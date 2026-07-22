const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

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
const imageFallbacks = [];
const cloudinaryUsages = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/');
  
  if (content.match(/\?\?\s*['"]\/[^'"]+['"]/)) {
    imageFallbacks.push(relative);
  } else if (content.match(/\|\|\s*['"]\/[^'"]+['"]/)) {
    imageFallbacks.push(relative);
  }

  if (content.includes('cloudinary')) {
    cloudinaryUsages.push(relative);
  }
});

console.log("=== Fallbacks ===");
console.log(imageFallbacks.join('\n'));
console.log("\n=== Cloudinary Usages ===");
console.log(cloudinaryUsages.join('\n'));
