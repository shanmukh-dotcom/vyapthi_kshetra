const fs = require('fs');
let css = fs.readFileSync('src/style.css', 'utf8');

// Replace the solid background with the image for .page-container
css = css.replace(/background:\s*#E8F4EC;/g, `background-image: url('/language select/language selection reference bg.png');`);

fs.writeFileSync('src/style.css', css, 'utf8');
console.log("Restored background image");
