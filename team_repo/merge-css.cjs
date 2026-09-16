const fs = require('fs');

let orig = fs.readFileSync('original-style-role.css', 'utf8');

// Remove :root block
orig = orig.replace(/:root\s*\{[^}]+\}/g, '');

// Remove standard html, body block. Note that it might be multi-line
orig = orig.replace(/html,\s*body\s*\{[^}]+\}/g, '');

// Remove @import
orig = orig.replace(/@import[^;]+;/g, '');

// Remove * selector if any
orig = orig.replace(/\*\s*\{[^}]+\}/g, '');

let current = fs.readFileSync('src/style.css', 'utf8');

// Append the missing styles
fs.writeFileSync('src/style.css', current + '\n\n/* Restored missing styles for index/role */\n' + orig, 'utf8');
console.log("Appended missing styles to src/style.css");
