const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const modelDomainMap = {
  'user': 'Foundation/database',
  'order': 'Customer/orders',
  'product': 'Commerce/products',
  'auction': 'Marketplace/auctions',
  'review': 'Marketplace/reviews',
  'coupon': 'Commerce/pricing',
  'wishlistItem': 'Customer/wishlist',
  'systemLog': 'Foundation/database',
  'adminLog': 'Foundation/database',
  'ticketMessage': 'Customer/support',
  'supportTicket': 'Customer/support',
  'storeSettings': 'Admin/settings'
};

function generateTypedRepository(modelName, domainPath) {
  const repoName = modelName.charAt(0).toUpperCase() + modelName.slice(1) + 'Repository';
  
  let customMethods = '';
  if (modelName === 'product') {
    customMethods = `
  getTrendingProducts: async (preferredCategories: string[], take: number = 8) => {
    return prisma.product.findMany({
      where: preferredCategories.length > 0 ? {
        OR: [
          { category: { in: preferredCategories } },
          { isTrending: true }
        ]
      } : { isTrending: true },
      include: { images: true },
      orderBy: { rating: 'desc' },
      take,
    });
  },
  getFeaturedProducts: async (minRating: number = 4.5, take: number = 6) => {
    return prisma.product.findMany({
      where: { rating: { gte: minRating } },
      include: { images: true },
      orderBy: { reviewCount: "desc" },
      take,
    });
  },
`;
  } else if (modelName === 'auction') {
    customMethods = `
  getActiveAuctions: async (take: number = 4) => {
    return prisma.auction.findMany({
      where: { status: "ACTIVE" },
      include: {
        product: {
          include: { images: true }
        }
      },
      orderBy: { endTime: "asc" },
      take
    });
  },
`;
  }

  const repoCode = `import { prisma } from "@/lib/prisma";

export const ${repoName} = {
  ...prisma.${modelName},${customMethods}
};
`;
  
  const repoDir = path.join(srcDir, 'domains', ...domainPath.split('/'), 'repositories');
  if (!fs.existsSync(repoDir)) fs.mkdirSync(repoDir, { recursive: true });
  
  const repoFile = path.join(repoDir, `${modelName}.repository.ts`);
  fs.writeFileSync(repoFile, repoCode);
  console.log(`Generated perfectly typed ${repoName} at ${repoFile}`);
}

for (const [model, domain] of Object.entries(modelDomainMap)) {
  generateTypedRepository(model, domain);
}

console.log("Typed Repositories Generated.");
