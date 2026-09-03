import { PrismaClient, CheckoutSagaStateEnum } from '@prisma/client';
import { CheckoutSagaRecoveryService } from './CheckoutSagaRecoveryService';
import { CheckoutOrchestratorService } from './CheckoutOrchestratorService';
import { PrismaCheckoutSagaStateStore } from './PrismaCheckoutSagaStateStore';
import { StripeGateway } from '../../infrastructure/gateways/StripeGateway';
import { CheckoutMetrics } from './CheckoutMetrics';

export class SagaRecoveryWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  // In-memory cooldown tracking to prevent tight-loop re-alerting on stuck sagas
  private static escalationCooldowns = new Map<string, number>();
  private static COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes
  
  constructor(
    private readonly recoveryService: CheckoutSagaRecoveryService,
    private readonly prisma: PrismaClient,
    private readonly pollIntervalMs: number = 60000
  ) {}

  static createDefault(prisma: PrismaClient): SagaRecoveryWorker {
    const store = new PrismaCheckoutSagaStateStore(prisma);
    const paymentProvider = new StripeGateway();
    const orchestrator = new CheckoutOrchestratorService(store, paymentProvider);
    const recoveryService = new CheckoutSagaRecoveryService(prisma, store, orchestrator, "worker-" + process.pid);
    return new SagaRecoveryWorker(recoveryService, prisma);
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this.sweep(), this.pollIntervalMs);
    console.log(`[SagaRecoveryWorker] Started sweeping every ${this.pollIntervalMs}ms`);
    this.sweep();
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log(`[SagaRecoveryWorker] Stopped`);
  }

  public async sweep(): Promise<void> {
    if (!this.isRunning) return;
    try {
      console.log(`[SagaRecoveryWorker] Running sweep for stuck sagas...`);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Track total stuck sagas requiring manual reconciliation
      const stuckCount = await this.prisma.checkoutSagaState.count({
        where: {
          currentState: CheckoutSagaStateEnum.FAILED,
          lastError: 'STUCK_FOR_24H_REQUIRES_MANUAL_RECONCILIATION'
        }
      });
      CheckoutMetrics.gauge("saga_stuck_total", stuckCount);

      const strandedIds = await this.recoveryService.discoverStrandedSagas();
      if (strandedIds.length === 0) return;
      
      for (const checkoutId of strandedIds) {
        try {
          const sagaRecord = await this.prisma.checkoutSagaState.findUnique({
            where: { checkoutId },
            select: { tenantId: true, updatedAt: true, currentState: true }
          });
          if (!sagaRecord) continue;
          
          if (sagaRecord.updatedAt < twentyFourHoursAgo) {
            const lastEscalated = SagaRecoveryWorker.escalationCooldowns.get(checkoutId) || 0;
            const now = Date.now();
            
            // Check if within cooldown window
            if (now - lastEscalated < SagaRecoveryWorker.COOLDOWN_MS) {
              continue; // Suppress duplicate alert in cooldown window
            }

            SagaRecoveryWorker.escalationCooldowns.set(checkoutId, now);
            console.warn(`[SagaRecoveryWorker] Saga ${checkoutId} stuck for > 24 hours! Needs manual reconciliation.`);
            
            await this.prisma.checkoutSagaState.updateMany({
                where: { checkoutId },
                data: { 
                  currentState: CheckoutSagaStateEnum.FAILED,
                  lastError: 'STUCK_FOR_24H_REQUIRES_MANUAL_RECONCILIATION'
                }
            });
            CheckoutMetrics.increment("saga_escalated_to_manual_total", 1, { tenantId: sagaRecord.tenantId });
            continue;
          }

          console.log(`[SagaRecoveryWorker] Attempting recovery for saga ${checkoutId}`);
          await this.recoveryService.recoverSaga(checkoutId, sagaRecord.tenantId);
          CheckoutMetrics.increment("saga_recovery_attempts_total", 1, { status: "SUCCESS", tenantId: sagaRecord.tenantId });
          console.log(`[SagaRecoveryWorker] Recovery successful for saga ${checkoutId}`);
        } catch (error: any) {
          CheckoutMetrics.increment("saga_recovery_attempts_total", 1, { status: "FAILED", error: error.name });
          console.error(`[SagaRecoveryWorker] Failed to recover saga ${checkoutId}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error(`[SagaRecoveryWorker] Sweep failed:`, error.message);
    }
  }
}
