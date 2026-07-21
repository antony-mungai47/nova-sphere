const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');
const REPORT_PATH = path.join(__dirname, '../ARCHITECTURE_AUDIT_REPORT.md');

function walk(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        walk(path.join(dir, file), fileList);
      }
    } else {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = walk(SRC_DIR);

const routes = [];
const layouts = [];
const middlewares = [];
const providers = [];
const zustandStores = [];
const apiRoutes = [];
const duplicates = new Map();
const hardcodedEnvs = [];

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relative = path.relative(SRC_DIR, file).replace(/\\/g, '/');

  if (relative.includes('/page.tsx')) routes.push(relative);
  if (relative.includes('/layout.tsx')) layouts.push(relative);
  if (relative.includes('middleware.ts')) middlewares.push(relative);
  if (relative.includes('/route.ts')) apiRoutes.push(relative);
  if (relative.includes('Provider.tsx') || content.includes('createContext')) providers.push(relative);
  if (content.includes('create(') && content.includes('zustand')) zustandStores.push(relative);
  
  if (content.includes('process.env.NODE_ENV')) hardcodedEnvs.push(relative);

  const baseName = path.basename(file, path.extname(file));
  if (baseName.length > 3) {
    if (!duplicates.has(baseName)) duplicates.set(baseName, []);
    duplicates.get(baseName).push(relative);
  }
});

const trueDuplicates = Array.from(duplicates.entries()).filter(([name, paths]) => paths.length > 1 && !['page', 'layout', 'route', 'index', 'actions', 'data', 'loading', 'error'].includes(name));

let report = `# Repository Architecture Audit\n\n`;

report += `## 1. Routing & Middleware\n`;
report += `### Routes (${routes.length})\n${routes.map(r => `- ${r}`).join('\n')}\n\n`;
report += `### Layouts (${layouts.length})\n${layouts.map(r => `- ${r}`).join('\n')}\n\n`;
report += `### API Routes (${apiRoutes.length})\n${apiRoutes.map(r => `- ${r}`).join('\n')}\n\n`;
report += `### Middleware\n${middlewares.map(r => `- ${r}`).join('\n')}\n\n`;

report += `## 2. State & Providers\n`;
report += `### Providers & Contexts\n${providers.map(r => `- ${r}`).join('\n')}\n\n`;
report += `### Zustand Stores\n${zustandStores.map(r => `- ${r}`).join('\n')}\n\n`;

report += `## 3. Potential Duplicate Components & Services\n`;
trueDuplicates.forEach(([name, paths]) => {
  report += `### ${name}\n${paths.map(p => `- ${p}`).join('\n')}\n`;
});
report += `\n`;

report += `## 4. Hardcoded Environment Variables (process.env.NODE_ENV)\n`;
report += `${hardcodedEnvs.map(r => `- ${r}`).join('\n')}\n\n`;

fs.writeFileSync(REPORT_PATH, report);
console.log('Architecture Audit Report generated.');
