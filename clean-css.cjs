const fs = require('fs');

let style = fs.readFileSync('src/style.css', 'utf8');
const marker = '/* Restored missing styles for index/role */';
if (style.includes(marker)) {
  style = style.substring(0, style.indexOf(marker));
}

let orig = fs.readFileSync('original-style-role.css', 'utf8');

// Strip out :root {} block entirely
orig = orig.replace(/:root\s*\{[^}]+\}/g, '');

// Strip out html, body block entirely
orig = orig.replace(/html,\s*body\s*\{[^}]+\}/g, '');

// Strip out all @imports safely
orig = orig.replace(/@import\s+url\([^)]+\)\s*;/g, '');

// Strip out * selector
orig = orig.replace(/\*,\s*\*\:\:before,\s*\*\:\:after\s*\{[^}]+\}/g, '');
orig = orig.replace(/\*\s*\{[^}]+\}/g, '');

fs.writeFileSync('src/style.css', style + '\n' + marker + '\n' + orig, 'utf8');
console.log("Restored properly");
