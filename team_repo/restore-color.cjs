const fs = require('fs');

const files = [
  'consumer-home.html',
  'consumer-my-requirements.html',
  'consumer-match-source.html',
  'consumer-supply-journey.html',
  'consumer-orders-delivery.html'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace the faded CSS
  content = content.replace(
    /\.sidebar-promo-bg \{ position: absolute; top: 0; bottom: 0; left: 0; right: 0; background: url\('\/assets\/city_nature_footer\.jpg'\) center\/cover no-repeat; opacity: 0\.15; mix-blend-mode: multiply; \}/g,
    `.sidebar-promo-bg { position: absolute; inset: 0; background: url('/assets/city_nature_footer.jpg') center bottom/cover no-repeat; opacity: 1; }`
  );
  
  // Just in case it's formatted slightly differently, let's also do a generic replace
  content = content.replace(
    /opacity: 0\.15;\s*mix-blend-mode: multiply;/g,
    `opacity: 1;`
  );
  
  fs.writeFileSync(f, content, 'utf8');
});

console.log("Restored full color to the sidebar promo image.");
