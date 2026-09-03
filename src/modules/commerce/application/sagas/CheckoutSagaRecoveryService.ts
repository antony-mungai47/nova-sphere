import { PrismaClient, CheckoutSagaStateEnum } from '@prisma/client';
import { CheckoutSagaInstance, CheckoutState } from './CheckoutSaga.types';
import { CheckoutOrchestratorService } from './CheckoutOrchestratorService';
import { PrismaCheckoutSagaStateStore, StaleSagaVersionError } from './PrismaCheckoutSagaStateStore';

const MAX_RECOVERY_RETRIES = 3;

export class SagaRecoveryConflictError extends Error {
  constructor(checkoutId: string) {
    super(`Recovery Conflict: Exhausted retries for saga ${checkoutId}`);
    this.name = "SagaRecoveryConflictError";
  }
}

export class CheckoutSagaRecoveryService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly store: PrismaCheckoutSagaStateStore,
    private readonly orchestrator: CheckoutOrchestratorService,
    private readonly workerId: string
  ) {}

  /**
   * Discovers stranded, non-terminal sagas that have no active lease
   */
  public async discoverStrandedSagas(tenantId?: string): Promise<string[]> {
    const whereClause: any = {
      currentState: {
        notIn: [
          CheckoutSagaStateEnum.COMPLETED,
          CheckoutSagaStateEnum.ROLLED_BACK,
          CheckoutSagaStateEnum.FAILED
        ]
      },
      OR: [
        { recoveryLeaseUntil: null },
        { recoveryLeaseUntil: { lt: new Date() } }
      ]
    };

    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const records = await this.prisma.checkoutSagaState.findMany({
      where: whereClause,
      select: { checkoutId: true },
      take: 10
    });

    return records.map(r => r.checkoutId);
  }

  /**
   * Attempts to claim and recover a specific saga.
   * Uses a bounded retry policy for OCC conflicts.
   */
  public async recoverSaga(checkoutId: string, tenantId: string): Promise<void> {
    let retries = 0;

    while (retries < MAX_RECOVERY_RETRIES) {
      try {
        await this.attemptRecovery(checkoutId, tenantId);
        return; // Success
      } catch (error: any) {
        if (error.name === "StaleSagaVersionError") {
          retries++;
          // Optional: Add jittered backoff here
          continue;
        }
        throw error; // Bubble up unexpected errors
      }
    }

    throw new SagaRecoveryConflictError(checkoutId);
  }

  private async attemptRecovery(checkoutId: string, tenantId: string): Promise<void> {
    // 1. Structural tenant isolation via loadByTenant
    const saga = await this.store.loadByTenant(checkoutId, tenantId);
    if (!saga) {
      throw new Error(`Saga ${checkoutId} not found or tenant mismatch`);
    }

    // Check if another worker holds a valid lease
    if (saga.recoveryOwner && saga.recoveryLeaseUntil && saga.recoveryLeaseUntil > new Date()) {
      throw new SagaRecoveryConflictError(checkoutId);
    }

    // 2. Claim lease via OCC
    const expectedVersion = saga.version;
    const leaseUntil = new Date(Date.now() + 30000); // 30 second lease

    const result = await this.prisma.checkoutSagaState.updateMany({
      where: {
        checkoutId,
        tenantId,
        version: expectedVersion
      },
      data: {
        recoveryOwner: this.workerId,
        recoveryLeaseUntil: leaseUntil,
        version: expectedVersion + 1
      }
    });

    if (result.count === 0) {
      throw new StaleSagaVersionError(checkoutId, expectedVersion);
    }

    // 3. Reload claimed saga
    const claimedSaga = await this.store.loadByTenant(checkoutId, tenantId);
    if (!claimedSaga) throw new Error("Unexpected error: Saga disappeared after claim");

    // 4. Determine next legal action based on explicit execution flags (NOT history)
    await this.resumeExecution(claimedSaga);
  }

  private async resumeExecution(saga: CheckoutSagaInstance): Promise<void> {
    // Based on currentState and the explicit execution flags, we invoke the Orchestrator
    // We do NOT directly execute effects here. We just trigger the Orchestrator.
    // The orchestrator has a method `resume` which we will add.

    await this.orchestrator.resume(saga);
  }
}
