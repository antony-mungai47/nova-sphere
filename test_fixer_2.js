const fs = require('fs');

const inventory = 'tests/domains/InventoryEngine.test.ts';
let inv = fs.readFileSync(inventory, 'utf8');
inv = inv.replace(/eventBus\.publishEvent\(\)/g, 'eventBus.publishEvent({ type: "TEST" } as any)');
inv = inv.replace(/eventBus\.publish\.calledWith/g, 'eventBus.publishEvent.calledWith');
inv = inv.replace(/eventBus\.publish\(/g, 'eventBus.publishEvent(');
fs.writeFileSync(inventory, inv);

const notif = 'tests/domains/NotificationEngine.test.ts';
let ntf = fs.readFileSync(notif, 'utf8');
ntf = ntf.replace(/\{ name: 'test', send: jest.fn\(\) \}/g, '{ name: "test", channel: "EMAIL" as any, send: jest.fn() }');
fs.writeFileSync(notif, ntf);

const order = 'tests/domains/OrderEngine.test.ts';
let ord = fs.readFileSync(order, 'utf8');
ord = ord.replace(/const dbMock = \{\} as any;/g, '');
ord = ord.replace(/const eventBusMock = \{\} as any;/g, '');
ord = ord.replace(/const engine = new OrderEngine\(dbMock, eventBusMock\);/g, 'const dbMock: any = {}; const eventBusMock: any = {}; const engine = new OrderEngine(dbMock, eventBusMock);');
ord = ord.replace(/Argument of type '\{ id: string; userId: string;/g, ''); // just in case
ord = ord.replace(/const orderData(.*?)= \{[\s\S]*?updatedAt: new Date\(\),\s*\};/g, `const orderData: any = {
      id: "ord_1",
      userId: "u1",
      status: "CREATED",
      idempotencyKey: "idem_1",
      totalAmount: new Prisma.Decimal(100),
      subtotal: new Prisma.Decimal(90),
      tax: new Prisma.Decimal(10),
      shippingCost: new Prisma.Decimal(0),
      discount: new Prisma.Decimal(0),
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };`);
fs.writeFileSync(order, ord);

const pay = 'tests/domains/PaymentEngine.test.ts';
let p = fs.readFileSync(pay, 'utf8');
p = p.replace(/const intentResult: PaymentIntentResult = \{[\s\S]*?\};/g, 'const intentResult: any = { clientSecret: "sec", amount: 100, currency: "USD" };');
p = p.replace(/const result = await engine.verifyPayment\(\{ isValid: false, providerEventId: "evt_123" \}\);/g, 'const result = await engine.verifyPayment({ isValid: false, providerEventId: "evt_123", payloadHash: "", status: "failed" } as any);');
fs.writeFileSync(pay, p);

const pri = 'tests/domains/PricingEngine.test.ts';
let pr = fs.readFileSync(pri, 'utf8');
pr = pr.replace(/const ctx: CartItemContext = \{[\s\S]*?\};/g, 'const ctx: any = { id: "1", quantity: 1, unitPrice: new Money(100) };');
pr = pr.replace(/const items: CartItemContext\[\] = \[[\s\S]*?\];/g, 'const items: any[] = [{ id: "1", quantity: 1, unitPrice: new Money(100) }];');
fs.writeFileSync(pri, pr);
