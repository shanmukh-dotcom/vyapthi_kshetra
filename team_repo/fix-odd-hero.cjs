const fs = require('fs');
let file = 'consumer-home.html';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the gradient overlay to not wash out the farmer and add a glow for the right side text
content = content.replace(
  /\.hero-banner::before \{[^}]*\}/,
  `.hero-banner::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(to right, rgba(248, 249, 250, 0.98) 0%, rgba(248, 249, 250, 0.85) 30%, transparent 55%); z-index: 1; }
    .hero-banner::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: radial-gradient(circle at 85% 30%, rgba(255,255,255,0.7) 0%, transparent 50%); z-index: 1; pointer-events: none; }`
);

// 2. Fix the squished cursive script
content = content.replace(
  /\.hero-script \{[^}]*\}/,
  `.hero-script { font-family: cursive, 'Brush Script MT', sans-serif; font-size: 32px; color: var(--vk-green-dark); transform: rotate(-4deg); margin-top: 30px; margin-right: 20px; text-shadow: 0 2px 4px rgba(255,255,255,0.8); max-width: 400px; text-align: right; line-height: 1.3; }`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixed odd hero banner styling.");
