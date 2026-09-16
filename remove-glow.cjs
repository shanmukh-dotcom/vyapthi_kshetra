const fs = require('fs');
let file = 'consumer-home.html';
let content = fs.readFileSync(file, 'utf8');

// Remove the radial gradient (::after) entirely
content = content.replace(/\s*\.hero-banner::after \{[^}]*\}\s*/g, '\n    ');

// Remove text-shadow from the cursive quote
content = content.replace(/text-shadow: [^;]+;/g, 'text-shadow: none;');

fs.writeFileSync(file, content, 'utf8');
console.log("Removed text shadow and radial fading design.");
