const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function moveFile(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest);
    fs.rmSync(src, { force: true });
    console.log(`Moved ${src} to ${dest}`);
  }
}

function replaceInFiles(dir, replacements) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath, replacements);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { from, to } of replacements) {
        if (content.includes(from)) {
          content = content.split(from).join(to);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

// Moves
moveFile(path.join(srcDir, 'app', 'actions', 'auction.ts'), path.join(srcDir, 'domains', 'Marketplace', 'auctions', 'actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'order.ts'), path.join(srcDir, 'domains', 'Customer', 'orders', 'actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'product.ts'), path.join(srcDir, 'domains', 'Commerce', 'products', 'actions.ts'));
// we'll leave products.ts for manual merging later, or move it to a specific name
moveFile(path.join(srcDir, 'app', 'actions', 'products.ts'), path.join(srcDir, 'domains', 'Commerce', 'products', 'search-actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'reviews.ts'), path.join(srcDir, 'domains', 'Marketplace', 'reviews', 'actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'saved-searches.ts'), path.join(srcDir, 'domains', 'Search', 'actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'support.ts'), path.join(srcDir, 'domains', 'Customer', 'account', 'support-actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'user.ts'), path.join(srcDir, 'domains', 'Customer', 'account', 'actions.ts'));
moveFile(path.join(srcDir, 'app', 'actions', 'wishlist.ts'), path.join(srcDir, 'domains', 'Customer', 'wishlist', 'actions.ts'));

// Replacements
const replacements = [
  { from: '@/app/actions/auction', to: '@/domains/Marketplace/auctions/actions' },
  { from: '@/app/actions/order', to: '@/domains/Customer/orders/actions' },
  { from: '@/app/actions/product', to: '@/domains/Commerce/products/actions' },
  { from: '@/app/actions/products', to: '@/domains/Commerce/products/search-actions' },
  { from: '@/app/actions/reviews', to: '@/domains/Marketplace/reviews/actions' },
  { from: '@/app/actions/saved-searches', to: '@/domains/Search/actions' },
  { from: '@/app/actions/support', to: '@/domains/Customer/account/support-actions' },
  { from: '@/app/actions/user', to: '@/domains/Customer/account/actions' },
  { from: '@/app/actions/wishlist', to: '@/domains/Customer/wishlist/actions' }
];

replaceInFiles(srcDir, replacements);

// Delete the old actions folder
const actionsPath = path.join(srcDir, 'app', 'actions');
if (fs.existsSync(actionsPath)) {
  fs.rmSync(actionsPath, { recursive: true, force: true });
  console.log('Removed old src/app/actions directory.');
}

console.log("Actions Refactoring Complete.");
