
-- Fix data before type change
UPDATE "FeatureFlag" SET "type" = 'KillSwitch' WHERE "type" = 'Kill Switch';
UPDATE "FeatureFlag" SET "type" = 'Release' WHERE "type" = 'Release';
UPDATE "FeatureFlag" SET "type" = 'Experiment' WHERE "type" = 'Experiment';
UPDATE "FeatureFlag" SET "type" = 'Operational' WHERE "type" = 'Operational';
UPDATE "FeatureFlag" SET "type" = 'Permission' WHERE "type" = 'Permission';

UPDATE "Auction" SET "status" = 'ACTIVE' WHERE "status" NOT IN ('ACTIVE', 'ENDED', 'CANCELLED');
UPDATE "Order" SET "status" = 'PENDING' WHERE "status" NOT IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
UPDATE "SupportTicket" SET "status" = 'OPEN' WHERE "status" NOT IN ('OPEN', 'IN_PROGRESS', 'RESOLVED');
UPDATE "SystemLog" SET "level" = 'INFO' WHERE "level" NOT IN ('INFO', 'WARN', 'ERROR', 'FATAL');
UPDATE "TicketMessage" SET "sender" = 'CUSTOMER' WHERE "sender" NOT IN ('CUSTOMER', 'ADMIN');
UPDATE "Transaction" SET "type" = 'CHARGE' WHERE "type" NOT IN ('CHARGE', 'REFUND');
UPDATE "Transaction" SET "status" = 'PENDING' WHERE "status" NOT IN ('SUCCEEDED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateEnum
CREATE TYPE "TicketSender" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('CHARGE', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('INFO', 'WARN', 'ERROR', 'FATAL');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FeatureFlagType" AS ENUM ('Release', 'Experiment', 'Operational', 'KillSwitch', 'Permission');

-- AlterTable
ALTER TABLE "AdminLog" ALTER COLUMN "details" DROP DEFAULT,
ALTER COLUMN "details" TYPE JSONB USING "details"::text::JSONB,
ALTER COLUMN "details" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "startingBid" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "currentBid" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "AuctionStatus" USING "status"::text::"AuctionStatus",
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Bid" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "FeatureFlag" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "type" TYPE "FeatureFlagType" USING "type"::text::"FeatureFlagType",
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "enabledForRoles" DROP DEFAULT,
ALTER COLUMN "enabledForRoles" TYPE JSONB USING "enabledForRoles"::text::JSONB,
ALTER COLUMN "enabledForRoles" DROP NOT NULL,
ALTER COLUMN "enabledForCountries" DROP DEFAULT,
ALTER COLUMN "enabledForCountries" TYPE JSONB USING "enabledForCountries"::text::JSONB,
ALTER COLUMN "enabledForCountries" DROP NOT NULL,
ALTER COLUMN "enabledForUsers" DROP DEFAULT,
ALTER COLUMN "enabledForUsers" TYPE JSONB USING "enabledForUsers"::text::JSONB,
ALTER COLUMN "enabledForUsers" DROP NOT NULL,
ALTER COLUMN "dependencies" DROP DEFAULT,
ALTER COLUMN "dependencies" TYPE JSONB USING "dependencies"::text::JSONB,
ALTER COLUMN "dependencies" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FeatureFlagHistory" ALTER COLUMN "oldValue" DROP DEFAULT,
ALTER COLUMN "oldValue" TYPE JSONB USING "oldValue"::text::JSONB,
ALTER COLUMN "oldValue" DROP NOT NULL,
ALTER COLUMN "newValue" DROP DEFAULT,
ALTER COLUMN "newValue" TYPE JSONB USING "newValue"::text::JSONB,
ALTER COLUMN "newValue" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "tax" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "shippingCost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "OrderStatus" USING "status"::text::"OrderStatus",
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "deleteReason" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedBy" TEXT,
ADD COLUMN     "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedBy" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "salePrice" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "specs" DROP DEFAULT,
ALTER COLUMN "specs" TYPE JSONB USING "specs"::text::JSONB,
ALTER COLUMN "specs" DROP NOT NULL,
ALTER COLUMN "features" DROP DEFAULT,
ALTER COLUMN "features" TYPE JSONB USING "features"::text::JSONB,
ALTER COLUMN "features" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SavedSearch" ALTER COLUMN "filters" DROP DEFAULT,
ALTER COLUMN "filters" TYPE JSONB USING "filters"::text::JSONB,
ALTER COLUMN "filters" DROP NOT NULL;

-- AlterTable
ALTER TABLE "StoreSettings" ALTER COLUMN "homepageLayout" DROP DEFAULT,
ALTER COLUMN "homepageLayout" TYPE JSONB USING "homepageLayout"::text::JSONB,
ALTER COLUMN "homepageLayout" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SupportTicket" ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "TicketStatus" USING "status"::text::"TicketStatus",
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "SystemLog" ALTER COLUMN "level" DROP DEFAULT,
ALTER COLUMN "level" TYPE "LogLevel" USING "level"::text::"LogLevel",
ALTER COLUMN "level" SET NOT NULL,
ALTER COLUMN "metadata" DROP DEFAULT,
ALTER COLUMN "metadata" TYPE JSONB USING "metadata"::text::JSONB,
ALTER COLUMN "metadata" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TicketMessage" ALTER COLUMN "sender" DROP DEFAULT,
ALTER COLUMN "sender" TYPE "TicketSender" USING "sender"::text::"TicketSender",
ALTER COLUMN "sender" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "type" DROP DEFAULT,
ALTER COLUMN "type" TYPE "TransactionType" USING "type"::text::"TransactionType",
ALTER COLUMN "type" SET NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" TYPE "TransactionStatus" USING "status"::text::"TransactionStatus",
ALTER COLUMN "status" SET NOT NULL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Auction_productId_idx" ON "Auction"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Auction_status_endTime_idx" ON "Auction"("status", "endTime");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bid_auctionId_idx" ON "Bid"("auctionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Bid_userId_idx" ON "Bid"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_status_category_idx" ON "Product"("status", "category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_brand_price_idx" ON "Product"("brand", "price");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RecentlyViewed_productId_idx" ON "RecentlyViewed"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedSearch_userId_idx" ON "SavedSearch"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_idx" ON "TicketMessage"("ticketId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WishlistItem_userId_idx" ON "WishlistItem"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WishlistItem_productId_idx" ON "WishlistItem"("productId");

