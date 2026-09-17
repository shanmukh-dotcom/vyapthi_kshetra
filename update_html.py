import re

with open(r'c:\Users\chenn\OneDrive\Documents\Desktop\VYAPTHI KSHETRA\farmer-home.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Body background and font
html = re.sub(r'body\s*\{\s*background-color:\s*[^;]+;\s*font-family:\s*[^;]+;', 'body { background-color: var(--bg); font-family: \'Inter\', sans-serif;', html)

# 2. Hero Background
old_bg = r"linear-gradient(rgba(27, 77, 53, 0.4), rgba(27, 77, 53, 0.85)), url('/assets/rajesh_bg.png') center/cover no-repeat"
new_bg = r"linear-gradient(90deg, rgba(11,61,46,0.92) 0%, rgba(20,90,58,0.72) 48%, rgba(20,90,58,0.45) 100%), url('/assets/rajesh_bg.png') center/cover no-repeat"
html = html.replace(old_bg, new_bg)

# Large hero radius: 28-32px
html = re.sub(r'border-radius:\s*0\s+0\s+24px\s+24px;', 'border-radius: 0 0 30px 30px;', html)

# 3. Typography changes for Hero
html = html.replace('font-size: 32px; font-weight: 700;', 'font-size: 36px; font-weight: 700;')
html = html.replace('font-size: 52px; font-weight: 800;', 'font-size: 56px; font-weight: 800;')

# 4. Header pills (pill styling: 18-24px radius, white bg, dark text)
html = re.sub(r'\.header-pill\s*\{[^}]+\}', '.header-pill { background: var(--white); border: 1px solid #E4EBE6; padding: 8px 16px; border-radius: 20px; font-size: 13.5px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); }', html)

html = re.sub(r'\.header-bell\s*\{[^}]+\}', '.header-bell { background: var(--white); border: 1px solid #E4EBE6; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); cursor: pointer; color: var(--text); }', html)

html = re.sub(r'\.profile-pill\s*\{[^}]+\}', '.profile-pill { background: var(--white); border: 1px solid #E4EBE6; padding: 4px 12px 4px 4px; border-radius: 24px; display: flex; align-items: center; gap: 10px; cursor: pointer; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); }', html)

# 5. "TOGETHER FOR BETTER PRICES" CTA
html = html.replace(
    'background: #FFFFFF; color: #1B4D35; box-shadow: 0 4px 12px rgba(0,0,0,0.1);',
    'background: var(--white); color: var(--vyapti-primary); box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); transition: transform 0.2s;'
)
html = html.replace('.better-prices-btn {', '.better-prices-btn:hover { transform: translateY(-2px); }\n    .better-prices-btn {')

# 6. Hero Cards (Card 1, Card 2, Card 3)
html = re.sub(r'\.hero-card\s*\{[^}]+\}', '.hero-card { border-radius: 24px; padding: 24px 28px; position: relative; overflow: hidden; display: flex; flex-direction: column; text-decoration: none; border: none; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); transition: transform 0.2s; }\n    .hero-card:hover { transform: translateY(-4px); }', html)

html = re.sub(r'\.hero-card-1\s*\{[^}]+\}', '.hero-card-1 { background: rgba(46, 139, 87, 0.03); }', html)
html = re.sub(r'\.hero-card-2\s*\{[^}]+\}', '.hero-card-2 { background: var(--cream); }', html)
html = re.sub(r'\.hero-card-3\s*\{[^}]+\}', '.hero-card-3 { background: #EAF3FB; }', html)

html = re.sub(r'\.c-icon-1\s*\{[^}]+\}', '.c-icon-1 { background: #E5F4E8; color: var(--vyapti-green); }', html)
html = re.sub(r'\.c-icon-2\s*\{[^}]+\}', '.c-icon-2 { background: #FFF0D2; color: #C47A13; font-weight: bold; font-size: 18px; }', html)
html = re.sub(r'\.c-icon-3\s*\{[^}]+\}', '.c-icon-3 { background: #D6E9F7; color: var(--buyer-blue); }', html)

html = re.sub(r'\.card-title\s*\{[^}]+\}', '.card-title { font-size: 18px; font-weight: 600; color: var(--muted); margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }', html)
html = re.sub(r'\.card-title-2\s*\{[^}]+\}', '.card-title-2 { color: var(--market-amber); }', html)
html = re.sub(r'\.card-title-3\s*\{[^}]+\}', '.card-title-3 { color: var(--buyer-blue); }', html)

html = re.sub(r'\.card-main-val\s*\{[^}]+\}', '.card-main-val { font-size: 42px; font-weight: 800; color: var(--text); margin-bottom: 16px; display: flex; align-items: baseline; gap: 6px; }', html)

# 7. Sell Banner
html = re.sub(r'\.sell-banner\s*\{[^}]+\}', '.sell-banner { background: var(--vyapti-deep); border-radius: 24px; padding: 0; display: flex; align-items: center; text-decoration: none; overflow: hidden; position: relative; margin-bottom: 30px; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); }', html)
html = html.replace('linear-gradient(to right, transparent 0%, black 50%)', 'linear-gradient(to right, transparent 0%, black 70%)') 

# 8. Other Options
html = re.sub(r'\.section-title\s*\{[^}]+\}', '.section-title { font-size: 26px; font-weight: 700; color: var(--text); margin-bottom: 24px; }', html)

html = re.sub(r'\.option-card\s*\{[^}]+\}', '.option-card { background: var(--white); border: none; border-radius: 24px; padding: 24px; display: flex; align-items: center; gap: 14px; text-decoration: none; transition: all 200ms ease; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); }\n    .option-card .card-arrow-right { transition: transform 200ms ease; }', html)
html = re.sub(r'\.option-card:hover\s*\{[^}]+\}', '.option-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(20, 50, 35, 0.1); }\n    .option-card:hover .card-arrow-right { transform: translateX(4px); }', html)
html = re.sub(r'\.opt-info\s+h4\s*\{[^}]+\}', '.opt-info h4 { font-size: 18px; font-weight: 600; color: var(--text); margin: 0 0 4px; }', html)

html = html.replace('<div style="margin-left: auto; color: #11261A; font-weight: bold;">></div>', '<div class="card-arrow-right" style="margin-left: auto; color: var(--text); font-weight: bold;">></div>')

html = html.replace('background: #EEF8F2; color: #1B4D35;', 'background: #E5F4E8; color: var(--vyapti-green);') # Green
html = html.replace('background: #FEF3D6; color: #9C540C;', 'background: #FFF0D2; color: #C47A13;') # Amber
html = html.replace('background: #E2F1F8; color: #17638B;', 'background: #D6E9F7; color: var(--buyer-blue);') # Blue


# 9. Join Nearby Farmers
html = re.sub(r'\.join-banner\s*\{[^}]+\}', '.join-banner { background: #E8F5EB; border-radius: 24px; padding: 0; display: flex; align-items: center; text-decoration: none; position: relative; overflow: hidden; height: 120px; margin-bottom: 40px; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); }', html)

# 10. Accessibility Bar
html = re.sub(r'\.bottom-acc-container\s*\{[^}]+\}', '.bottom-acc-container { display: flex; justify-content: center; align-items: center; padding: 20px 0 40px; margin-top: auto; }', html)
html = re.sub(r'\.acc-pill\s*\{[^}]+\}', '.acc-pill { background: var(--white); border-radius: 30px; padding: 8px 12px; display: flex; align-items: center; gap: 4px; box-shadow: 0 8px 30px rgba(20, 50, 35, 0.06); border: 1px solid rgba(228, 235, 230, 0.5); }', html)


with open(r'c:\Users\chenn\OneDrive\Documents\Desktop\VYAPTHI KSHETRA\farmer-home.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated farmer-home.html")
