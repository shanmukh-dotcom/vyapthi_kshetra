const fs = require('fs');
const files = [
  'consumer-home.html',
  'consumer-my-requirements.html',
  'consumer-match-source.html',
  'consumer-supply-journey.html',
  'consumer-orders-delivery.html'
];

const ctaLinks = {
  'consumer-home.html': [
    { search: />View Matched Farmers/g, replace: 'href="/consumer-match-source.html">View Matched Farmers' },
    { search: />View Full Journey/g, replace: 'href="/consumer-supply-journey.html">View Full Journey' },
    { search: />View Live Location/g, replace: 'href="/consumer-orders-delivery.html">View Live Location' },
    { search: />View Details/g, replace: 'href="/consumer-my-requirements.html">View Details' }
  ],
  'consumer-my-requirements.html': [
    { search: />Match &amp; Source/g, replace: 'href="/consumer-match-source.html">Match &amp; Source' },
    { search: />Match & Source/g, replace: 'href="/consumer-match-source.html">Match & Source' }
  ],
  'consumer-match-source.html': [
    { search: />Accept &amp; Generate Contract/g, replace: 'href="/consumer-supply-journey.html">Accept &amp; Generate Contract' },
    { search: />Accept & Generate Contract/g, replace: 'href="/consumer-supply-journey.html">Accept & Generate Contract' },
    { search: />Track Logistics/g, replace: 'href="/consumer-orders-delivery.html">Track Logistics' }
  ],
  'consumer-supply-journey.html': [
    { search: />Live Tracking/g, replace: 'href="/consumer-orders-delivery.html">Live Tracking' }
  ],
  'consumer-orders-delivery.html': [
    { search: />Track on Map/g, replace: 'href="/consumer-supply-journey.html">Track on Map' }
  ]
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to fix sidebar links while preserving the 'active' class (or lack thereof)
  const links = [
    { title: 'Home', url: '/consumer-home.html' },
    { title: 'My Requirements', url: '/consumer-my-requirements.html' },
    { title: 'Match &amp; Source', url: '/consumer-match-source.html' },
    { title: 'Match & Source', url: '/consumer-match-source.html' },
    { title: 'Supply Journey', url: '/consumer-supply-journey.html' },
    { title: 'Orders &amp; Delivery', url: '/consumer-orders-delivery.html' },
    { title: 'Orders & Delivery', url: '/consumer-orders-delivery.html' }
  ];

  links.forEach(link => {
    // We look for <a href="..." class="sidebar-nav-link [active]">...<span>Title</span>...</a>
    // We replace the href portion.
    const regex = new RegExp(`(<a\\s+href=")[^"]*("\\s+class="sidebar-nav-link[^>]*>[\\s\\S]*?<span>${link.title}<\/span>\\s*<\/a>)`, 'gi');
    content = content.replace(regex, `$1${link.url}$2`);
  });

  // Now replace CTAs
  if (ctaLinks[file]) {
    ctaLinks[file].forEach(cta => {
      // Find buttons/anchors with specific text and set their href
      // This is a bit brute force but effective. We replace `href="#" class="...">Text` or similar
      const ctaRegex = new RegExp(`href="#"([^>]*)${cta.search.source}`, 'g');
      content = content.replace(ctaRegex, `${cta.replace}$1`);
      
      // Also catch if there is no href="#" but it's a button, we can wrap it or just change to anchor.
      // But all our CTAs are likely `<a href="#" class="...">` or `<button>`. 
      // I'll do a simpler replacement: Just find `href="#" ... >Text`
    });
  }
  
  // Specific catch-all for href="#" on CTA elements:
  if (file === 'consumer-home.html') {
    content = content.replace(/href="#" class="btn-solid">View Matched Farmers/g, 'href="/consumer-match-source.html" class="btn-solid">View Matched Farmers');
    content = content.replace(/href="#" class="btn-link">View Full Journey/g, 'href="/consumer-supply-journey.html" class="btn-link">View Full Journey');
    content = content.replace(/href="#" class="btn-link"[^>]*>View Live Location/g, 'href="/consumer-orders-delivery.html" class="btn-link" style="margin-top: 4px; font-size: 11px;">View Live Location');
    content = content.replace(/href="#" class="btn-link">View Details/g, 'href="/consumer-my-requirements.html" class="btn-link">View Details');
  }
  if (file === 'consumer-my-requirements.html') {
    content = content.replace(/<button class="btn-primary">Match &amp; Source<\/button>/g, '<a href="/consumer-match-source.html" class="btn-primary" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">Match &amp; Source</a>');
  }
  if (file === 'consumer-match-source.html') {
    content = content.replace(/<button class="btn-primary">Accept &amp; Generate Contract<\/button>/g, '<a href="/consumer-supply-journey.html" class="btn-primary" style="display:inline-flex; align-items:center; justify-content:center; text-decoration:none;">Accept &amp; Generate Contract</a>');
  }

  fs.writeFileSync(file, content, 'utf8');
});
console.log("Links connected!");
