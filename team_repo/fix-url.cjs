const fs = require('fs');
let content = fs.readFileSync('src/style.css', 'utf8');
content = content.replace(/background-image: url\('[^']+'\);/g, `background-image: url('/assets/city_nature_footer.jpg');`);
fs.writeFileSync('src/style.css', content, 'utf8');
console.log("Fixed background image URL");
