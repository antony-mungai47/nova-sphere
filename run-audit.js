const { execSync } = require('child_process');
try {
  const result = execSync('npm audit --json', { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  parse(result);
} catch (err) {
  parse(err.stdout);
}

function parse(str) {
  const data = JSON.parse(str);
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
}
