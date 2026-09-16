const fs = require('fs');
let content = fs.readFileSync('src/style.css', 'utf8');
content = content.replace(/background-image:[^\n]+;/g, 'background: #E8F4EC;');
fs.writeFileSync('src/style.css', content, 'utf8');
