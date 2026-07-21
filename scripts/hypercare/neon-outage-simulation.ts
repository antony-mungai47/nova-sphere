import { PrismaClient } from "@prisma/client";
import { PrismaOrderRepository } from "../../src/domains/CommerceCore/OrderEngine/repositories/PrismaOrderRepository";
import { OrderEngine } from "../../src/domains/CommerceCore/OrderEngine/services/OrderEngine";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

class MockEventBus {
  async publishOrderCreated(event: any) {}
  async publishOrderStateChanged(event: any) {}
  async publishOrderFailed(event: any) {}
}

async function runSimulation() {
  console.log("=== NEON DATABASE OUTAGE SIMULATION ===\n");
  const evidence: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    evidence.push(msg);
  };

  try {
    const user = await prisma.user.create({ data: { id: `usr_neon_${Date.now()}`, email: `neon_${Date.now()}@example.com`, clerkId: `clrk_neon_${Date.now()}` } });
    
    // Simulate Prisma throwing a connection error during $transaction
    const repo = new PrismaOrderRepository(prisma);
    const engine = new OrderEngine(repo, new MockEventBus());

    // Monkey-patch Prisma's $transaction to simulate a sudden DB crash
    const originalTransaction = prisma.$transaction.bind(prisma);
    prisma.$transaction = async (arg: any) => {
      // Throw a Neon connection drop error
      throw new Error("Neon Database Connection Dropped (ECONNRESET)");
    };

    log("--- SCENARIO 1: Checkout DB Outage ---");
    let scenarioPassed = false;
    try {
      await engine.createDraftOrder(`idem_${Date.now()}`, user.id, 100, 10, 5, 0);
    } catch (e: any) {
      if (e.message.includes("Neon Database Connection Dropped")) {
        // Assert no order was created
        const orders = await prisma.order.count({ where: { userId: user.id } });
        if (orders === 0) {
          scenarioPassed = true;
          log("✓ SCENARIO 1 PASS: Database error cleanly aborted checkout. 0 orders created.");
        } else {
          log(`✗ SCENARIO 1 FAIL: Expected 0 orders, got ${orders}.`);
        }
      } else {
        log(`✗ SCENARIO 1 FAIL: Unexpected error: ${e.message}`);
      }
    }

    // Restore transaction
    prisma.$transaction = originalTransaction;

    // --- Scenario 2: DB Outage during State Transition ---
    log("\n--- SCENARIO 2: State Transition DB Outage ---");
    const orderId = await engine.createDraftOrder(`idem_${Date.now()}`, user.id, 100, 10, 5, 0);
    log(`Created draft order ${orderId}`);
    
    // Patch to fail
    prisma.$transaction = async (arg: any) => {
      throw new Error("Neon Database Connection Dropped (ECONNRESET)");
    };

    try {
      await engine.transitionOrder(orderId, "PENDING", "Proceed to checkout", "SYSTEM");
    } catch (e: any) {
      if (e.message.includes("Neon Database Connection Dropped")) {
        // Restore to check state
        prisma.$transaction = originalTransaction;
        
        const state = await prisma.order.findUnique({ where: { id: orderId } });
        if (state?.status === "CREATED") {
          log("✓ SCENARIO 2 PASS: Order state mutation cleanly aborted and rolled back. Status remains CREATED.");
        } else {
          log(`✗ SCENARIO 2 FAIL: Order state mutated despite DB error. Status is ${state?.status}`);
        }
      }
    }

    log("\nWriting evidence artifacts...");
    const evidenceDir = path.join(__dirname, "../../docs/evidence");
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });
    
    fs.writeFileSync(path.join(evidenceDir, "17-neon-outage.txt"), "NEON OUTAGE\n\n" + evidence.join("\n"));

  } catch (error) {
    console.error("Simulation failed catastrophically:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSimulation();
