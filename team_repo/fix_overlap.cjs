const fs = require('fs');

let content = fs.readFileSync('farmer-transactions.html', 'utf8');

content = content.replace(
  /\.pt-middle\s*\{[^}]*\}/,
  ".pt-middle { position: absolute; left: 50%; transform: translateX(-50%) rotate(-5deg); font-family: cursive, 'Brush Script MT', sans-serif; font-size: 32px; color: #1B4D35; text-shadow: 1px 1px 0 rgba(255,255,255,0.5); white-space: nowrap; }"
);

fs.writeFileSync('farmer-transactions.html', content);
console.log('Fixed pt-middle CSS');
