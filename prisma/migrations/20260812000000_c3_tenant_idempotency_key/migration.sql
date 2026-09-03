-- DropIndex
DROP INDEX "CheckoutSagaState_idempotencyKey_key";

-- AlterTable
ALTER TABLE "CheckoutSagaState" ADD COLUMN     "requestFingerprint" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "checkout_saga_tenant_idempotency_key" ON "CheckoutSagaState"("tenantId", "idempotencyKey");
