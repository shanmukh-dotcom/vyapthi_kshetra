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

  // 1. Replace SVG Logo with app_logo.png
  content = content.replace(
    /<svg width="42" height="42" viewBox="0 0 100 100" fill="none">[\s\S]*?<\/svg>/g,
    '<img src="/assets/app_logo.png" alt="Vyapti Logo" style="width: 44px; height: 44px; object-fit: contain; image-rendering: -webkit-optimize-contrast;" />'
  );

  // 2. Add hamburger menu to header
  content = content.replace(
    /<div class="search-bar">/g,
    `<div style="display: flex; align-items: center; gap: 12px;">
        <button type="button" id="app-menu-toggle" style="background: #FFFFFF; border: 1px solid #E8ECEF; border-radius: 8px; width: 42px; height: 42px; cursor: pointer; color: #163323; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"><svg style="width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        <div class="search-bar">`
  );
  
  // Close the wrapper div around the search bar
  content = content.replace(
    /<\/div>\s*<div class="header-right">/g,
    '</div>\n      </div>\n      <div class="header-right">'
  );

  // 3. Insert Backdrop div after <body ...>
  content = content.replace(
    /<body[^>]*>/,
    match => `${match}\n  <div id="app-drawer-backdrop" class="drawer-backdrop"></div>`
  );

  // 4. Update CSS layout properties for main layout and floating container
  content = content.replace(
    /\.app-main-layout\s*\{[^}]*\}/,
    '.app-main-layout { margin-left: 0; max-width: 1400px; padding: 30px 40px 100px; min-height: 100vh; display: flex; flex-direction: column; }'
  );

  content = content.replace(
    /\.bottom-acc-container\s*\{[^}]*\}/,
    '.bottom-acc-container { position: fixed; bottom: 20px; left: 0; right: 0; display: flex; justify-content: center; align-items: center; pointer-events: none; z-index: 100; }'
  );

  // In transactions, the layout has different padding/wrapper
  if (file === 'farmer-transactions.html') {
      content = content.replace(
        /\.app-main-layout\s*\{[^}]*\}/,
        '.app-main-layout { margin-left: 0; max-width: 1400px; min-height: 100vh; display: flex; flex-direction: column; }'
      );
  }

  // 5. Append Drawer CSS
  const cssStyles = `
    /* Drawer Styles */
    #app-sidebar-drawer {
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1000;
    }
    #app-sidebar-drawer.open {
      transform: translateX(0);
    }
    .drawer-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(13, 33, 20, 0.4);
      backdrop-filter: blur(2px);
      z-index: 999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    .drawer-backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }
  </style>`;
  
  content = content.replace(/<\/style>/, cssStyles);

  // Note: Remove the old `left: 0;` or anything that clashes in #app-sidebar-drawer
  // We'll let transform do the work, but need to make sure left is 0 originally.
  content = content.replace(
    /#app-sidebar-drawer\s*\{([^}]*)\}/,
    (match, rules) => {
        let newRules = rules.replace(/left:\s*0;/, 'left: 0;'); // keep left 0, transform will hide it
        return `#app-sidebar-drawer { ${newRules} }`;
    }
  );

  // Ensure sidebar starts without class="open" in HTML so it is hidden by default
  content = content.replace(
    /<aside id="app-sidebar-drawer"[^>]*class="open"[^>]*>/,
    '<aside id="app-sidebar-drawer" aria-label="Main Navigation">'
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
