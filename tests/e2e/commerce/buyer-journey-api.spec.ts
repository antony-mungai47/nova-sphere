import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Buyer Journey - API & Idempotency E2E', () => {
  let testUserId: string;
  let testOrderId: string;
  let testProductId: string;

  test.beforeEach(async () => {
    testUserId = `test-user-${Date.now()}`;
    testOrderId = `test-order-${Date.now()}`;
    testProductId = `test-product-${Date.now()}`;

    await prisma.user.create({
      data: {
        id: testUserId,
        clerkId: `clerk-${Date.now()}`,
        email: `api-${Date.now()}@example.com`,
        name: 'API Tester',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await prisma.product.create({
      data: {
        id: testProductId,
        name: 'API E2E Item',
        description: 'Testing API E2E',
        price: 200,
        sku: `SKU-API-${Date.now()}`,
        category: 'TEST',
        brand: 'TEST BRAND',
        status: 'ACTIVE'
      }
    });

    // Create a pending order
    await prisma.order.create({
      data: {
        id: testOrderId,
        userId: testUserId,
        status: 'PENDING',
        subtotal: 200,
        tax: 0,
        shippingCost: 0,
        totalAmount: 200,
        currency: 'USD',
        items: {
          create: [{
            productId: testProductId,
            quantity: 1,
            price: 200
          }]
        }
      }
    });
  });

  test.afterEach(async () => {
    // Clean up
    await prisma.outboxEvent.deleteMany({ where: { payload: { path: ['orderId'], equals: testOrderId } } });
    await prisma.ledgerEntry.deleteMany({ where: { orderId: testOrderId } });
    await prisma.invoice.deleteMany({ where: { orderId: testOrderId } });
    
    // Cleanup the webhook events which we mock using providerEventId
    await prisma.paymentWebhookEvent.deleteMany({ where: { provider: 'STRIPE' } });
    
    const attempts = await prisma.paymentAttempt.findMany({ where: { orderId: testOrderId } });
    for (const att of attempts) {
      await prisma.paymentTransaction.deleteMany({ where: { paymentAttemptId: att.id } });
    }
    await prisma.paymentAttempt.deleteMany({ where: { orderId: testOrderId } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrderId } });
    await prisma.order.deleteMany({ where: { id: testOrderId } });
    await prisma.product.deleteMany({ where: { id: testProductId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  test('Idempotency & Database Consistency - Processing same webhook twice', async ({ request }) => {
    const payload = {
      orderId: testOrderId,
      scenario: 'success',
      providerEventId: `evt_${Date.now()}`
    };

    // 1st request
    const response1 = await request.post('/api/checkout/simulate-webhook', {
      data: payload
    });
    expect(response1.ok()).toBeTruthy();

    // 2nd request (duplicate)
    const response2 = await request.post('/api/checkout/simulate-webhook', {
      data: payload
    });
    expect(response2.ok()).toBeTruthy(); // Should return 200 safely but do nothing

    // DB Assertions
    const attempts = await prisma.paymentAttempt.findMany({ where: { orderId: testOrderId } });
    expect(attempts.length).toBe(1);

    const transactions = await prisma.paymentTransaction.findMany({ where: { paymentAttemptId: attempts[0].id } });
    expect(transactions.length).toBe(1);
    expect(transactions[0].status).toBe('CAPTURED');

    const ledgers = await prisma.ledgerEntry.findMany({ where: { orderId: testOrderId } });
    expect(ledgers.length).toBe(2); // Double entry (CREDIT, DEBIT)

    const outbox = await prisma.outboxEvent.findMany({ 
      where: { eventType: 'PaymentCaptured' }
    });
    const orderEvents = outbox.filter(e => (e.payload as any).orderId === testOrderId);
    expect(orderEvents.length).toBe(1);
  });

  test('Compensation & Resilience - Payment Declined', async ({ request }) => {
    const payload = {
      orderId: testOrderId,
      scenario: 'payment_declined'
    };

    const response = await request.post('/api/checkout/simulate-webhook', {
      data: payload
    });
    expect(response.ok()).toBeTruthy();

    const attempts = await prisma.paymentAttempt.findMany({ where: { orderId: testOrderId } });
    expect(attempts.length).toBe(1);

    const transactions = await prisma.paymentTransaction.findMany({ where: { paymentAttemptId: attempts[0].id } });
    expect(transactions.length).toBe(1);
    expect(transactions[0].status).toBe('FAILED');
    expect((transactions[0].metadata as any).reason).toBe('card_declined');

    // Should create a PaymentFailed outbox event to trigger compensation (e.g., Inventory release)
    const outbox = await prisma.outboxEvent.findMany({ 
      where: { eventType: 'PaymentFailed' }
    });
    const orderEvents = outbox.filter(e => (e.payload as any).orderId === testOrderId);
    expect(orderEvents.length).toBe(1);
  });
});
