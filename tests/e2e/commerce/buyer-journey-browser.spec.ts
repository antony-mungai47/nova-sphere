import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Buyer Journey - Browser E2E', () => {
  let testUserId: string;
  let testOrderId: string;
  let testProductId: string;

  test.beforeAll(async () => {
    testUserId = `test-user-${Date.now()}`;
    testOrderId = `test-order-${Date.now()}`;
    testProductId = `test-product-${Date.now()}`;

    // Create a mock user, product, and order so we can navigate straight to simulate checkout page
    await prisma.user.create({
      data: {
        id: testUserId,
        clerkId: `clerk-${Date.now()}`,
        email: `buyer-${Date.now()}@example.com`,
        name: 'Browser Tester',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    await prisma.product.create({
      data: {
        id: testProductId,
        name: 'Browser E2E Item',
        description: 'Testing Browser E2E',
        price: 150,
        sku: `SKU-${Date.now()}`,
        category: 'TEST',
        brand: 'TEST BRAND',
        status: 'ACTIVE'
      }
    });

    await prisma.order.create({
      data: {
        id: testOrderId,
        userId: testUserId,
        status: 'PENDING',
        subtotal: 150,
        tax: 0,
        shippingCost: 0,
        totalAmount: 150,
        currency: 'USD',
        items: {
          create: [{
            productId: testProductId,
            quantity: 1,
            price: 150
          }]
        }
      }
    });
  });

  test.afterAll(async () => {
    // Add complete cleanup
    await prisma.outboxEvent.deleteMany({ where: { payload: { path: ['orderId'], equals: testOrderId } } });
    await prisma.ledgerEntry.deleteMany({ where: { orderId: testOrderId } });
    await prisma.invoice.deleteMany({ where: { orderId: testOrderId } });
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

  test('Happy path UI flow - completes checkout successfully', async ({ page }) => {
    // Navigate straight to the simulate page with the real order ID
    await page.goto(`/checkout/simulate?orderId=${testOrderId}`);
    
    // Verify we are on the simulate page
    await expect(page.locator('h1')).toContainText('Secure Checkout Simulation');
    
    // Select the success scenario
    await page.selectOption('select[name="scenario"]', 'success');

    // Submit the payment
    await page.click('button[type="submit"]');

    // Should redirect to success
    await expect(page).toHaveURL(/\/checkout\/success/, { timeout: 15000 });
  });

});
