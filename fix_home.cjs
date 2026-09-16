const fs = require('fs');

let content = fs.readFileSync('farmer-home.html', 'utf8');

// Change flex-end to space-between
content = content.replace(
  /\.top-floating-header \{ display: flex; justify-content: flex-end;/g,
  '.top-floating-header { display: flex; justify-content: space-between;'
);

// Add the hamburger menu and wrap the right side in a div
content = content.replace(
  /<div class="top-floating-header">/g,
  `<div class="top-floating-header">
        <button type="button" id="app-menu-toggle" style="background: #FFFFFF; border: 1px solid #E4EBE6; border-radius: 8px; width: 42px; height: 42px; cursor: pointer; color: #163323; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02);"><svg style="width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></button>
        <div style="display: flex; gap: 12px;">`
);

// We need to close that new flex div. The end of top-floating-header is just before <!-- Welcome/Overview Row --> or <div class="page-title-row">
content = content.replace(
  /<\/div>\s*<div class="page-title-row">/g,
  '</div>\n      </div>\n      \n      <div class="page-title-row">'
);

fs.writeFileSync('farmer-home.html', content);
console.log('Fixed farmer-home.html');
