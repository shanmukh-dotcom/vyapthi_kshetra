import re
import sys

# Update style.css
with open(r'c:\Users\chenn\OneDrive\Documents\Desktop\VYAPTHI KSHETRA\src\style.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

new_vars = """
  --vyapti-deep: #0B3D2E;
  --vyapti-primary: #145A3A;
  --vyapti-green: #2E8B57;
  --vyapti-fresh: #55B85A;
  --market-amber: #F2A93B;
  --buyer-blue: #3D7FC4;
  --bg: #F7F8F5;
  --cream: #FFF7E8;
  --white: #FFFFFF;
  --text: #14231D;
  --muted: #65756D;
  --radius-card: 22px;
  --radius-large: 30px;
"""

# Insert variables into :root
if '--vyapti-deep' not in css_content:
    css_content = re.sub(r'(:root\s*\{)', r'\1' + new_vars, css_content)

# Update body background and font
css_content = re.sub(r'(html,\s*body\s*\{[^}]*background-color:\s*)[^;]+(;)', r'\1var(--bg)\2', css_content)
css_content = re.sub(r'(html,\s*body\s*\{[^}]*font-family:\s*)[^;]+(;)', r"\1'Inter', sans-serif\2", css_content)

with open(r'c:\Users\chenn\OneDrive\Documents\Desktop\VYAPTHI KSHETRA\src\style.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updated style.css")
