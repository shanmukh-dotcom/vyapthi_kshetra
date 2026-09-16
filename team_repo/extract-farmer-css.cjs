const fs = require('fs');
const lines = fs.readFileSync('C:/Users/chenn/.gemini/antigravity/brain/95a5dfe3-ae23-4719-9b96-e8999111c1ac/.system_generated/logs/transcript_full.jsonl', 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  if (line.includes('src\\\\style.css') && line.includes('farmer-profile-bg')) {
    try {
      const obj = JSON.parse(line);
      const tc = obj.tool_calls.find(t => t.name === 'write_to_file' && t.args.TargetFile.endsWith('style.css'));
      if (tc) {
        fs.writeFileSync('original-farmer-profile.css', tc.args.CodeContent);
        console.log("Extracted farmer profile style.css successfully!");
      }
    } catch(e) {}
  }
}
