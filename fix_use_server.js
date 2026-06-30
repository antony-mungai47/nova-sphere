const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function fixUseServer(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixUseServer(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const useServerRegex = /^(import[\s\S]*?)\r?\n("use server";|'use server';)\r?\n/m;
      if (useServerRegex.test(content)) {
        // Remove it from where it is
        content = content.replace(/"use server";\r?\n|'use server';\r?\n/g, '');
        // Add it to the very top
        content = `"use server";\n` + content;
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Fixed use server in ${fullPath}`);
      }
    }
  }
}

fixUseServer(srcDir);
console.log("Fixed use server directives.");
