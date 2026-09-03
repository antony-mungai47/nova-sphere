import { PrismaClient, CheckoutSagaStateEnum, CheckoutSagaEventEnum, Prisma } from '@prisma/client';
import { CheckoutSagaStateStore, DuplicateIdempotencyKeyError } from './CheckoutSagaStateStore';
import { CheckoutSagaInstance, CheckoutState, CheckoutEvent, CheckoutEffect } from './CheckoutSaga.types';

export class StaleSagaVersionError extends Error {
  constructor(checkoutId: string, version: number) {
    super(`OCC Conflict: Saga ${checkoutId} has been modified by another worker (expected version ${version})`);
    this.name = "StaleSagaVersionError";
  }
}

export class PrismaCheckoutSagaStateStore implements CheckoutSagaStateStore {
  constructor(private readonly prisma: PrismaClient) {}

  public async save(saga: CheckoutSagaInstance): Promise<void> {
    const isNew = saga.version === 1;

    if (isNew) {
      await this.insertNew(saga);
    } else {
      await this.updateExisting(saga);
    }
  }

  public async load(checkoutId: string): Promise<CheckoutSagaInstance | null> {
    const record = await this.prisma.checkoutSagaState.findUnique({
      where: { checkoutId },
      include: { transitions: { orderBy: { step: 'asc' } } }
    });

    if (!record) return null;
    return this.mapToDomain(record);
  }

  public async loadByTenant(checkoutId: string, tenantId: string): Promise<CheckoutSagaInstance | null> {
    const record = await this.prisma.checkoutSagaState.findUnique({
      where: { checkoutId },
      include: { transitions: { orderBy: { step: 'asc' } } }
    });

    if (!record || record.tenantId !== tenantId) return null;
    return this.mapToDomain(record);
  }

  public async loadByTenantAndIdempotencyKey(tenantId: string, idempotencyKey: string): Promise<CheckoutSagaInstance | null> {
    const record = await this.prisma.checkoutSagaState.findUnique({
      where: {
        checkout_saga_tenant_idempotency_key: { tenantId, idempotencyKey }
      },
      include: { transitions: { orderBy: { step: 'asc' } } }
    });

    if (!record) return null;
    return this.mapToDomain(record);
  }

  private async insertNew(saga: CheckoutSagaInstance): Promise<void> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.checkoutSagaState.create({
          data: {
            checkoutId: saga.identity.checkoutId,
            tenantId: saga.identity.tenantId,
            idempotencyKey: saga.identity.idempotencyKey,
            requestFingerprint: (saga as any).requestFingerprint || null,
            traceId: saga.identity.traceId,
            currentState: this.mapStateToEnum(saga.currentState),
            pricingCompleted: saga.pricingCompleted,
            inventoryReserved: saga.inventoryReserved,
            orderCreated: saga.orderCreated,
            paymentAuthorized: saga.paymentAuthorized,
            compensationRequired: saga.compensationRequired,
            lastEvent: saga.lastEvent ? this.mapEventToEnum(saga.lastEvent) : null,
            lastError: saga.lastError,
            version: saga.version,
            payload: saga.payload ? (saga.payload as any) : null,
          }
        });

        if (saga.history.length > 0) {
          await tx.checkoutSagaTransition.createMany({
            data: saga.history.map(h => ({
              id: h.transitionId,
              checkoutId: h.checkoutId,
              previousState: this.mapStateToEnum(h.previousState),
              currentState: this.mapStateToEnum(h.currentState),
              event: this.mapEventToEnum(h.event),
              effect: h.effect,
              step: h.step,
              attempt: h.attempt,
              timestamp: h.timestamp
            }))
          });
        }
      }, { timeout: 30000 });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = e.meta?.target;
        if (Array.isArray(target) && target.includes('tenantId') && target.includes('idempotencyKey')) {
          throw new DuplicateIdempotencyKeyError(saga.identity.tenantId, saga.identity.idempotencyKey);
        }
        if (target === 'checkout_saga_tenant_idempotency_key') {
          throw new DuplicateIdempotencyKeyError(saga.identity.tenantId, saga.identity.idempotencyKey);
        }
        if (Array.isArray(target) && target.includes('checkoutId')) {
          throw new DuplicateIdempotencyKeyError(saga.identity.tenantId, saga.identity.idempotencyKey);
        }
        if (target === 'CheckoutSagaState_pkey' || target === 'checkoutId') {
          throw new DuplicateIdempotencyKeyError(saga.identity.tenantId, saga.identity.idempotencyKey);
        }
      }
      throw e;
    }
  }

  private async updateExisting(saga: CheckoutSagaInstance): Promise<void> {
    // Expected version in DB is saga.version - 1 because orchestrator incremented it
    const expectedVersion = saga.version - 1;

    await this.prisma.$transaction(async (tx) => {
      const result = await tx.checkoutSagaState.updateMany({
        where: {
          checkoutId: saga.identity.checkoutId,
          version: expectedVersion
        },
        data: {
          currentState: this.mapStateToEnum(saga.currentState),
          pricingCompleted: saga.pricingCompleted,
          inventoryReserved: saga.inventoryReserved,
          orderCreated: saga.orderCreated,
          paymentAuthorized: saga.paymentAuthorized,
          compensationRequired: saga.compensationRequired,
          lastEvent: saga.lastEvent ? this.mapEventToEnum(saga.lastEvent) : null,
          lastError: saga.lastError,
          version: saga.version, // optimistic lock incremented
          payload: saga.payload ? (saga.payload as any) : null,
          completedAt: saga.currentState === CheckoutState.COMPLETED ? new Date() : undefined,
          failedAt: saga.currentState === CheckoutState.FAILED || saga.currentState === CheckoutState.ROLLED_BACK ? new Date() : undefined,
        }
      });

      if (result.count === 0) {
        throw new StaleSagaVersionError(saga.identity.checkoutId, expectedVersion);
      }

      // Identify new transitions to insert (those not yet in DB)
      // Since history is append-only, we just find the highest step currently in DB and insert anything above it
      const lastTx = await tx.checkoutSagaTransition.findFirst({
        where: { checkoutId: saga.identity.checkoutId },
        orderBy: { step: 'desc' }
      });

      const maxStepInDb = lastTx?.step || 0;
      const newTransitions = saga.history.filter(h => h.step > maxStepInDb);

      if (newTransitions.length > 0) {
        await tx.checkoutSagaTransition.createMany({
          data: newTransitions.map(h => ({
            id: h.transitionId,
            checkoutId: h.checkoutId,
            previousState: this.mapStateToEnum(h.previousState),
            currentState: this.mapStateToEnum(h.currentState),
            event: this.mapEventToEnum(h.event),
            effect: h.effect,
            step: h.step,
            attempt: h.attempt,
            timestamp: h.timestamp
          }))
        });
      }
    }, { timeout: 30000 });
  }

  private mapStateToEnum(state: CheckoutState | null): CheckoutSagaStateEnum | any {
    if (!state) return null;
    return state as unknown as CheckoutSagaStateEnum;
  }

  private mapEventToEnum(event: CheckoutEvent): CheckoutSagaEventEnum {
    return event as unknown as CheckoutSagaEventEnum;
  }

  private mapToDomain(record: any): CheckoutSagaInstance {
    // Validate payload carefully as requested by user constraints
    let payload = undefined;
    if (record.payload && typeof record.payload === 'object') {
      const p = record.payload as any;
      payload = {
        items: Array.isArray(p.items) ? p.items : [],
        userId: String(p.userId || ''),
        clientTotal: Number(p.clientTotal || 0),
        pricingSnapshot: p.pricingSnapshot ? p.pricingSnapshot : undefined,
        reservationReference: p.reservationReference ? String(p.reservationReference) : undefined,
        orderReference: p.orderReference ? String(p.orderReference) : undefined,
        paymentReference: p.paymentReference ? String(p.paymentReference) : undefined,
        checkoutUrl: p.checkoutUrl ? String(p.checkoutUrl) : undefined,
      };
    }

    return {
      identity: {
        checkoutId: record.checkoutId,
        tenantId: record.tenantId,
        idempotencyKey: record.idempotencyKey,
        traceId: record.traceId
      },
      currentState: record.currentState as CheckoutState,
      pricingCompleted: record.pricingCompleted,
      inventoryReserved: record.inventoryReserved,
      orderCreated: record.orderCreated,
      paymentAuthorized: record.paymentAuthorized,
      compensationRequired: record.compensationRequired,
      lastEvent: record.lastEvent as CheckoutEvent | null,
      lastError: record.lastError,
      version: record.version,
      payload,
      recoveryOwner: record.recoveryOwner,
      recoveryLeaseUntil: record.recoveryLeaseUntil,
      requestFingerprint: record.requestFingerprint,
      history: record.transitions.map((t: any) => ({
        checkoutId: t.checkoutId,
        previousState: t.previousState as CheckoutState,
        currentState: t.currentState as CheckoutState,
        event: t.event as CheckoutEvent,
        transitionId: t.id,
        timestamp: t.timestamp,
        step: t.step,
        attempt: t.attempt,
        effect: t.effect as CheckoutEffect
      })),
      completedEffects: [] 
    };
  }
}
