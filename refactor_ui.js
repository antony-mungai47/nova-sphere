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
        // Simple string replace for now (could be regex if needed)
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

// 1. Move UI components
moveDirectory(path.join(srcDir, 'components', 'ui'), path.join(srcDir, 'shared', 'components', 'ui'));
moveDirectory(path.join(srcDir, 'components', 'layout'), path.join(srcDir, 'shared', 'components', 'layout'));

// 2. Update imports
const replacements = [
  { from: '@/components/ui/', to: '@/shared/components/ui/' },
  { from: '@/components/layout/', to: '@/shared/components/layout/' }
];

replaceInFiles(srcDir, replacements);

console.log("UI Refactoring Step Complete.");
