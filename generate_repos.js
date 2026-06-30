const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

// Define domain mappings for models
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

function generateRepository(modelName, domainPath) {
  const repoName = modelName.charAt(0).toUpperCase() + modelName.slice(1) + 'Repository';
  const repoCode = `import { prisma } from "@/lib/prisma";

export class ${repoName} {
  static async findUnique(args: any) { return prisma.${modelName}.findUnique(args); }
  static async findFirst(args: any) { return prisma.${modelName}.findFirst(args); }
  static async findMany(args: any = {}) { return prisma.${modelName}.findMany(args); }
  static async create(args: any) { return prisma.${modelName}.create(args); }
  static async update(args: any) { return prisma.${modelName}.update(args); }
  static async delete(args: any) { return prisma.${modelName}.delete(args); }
  static async count(args: any = {}) { return prisma.${modelName}.count(args); }
}
`;
  
  const repoDir = path.join(srcDir, 'domains', ...domainPath.split('/'), 'repositories');
  if (!fs.existsSync(repoDir)) fs.mkdirSync(repoDir, { recursive: true });
  
  const repoFile = path.join(repoDir, `${modelName}.repository.ts`);
  if (!fs.existsSync(repoFile)) {
    fs.writeFileSync(repoFile, repoCode);
    console.log(`Generated ${repoName} at ${repoFile}`);
  }
}

// Generate base repositories
for (const [model, domain] of Object.entries(modelDomainMap)) {
  generateRepository(model, domain);
}

console.log("Base Repositories Generated.");
