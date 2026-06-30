const fs = require('fs');
const transcript = fs.readFileSync('C:/Users/charl/.gemini/antigravity/brain/17f86a0d-ba69-4e6f-9890-3f7c5369343f/.system_generated/logs/transcript.jsonl', 'utf8');

const lines = transcript.split('\n');
for (const line of lines) {
  if (line.includes("Phase 2") || line.includes("Phase 3") || line.includes("here's the order")) {
    try {
      const obj = JSON.parse(line);
      if (obj.type === 'USER_INPUT') {
        console.log("---- USER MESSAGE ----");
        console.log(obj.content);
        console.log("----------------------");
      }
    } catch (e) {}
  }
}
