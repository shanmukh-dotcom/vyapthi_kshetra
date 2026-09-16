const fs = require('fs');

const files = [
  'farmer-home.html',
  'farmer-my-farm.html',
  'farmer-market.html',
  'farmer-grade-sell.html',
  'farmer-find-buyers.html',
  'farmer-collective-logistics.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  content = content.replace(
    /\.bottom-acc-container\s*\{[^}]*\}/g,
    '.bottom-acc-container { display: flex; justify-content: center; align-items: center; padding: 20px 0 40px; margin-top: auto; }'
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
