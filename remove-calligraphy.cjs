const fs = require('fs');
let html = fs.readFileSync('farmer-transactions.html', 'utf8');

// Remove the HTML div
html = html.replace(/\s*<div class="pt-middle">[\s\S]*?<\/div>/, '');

// Remove the CSS class
html = html.replace(/\s*\.pt-middle\s*\{[^\}]+\}/, '');

fs.writeFileSync('farmer-transactions.html', html, 'utf8');
console.log("Removed pt-middle from farmer-transactions.html");
