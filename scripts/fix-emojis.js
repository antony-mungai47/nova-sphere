const fs = require('fs');

const path = 'src/domains/Experience/components/home/homepage-sections.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace corrupted emoji bytes with proper emojis
content = content.replace(/dY'/g, '🔌');
content = content.replace(/dY`-/g, '👗');
content = content.replace(/dY'/g, '🪴');
content = content.replace(/dY\?Z/g, '🛒');
content = content.replace(/s/g, '⚡');
content = content.replace(/dY"/g, '💎');
content = content.replace(/o"/g, '✨');
content = content.replace(/dYs\?/g, '🚀');
content = content.replace(/dY>,\?/g, '🔒');
content = content.replace(/-\?/g, '⭐');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed emojis in homepage-sections.tsx');
