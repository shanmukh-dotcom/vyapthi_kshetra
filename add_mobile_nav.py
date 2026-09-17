import os
import glob
from bs4 import BeautifulSoup

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Skip if already has mobile nav
    if 'mobile-bottom-nav' in html:
        return False

    # Insert bottom navigation before closing body tag
    bottom_nav_html = """
    <!-- Mobile Bottom Navigation -->
    <div class="mobile-bottom-nav">
      <a href="farmer-home.html" class="mob-nav-item">
        <svg class="mob-nav-icon" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Home</span>
      </a>
      <a href="farmer-my-farm.html" class="mob-nav-item">
        <svg class="mob-nav-icon" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        <span>Farm</span>
      </a>
      <a href="farmer-grade-sell.html" class="mob-nav-item">
        <svg class="mob-nav-icon" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span>Sell</span>
      </a>
      <a href="farmer-collective-logistics.html" class="mob-nav-item">
        <svg class="mob-nav-icon" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
        <span>Logistics</span>
      </a>
      <div class="mob-nav-item" onclick="document.getElementById('app-sidebar-drawer').classList.add('open'); document.getElementById('app-drawer-backdrop').classList.add('open');">
        <svg class="mob-nav-icon" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        <span>More</span>
      </div>
    </div>
    """

    # Replace </body> with the bottom nav + </body>
    html = html.replace('</body>', bottom_nav_html + '\n</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    return True

files = glob.glob('farmer-*.html')
for f in files:
    if update_file(f):
        print(f"Updated {f}")

print("Done inserting mobile bottom nav.")
