const fs = require('fs');

const path = 'prisma/migrations/1_type_modernization/migration.sql';
let sql = fs.readFileSync(path, 'utf8');

// Strip old prepend if it exists
if (sql.includes('-- Fix data before type change')) {
    sql = sql.substring(sql.indexOf('-- CreateEnum'));
}

const fixScript = `
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

`;

fs.writeFileSync(path, fixScript + sql, 'utf8');
console.log('Prepended correct data sanitization to migration.sql');
