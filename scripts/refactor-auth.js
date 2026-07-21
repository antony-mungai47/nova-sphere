const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/admin/inventory/actions.ts',
  'src/app/admin/marketing/actions.ts',
  'src/app/admin/orders/actions.ts',
  'src/app/admin/products/actions.ts',
  'src/app/admin/reports/actions.ts',
  'src/app/admin/settings/actions.ts',
  'src/app/admin/support/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/api/user/role/route.ts',
  'src/domains/Customer/account/support/actions.ts',
  'src/domains/Engagement/AI/actions.ts',
  'src/domains/Engagement/Conversations/actions.ts',
  'src/shared/components/layout/SellerDashboardLayout.tsx'
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Replace import
  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/auth['"];?/g, 'import { IdentityService } from "@/modules/identity/services/IdentityService";');
  
  // Replace function calls
  content = content.replace(/isAdmin\(/g, 'IdentityService.isAdmin(');
  content = content.replace(/getUserRole\(/g, 'IdentityService.getUserRole(');
  content = content.replace(/hasRole\(/g, 'IdentityService.hasRole(');
  content = content.replace(/isSuperAdmin\(/g, 'IdentityService.isSuperAdmin(');
  
  fs.writeFileSync(fullPath, content);
  console.log(`Refactored ${relPath}`);
});
