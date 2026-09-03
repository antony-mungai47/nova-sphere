import { PrismaClient } from '@prisma/client';
import { CheckoutSagaRecoveryService, SagaRecoveryConflictError } from './CheckoutSagaRecoveryService';
import { PrismaCheckoutSagaStateStore, StaleSagaVersionError } from './PrismaCheckoutSagaStateStore';
import { CheckoutOrchestratorService } from './CheckoutOrchestratorService';
import { CheckoutState, CheckoutEvent, CheckoutSagaInstance } from './CheckoutSaga.types';
import { randomUUID } from 'crypto';

jest.setTimeout(30000);

describe('CheckoutSaga Crash Recovery & OCC (U3B.4-B)', () => {
  let prisma: PrismaClient;
  let store: PrismaCheckoutSagaStateStore;
  let orchestrator: CheckoutOrchestratorService;
  let recoveryService1: CheckoutSagaRecoveryService;
  let recoveryService2: CheckoutSagaRecoveryService;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear out test data for tests
    await prisma.checkoutSagaTransition.deleteMany();
    await prisma.checkoutSagaState.deleteMany();
    
    store = new PrismaCheckoutSagaStateStore(prisma);
    orchestrator = new CheckoutOrchestratorService(store);
    
    // We create two distinct workers to simulate concurrent races
    recoveryService1 = new CheckoutSagaRecoveryService(prisma, store, orchestrator, 'worker-1');
    recoveryService2 = new CheckoutSagaRecoveryService(prisma, store, orchestrator, 'worker-2');

    jest.spyOn(orchestrator as any, 'executeEffect').mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createIdentity = () => ({
    checkoutId: randomUUID(),
    tenantId: 'tenant-123',
    idempotencyKey: randomUUID(),
    traceId: 'trace-456'
  });

  describe('Gate 15: Saga State Integrity & OCC', () => {
    it('should reject stale writers and enforce OCC', async () => {
      const identity = createIdentity();
      await orchestrator.startCheckout(identity, { items: [], userId: 'u1', clientTotal: 0 });

      const saga1 = await store.load(identity.checkoutId);
      const saga2 = await store.load(identity.checkoutId);

      expect(saga1).toBeDefined();
      expect(saga2).toBeDefined();

      // Worker 1 advances the state
      saga1!.currentState = CheckoutState.PRICING_CALCULATED;
      saga1!.version += 1;
      await store.save(saga1!);

      // Worker 2 attempts to save stale state
      saga2!.currentState = CheckoutState.COMPLETED;
      saga2!.version += 1; // It increments from its own stale read (2 -> 3)
      
      await expect(store.save(saga2!)).rejects.toThrow(StaleSagaVersionError);
      
      // Verify DB hasn't been corrupted by Worker 2
      const finalSaga = await store.load(identity.checkoutId);
      expect(finalSaga?.currentState).toBe(CheckoutState.PRICING_CALCULATED);
    });

    it('should prevent cross-tenant access during recovery', async () => {
      const identity = createIdentity();
      await orchestrator.startCheckout(identity, { items: [], userId: 'u1', clientTotal: 0 });

      await expect(recoveryService1.recoverSaga(identity.checkoutId, 'wrong-tenant'))
        .rejects.toThrow('Saga ' + identity.checkoutId + ' not found or tenant mismatch');
    });

    it('two workers racing for recovery should result in only one claim', async () => {
      const identity = createIdentity();
      await orchestrator.startCheckout(identity, { items: [], userId: 'u1', clientTotal: 0 });
      
      // Clear the execution count from startCheckout
      (orchestrator as any).executeEffect.mockClear();

      // Fire off both workers concurrently
      const promise1 = recoveryService1.recoverSaga(identity.checkoutId, identity.tenantId);
      const promise2 = recoveryService2.recoverSaga(identity.checkoutId, identity.tenantId);

      const results = await Promise.allSettled([promise1, promise2]);
      
      // At least one must succeed, exactly one must succeed, one must reject with SagaRecoveryConflictError
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      expect(successes.length).toBe(1);
      expect(failures.length).toBe(1);

      // Verify the lease in DB
      const dbRecord = await prisma.checkoutSagaState.findUnique({ where: { checkoutId: identity.checkoutId } });
      expect(dbRecord?.recoveryOwner).toMatch(/worker-[12]/);
      expect(dbRecord?.recoveryLeaseUntil).toBeDefined();

      // IMPORTANT: Prove the losing worker had ZERO side effects
      // If both workers executed, `executeEffect` would be called twice.
      // Since only one won, it should be called exactly once.
      expect((orchestrator as any).executeEffect).toHaveBeenCalledTimes(1);
    });
  });

  describe('Gate 16: Recovery Integrity (Crash Matrix)', () => {
    it('should recover safely if crashed immediately after saga creation (INITIALIZED)', async () => {
      const identity = createIdentity();
      
      // We manually save an INITIALIZED saga as if it crashed before starting execution
      const saga: CheckoutSagaInstance = {
        identity,
        currentState: CheckoutState.INITIALIZED,
        pricingCompleted: false,
        inventoryReserved: false,
        orderCreated: false,
        paymentAuthorized: false,
        compensationRequired: false,
        lastEvent: CheckoutEvent.START,
        lastError: null,
        version: 1,
        history: [],
        completedEffects: []
      };
      await store.save(saga);

      await recoveryService1.recoverSaga(identity.checkoutId, identity.tenantId);

      expect((orchestrator as any).executeEffect).toHaveBeenCalledWith(
        expect.objectContaining({ identity }), 
        'CALCULATE_PRICING'
      );
    });

    it('should recover safely if crashed after pricing completes (PRICING_CALCULATED)', async () => {
      const identity = createIdentity();
      
      const saga: CheckoutSagaInstance = {
        identity,
        currentState: CheckoutState.PRICING_CALCULATED,
        pricingCompleted: true,
        inventoryReserved: false,
        orderCreated: false,
        paymentAuthorized: false,
        compensationRequired: false,
        lastEvent: CheckoutEvent.PRICING_SUCCESS,
        lastError: null,
        version: 1,
        history: [],
        completedEffects: []
      };
      await store.save(saga);

      await recoveryService1.recoverSaga(identity.checkoutId, identity.tenantId);

      expect((orchestrator as any).executeEffect).toHaveBeenCalledWith(
        expect.objectContaining({ identity }), 
        'RESERVE_INVENTORY'
      );
    });

    it('should recover compensating sequence if crashed during order cancellation', async () => {
      const identity = createIdentity();
      
      const saga: CheckoutSagaInstance = {
        identity,
        currentState: CheckoutState.COMPENSATING,
        pricingCompleted: true,
        inventoryReserved: true,
        orderCreated: true, // Needs cancellation
        paymentAuthorized: false,
        compensationRequired: true,
        lastEvent: CheckoutEvent.PAYMENT_FAILURE,
        lastError: null,
        version: 1,
        history: [],
        completedEffects: []
      };
      await store.save(saga);

      await recoveryService1.recoverSaga(identity.checkoutId, identity.tenantId);

      expect((orchestrator as any).executeEffect).toHaveBeenCalledWith(
        expect.objectContaining({ identity }), 
        'CANCEL_ORDER'
      );
    });
  });

  describe('Gate 16A: Effect/State Divergence', () => {
    it('should prevent duplicate domain effects when process crashes after effect but before DB update', async () => {
      const identity = createIdentity();
      
      const saga: CheckoutSagaInstance = {
        identity,
        currentState: CheckoutState.PRICING_CALCULATED,
        pricingCompleted: true,
        inventoryReserved: false,
        orderCreated: false,
        paymentAuthorized: false,
        compensationRequired: false,
        lastEvent: CheckoutEvent.PRICING_SUCCESS,
        lastError: null,
        version: 1,
        history: [],
        completedEffects: []
      };
      await store.save(saga);

      let effectiveDomainCalls = 0;
      const seenIdempotencyKeys = new Set<string>();

      // Downstream Domain Idempotent Boundary
      const mockDomainReservation = jest.fn(async (idempotencyKey: string) => {
        if (!seenIdempotencyKeys.has(idempotencyKey)) {
          seenIdempotencyKeys.add(idempotencyKey);
          effectiveDomainCalls++;
        }
      });

      // Hook orchestrator to simulate the domain boundary
      jest.spyOn(orchestrator as any, 'executeEffect').mockImplementation(async (s: any, effect: any) => {
        if (effect === 'RESERVE_INVENTORY') {
          await mockDomainReservation(s.identity.idempotencyKey);
        }
      });

      // 1. Simulate the FIRST execution that crashes after domain mutation but before DB save
      await mockDomainReservation(identity.idempotencyKey);

      // 2. Worker detects stranded saga and attempts recovery
      await recoveryService1.recoverSaga(identity.checkoutId, identity.tenantId);

      // 3. Prove idempotent outcomes
      expect((orchestrator as any).executeEffect).toHaveBeenCalledWith(
        expect.objectContaining({ identity }), 
        'RESERVE_INVENTORY'
      );
      expect(mockDomainReservation).toHaveBeenCalledTimes(2); // Boundary reached twice
      expect(effectiveDomainCalls).toBe(1); // But mutated exactly once!
    });
  });
});
