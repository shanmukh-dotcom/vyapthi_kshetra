import os
import re

with open('src/guided-tour.js', 'r', encoding='utf-8') as f:
    js = f.read()

# I will write a patch that replaces the highlight logic in GuidedAssistant.
# Specifically, replace playStep() where it does:
# element.style.boxShadow = ...
# element.classList.add('guided-highlight');

highlight_replacement = """
      if (element) {
        this.removeHighlights();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Ensure floating box exists
        if (!document.getElementById('vyapti-floating-highlight')) {
            const floater = document.createElement('div');
            floater.id = 'vyapti-floating-highlight';
            floater.style.cssText = 'position: fixed; pointer-events: none; z-index: 2147483647; transition: all 0.4s ease-in-out; border-radius: 12px; box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.9), 0 0 0 9999px rgba(0, 0, 0, 0.65);';
            document.body.appendChild(floater);
        }
        
        const floater = document.getElementById('vyapti-floating-highlight');
        floater.style.display = 'block';
        
        // Update floater position continuously to handle layout shifts while scrolling
        const updatePos = () => {
            if (floater.style.display !== 'block') return;
            const rect = element.getBoundingClientRect();
            floater.style.top = (rect.top - 6) + 'px';
            floater.style.left = (rect.left - 6) + 'px';
            floater.style.width = (rect.width + 12) + 'px';
            floater.style.height = (rect.height + 12) + 'px';
            requestAnimationFrame(updatePos);
        };
        updatePos();
        
        element.classList.add('guided-highlight');
      } else {
"""

js = re.sub(r'if\s*\(\s*element\s*\)\s*\{\s*this\.removeHighlights\(\);\s*// Scroll to element\s*element\.scrollIntoView\(\{\s*behavior:\s*\'smooth\',\s*block:\s*\'center\'\s*\}\);\s*// Elevate element above overlay.*?element\.classList\.add\(\'guided-highlight\'\);\s*\}\s*else\s*\{', highlight_replacement, js, flags=re.DOTALL)

remove_highlight_replacement = """
    removeHighlights() {
      const floater = document.getElementById('vyapti-floating-highlight');
      if (floater) {
          floater.style.display = 'none';
      }
      document.querySelectorAll('.guided-highlight').forEach(el => {
        el.classList.remove('guided-highlight');
      });
    }
"""

js = re.sub(r'removeHighlights\(\)\s*\{.*?\}\s*\}', remove_highlight_replacement + "}", js, flags=re.DOTALL)

with open('src/guided-tour.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Patched guided-tour.js with floating BoundingRect overlay.")
