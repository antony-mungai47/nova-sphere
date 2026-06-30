const fs = require('fs');
const readline = require('readline');

const transcriptPath = 'C:\\Users\\charl\\.gemini\\antigravity\\brain\\17f86a0d-ba69-4e6f-9890-3f7c5369343f\\.system_generated\\logs\\transcript_full.jsonl';
let plans = [];

async function parse() {
  const fileStream = fs.createReadStream(transcriptPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const call of parsed.tool_calls) {
          if (call.name === 'write_to_file' || call.name === 'default_api:write_to_file') {
            const args = call.args || call.arguments;
            let targetFile = '';
            let codeContent = '';
            
            if (args && typeof args === 'object') {
               targetFile = args.TargetFile || '';
               codeContent = args.CodeContent || '';
            } else if (typeof args === 'string') {
               const parsedArgs = JSON.parse(args);
               targetFile = parsedArgs.TargetFile || '';
               codeContent = parsedArgs.CodeContent || '';
            }
            
            if (targetFile.endsWith('implementation_plan.md')) {
              plans.push(codeContent);
            }
          }
        }
      }
    } catch (e) {
      // ignore JSON parse errors for incomplete lines
    }
  }

  // Deduplicate matches based on first 50 chars to avoid slight variations
  const uniquePlans = [];
  const signatures = new Set();
  plans.forEach(m => {
    const sig = m.substring(0, 100);
    if (!signatures.has(sig)) {
      signatures.add(sig);
      uniquePlans.push(m);
    }
  });

  let output = '';
  uniquePlans.forEach((p, idx) => {
    output += `\n\n==============================================\n`;
    output += `=== EXTRACTED PLAN ${idx + 1} ===\n`;
    output += `==============================================\n\n`;
    output += p;
  });

  fs.writeFileSync('C:\\Users\\charl\\nova sphere market\\nova-sphere\\extracted_plans_clean.md', output, 'utf8');
}

parse();
