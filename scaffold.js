const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const domains = [
  'Foundation/auth',
  'Foundation/database',
  'Foundation/feature-flags',
  'Foundation/events',
  'Commerce/products',
  'Commerce/inventory',
  'Commerce/checkout',
  'Commerce/pricing',
  'Marketplace/auctions',
  'Marketplace/sellers',
  'Marketplace/reviews',
  'Customer/account',
  'Customer/orders',
  'Customer/wishlist',
  'Admin/dashboard',
  'Admin/reports',
  'Experience/themes',
  'Experience/animations',
  'Experience/ui',
  'Operations/monitoring',
  'Operations/security',
  'Search',
  'Recommendations',
  'Notifications'
];

const subfolders = [
  'components',
  'actions',
  'services',
  'repositories',
  'validators',
  'schemas',
  'types',
  'events',
  'tests'
];

const sharedFolders = [
  'hooks',
  'constants',
  'validators',
  'config',
  'schemas',
  'helpers',
  'icons',
  'assets',
  'errors',
  'utilities',
  'components'
];

console.log("Setting up Domain-Driven Design scaffolding...");

// Create Domains
domains.forEach(domain => {
  const domainPath = path.join(srcDir, 'domains', domain);
  
  if (!fs.existsSync(domainPath)) {
    fs.mkdirSync(domainPath, { recursive: true });
  }

  // Create standard subfolders
  subfolders.forEach(sub => {
    const subPath = path.join(domainPath, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  });
});

// Create Shared
sharedFolders.forEach(folder => {
  const sharedPath = path.join(srcDir, 'shared', folder);
  if (!fs.existsSync(sharedPath)) {
    fs.mkdirSync(sharedPath, { recursive: true });
  }
});

console.log("Scaffolding complete.");
