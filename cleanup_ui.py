import glob
import re

mobile_override_css = """
/* MOBILE UI STABILIZATION - GLOBAL OVERRIDES */
@media (max-width: 768px) {
  body, html {
    overflow-x: hidden !important;
    width: 100% !important;
  }
  .page-container, .app-main-layout {
    width: 100% !important;
    max-width: 100% !important;
  }
  .table-responsive, [style*="overflow-x: auto"], .horizontal-scroll, table, .scroll-x {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  [style*="height: 100vh"], [style*="min-height: 100vh"] {
    height: auto !important;
    min-height: 100vh !important;
  }
  .header-pill, .header-bell {
    padding: 6px 12px !important;
    height: 36px !important;
    font-size: 12px !important;
  }
  [style*="display: flex"]:not(.scroll-x):not(.horizontal-scroll):not(.no-wrap) {
    max-width: 100% !important;
  }
  .page-title-row, [style*="justify-content: space-between"][style*="align-items: center"]:not(.scroll-x) {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }
  .hero-sell-banner {
    background-size: cover !important;
    background-position: center !important;
    min-height: 160px !important;
    padding: 20px !important;
    border-radius: 16px !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    text-align: left !important;
  }
  h1, h2, [style*="font-size: 56px"], [style*="font-size: clamp(40px"] {
    font-size: 28px !important;
    line-height: 1.2 !important;
  }
  h3, [style*="font-size: clamp(18px"] {
    font-size: 18px !important;
  }
  
  /* Convert multi-column grids into horizontally swipeable carousels on mobile */
  [style*="grid-template-columns: repeat(3"], 
  [style*="grid-template-columns: repeat(4"],
  .hero-cards-grid, 
  .options-grid {
    display: flex !important;
    overflow-x: auto !important;
    flex-wrap: nowrap !important;
    scroll-snap-type: x mandatory !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 12px !important;
    gap: 16px !important;
  }
  
  [style*="grid-template-columns: repeat(3"] > *, 
  [style*="grid-template-columns: repeat(4"] > *,
  .hero-cards-grid > *, 
  .options-grid > * {
    flex: 0 0 85% !important;
    min-width: 240px !important;
    scroll-snap-align: center !important;
  }
  
  /* Fix remaining oversized grids by stacking them */
  [style*="display: grid"]:not([style*="grid-template-columns: repeat(3"]):not([style*="grid-template-columns: repeat(4"]):not(.scroll-x) {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
    min-height: auto !important;
  }
  
  .card, .action-card, .buyer-card, .stat-card, .ui-card, .metric-card {
    padding: 16px !important;
    border-radius: 12px !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }
  img {
    max-width: 100% !important;
    height: auto !important;
  }
  button, .btn {
    max-width: 100% !important;
    white-space: normal !important;
    height: auto !important;
    min-height: 44px !important;
  }
  body {
    padding-bottom: 80px !important;
  }
}
"""

for filepath in glob.glob('*.html'):
    if filepath == 'temp_drawer.html': continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Strip ALL <style> blocks that contain MOBILE UI STABILIZATION
    html = re.sub(r'<style>\s*/\*\s*MOBILE UI STABILIZATION - GLOBAL OVERRIDES\s*\*/.*?</style>', '', html, flags=re.DOTALL)
    
    # Strip bell icon HTML again just to be safe
    html = re.sub(r'<div class="header-bell".*?</div>', '', html, flags=re.DOTALL)
    html = re.sub(r'<div[^>]*class="header-bell"[^>]*>.*?<div class="bell-badge"[^>]*>.*?</div>\s*</div>', '', html, flags=re.DOTALL)
    
    # Strip Help & Support and Settings from sidebar
    html = re.sub(r'<li>\s*<a href="#" class="sidebar-nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12".*?<span>Help & Support</span>\s*</a>\s*</li>', '', html, flags=re.DOTALL)
    html = re.sub(r'<li>\s*<a href="#" class="sidebar-nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12".*?<span>Settings</span>\s*</a>\s*</li>', '', html, flags=re.DOTALL)
    
    # Insert ONE copy of the CSS right before </head>
    insertion = f"<style>\n{mobile_override_css}\n</style>\n</head>"
    html = html.replace('</head>', insertion)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
        
print("Cleaned up and reapplied UI fixes.")
