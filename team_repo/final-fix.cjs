const fs = require('fs');

const asideTemplate = `
  <aside id="app-sidebar-drawer" aria-label="Main Navigation">
    <div class="sidebar-header">
      <img src="/assets/app_logo.png" alt="Vyapti Kshetra" />
    </div>
    
    <ul class="sidebar-nav-list">
      <li>
        <a href="/consumer-home.html" class="sidebar-nav-link" id="nav-home">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span>Home</span>
        </a>
      </li>
      <li>
        <a href="/consumer-my-requirements.html" class="sidebar-nav-link" id="nav-my-req">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>My Requirements</span>
        </a>
      </li>
      <li>
        <a href="/consumer-match-source.html" class="sidebar-nav-link" id="nav-match">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Match & Source</span>
        </a>
      </li>
      <li>
        <a href="/consumer-supply-journey.html" class="sidebar-nav-link" id="nav-journey">
          <svg class="nav-icon" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
          <span>Supply Journey</span>
        </a>
      </li>
      <li>
        <a href="/consumer-orders-delivery.html" class="sidebar-nav-link" id="nav-orders">
          <svg class="nav-icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span>Orders & Delivery</span>
        </a>
      </li>
      <li class="sidebar-divider"></li>
      <li>
        <a href="#" class="sidebar-nav-link">
          <svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span>Help & Support</span>
        </a>
      </li>
      <li>
        <a href="#" class="sidebar-nav-link">
          <svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          <span>Settings</span>
        </a>
      </li>
    </ul>
    
    <div class="sidebar-footer-promo">
      <div class="sidebar-promo-bg"></div>
      <div class="sidebar-promo-content">
        <h3 class="sidebar-promo-title"><svg class="nav-icon" style="stroke: var(--vk-green-dark);" viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path></svg> Better Food<br>Stronger Communities</h3>
      </div>
    </div>
    <div style="padding: 0 20px 20px; font-size: 10px; color: #8F9E96;">Version 1.0.0</div>
  </aside>`;

const files = [
  { name: 'consumer-home.html', id: 'id="nav-home"' },
  { name: 'consumer-my-requirements.html', id: 'id="nav-my-req"' },
  { name: 'consumer-match-source.html', id: 'id="nav-match"' },
  { name: 'consumer-supply-journey.html', id: 'id="nav-journey"' },
  { name: 'consumer-orders-delivery.html', id: 'id="nav-orders"' }
];

files.forEach(f => {
  let content = fs.readFileSync(f.name, 'utf8');
  
  // Replace the entire aside block. It starts at <aside id="app-sidebar-drawer"... and ends at </aside>
  content = content.replace(/<aside id="app-sidebar-drawer"[\s\S]*?<\/aside>/, asideTemplate);
  
  // Set the active class
  content = content.replace(new RegExp(`class="sidebar-nav-link" ${f.id}`), `class="sidebar-nav-link active"`);
  
  fs.writeFileSync(f.name, content, 'utf8');
});

console.log("Successfully hard-replaced the entire sidebar in all 5 files.");
