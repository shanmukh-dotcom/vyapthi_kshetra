const fs = require('fs');

const files = [
  'consumer-home.html',
  'consumer-my-requirements.html',
  'consumer-match-source.html',
  'consumer-supply-journey.html',
  'consumer-orders-delivery.html'
];

const cssInject = `
    /* Sidebar Toggle Support */
    #app-sidebar-drawer { transition: transform 0.3s ease; }
    #app-sidebar-drawer.collapsed { transform: translateX(-260px); }
    .app-main-layout { transition: margin-left 0.3s ease; }
    .app-main-layout.expanded { margin-left: 0; }
`;

const jsInject = `
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const hamburgerBtn = document.querySelector('.hamburger-btn');
      const sidebar = document.getElementById('app-sidebar-drawer');
      const mainLayout = document.querySelector('.app-main-layout');
      
      if(hamburgerBtn && sidebar && mainLayout) {
        hamburgerBtn.addEventListener('click', () => {
          sidebar.classList.toggle('collapsed');
          mainLayout.classList.toggle('expanded');
        });
      }
    });
  </script>
</body>`;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Only inject if not already injected
  if (!content.includes('Sidebar Toggle Support')) {
    content = content.replace('</style>', cssInject + '\n  </style>');
  }
  
  if (!content.includes('sidebar.classList.toggle(\'collapsed\')')) {
    content = content.replace('</body>', jsInject);
  }
  
  fs.writeFileSync(f, content, 'utf8');
});

console.log("Added sidebar toggle logic!");
