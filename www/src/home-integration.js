import { sharedState } from './shared-state.js';

document.addEventListener('DOMContentLoaded', () => {
  function renderFarmerHome() {
    // Find matched requirements for Ramesh
    const reqs = sharedState.matchFarmerToRequirements('farmer-ramesh');
    
    // Select the "Buyers Interested" card (the 3rd card in the top grid)
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length < 3) return;
    const buyerCard = statCards[2]; // 3rd card
    
    if (reqs.length > 0) {
      const activeReq = reqs[0]; // just grab the first one for the demo
      const title = buyerCard.querySelector('.card-title');
      if (title) title.textContent = 'Buyer Demand Match!';
      
      const mainVal = buyerCard.querySelector('.card-main-val');
      if (mainVal) mainVal.innerHTML = `<span style="font-size: 32px; color: #17638B;">${reqs.length}</span> <span style="font-size: 18px;">active buyer(s)</span>`;
      
      // Update text below main val
      const subText = mainVal.nextElementSibling;
      if (subText && subText.tagName === 'DIV') {
        subText.innerHTML = `Needs up to <strong>${activeReq.quantity.toLocaleString()} kg</strong> ${activeReq.grade}`;
      }
      
      const pill = buyerCard.querySelector('.card-pill');
      if (pill) {
        pill.innerHTML = `🏢 ${activeReq.company || 'GreenBite Foods'} in ${activeReq.deliveryLocation}`;
      }
    }
    
    // Also sync the crop quantity
    const rameshPotato = sharedState.db.supplies['supply-ramesh-potato'];
    if (rameshPotato) {
      const qtyElems = document.querySelectorAll('.sync-crop-qty');
      qtyElems.forEach(el => {
        el.textContent = `${rameshPotato.quantity.toLocaleString()} kg`;
      });
    }
  }

  renderFarmerHome();

  window.addEventListener('vyapti:data_changed', renderFarmerHome);
});
