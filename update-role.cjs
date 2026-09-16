const fs = require('fs');
let file = 'src/role.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /window\.location\.href = '\/buyer-dashboard\.html';/g,
  `window.location.href = '/consumer-home.html';`
);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated role.js redirect to consumer-home.html");
