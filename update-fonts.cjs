const fs = require('fs');
let html = fs.readFileSync('farmer-home.html', 'utf8');

html = html.replace(
  /\.page-title-left h2 \{ font-size: 24px;/,
  '.page-title-left h2 { font-size: 32px;'
);

html = html.replace(
  /\.page-title-left h1 \{ font-size: 38px;/,
  '.page-title-left h1 { font-size: 52px;'
);

html = html.replace(
  /\.page-title-left p \{ font-size: 15px;/,
  '.page-title-left p { font-size: 18px;'
);

fs.writeFileSync('farmer-home.html', html, 'utf8');
console.log("Updated font sizes in farmer-home.html");
