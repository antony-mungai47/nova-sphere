import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch {
    return 'unknown';
  }
}

async function generateRC1() {
  const reportsDir = path.join(process.cwd(), 'reports');
  const gateJsonPath = path.join(reportsDir, 'release-gate.json');
  
  let gateData = null;
  if (fs.existsSync(gateJsonPath)) {
    gateData = JSON.parse(fs.readFileSync(gateJsonPath, 'utf8'));
  } else {
    console.error("No release-gate.json found. Run release-gate.mjs first.");
    process.exit(1);
  }

  // Get Git info
  const commitHash = run('git rev-parse HEAD') || 'unknown';
  const branchName = run('git rev-parse --abbrev-ref HEAD') || 'main';
  const version = process.env.npm_package_version || '2.0.0';

  const isApproved = gateData.overallStatus === 'PASS';
  const score = gateData.score;

  const getStatusEmoji = (status) => status === 'PASS' ? '✅' : (status === 'WARN' ? '⚠️' : '❌');

  const rc1Content = `# Release Candidate 1 (RC1)
**Date:** ${new Date().toISOString()}
**Recommendation:** ${isApproved ? '✅ Approved for Production' : '❌ Blocked'}

## Build & Version Info
- **Version:** ${version}
- **Git Commit:** \`${commitHash}\`
- **Branch:** \`${branchName}\`

## Quality Gates
- **Production Readiness Score:** ${score}/100
- **Build Status:** ${getStatusEmoji(gateData.checks.Build)}
- **TypeScript Status:** ${getStatusEmoji(gateData.checks.TypeScript)}
- **ESLint Status:** ${getStatusEmoji(gateData.checks.Lint)}
- **Unit Tests (Jest):** ${getStatusEmoji(gateData.checks.UnitTests)}
- **E2E Tests (Playwright):** ${getStatusEmoji(gateData.checks.Playwright)}
- **Security Audit:** ${getStatusEmoji(gateData.checks.SecurityAudit)}
- **Lighthouse:** ${getStatusEmoji(gateData.checks.Lighthouse)}
- **Database:** ${getStatusEmoji(gateData.checks.Database)}

## Open Issues / Blockers
${gateData.blockers.length === 0 ? '_Zero release blockers._' : gateData.blockers.map(b => `- ❌ ${b}`).join('\n')}

---
*This report is automatically generated and serves as the permanent record for the Nova Sphere V2 release.*
`;

  fs.writeFileSync(path.join(reportsDir, 'RC1.md'), rc1Content);
  console.log("📄 Generated reports/RC1.md");
}

generateRC1();
