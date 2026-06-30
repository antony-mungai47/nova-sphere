import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const models = [
    'User', 'Address', 'Product', 'ProductImage', 'Review', 'WishlistItem',
    'Coupon', 'Order', 'OrderItem', 'StoreSettings', 'SupportTicket',
    'TicketMessage', 'Auction', 'Bid', 'RecentlyViewed', 'SavedSearch',
    'AdminLog', 'Transaction', 'SystemLog', 'FeatureFlag', 'FeatureFlagHistory'
  ];

  const counts: Record<string, number> = {};

  console.log('Collecting baseline data...');
  for (const model of models) {
    // @ts-expect-error global process exists
    counts[model] = await prisma[model.charAt(0).toLowerCase() + model.slice(1)].count();
  }

  const baseline = {
    timestamp: new Date().toISOString(),
    databaseUrl: process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@'),
    tableCounts: counts
  };

  fs.writeFileSync('db-baseline-report.json', JSON.stringify(baseline, null, 2));
  console.log('Baseline report generated at db-baseline-report.json');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
