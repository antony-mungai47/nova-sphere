const fs = require('fs');
if (!fs.existsSync('audit_results.json')) { console.log('not found'); process.exit(0); }
const data = JSON.parse(fs.readFileSync('audit_results.json'));
const vulns = data.vulnerabilities || {};
const out = [];
for (const [pkg, info] of Object.entries(vulns)) {
  out.push({
    package: pkg,
    severity: info.severity,
    isDirect: info.isDirect,
    fixAvailable: typeof info.fixAvailable === 'boolean' ? info.fixAvailable : true,
    via: info.via.map(v => typeof v === 'string' ? v : (v.title || v.source)).join(', ')
  });
}
console.log(JSON.stringify(out, null, 2));
