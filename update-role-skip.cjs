const fs = require('fs');
let content = fs.readFileSync('src/role.js', 'utf8');

content = content.replace(
  /window\.location\.href = '\/farmer-profile\.html';/g,
  `window.location.href = '/farmer-home.html';`
);

fs.writeFileSync('src/role.js', content, 'utf8');
console.log("Updated role.js to skip farmer-profile");
