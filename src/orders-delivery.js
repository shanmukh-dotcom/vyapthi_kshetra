import { sharedState } from './shared-state.js';

document.addEventListener('DOMContentLoaded', () => {
  function renderOrdersDelivery() {
    const selectedIds = sharedState.db.selectedFarmers || [];
    const farmersList = document.querySelector('.farmers-list');
    
    if (farmersList) {
      farmersList.innerHTML = '';
      selectedIds.forEach(fid => {
        const farmer = sharedState.db.farmers[fid];
        const supplies = Object.values(sharedState.db.supplies).filter(s => s.farmerId === fid && s.crop === 'Potato');
        if (!farmer || supplies.length === 0) return;
        const supply = supplies[0];
        const avatarSrc = farmer.name.includes('Lakshmi') ? '/assets/lakshmi_avatar.jpg' : '/assets/farmer_portrait.jpg';
        
        farmersList.innerHTML += `
          <div class="farmer-row-card">
            <img src="${avatarSrc}" class="frc-img" alt="${farmer.name}" />
            <div class="frc-info">
              <strong>${farmer.name}</strong>
              <span>${farmer.location}</span>
            </div>
            <div class="frc-stats">
              <span><strong>${supply.quantity.toLocaleString()} kg</strong> Grade A</span>
              <span><strong>${supply.grade}</strong> (AI Verified)</span>
            </div>
            <div class="frc-badge supplied"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path stroke="currentColor" stroke-width="2" fill="none" d="m8 12 3 3 5.5-5.5"></path></svg> Supplied</div>
          </div>
        `;
      });
      if (selectedIds.length === 0) {
        farmersList.innerHTML = '<div style="color:var(--vk-text-muted); font-size:14px; padding:20px; text-align:center;">No farmers selected. Order is empty.</div>';
      }
    }
  }

  renderOrdersDelivery();
  window.addEventListener('vyapti:data_changed', renderOrdersDelivery);
});
