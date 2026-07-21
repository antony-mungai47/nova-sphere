import { PrismaClient } from "@prisma/client";
import { PaymentEngine } from "../../src/domains/CommerceCore/PaymentEngine/services/PaymentEngine";
import { PrismaPaymentRepository } from "../../src/domains/CommerceCore/PaymentEngine/repositories/PrismaPaymentRepository";
import { MockPaymentProvider } from "../../src/domains/CommerceCore/PaymentEngine/providers/MockPaymentProvider";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function runSimulation() {
  console.log("=== STRIPE WEBHOOK DELIVERY FAILURE SIMULATION ===\n");
  const evidence: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    evidence.push(msg);
  };

  try {
    // 1. Setup Mock Data
    log("1. Setting up mock environment...");
    const user = await prisma.user.create({
      data: {
        id: `usr_sim_${Date.now()}`,
        email: `sim_${Date.now()}@example.com`,
        clerkId: `clrk_${Date.now()}`
      }
    });

    const product = await prisma.product.create({
      data: {
        name: "Hypercare Test Product",
        description: "Test",
        price: 100,
        sku: `sim-sku-${Date.now()}`,
        category: "TestCategory",
        brand: "TestBrand",
        stock: 5,
        status: "ACTIVE"
      }
    });

    const createOrder = async () => prisma.order.create({
      data: {
        userId: user.id,
        status: "PENDING",
        totalAmount: 100,
        subtotal: 100,
        tax: 0,
        shippingCost: 0
      }
    });

    let order = await createOrder();
    log(`Created Order ${order.id} for Product ${product.id}`);

    // Setup engine
    const repo = new PrismaPaymentRepository(prisma);
    const provider = new MockPaymentProvider();
    const engine = new PaymentEngine(repo, provider);

    const sendWebhook = async (eventId: string, targetOrderId: string = order.id, simulateFailure: boolean = false) => {
      const payload = JSON.stringify({
        scenario: "success",
        orderId: targetOrderId,
        amount: 100,
        currency: "USD",
        providerEventId: eventId,
        simulateOutboxFailure: simulateFailure
      });
      return engine.processWebhook(payload, "mock_sig");
    };

    // SCENARIO 1: First Webhook
    log("\n--- SCENARIO 1: First Webhook ---");
    const eventId1 = `evt_sim_${Date.now()}_1`;
    await sendWebhook(eventId1);
    
    let attempt1 = await prisma.paymentAttempt.findFirst({ where: { orderId: order.id } });
    if (attempt1?.status === "CAPTURED") {
      log("✓ SCENARIO 1 PASS: Order captured successfully on first webhook.");
    } else {
      log("✗ SCENARIO 1 FAIL: Order not captured.");
    }

    // SCENARIO 2: 50 Concurrent Webhooks (Stress Test)
    log("\n--- SCENARIO 2: 50 Concurrent Webhooks (Stress Test) ---");
    const concurrentOrder = await createOrder();
    const concurrentRequests = Array.from({ length: 50 }).map((_, i) => {
      return sendWebhook(`evt_sim_stress_${Date.now()}_${i}`, concurrentOrder.id).catch(e => {
        // Suppress expected transaction timeouts (P2028) or lock timeouts under heavy SQLite concurrency
        if (!e.message.includes("Unable to start a transaction")) {
          // console.error(e);
        }
      });
    });

    await Promise.all(concurrentRequests);

    const successfulAttempts = await prisma.paymentAttempt.count({
      where: { orderId: concurrentOrder.id, status: "CAPTURED" }
    });

    const ledgers = await prisma.ledgerEntry.count({
      where: { orderId: concurrentOrder.id }
    });

    const outboxEvents = await prisma.outboxEvent.count({
      where: { eventType: "PaymentCaptured", payload: { path: ["orderId"], equals: concurrentOrder.id } }
    });

    if (successfulAttempts === 1 && ledgers === 2 && outboxEvents === 1) {
      log("✓ SCENARIO 2 PASS: 50 Concurrent webhooks resulted in exactly 1 successful attempt, 1 outbox event, and 2 ledger entries.");
    } else {
      log(`✗ SCENARIO 2 FAIL: Concurrency failed. Attempts: ${successfulAttempts}, Ledgers: ${ledgers}, Outbox: ${outboxEvents}`);
    }

    // SCENARIO 3: Outbox Rollback
    log("\n--- SCENARIO 3: Outbox Rollback ---");
    
    // We mock the Engine temporarily to pass simulateOutboxFailure to the Repository.
    // In our implementation plan, we added this boolean flag to the repository.
    // Let's directly call the repository to inject the failure, simulating a crash during the webhook process.
    
    const rollbackOrder = await createOrder();
    const attemptId = await repo.createPaymentAttempt(rollbackOrder.id);
    
    try {
      await repo.recordSuccessfulPayment(attemptId, rollbackOrder.id, 100, "USD", "pi_sim_fail", "evt_sim_fail", true);
      log("✗ SCENARIO 3 FAIL: No exception was thrown during simulated outbox failure.");
    } catch (e: any) {
      if (e.message === "SIMULATED_OUTBOX_FAILURE") {
        // Assert Rollback
        const attempt = await prisma.paymentAttempt.findUnique({ where: { id: attemptId } });
        const failedLedgers = await prisma.ledgerEntry.count({ where: { orderId: rollbackOrder.id } });
        const failedOutbox = await prisma.outboxEvent.count({ where: { payload: { path: ["orderId"], equals: rollbackOrder.id } } });
        const orderState = await prisma.order.findUnique({ where: { id: rollbackOrder.id } });

        if (attempt?.status === "CREATED" && failedLedgers === 0 && failedOutbox === 0 && orderState?.status === "PENDING") {
          log("✓ SCENARIO 3 PASS: Outbox failure perfectly rolled back Order, Attempt, and Ledgers.");
        } else {
          log(`✗ SCENARIO 3 FAIL: Partial commit detected! Attempt: ${attempt?.status}, Ledgers: ${failedLedgers}, Outbox: ${failedOutbox}, Order: ${orderState?.status}`);
        }
      } else {
        log(`✗ SCENARIO 3 FAIL: Unexpected error: ${e.message}`);
      }
    }

    // Write evidence
    log("\nWriting evidence to docs/evidence/18-stripe-concurrency-stress.txt");
    const evidenceDir = path.join(__dirname, "../../docs/evidence");
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
    fs.writeFileSync(path.join(evidenceDir, "18-stripe-concurrency-stress.txt"), evidence.join("\n"));

  } catch (error) {
    console.error("Simulation failed catastrophically:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
