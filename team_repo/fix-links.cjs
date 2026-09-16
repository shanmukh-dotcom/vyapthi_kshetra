const fs = require('fs');

const file = 'consumer-home.html';
let content = fs.readFileSync(file, 'utf8');

// Fix messed up CTAs
content = content.replace(/href="\/consumer-my-requirements\.html">View Details class="btn-link"/g, 'href="/consumer-my-requirements.html" class="btn-link">View Details');
content = content.replace(/href="\/consumer-match-source\.html">View Matched Farmers class="btn-solid"/g, 'href="/consumer-match-source.html" class="btn-solid">View Matched Farmers');
content = content.replace(/href="\/consumer-supply-journey\.html">View Full Journey class="btn-link"/g, 'href="/consumer-supply-journey.html" class="btn-link">View Full Journey');
content = content.replace(/href="\/consumer-orders-delivery\.html">View Live Location class="btn-link" style="margin-top: 4px; font-size: 11px;"/g, 'href="/consumer-orders-delivery.html" class="btn-link" style="margin-top: 4px; font-size: 11px;">View Live Location');

fs.writeFileSync(file, content, 'utf8');

const files = [
  'consumer-home.html',
  'consumer-my-requirements.html',
  'consumer-match-source.html',
  'consumer-supply-journey.html',
  'consumer-orders-delivery.html'
];
files.forEach(f => {
  let text = fs.readFileSync(f, 'utf8');
  // Re-run the sidebar links because they seem to have failed partly, consumer-home still only had consumer-orders-delivery linked? Wait, the regex replaced all Home with Home, etc.
  
  // Explicit exact replacements for sidebar links to guarantee it works:
  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Home<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-home.html"'));
  
  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>My Requirements<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-my-requirements.html"'));

  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Match &amp; Source<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-match-source.html"'));
                      
  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Match & Source<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-match-source.html"'));

  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Supply Journey<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-supply-journey.html"'));

  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Orders &amp; Delivery<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-orders-delivery.html"'));
                      
  text = text.replace(/<a href="[^"]*" class="sidebar-nav-link([^"]*)">\s*<svg[^>]*>.*?<span>Orders & Delivery<\/span>\s*<\/a>/sgi, 
                      match => match.replace(/href="[^"]*"/, 'href="/consumer-orders-delivery.html"'));

  fs.writeFileSync(f, text, 'utf8');
});

