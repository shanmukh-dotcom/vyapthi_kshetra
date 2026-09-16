const fs = require('fs');
let content = fs.readFileSync('src/style.css', 'utf8');
content = content.replace(/500;600;700[^\)]+\);/g, '');
fs.writeFileSync('src/style.css', content, 'utf8');
console.log("Fixed syntax error");
