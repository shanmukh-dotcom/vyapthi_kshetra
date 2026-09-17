import os
import subprocess

css_append = """
/* ANDROID APK MOBILE MIGRATION */
@media (max-width: 768px) {
  body, html {
    overflow-x: hidden;
  }
  .app-main-layout {
    padding: 10px 10px 90px 10px; /* Leave space for bottom nav */
    gap: 12px;
  }
  
  /* Compact Headers */
  .app-header {
    padding: 10px 14px;
    gap: 10px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .page-heading {
    font-size: 20px;
  }
  
  /* Vertical Stacked Cards */
  .grid-3-col, .grid-4-col, .grid-2-1-col {
    grid-template-columns: 1fr !important;
    gap: 12px;
  }
  
  /* Horizontal scrollable areas */
  .horizontal-scroll-mobile {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .horizontal-scroll-mobile::-webkit-scrollbar {
    display: none;
  }
  .horizontal-scroll-mobile > * {
    min-width: 280px;
    scroll-snap-align: center;
  }
  
  /* Sticky Bottom Navigation */
  .app-bottom-acc-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    transform: none;
    border-radius: 20px 20px 0 0;
    padding: 12px 16px 20px 16px; /* Extra padding for bottom inset */
    background: #FFFFFF;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    justify-content: space-around;
    border: none;
    z-index: 1000;
  }
  
  .acc-bar-link {
    flex-direction: column;
    font-size: 10px;
    padding: 4px;
    gap: 4px;
  }
  
  .acc-bar-icon {
    width: 22px;
    height: 22px;
  }
}
"""

with open("src/style.css", "a") as f:
    f.write(css_append)

vyapti_css_append = """
/* Mobile Android Adjustments for Ask Vyapti */
@media (max-width: 768px) {
  #ask-vyapti-btn {
    bottom: 90px !important; /* Above bottom navigation */
    right: 16px !important;
    padding: 12px 16px !important;
    height: 48px !important;
    font-size: 13px !important;
  }
  
  #ask-vyapti-panel {
    bottom: 0 !important;
    z-index: 1001 !important; /* Above bottom nav */
    border-radius: 24px 24px 0 0 !important;
    height: 85vh !important;
  }
}
"""

with open("src/ask-vyapti.css", "a") as f:
    f.write(vyapti_css_append)

print("CSS updated.")
