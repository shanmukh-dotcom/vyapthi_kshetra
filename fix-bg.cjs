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
  content = content.replace(
    /\.sidebar-promo-bg \{ position: absolute; inset: 0; background: url\('\/assets\/city_nature_footer\.jpg'\) center bottom\/cover no-repeat; opacity: 1; \}/g,
    `.sidebar-promo-bg { position: absolute; inset: 0; background: url('/assets/city_nature_footer.jpg') center top/cover no-repeat; opacity: 1; }`
  );
  fs.writeFileSync(f, content, 'utf8');
});
console.log("Updated background position to center top.");
