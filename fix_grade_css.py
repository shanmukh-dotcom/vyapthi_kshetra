import os

css = """
@media (max-width: 768px) {
  .main-grid-3, .main-grid-2 {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  
  .stepper-container {
    padding: 12px 16px !important;
    overflow-x: auto;
    justify-content: flex-start !important;
    gap: 12px;
  }
  
  .step-line {
    min-width: 20px;
    margin: 0 4px !important;
  }
  
  .step-label {
    white-space: nowrap;
    font-size: 11px !important;
  }
}
"""

with open("src/style.css", "a", encoding='utf-8') as f:
    f.write(css)
    
print("Added grade-sell mobile CSS.")
