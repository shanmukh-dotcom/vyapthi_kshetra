const fs = require('fs');

const files = [
  'consumer-home.html',
  'consumer-my-requirements.html',
  'consumer-match-source.html',
  'consumer-supply-journey.html',
  'consumer-orders-delivery.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Fix Sidebar Promo Background
  content = content.replace(
    /\.sidebar-promo-bg \{ position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: url\('\/assets\/city_nature_footer\.jpg'\) center bottom\/cover no-repeat; opacity: 0\.9; \}/g,
    `.sidebar-promo-bg { position: absolute; top: 0; bottom: 0; left: 0; right: 0; background: url('/assets/city_nature_footer.jpg') center/cover no-repeat; opacity: 0.15; mix-blend-mode: multiply; }`
  );
  
  content = content.replace(
    /\.sidebar-promo-bg \{ position: absolute; bottom: 0; left: 0; right: 0; height: 100px; background: url\('\/assets\/city_nature_footer\.jpg'\) center bottom\/cover no-repeat; opacity: 0\.9; \}/,
    `.sidebar-promo-bg { position: absolute; top: 0; bottom: 0; left: 0; right: 0; background: url('/assets/city_nature_footer.jpg') center/cover no-repeat; opacity: 0.15; mix-blend-mode: multiply; }`
  );

  // 2. Fix Hamburger Menu
  if (!content.includes('hamburger-btn')) {
    content = content.replace(
      /<div class="search-bar">/g,
      `<div style="display: flex; align-items: center; gap: 12px;">\n        <button class="hamburger-btn" style="background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: var(--vk-text-main);"><svg viewBox="0 0 24 24" style="width: 24px; height: 24px; stroke: currentColor; fill: none; stroke-width: 2;"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>\n        <div class="search-bar">`
    );
    content = content.replace(
      /<\/div>\s*<div class="header-right">/g,
      `</div>\n      </div>\n      <div class="header-right">`
    );
  }

  // 3. Fix consumer-home.html specifically
  if (file === 'consumer-home.html') {
    content = content.replace(
      /\.consumer-hero \{ background: url\('\/assets\/consumer_hero_bg\.jpg'\) center\/cover no-repeat; border-radius: 16px; overflow: hidden; position: relative; height: 320px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba\(0,0,0,0\.05\); \}/g,
      `.consumer-hero { background: url('/assets/consumer_hero_bg.jpg') center/cover no-repeat; border-radius: 16px; position: relative; height: 320px; margin-bottom: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }`
    );
    content = content.replace(
      /\.consumer-hero::before \{ content: ""; position: absolute; inset: 0; background: linear-gradient\(to right, rgba\(255,255,255,1\) 0%, rgba\(255,255,255,0\.8\) 40%, transparent 100%\); \}/g,
      `.consumer-hero::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 40%, transparent 100%); }`
    );
    content = content.replace(
      /\.ch-quote \{ font-family: cursive, 'Brush Script MT', sans-serif; font-size: 28px; color: var\(--vk-green-dark\); transform: rotate\(-4deg\); position: absolute; right: 60px; top: 120px; text-shadow: 0 0 10px rgba\(255,255,255,0\.8\); text-align: center; line-height: 1\.2; \}/g,
      `.ch-quote { font-family: cursive, 'Brush Script MT', sans-serif; font-size: 24px; color: var(--vk-green-dark); transform: rotate(-4deg); position: absolute; right: 40px; top: 140px; text-shadow: 0 0 10px rgba(255,255,255,0.8); text-align: center; line-height: 1.2; max-width: 250px; }`
    );
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Updated files!");
