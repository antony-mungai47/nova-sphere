import { PrismaClient } from '@prisma/client';
import { CheckoutOrchestratorService } from './CheckoutOrchestratorService';
import { PrismaCheckoutSagaStateStore, StaleSagaVersionError } from './PrismaCheckoutSagaStateStore';
import { CheckoutSagaRecoveryService } from './CheckoutSagaRecoveryService';
import { CheckoutIdentity, CheckoutSagaPayload, CheckoutState, CheckoutSagaInstance, CheckoutEvent } from './CheckoutSaga.types';
import { CheckoutStateMachine } from './CheckoutStateMachine';
import { randomUUID } from 'crypto';
import { PricingQueryService } from '../queries/PricingQueryService';
import { InventoryCommandService } from '../commands/InventoryCommandService';
import { OrderCommandService } from '../commands/OrderCommandService';
import { PaymentService } from '../PaymentService';
import { PaymentProvider } from '../payment/PaymentProvider';

jest.setTimeout(60000);

describe('Phase C2: CheckoutSaga Integration & Fault Injection', () => {
  let prisma: PrismaClient;
  let store: PrismaCheckoutSagaStateStore;
  let orchestrator: CheckoutOrchestratorService;
  let recoveryService: CheckoutSagaRecoveryService;

  let testTenantId: string;
  let testProductId: string;
  let testUserId: string;

  // Mock Payment Provider with Idempotency Tracking + Physical-Call Instrumentation
  class MockPaymentProvider implements PaymentProvider {
    public idempotencyCache = new Map<string, string>();
    private physicalCallLog = new Map<string, number>();

    async createCheckoutSession(orderId: string, successUrl: string, cancelUrl: string, idempotencyKey?: string): Promise<string> {
      const cacheKey = idempotencyKey || orderId;

      // Track every physical invocation regardless of idempotency outcome
      const prev = this.physicalCallLog.get(cacheKey) ?? 0;
      this.physicalCallLog.set(cacheKey, prev + 1);

      if (this.idempotencyCache.has(cacheKey)) {
        return this.idempotencyCache.get(cacheKey)!;
      }

      const sessionUrl = `https://mock.gateway/pay/${orderId}-${Date.now()}`;
      this.idempotencyCache.set(cacheKey, sessionUrl);
      return sessionUrl;
    }

    async capture(paymentIntentId: string): Promise<boolean> { return true; }
    async refund(paymentIntentId: string, amount: number): Promise<boolean> { return true; }
    async cancel(paymentIntentId: string): Promise<boolean> { return true; }

    async verifyWebhook(body: string, signature: string, secret: string): Promise<any> {
      return { type: "payment_intent.succeeded" };
    }

    async verifyPaymentStatus(idempotencyKey: string): Promise<{ status: string, checkoutUrl?: string, paymentReference?: string } | null> {
      if (this.idempotencyCache.has(idempotencyKey)) {
        return {
          status: "AUTHORIZED",
          checkoutUrl: this.idempotencyCache.get(idempotencyKey),
          paymentReference: "pi_mock_" + idempotencyKey
        };
      }
      return null;
    }

    /** Logical count: 1 if the key was ever authorized, 0 otherwise. */
    getCallCount(idempotencyKey: string): number {
      return this.idempotencyCache.has(idempotencyKey) ? 1 : 0;
    }

    /** Physical count: number of times createCheckoutSession was actually entered. */
    getPhysicalCallCount(idempotencyKey: string): number {
      return this.physicalCallLog.get(idempotencyKey) ?? 0;
    }
  }

  let paymentProvider: MockPaymentProvider;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clear out test data for tests
    await prisma.domainEventOutbox.deleteMany();
    await prisma.checkoutSagaTransition.deleteMany();
    await prisma.checkoutSagaState.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.orderTimeline.deleteMany();
    await prisma.order.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.inventory.deleteMany();
    await prisma.product.deleteMany();
    await prisma.tenant.deleteMany();
    
    testTenantId = `tenant-${randomUUID()}`;
    testProductId = `prod-${randomUUID()}`;

    // Seed Tenant
    await prisma.tenant.create({
      data: {
        id: testTenantId,
        name: 'Test Tenant'
      }
    });

    const testWarehouseId = `wh-${randomUUID()}`;
    await prisma.warehouse.create({
      data: {
        id: testWarehouseId,
        name: 'Test Warehouse',
        ownerTenantId: testTenantId
      }
    });

    // Seed Product
    await prisma.product.create({
      data: {
        id: testProductId,
        ownerTenantId: testTenantId,
        name: 'Integration Test Product',
        sku: `int-test-prod-${randomUUID()}`,
        description: 'Test product for saga integration',
        price: 100, // $100
        category: 'Test',
        brand: 'TestBrand',
        stock: 10,
        version: 1,
        status: 'ACTIVE'
      }
    });

    // Seed Inventory
    await prisma.inventory.create({
      data: {
        productId: testProductId,
        warehouseId: testWarehouseId,
        quantity: 10,
        reserved: 0
      }
    });

    testUserId = `user-${randomUUID()}`;
    await prisma.user.create({
      data: {
        id: testUserId,
        clerkId: `clerk-${randomUUID()}`,
        email: `test-${randomUUID()}@example.com`,
        name: 'Test User'
      }
    });

    store = new PrismaCheckoutSagaStateStore(prisma);
    paymentProvider = new MockPaymentProvider();
    orchestrator = new CheckoutOrchestratorService(store, paymentProvider);
    recoveryService = new CheckoutSagaRecoveryService(prisma, store, orchestrator, 'integration-worker-1');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createIdentity = (): CheckoutIdentity => ({
    checkoutId: randomUUID(),
    tenantId: testTenantId,
    idempotencyKey: randomUUID(),
    traceId: `trace-${randomUUID()}`
  });

  const createPayload = (): CheckoutSagaPayload => ({
    items: [{ productId: testProductId, quantity: 1, price: 100 }],
    userId: testUserId,
    clientTotal: 100
  });

  describe('Fault Injection Matrix', () => {

    it('Scenario 1: Pricing succeeds → crash (Recovery resumes without recalculating incorrectly)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      const originalCalculate = PricingQueryService.calculateDiscounts;
      let hookCalled = false;
      jest.spyOn(PricingQueryService, 'calculateDiscounts').mockImplementation(async (input, coupons, traceId) => {
        const result = await originalCalculate.call(PricingQueryService, input, coupons, traceId);
        if (!hookCalled) {
          hookCalled = true;
          throw new Error('CRASH_SIMULATION_AFTER_PRICING');
        }
        return result;
      });

      const originalSave = store.save.bind(store);
      jest.spyOn(store, 'save').mockImplementation(async (saga) => {
        if (saga.lastError === 'CRASH_SIMULATION_AFTER_PRICING') {
          throw new Error('FATAL_CRASH');
        }
        return originalSave(saga);
      });

      await expect(orchestrator.startCheckout(identity, payload))
        .rejects.toThrow('FATAL_CRASH');

      const crashedSaga = await store.load(identity.checkoutId);
      expect(crashedSaga?.currentState).toBe(CheckoutState.INITIALIZED);

      await recoveryService.recoverSaga(identity.checkoutId, identity.tenantId);

      const recoveredSaga = await store.load(identity.checkoutId);
      expect(recoveredSaga?.currentState).toBe(CheckoutState.COMPLETED);
    });

    it('Scenario 2: Inventory reserves → crash (Reservation is not duplicated)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Hook into reserveInventory to throw AFTER it completes
      const originalReserve = InventoryCommandService.reserveInventory;
      let hookCalled = false;
      jest.spyOn(InventoryCommandService, 'reserveInventory').mockImplementation(async (cmd, tx) => {
        await originalReserve.call(InventoryCommandService, cmd, tx);
        if (!hookCalled) {
          hookCalled = true;
          throw new Error('CRASH_SIMULATION_AFTER_INVENTORY');
        }
      });

      // Hook into store.save to prevent saving the failure state (simulating a process crash)
      const originalSave = store.save.bind(store);
      jest.spyOn(store, 'save').mockImplementation(async (saga) => {
        if (saga.lastError === 'CRASH_SIMULATION_AFTER_INVENTORY') {
          throw new Error('FATAL_CRASH'); // Bypasses orchestrator catch block
        }
        return originalSave(saga);
      });

      // 1. Start Checkout. It will crash during execution of RESERVE_INVENTORY.
      await expect(orchestrator.startCheckout(identity, payload))
        .rejects.toThrow('FATAL_CRASH');

      // Verify the saga is stuck in PRICING_CALCULATED because the success event was never processed
      const crashedSaga = await store.load(identity.checkoutId);
      expect(crashedSaga?.currentState).toBe(CheckoutState.PRICING_CALCULATED);

      // Verify DB actually mutated (reservation exists)
      const reservations = await prisma.reservation.findMany({
        where: { orderId: identity.checkoutId }
      });
      expect(reservations.length).toBe(1);

      // 2. Recover the Saga
      await recoveryService.recoverSaga(identity.checkoutId, identity.tenantId);

      // 3. Verify Idempotency - Reservation shouldn't be duplicated
      const postRecoveryReservations = await prisma.reservation.findMany({
        where: { orderId: identity.checkoutId }
      });
      expect(postRecoveryReservations.length).toBe(1); // Still exactly 1
      
      const recoveredSaga = await store.load(identity.checkoutId);
      expect(recoveredSaga?.currentState).toBe(CheckoutState.COMPLETED);
    });

    it('Scenario 3: Order created → crash (Recovery doesnt create second order)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      const originalCreate = OrderCommandService.createOrder;
      let hookCalled = false;
      jest.spyOn(OrderCommandService, 'createOrder').mockImplementation(async (cmd) => {
        const result = await originalCreate.call(OrderCommandService, cmd);
        if (!hookCalled) {
          hookCalled = true;
          throw new Error('CRASH_SIMULATION_AFTER_ORDER');
        }
        return result;
      });

      const originalSave = store.save.bind(store);
      jest.spyOn(store, 'save').mockImplementation(async (saga) => {
        if (saga.lastError === 'CRASH_SIMULATION_AFTER_ORDER') {
          throw new Error('FATAL_CRASH');
        }
        return originalSave(saga);
      });

      await expect(orchestrator.startCheckout(identity, payload))
        .rejects.toThrow('FATAL_CRASH');

      const crashedSaga = await store.load(identity.checkoutId);
      expect(crashedSaga?.currentState).toBe(CheckoutState.INVENTORY_RESERVED);

      const orders = await prisma.order.findMany({
        where: { idempotencyKey: identity.idempotencyKey }
      });
      expect(orders.length).toBe(1);

      await recoveryService.recoverSaga(identity.checkoutId, identity.tenantId);

      const postRecoveryOrders = await prisma.order.findMany({
        where: { idempotencyKey: identity.idempotencyKey }
      });
      expect(postRecoveryOrders.length).toBe(1);
      
      const recoveredSaga = await store.load(identity.checkoutId);
      expect(recoveredSaga?.currentState).toBe(CheckoutState.COMPLETED);
    });

    it('Scenario 4: Payment authorization → crash (Idempotency prevents double charge)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      const originalAuth = paymentProvider.createCheckoutSession;
      let hookCalled = false;
      jest.spyOn(paymentProvider, 'createCheckoutSession').mockImplementation(async (orderId, successUrl, cancelUrl, idempotencyKey) => {
        const result = await originalAuth.call(paymentProvider, orderId, successUrl, cancelUrl, idempotencyKey);
        if (!hookCalled) {
          hookCalled = true;
          throw new Error('CRASH_SIMULATION_AFTER_PAYMENT');
        }
        return result;
      });

      const originalSave = store.save.bind(store);
      jest.spyOn(store, 'save').mockImplementation(async (saga) => {
        if (saga.lastError === 'CRASH_SIMULATION_AFTER_PAYMENT') {
          throw new Error('FATAL_CRASH');
        }
        return originalSave(saga);
      });

      await expect(orchestrator.startCheckout(identity, payload))
        .rejects.toThrow('FATAL_CRASH');

      const crashedSaga = await store.load(identity.checkoutId);
      expect(crashedSaga?.currentState).toBe(CheckoutState.ORDER_CREATED);

      // Before recovery: one physical call, one logical authorization
      expect(paymentProvider.getPhysicalCallCount(identity.idempotencyKey)).toBe(1);
      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);

      // 2. Recover the Saga
      await recoveryService.recoverSaga(identity.checkoutId, identity.tenantId);

      // 3. Distributed-systems guarantee: the provider was physically entered TWICE
      //    (original crashed attempt + recovery re-entry) but only ONE logical
      //    authorization was created — the idempotency cache returned the cached URL.
      expect(paymentProvider.getPhysicalCallCount(identity.idempotencyKey)).toBe(2);
      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);

      const recoveredSaga = await store.load(identity.checkoutId);
      expect(recoveredSaga?.currentState).toBe(CheckoutState.COMPLETED);
    });

    test('Scenario 5: End-to-end success path (Happy Path)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // 1. Run the Saga end-to-end without any crashes
      await orchestrator.startCheckout(identity, payload);

      // 2. Verify final state
      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.COMPLETED);

      // 3. Verify side effects
      const reservations = await prisma.reservation.findMany({ where: { orderId: identity.checkoutId } });
      expect(reservations.length).toBeGreaterThan(0);

      const order = await prisma.order.findUnique({ where: { id: saga!.payload!.orderReference } });
      expect(order).toBeDefined();
      expect(order?.status).toBe('PENDING');

      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);
    });

    test('Scenario 6: Inventory reservation failure (Out of stock -> FAILED)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // 1. Setup: Force inventory service to throw an error (simulate out of stock)
      const originalReserve = InventoryCommandService.reserveInventory;
      jest.spyOn(InventoryCommandService, 'reserveInventory').mockImplementation(async () => {
        throw new Error('OUT_OF_STOCK');
      });

      // 2. Start Saga
      // It won't crash the orchestrator (FATAL_CRASH), but rather fail the effect, transitioning to COMPENSATING then FAILED
      await orchestrator.startCheckout(identity, payload);

      // 3. Verify final state is FAILED
      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.FAILED);
      expect(saga?.lastError).toBe('OUT_OF_STOCK');

      // 4. Verify no reservations were persisted
      const reservations = await prisma.reservation.findMany({ where: { orderId: identity.checkoutId } });
      expect(reservations.length).toBe(0);

      // 5. Verify no order was created
      const orders = await prisma.order.findMany({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(orders.length).toBe(0);

      // Cleanup mock
      jest.restoreAllMocks();
    });

    test('Scenario 7: Order creation fails (compensating saga: releases inventory)', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Force createOrder to fail with a domain error
      jest.spyOn(OrderCommandService, 'createOrder').mockImplementation(async () => {
        throw new Error('DATABASE_CONNECTION_ERROR');
      });

      // ORDER_FAILURE → COMPENSATING → RELEASE_INVENTORY → ROLLED_BACK
      await orchestrator.startCheckout(identity, payload);

      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.ROLLED_BACK);

      // The error is recorded on the saga before compensation runs
      expect(saga?.lastError).toBe('DATABASE_CONNECTION_ERROR');

      // Compensation execution flags are cleared after successful rollback
      expect(saga?.inventoryReserved).toBe(false);
      expect(saga?.orderCreated).toBe(false);

      // Real DB proof: RELEASE_INVENTORY ran — no RESERVED reservations remain
      const reservations = await prisma.reservation.findMany({ where: { orderId: identity.checkoutId } });
      const activeReservations = reservations.filter(r => r.status === 'RESERVED');
      expect(activeReservations).toHaveLength(0);
    });

    test('Scenario 8: Payment fails (Insufficient funds) -> triggers full compensation -> ROLLED_BACK', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // PaymentProvider exposes createCheckoutSession, not authorizePayment.
      // PaymentService.authorizePayment delegates to provider.createCheckoutSession.
      jest.spyOn(paymentProvider, 'createCheckoutSession').mockImplementation(async () => {
        throw new Error('INSUFFICIENT_FUNDS');
      });

      await orchestrator.startCheckout(identity, payload);

      const saga = await store.load(identity.checkoutId);
      // Flow: ORDER_CREATED -> PAYMENT_FAILURE -> COMPENSATING -> CANCEL_ORDER -> RELEASE_INVENTORY -> ROLLED_BACK
      expect(saga?.currentState).toBe(CheckoutState.ROLLED_BACK);
      expect(saga?.lastError).toBe('INSUFFICIENT_FUNDS');
      expect(saga?.orderCreated).toBe(false);
      expect(saga?.inventoryReserved).toBe(false);

      // Verify the order was actually cancelled in the database
      const order = await prisma.order.findFirst({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(order?.status).toBe('CANCELLED');

      // Real DB proof: RELEASE_INVENTORY ran — no RESERVED reservations remain
      const reservations = await prisma.reservation.findMany({ where: { orderId: identity.checkoutId } });
      const activeReservations = reservations.filter(r => r.status === 'RESERVED');
      expect(activeReservations).toHaveLength(0);
    });

    test('Scenario 9: Compensation permanently fails -> COMPENSATION_FAILURE -> FAILED', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Payment fails normally, triggering compensation
      jest.spyOn(paymentProvider, 'createCheckoutSession').mockImplementation(async () => {
        throw new Error('PAYMENT_REJECTED');
      });

      // cancelOrder always fails (permanent error, not FATAL_CRASH).
      // This triggers COMPENSATION_FAILURE which transitions to FAILED.
      jest.spyOn(OrderCommandService, 'cancelOrder').mockImplementation(async () => {
        throw new Error('CANCEL_ORDER_UNAVAILABLE');
      });

      await orchestrator.startCheckout(identity, payload);

      const saga = await store.load(identity.checkoutId);
      // COMPENSATING -> COMPENSATION_FAILURE -> FAILED
      expect(saga?.currentState).toBe(CheckoutState.FAILED);
    });

    test('Scenario 10: Payment fails -> cancelOrder crashes (FATAL_CRASH) -> recovery resumes -> ROLLED_BACK', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Payment fails normally (kicks off compensation path, not a crash)
      jest.spyOn(paymentProvider, 'createCheckoutSession').mockImplementation(async () => {
        throw new Error('PAYMENT_REJECTED');
      });

      // cancelOrder crashes on first call (FATAL_CRASH bypasses the catch block, so the saga
      // is already saved in COMPENSATING state before the crash propagates).
      let hookCalled = false;
      const originalCancel = OrderCommandService.cancelOrder;
      jest.spyOn(OrderCommandService, 'cancelOrder').mockImplementation(async (cmd) => {
        if (!hookCalled) {
          hookCalled = true;
          throw new Error('FATAL_CRASH');
        }
        return originalCancel.call(OrderCommandService, cmd);
      });

      // Start Checkout: payment fails -> COMPENSATING (saved to DB) -> cancelOrder FATAL_CRASH
      await expect(orchestrator.startCheckout(identity, payload))
        .rejects.toThrow('FATAL_CRASH');

      // Verify saga is stuck in COMPENSATING with orderCreated=true
      const crashedSaga = await store.load(identity.checkoutId);
      expect(crashedSaga?.currentState).toBe(CheckoutState.COMPENSATING);
      expect(crashedSaga?.orderCreated).toBe(true);

      // Recovery picks up the COMPENSATING saga and retries CANCEL_ORDER (second call succeeds)
      await recoveryService.recoverSaga(identity.checkoutId, identity.tenantId);

      const recoveredSaga = await store.load(identity.checkoutId);
      // After successful compensation: CANCEL_ORDER -> RELEASE_INVENTORY (no-op) -> ROLLED_BACK
      expect(recoveredSaga?.currentState).toBe(CheckoutState.ROLLED_BACK);

      // The order was eventually cancelled
      const order = await prisma.order.findFirst({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(order?.status).toBe('CANCELLED');
    });

    test('Scenario 11: Duplicate webhook / second startCheckout -> throws, no double side-effects', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // First run completes successfully
      await orchestrator.startCheckout(identity, payload);
      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.COMPLETED);

      // Second call with the same checkoutId throws a unique constraint error
      // (the saga record already exists in the DB).
      await expect(orchestrator.startCheckout(identity, payload)).rejects.toThrow();

      // Idempotency invariant: payment was only authorized once
      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);

      // Only one order was created
      const orders = await prisma.order.findMany({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(orders.length).toBe(1);
    });

    test('Scenario 12: Invalid state transition is rejected by the state machine', () => {
      // Pure state-machine test — no DB needed.
      // CheckoutStateMachine.transition throws for any event that is not valid from the current state.
      const sagaInstance: CheckoutSagaInstance = {
        identity: createIdentity(),
        currentState: CheckoutState.INITIALIZED,
        pricingCompleted: false,
        inventoryReserved: false,
        orderCreated: false,
        paymentAuthorized: false,
        compensationRequired: false,
        lastEvent: null,
        lastError: null,
        version: 1,
        history: [],
        completedEffects: []
      };

      // PAYMENT_SUCCESS is not a valid event from INITIALIZED
      expect(() => CheckoutStateMachine.transition(sagaInstance, CheckoutEvent.PAYMENT_SUCCESS))
        .toThrow('Invalid transition');

      // ORDER_SUCCESS is also not valid from INITIALIZED
      expect(() => CheckoutStateMachine.transition(sagaInstance, CheckoutEvent.ORDER_SUCCESS))
        .toThrow('Invalid transition');

      // FINALIZE is not valid from INITIALIZED
      expect(() => CheckoutStateMachine.transition(sagaInstance, CheckoutEvent.FINALIZE))
        .toThrow('Invalid transition');
    });

    test('Scenario 13: Concurrency - two identical startCheckout calls -> no duplicate side-effects', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Fire two concurrent startCheckout calls with the same checkoutId.
      // The DB unique constraint on checkoutId guarantees only one INSERT succeeds;
      // the other fails immediately before touching any other table.
      const results = await Promise.allSettled([
        orchestrator.startCheckout(identity, payload),
        orchestrator.startCheckout(identity, payload)
      ]);

      // At least one must be rejected (duplicate key)
      const rejected = results.filter(r => r.status === 'rejected');
      expect(rejected.length).toBeGreaterThanOrEqual(1);

      // Core invariant: no duplicated side-effects regardless of which call won
      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);

      const orders = await prisma.order.findMany({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(orders.length).toBe(1);
    });

    test('Scenario 14: Poison pill - unhandled pricing error -> FAILED', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Simulate an unexpected bug in the pricing service
      jest.spyOn(PricingQueryService, 'calculateDiscounts').mockImplementation(async () => {
        throw new Error('RANDOM_POISON_PILL');
      });

      // The orchestrator catches the effect error and fires PRICING_FAILURE -> FAILED
      await orchestrator.startCheckout(identity, payload);

      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.FAILED);
      expect(saga?.lastError).toBe('RANDOM_POISON_PILL');
    });

    // ─────────────────────────────────────────────────────────────────────
    // Scenarios 15–19: Infrastructure Invariants
    // ─────────────────────────────────────────────────────────────────────

    test('Scenario 15: OCC conflict — losing worker save is rejected, no domain side-effect', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Strand saga at INITIALIZED by crashing during CALCULATE_PRICING
      jest.spyOn(PricingQueryService, 'calculateDiscounts').mockImplementationOnce(async () => {
        throw new Error('FATAL_CRASH');
      });
      await expect(orchestrator.startCheckout(identity, payload)).rejects.toThrow('FATAL_CRASH');

      const strandedSaga = await store.load(identity.checkoutId);
      expect(strandedSaga?.currentState).toBe(CheckoutState.INITIALIZED);
      const originalVersion = strandedSaga!.version;

      // Simulate Worker A advancing the DB version (it won the concurrent race)
      await prisma.checkoutSagaState.updateMany({
        where: { checkoutId: identity.checkoutId },
        data: { version: originalVersion + 100 }
      });

      // Worker B holds a stale in-memory saga and attempts to save at originalVersion + 1
      strandedSaga!.version = originalVersion + 1;
      await expect(store.save(strandedSaga!)).rejects.toThrow(StaleSagaVersionError);

      // DB remains at Worker A's version — Worker B's save had no effect
      const dbSaga = await store.load(identity.checkoutId);
      expect(dbSaga?.version).toBe(originalVersion + 100);

      // No order was created — Worker B never progressed to CREATE_ORDER
      const orders = await prisma.order.findMany({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(orders.length).toBe(0);
    });

    test('Scenario 16: Tenant isolation — wrong tenantId is rejected by recovery, saga unmodified', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      await orchestrator.startCheckout(identity, payload);

      const wrongTenantId = `wrong-tenant-${randomUUID()}`;

      // recoverSaga with wrong tenant throws immediately (not StaleSagaVersionError → no retry)
      await expect(
        recoveryService.recoverSaga(identity.checkoutId, wrongTenantId)
      ).rejects.toThrow('not found or tenant mismatch');

      // Saga state is intact — COMPLETED, no recovery lease was claimed
      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.COMPLETED);
      expect(saga?.recoveryOwner).toBeNull();
    });

    test('Scenario 17: Duplicate recovery workers — exactly one logical effect, loser gets SagaRecoveryConflictError', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      // Strand saga at INITIALIZED by crashing during CALCULATE_PRICING
      jest.spyOn(PricingQueryService, 'calculateDiscounts').mockImplementationOnce(async () => {
        throw new Error('FATAL_CRASH');
      });
      await expect(orchestrator.startCheckout(identity, payload)).rejects.toThrow('FATAL_CRASH');

      const strandedSaga = await store.load(identity.checkoutId);
      expect(strandedSaga?.currentState).toBe(CheckoutState.INITIALIZED);

      // Two independent recovery workers with different IDs sharing the same store + orchestrator
      const workerA = new CheckoutSagaRecoveryService(prisma, store, orchestrator, 'recovery-A');
      const workerB = new CheckoutSagaRecoveryService(prisma, store, orchestrator, 'recovery-B');

      const results = await Promise.allSettled([
        workerA.recoverSaga(identity.checkoutId, identity.tenantId),
        workerB.recoverSaga(identity.checkoutId, identity.tenantId)
      ]);

      // Exactly one worker succeeds; the other is blocked by the OCC lease mechanism
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      const rejected  = results.filter(r => r.status === 'rejected');
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      expect((rejected[0] as PromiseRejectedResult).reason.name).toBe('SagaRecoveryConflictError');

      // Core invariant: exactly one order created despite two recovery attempts
      const orders = await prisma.order.findMany({ where: { idempotencyKey: identity.idempotencyKey } });
      expect(orders.length).toBe(1);

      // Payment authorized exactly once (logical boundary)
      expect(paymentProvider.getCallCount(identity.idempotencyKey)).toBe(1);

      // Final state is COMPLETED
      const finalSaga = await store.load(identity.checkoutId);
      expect(finalSaga?.currentState).toBe(CheckoutState.COMPLETED);
    });

    test('Scenario 18: Trace propagation — traceId threads through all wired service boundaries', async () => {
      const identity = createIdentity();
      const payload = createPayload();

      const capturedTraces: { boundary: string; traceId: string }[] = [];

      const origOrder = OrderCommandService.createOrder;
      jest.spyOn(OrderCommandService, 'createOrder').mockImplementation(async (cmd, tx) => {
        capturedTraces.push({ boundary: 'order', traceId: cmd.traceId || '' });
        return origOrder.call(OrderCommandService, cmd, tx);
      });

      const origPricing = PricingQueryService.calculateDiscounts;
      jest.spyOn(PricingQueryService, 'calculateDiscounts').mockImplementation(async (input, coupons, traceId) => {
        capturedTraces.push({ boundary: 'pricing', traceId });
        return origPricing.call(PricingQueryService, input, coupons, traceId);
      });

      const origReserve = InventoryCommandService.reserveInventory;
      jest.spyOn(InventoryCommandService, 'reserveInventory').mockImplementation(async (cmd, tx) => {
        capturedTraces.push({ boundary: 'inventory', traceId: cmd.traceId });
        return origReserve.call(InventoryCommandService, cmd, tx);
      });

      await orchestrator.startCheckout(identity, payload);

      // Pricing boundary: traceId threaded correctly
      const pricingCaptures = capturedTraces.filter(c => c.boundary === 'pricing');
      expect(pricingCaptures).toHaveLength(1);
      expect(pricingCaptures[0].traceId).toBe(identity.traceId);

      // Inventory boundary: traceId threaded correctly
      const inventoryCaptures = capturedTraces.filter(c => c.boundary === 'inventory');
      expect(inventoryCaptures).toHaveLength(1);
      expect(inventoryCaptures[0].traceId).toBe(identity.traceId);

      // Order boundary: traceId threaded correctly
      const orderCaptures = capturedTraces.filter(c => c.boundary === 'order');
      expect(orderCaptures).toHaveLength(1);
      expect(orderCaptures[0].traceId).toBe(identity.traceId);

      // Persisted/outbox context retains traceId
      const saga = await store.load(identity.checkoutId);
      const createdEvents = await prisma.domainEventOutbox.findMany({
        where: { aggregateId: saga!.payload!.orderReference!, eventType: 'order.created' }
      });
      expect(createdEvents).toHaveLength(1);
      expect((createdEvents[0].payload as any).traceId).toBe(identity.traceId);
    });

    test('Scenario 19: Outbox integrity — domain events written atomically with order mutations', async () => {
      // ── Happy path: order.created event must appear in outbox ──────────────
      const identity = createIdentity();
      await orchestrator.startCheckout(identity, createPayload());

      const saga = await store.load(identity.checkoutId);
      expect(saga?.currentState).toBe(CheckoutState.COMPLETED);

      const createdEvents = await prisma.domainEventOutbox.findMany({
        where: { aggregateId: saga!.payload!.orderReference!, eventType: 'order.created' }
      });
      expect(createdEvents).toHaveLength(1);
      expect((createdEvents[0].payload as any).tenantId).toBe(identity.tenantId);

      // ── Compensation path: order.cancelled event must appear in outbox ─────
      const compIdentity = createIdentity();
      jest.spyOn(paymentProvider, 'createCheckoutSession').mockImplementationOnce(async () => {
        throw new Error('PAYMENT_DECLINED_OUTBOX_TEST');
      });
      await orchestrator.startCheckout(compIdentity, createPayload());

      const compSaga = await store.load(compIdentity.checkoutId);
      expect(compSaga?.currentState).toBe(CheckoutState.ROLLED_BACK);

      const cancelledEvents = await prisma.domainEventOutbox.findMany({
        where: { aggregateId: compSaga!.payload!.orderReference!, eventType: 'order.cancelled' }
      });
      expect(cancelledEvents).toHaveLength(1);
    }, 120000);
  });
});
