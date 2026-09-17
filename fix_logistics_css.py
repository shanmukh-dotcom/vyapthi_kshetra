import os

css = """
@media (max-width: 768px) {
  .stats-grid, .main-grid, .booking-form-grid, .booking-form-grid-2 {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  
  [style*="display: grid; grid-template-columns: 1fr 1fr;"] {
    grid-template-columns: 1fr !important;
  }
  
  /* Maps full width */
  .map-container {
    width: 100% !important;
    height: 250px !important;
  }
}
"""

with open("src/style.css", "a", encoding='utf-8') as f:
    f.write(css)
    
print("Added logistics mobile CSS.")
