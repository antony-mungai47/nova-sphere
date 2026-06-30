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

function replacePrismaCalls(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replacePrismaCalls(fullPath);
    } else if ((fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) && !fullPath.includes('repositories')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      const importsToAdd = new Set();
      
      for (const [model, domain] of Object.entries(modelDomainMap)) {
        const repoName = model.charAt(0).toUpperCase() + model.slice(1) + 'Repository';
        const searchRegex = new RegExp(`prisma\\.${model}\\.`, 'g');
        
        if (searchRegex.test(content)) {
          content = content.replace(searchRegex, `${repoName}.`);
          importsToAdd.add(`import { ${repoName} } from "@/domains/${domain}/repositories/${model}.repository";`);
          modified = true;
        }
      }

      if (modified) {
        // Add imports at the top (after other imports ideally, but top is fine for now)
        const importStr = Array.from(importsToAdd).join('\n') + '\n';
        content = importStr + content;
        
        // Optionally remove import { prisma } if it's no longer used
        if (!content.includes('prisma.')) {
           content = content.replace(/import \{ prisma \} from "@\/lib\/prisma";?\n?/g, '');
        }

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated Prisma calls in ${fullPath}`);
      }
    }
  }
}

replacePrismaCalls(path.join(srcDir, 'app'));
replacePrismaCalls(path.join(srcDir, 'domains')); // In case actions use it

console.log("Prisma Refactoring Complete.");
