import { sharedState } from './shared-state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Find the Tomato crop card's quantity element
  const cards = document.querySelectorAll('.crop-card');
  let qtyEl;
  
  cards.forEach(card => {
    const title = card.querySelector('.crop-title');
    if (title && title.textContent.trim() === 'Tomato') {
      const labels = card.querySelectorAll('.stat-label');
      labels.forEach(label => {
        if (label.textContent.includes('Quantity')) {
          qtyEl = label.nextElementSibling;
        }
      });
    }
  });
  
  if (qtyEl) {
    // Render initial value from shared state
    const supply = sharedState.db.supplies['supply-ramesh-tomato'];
    if (supply) {
      qtyEl.innerHTML = `${supply.quantity.toLocaleString()} kg <button id="edit-qty-btn" style="background:none; border:none; color:var(--vk-green, #1B4D35); cursor:pointer; margin-left:4px;" title="Edit Quantity">✏️</button>`;
    }
    
    // Setup Edit functionality
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#edit-qty-btn');
      if (btn) {
        const newQtyStr = prompt("Update available Tomato quantity (kg):", supply.quantity);
        if (newQtyStr !== null) {
          const newQty = parseInt(newQtyStr.replace(/,/g, ''));
          if (!isNaN(newQty) && newQty >= 0) {
            sharedState.updateFarmerSupply('supply-ramesh-tomato', { quantity: newQty });
            alert("Quantity updated successfully!");
          } else {
            alert("Please enter a valid number.");
          }
        }
      }
    });
    
    // Listen for changes
    window.addEventListener('vyapti:data_changed', () => {
      const updatedSupply = sharedState.db.supplies['supply-ramesh-tomato'];
      if (updatedSupply) {
        qtyEl.innerHTML = `${updatedSupply.quantity.toLocaleString()} kg <button id="edit-qty-btn" style="background:none; border:none; color:var(--vk-green, #1B4D35); cursor:pointer; margin-left:4px;" title="Edit Quantity">✏️</button>`;
      }
    });
  }
});
