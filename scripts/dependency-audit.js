const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const GRAPH_PATH = path.join(__dirname, '../DEPENDENCY_GRAPH.md');
const SOT_PATH = path.join(__dirname, '../SOURCE_OF_TRUTH.md');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(path.join(dir, file), fileList);
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(path.join(dir, file));
      }
    }
  }
  return fileList;
}

const allFiles = walk(SRC_DIR);
const dependencies = {};

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  
  const imports = content.match(/from ['"]([^'"]+)['"]/g) || [];
  const moduleName = relative.split('/')[0] === 'app' ? 'Presentation' : 
                     relative.split('/')[0] === 'domains' ? relative.split('/')[1] : 
                     relative.split('/')[0];

  if (!dependencies[moduleName]) dependencies[moduleName] = new Set();
  
  imports.forEach(imp => {
    if (imp.includes('@/domains/')) {
      const match = imp.match(/@\/domains\/([^/]+)/);
      if (match && match[1] !== moduleName) {
        dependencies[moduleName].add(match[1]);
      }
    } else if (imp.includes('@/lib/prisma')) {
      dependencies[moduleName].add('Infrastructure(Prisma)');
    } else if (imp.includes('stripe')) {
      dependencies[moduleName].add('Infrastructure(Stripe)');
    } else if (imp.includes('posthog')) {
      dependencies[moduleName].add('Infrastructure(PostHog)');
    }
  });
});

let graph = `# Nova Sphere Dependency Graph\n\n`;
graph += `## Domain Interactions\n\n`;
graph += '```mermaid\nflowchart TD\n';

for (const [module, deps] of Object.entries(dependencies)) {
  if (module === 'app') continue; // Grouping app as Presentation
  deps.forEach(dep => {
    graph += `  ${module} --> ${dep}\n`;
  });
}
graph += '```\n';

fs.writeFileSync(GRAPH_PATH, graph);
console.log('Dependency Graph generated.');

let sot = `# Source of Truth Audit\n\n`;
sot += `| Domain | Current Fragmented Owners | Final Proposed Owner |\n`;
sot += `|--------|---------------------------|----------------------|\n`;
sot += `| **Inventory** | Cart, Orders, Auctions, ProductService, CommerceCore/InventoryEngine, Commerce/inventory/InventoryEngine | \`InventoryService\` (Application Layer) |\n`;
sot += `| **Products** | CommerceCore, Merchandising, Storefront UI, Admin UI | \`ProductService\` (Application Layer) |\n`;
sot += `| **Images** | UI Fallbacks, \`src/lib/cloudinary\`, Product Entity | \`ImageService\` (Application Layer) |\n`;
sot += `| **Payments** | Finance/PaymentEngine, CommerceCore/PaymentEngine | \`PaymentService\` (Application Layer) |\n`;
sot += `| **Users/Auth** | Middleware, Clerk Webhooks, Admin Guards | \`UserService\` (Application Layer) |\n`;
sot += `| **Analytics** | lib/analytics.ts, inngest/functions, PostHogProvider | \`AnalyticsService\` (Infrastructure Layer) |\n\n`;
sot += `> **Conclusion:** Almost every domain has 2 or more conflicting engines operating on the same underlying data models.\n`;

fs.writeFileSync(SOT_PATH, sot);
console.log('Source of Truth Audit generated.');
