import { sharedState } from './shared-state.js';

document.addEventListener('DOMContentLoaded', () => {
  function renderSupplyJourney() {
    const selectedIds = sharedState.db.selectedFarmers || [];
    
    // Update .farmers-row
    const farmersRow = document.querySelector('.farmers-row');
    if (farmersRow) {
      farmersRow.innerHTML = '';
      selectedIds.forEach(fid => {
        const farmer = sharedState.db.farmers[fid];
        // find matching supply
        const supplies = Object.values(sharedState.db.supplies).filter(s => s.farmerId === fid && s.crop === 'Tomato');
        if (!farmer || supplies.length === 0) return;
        const supply = supplies[0];
        const avatarSrc = farmer.name.includes('Lakshmi') ? '/assets/lakshmi_avatar.jpg' : '/assets/farmer_portrait.jpg';
        
        farmersRow.innerHTML += `
          <div class="farmer-mini-card">
            <img src="${avatarSrc}" class="fmc-avatar" alt="${farmer.name}" />
            <h4 class="fmc-name">${farmer.name}</h4>
            <p class="fmc-loc">${farmer.location}</p>
            <div class="fmc-qty"><i class="fmc-qty-icon">📦</i> ${supply.quantity.toLocaleString()} kg</div>
            <div class="fmc-grade">${supply.grade}</div>
            <div class="fmc-badge"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Supplying for this order</div>
          </div>
        `;
      });
      if (selectedIds.length === 0) {
        farmersRow.innerHTML = '<div style="color:var(--vk-text-muted); font-size:14px;">No farmers selected yet. Please select farmers in Match & Source.</div>';
      }
    }
    
    // Update .cf-farmers
    const cfFarmers = document.querySelector('.cf-farmers');
    if (cfFarmers) {
      cfFarmers.innerHTML = '';
      selectedIds.forEach(fid => {
        const farmer = sharedState.db.farmers[fid];
        const supplies = Object.values(sharedState.db.supplies).filter(s => s.farmerId === fid && s.crop === 'Tomato');
        if (!farmer || supplies.length === 0) return;
        const supply = supplies[0];
        const avatarSrc = farmer.name.includes('Lakshmi') ? '/assets/lakshmi_avatar.jpg' : '/assets/farmer_portrait.jpg';
        
        cfFarmers.innerHTML += `
          <div class="cf-farmer">
            <img src="${avatarSrc}" alt="${farmer.name}" />
            <div class="cf-farmer-text"><strong>${farmer.name}</strong><span>${supply.quantity.toLocaleString()} kg</span></div>
          </div>
        `;
      });
      if (selectedIds.length === 0) {
        cfFarmers.innerHTML = '<div style="color:var(--vk-text-muted); font-size:12px; margin-bottom: 12px;">No farmers selected</div>';
      }
      
      // Add empty slot back
      cfFarmers.innerHTML += `
        <div class="cf-farmer" style="margin-top: 4px;">
          <div class="cf-f-empty"><svg viewBox="0 0 24 24" style="width:14px; height:14px; stroke:currentColor; fill:none; stroke-width:2;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg></div>
          <div class="cf-farmer-text"><strong>Awaiting more farmers</strong><span>To fulfill 12,000 kg</span></div>
        </div>
      `;
    }
    
    // Update total quantity
    let totalQty = 0;
    selectedIds.forEach(fid => {
      const supplies = Object.values(sharedState.db.supplies).filter(s => s.farmerId === fid && s.crop === 'Tomato');
      if (supplies.length > 0) totalQty += supplies[0].quantity;
    });
    
    // Attempt to update headers
    const reqBannerText = document.querySelector('.req-banner .rs-item:first-child div:last-child');
    if (reqBannerText) {
      reqBannerText.innerHTML = `<strong>${totalQty.toLocaleString()} / 12,000 kg</strong><span>Required Amount</span>`;
    }
  }

  renderSupplyJourney();
  window.addEventListener('vyapti:data_changed', renderSupplyJourney);
});
