import glob
import re

injection = """
<script>
  (function() {
    var lang = localStorage.getItem('vyapti_selected_language');
    if (lang && lang !== 'en') {
      document.cookie = "googtrans=/en/" + lang + "; path=/;";
      document.cookie = "googtrans=/en/" + lang + "; domain=localhost; path=/;";
    } else if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/;";
      document.cookie = "googtrans=/en/en; domain=localhost; path=/;";
    }
  })();
</script>
<script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
"""

for filepath in glob.glob('*.html'):
    if filepath == 'temp_drawer.html': continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
        
    # Replace the existing translate script with the injected one
    # Note: handle cases where we already injected it so we don't duplicate
    if "<script>\n  (function() {\n    var lang = localStorage" in html:
        continue
        
    html = re.sub(r'<script type="text/javascript"\s+src="https://translate\.google\.com/translate_a/element\.js\?cb=googleTranslateElementInit"></script>', injection, html)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Translation persistence script injected into all HTML files.")
