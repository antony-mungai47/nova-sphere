const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const testOrderId = `test-order-${Date.now()}`;
  const testUserId = `test-user-${Date.now()}`;
  
  await prisma.user.create({
    data: { id: testUserId, clerkId: `c-${Date.now()}`, email: `c@example.com`, name: 'c' }
  });
  
  await prisma.order.create({
    data: {
      id: testOrderId,
      userId: testUserId,
      status: 'PENDING',
      subtotal: 100, tax: 0, shippingCost: 0, totalAmount: 100, currency: 'USD'
    }
  });
  
  const res = await fetch('http://localhost:3000/api/checkout/simulate-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: testOrderId, scenario: 'success' })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Body:', text);
  
  process.exit(0);
}
run();
