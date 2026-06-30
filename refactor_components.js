const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function moveDirectory(src, dest) {
  if (fs.existsSync(src)) {
    fs.cpSync(src, dest, { recursive: true });
    fs.rmSync(src, { recursive: true, force: true });
    console.log(`Moved ${src} to ${dest}`);
  }
}

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
moveDirectory(path.join(srcDir, 'components', 'home'), path.join(srcDir, 'domains', 'Experience', 'components', 'home'));
moveDirectory(path.join(srcDir, 'components', 'cart'), path.join(srcDir, 'domains', 'Commerce', 'checkout', 'components', 'cart'));
moveDirectory(path.join(srcDir, 'components', 'store'), path.join(srcDir, 'domains', 'Commerce', 'products', 'components', 'store'));
moveDirectory(path.join(srcDir, 'components', 'support'), path.join(srcDir, 'shared', 'components', 'support'));

moveFile(path.join(srcDir, 'components', 'theme-provider.tsx'), path.join(srcDir, 'domains', 'Experience', 'components', 'theme-provider.tsx'));
moveFile(path.join(srcDir, 'components', 'analytics.tsx'), path.join(srcDir, 'domains', 'Operations', 'components', 'analytics.tsx'));

// Replacements
const replacements = [
  { from: '@/components/home/', to: '@/domains/Experience/components/home/' },
  { from: '@/components/cart/', to: '@/domains/Commerce/checkout/components/cart/' },
  { from: '@/components/store/', to: '@/domains/Commerce/products/components/store/' },
  { from: '@/components/support/', to: '@/shared/components/support/' },
  { from: '@/components/theme-provider', to: '@/domains/Experience/components/theme-provider' },
  { from: '@/components/analytics', to: '@/domains/Operations/components/analytics' }
];

replaceInFiles(srcDir, replacements);

// Delete the old components folder if empty
const componentsPath = path.join(srcDir, 'components');
if (fs.existsSync(componentsPath) && fs.readdirSync(componentsPath).length === 0) {
  fs.rmSync(componentsPath, { recursive: true, force: true });
  console.log('Removed empty src/components directory.');
}

console.log("Remaining UI Refactoring Complete.");
