import os
import re

with open('src/guided-tour.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace playStep highlight section completely
highlight_replacement = """
      if (element) {
        this.removeHighlights();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Remove old floater if it exists
        const oldFloater = document.getElementById('vyapti-floating-highlight');
        if (oldFloater) oldFloater.remove();
        
        // Foolproof inline highlighting
        element.dataset.originalBorder = element.style.border || '';
        element.dataset.originalBackground = element.style.backgroundColor || '';
        element.dataset.originalBoxShadow = element.style.boxShadow || '';
        element.dataset.originalTransition = element.style.transition || '';
        
        element.style.transition = 'all 0.3s ease';
        element.style.border = '4px solid #2ECC71';
        element.style.backgroundColor = 'rgba(46, 204, 113, 0.15)';
        element.style.boxShadow = '0 0 15px rgba(46, 204, 113, 0.5)';
        
        element.classList.add('guided-highlight');
      } else {
"""

# Match the old floater logic
js = re.sub(r'if\s*\(\s*element\s*\)\s*\{\s*this\.removeHighlights\(\);\s*element\.scrollIntoView.*?element\.classList\.add\(\'guided-highlight\'\);\s*\}\s*else\s*\{', highlight_replacement, js, flags=re.DOTALL)

remove_highlight_replacement = """
    removeHighlights() {
      document.querySelectorAll('.guided-highlight').forEach(el => {
        el.style.border = el.dataset.originalBorder || '';
        el.style.backgroundColor = el.dataset.originalBackground || '';
        el.style.boxShadow = el.dataset.originalBoxShadow || '';
        el.style.transition = el.dataset.originalTransition || '';
        el.classList.remove('guided-highlight');
      });
    }
"""

js = re.sub(r'removeHighlights\(\)\s*\{.*?\}\s*\}', remove_highlight_replacement + "}", js, flags=re.DOTALL)

with open('src/guided-tour.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Patched guided-tour.js with foolproof inline highlighting.")
