const fs = require('fs');

const files = [
  'farmer-home.html',
  'farmer-my-farm.html',
  'farmer-market.html',
  'farmer-grade-sell.html',
  'farmer-find-buyers.html',
  'farmer-collective-logistics.html',
  'farmer-transactions.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // We want to replace the entire sidebar header block:
  // <div class="sidebar-header" style="...">
  //   <div class="sidebar-logo-brand" style="...">
  //     <img ... />
  //     <div ...>VYAPTI...</div>
  //   </div>
  //   <div ...>One field...</div>
  // </div>
  //
  // With:
  // <div class="sidebar-header" style="padding: 24px 20px 16px; display: flex; justify-content: center;">
  //   <img src="/assets/app_logo.png" alt="Vyapti Kshetra" style="max-width: 100%; height: auto; max-height: 80px; object-fit: contain; image-rendering: -webkit-optimize-contrast;" />
  // </div>

  const headerRegex = /<div class="sidebar-header"[\s\S]*?<ul class="sidebar-nav-list">/;
  
  const replacement = `<div class="sidebar-header" style="padding: 24px 20px 16px; display: flex; justify-content: center; align-items: center; min-height: 100px;">
      <img src="/assets/app_logo.png" alt="Vyapti Kshetra" style="width: 180px; height: auto; object-fit: contain; image-rendering: -webkit-optimize-contrast;" />
    </div>
    
    <ul class="sidebar-nav-list">`;

  content = content.replace(headerRegex, replacement);

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
