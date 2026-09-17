import glob
import re

for filepath in glob.glob('*.html'):
    if filepath == 'temp_drawer.html': continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1. Remove the header bell
    # The header bell looks like this:
    # <div class="header-bell" ...> ... </div>
    html = re.sub(r'<div class="header-bell".*?</div>', '', html, flags=re.DOTALL)
    
    # 2. Remove "Help & Support" from the sidebar
    html = re.sub(r'<li>\s*<a href="#" class="sidebar-nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12".*?<span>Help & Support</span>\s*</a>\s*</li>', '', html, flags=re.DOTALL)

    # 3. Remove "Settings" from the sidebar
    html = re.sub(r'<li>\s*<a href="#" class="sidebar-nav-link">\s*<svg class="nav-icon" viewBox="0 0 24 24"><circle cx="12".*?<span>Settings</span>\s*</a>\s*</li>', '', html, flags=re.DOTALL)

    # Note: Just to be aggressive about the bell icon if it doesn't have the exact structure:
    html = re.sub(r'<div[^>]*class="header-bell"[^>]*>.*?<div class="bell-badge"[^>]*>.*?</div>\s*</div>', '', html, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Removed notifications, Help & Support, and Settings from all HTML files.")
