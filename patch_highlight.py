import os
import re

with open('src/guided-tour.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Disable overlay creation
content = content.replace("this.overlay.style.cssText =", "// this.overlay.style.cssText =")
content = content.replace("document.body.appendChild(this.overlay);", "// document.body.appendChild(this.overlay);")
content = content.replace("this.overlay.style.opacity = '1';", "// this.overlay.style.opacity = '1';")
content = content.replace("this.overlay.style.opacity = '0';", "// this.overlay.style.opacity = '0';")

# Ensure the highlight doesn't rely on position: relative if it breaks layout
content = content.replace("element.style.position = 'relative';", "// element.style.position = 'relative';")
content = content.replace("element.style.zIndex = '9995';", "// element.style.zIndex = '9995';")

with open('src/guided-tour.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Disabled dark overlay in guided-tour.js to fix stacking context visibility issues.")
