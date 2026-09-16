const fs = require('fs');
let content = fs.readFileSync('src/style.css', 'utf8');

// The broken import is on line 2 (or top of the file)
content = content.replace(/@import url\('https:\/\/fonts[^;]+;/g, `@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');`);

fs.writeFileSync('src/style.css', content, 'utf8');
console.log("Restored font import");
