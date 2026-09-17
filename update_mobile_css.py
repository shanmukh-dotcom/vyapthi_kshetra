import os

css_append = """
/* NEW MOBILE BOTTOM NAVIGATION */
.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #FFFFFF;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    justify-content: space-around;
    align-items: center;
    padding: 10px 16px 20px 16px; /* Bottom inset */
    z-index: 1000;
    border-top: 1px solid #E4EBE6;
  }
  
  .mob-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
  }
  
  .mob-nav-item:hover, .mob-nav-item.active {
    color: var(--color-primary);
  }
  
  .mob-nav-icon {
    width: 24px;
    height: 24px;
    stroke: currentColor;
    stroke-width: 2;
    fill: none;
  }
  
  /* Hide desktop sidebar trigger on mobile if we have bottom nav */
  .menu-toggle-btn {
    display: flex; /* Keep for 'More' or if needed */
  }
  
  /* Hide the old bottom acc bar on mobile since we redesign it */
  .app-bottom-acc-bar {
    display: none !important;
  }
  
  /* Fix header */
  .header-search-wrap {
    display: none; /* Expandable later */
  }
  
  .app-header {
    padding: 10px 16px;
  }
}
"""

with open("src/style.css", "a") as f:
    f.write(css_append)

print("Appended mobile CSS.")
