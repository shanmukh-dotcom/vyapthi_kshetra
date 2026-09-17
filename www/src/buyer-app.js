import { sharedState } from './shared-state.js';

class BuyerApp {
  constructor() {
    this.init();
    
    window.addEventListener('vyapti:data_changed', () => {
      this.render();
    });
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupCreateRequirement();
      this.render();
    });
  }

  setupCreateRequirement() {
    const btn = document.querySelector('.btn-submit');
    if (!btn) return;
    
    // We can assume we're on the requirements page
    btn.addEventListener('click', () => {
      // Find the selects based on their order in DOM or surrounding labels
      const formGroups = document.querySelectorAll('.form-group');
      if (formGroups.length < 5) return;
      
      const crop = formGroups[0].querySelector('select').value;
      const qtyStr = formGroups[1].querySelector('select').value;
      const quantity = parseInt(qtyStr.replace(/,/g, ''));
      const grade = formGroups[2].querySelector('select').value;
      const requiredBy = formGroups[3].querySelector('input').value;
      const location = formGroups[4].querySelector('select').value;
      
      const newReq = {
        buyerId: 'buyer-greenbite',
        crop,
        quantity,
        grade,
        requiredBy,
        deliveryLocation: location
      };
      
      sharedState.addRequirement(newReq);
      
      // Notify user via alert for the prototype
      alert(`New requirement published:\n${quantity.toLocaleString()} kg ${grade} ${crop}`);
      window.location.href = '/consumer-match-source.html';
    });
  }

  render() {
    const pageKey = window.location.pathname.split('/').pop().replace('.html', '');
    
    if (pageKey === 'consumer-my-requirements') {
      this.renderRequirements();
    } else if (pageKey === 'consumer-match-source') {
      this.renderMatches();
    } else if (pageKey === 'consumer-home') {
      this.renderHome();
    }
  }

  renderRequirements() {
    const tbody = document.querySelector('.data-table tbody');
    if (!tbody) return;
    
    // First, clear existing rows
    tbody.innerHTML = '';
    
    const requirements = Object.values(sharedState.db.requirements);
    
    requirements.forEach(req => {
      const matchData = sharedState.matchRequirementToFarmers(req);
      const matchPct = Math.min(100, Math.round((matchData.totalMatchedQty / req.quantity) * 100));
      
      // Determine crop emoji
      let emoji = '📦';
      if (req.crop.toLowerCase().includes('potato')) emoji = '🍅';
      if (req.crop.toLowerCase().includes('chilli')) emoji = '🌶️';
      if (req.crop.toLowerCase().includes('maize')) emoji = '🌽';
      
      const row = `
        <tr>
          <td><div class="crop-col"><span style="font-size: 16px; font-style: normal;">${emoji}</span> ${req.crop}</div></td>
          <td>${req.quantity.toLocaleString()} kg</td>
          <td>${req.grade}</td>
          <td>${req.requiredBy}</td>
          <td>${req.deliveryLocation}</td>
          <td><span class="status-badge sb-blue">In Progress</span></td>
          <td>
            <div class="supply-stats">
              <div class="ss-text"><span>${matchData.totalMatchedQty.toLocaleString()} / ${req.quantity.toLocaleString()} kg</span> <span style="font-weight: 800;">${matchPct}%</span></div>
              <span class="ss-sub">(${matchData.matches.length} farmers)</span>
              <div class="ss-bar-bg"><div class="ss-bar-fill" style="width: ${matchPct}%;"></div></div>
            </div>
          </td>
          <td>
            <div class="action-col">
              <button class="btn-action">View</button>
              <button class="btn-kebab"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg></button>
            </div>
          </td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  }

  renderMatches() {
    const list = document.querySelector('.farmer-list');
    if (!list) return;
    
    // Check if we have active potato req
    const reqs = Object.values(sharedState.db.requirements);
    const potatoReq = reqs.find(r => r.crop === 'Potato' && r.status === 'active');
    
    if (!potatoReq) {
      list.innerHTML = `<div class="fc-empty" style="border: none; background: transparent;"><h3 style="color:var(--vk-text-muted); text-align:center; width:100%;">Create a requirement first to see matches.</h3></div>`;
      const donutVal = document.querySelector('.donut-val');
      if (donutVal) donutVal.textContent = '0 /';
      const reqVal = document.querySelector('.req-val');
      if (reqVal) reqVal.textContent = '0 kg';
      return;
    }
    
    const matchData = sharedState.matchRequirementToFarmers(potatoReq);
    
    list.innerHTML = '';
    
    matchData.matches.forEach((supply) => {
      const farmer = sharedState.db.farmers[supply.farmerId];
      // Avatar placeholder logic based on name
      const avatarSrc = farmer.name.includes('Lakshmi') ? '/assets/lakshmi_avatar.jpg' : '/assets/farmer_portrait.jpg';
      
      const cardHTML = `
        <div class="farmer-card">
          <div class="fc-avatar-wrap">
            <img src="${avatarSrc}" class="fc-avatar" alt="${farmer.name}" />
            <div class="fc-verified"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Verified</div>
          </div>
          <div class="fc-main">
            <div class="fc-header">
              <h3>${farmer.name}</h3>
              <div class="fc-loc"><svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${farmer.location}</div>
            </div>
            <div class="fc-stats">
              <div class="fc-stat">
                <div class="fc-stat-icon">📦</div>
                <div class="fc-stat-text"><strong>${supply.quantity.toLocaleString()} kg</strong><span>Available Quantity</span></div>
              </div>
              <div class="fc-stat">
                <div class="fc-stat-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg></div>
                <div class="fc-stat-text"><strong>${supply.grade}</strong><span>AI Verified</span></div>
              </div>
              <div class="fc-stat">
                <div class="fc-stat-icon"><svg viewBox="0 0 24 24"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path></svg></div>
                <div class="fc-stat-text"><strong>${supply.availability}</strong><span>Availability</span></div>
              </div>
              <div class="fc-stat">
                <div class="fc-stat-icon"><svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg></div>
                <div class="fc-stat-text"><strong>< 50 km</strong><span>Distance</span></div>
              </div>
            </div>
          </div>
          <div class="fc-actions">
            <button class="btn-selected" data-farmer-id="${farmer.id}"><svg style="width: 16px; height: 16px; stroke: currentColor; fill: none; stroke-width: 3;" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="btn-txt">Select</span></button>
          </div>
        </div>
      `;
      list.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Bind click events for selection
    const selectBtns = list.querySelectorAll('.btn-selected');
    selectBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const farmerId = e.currentTarget.getAttribute('data-farmer-id');
        // Toggle selected state visually
        const txt = e.currentTarget.querySelector('.btn-txt');
        if (txt.textContent === 'Select') {
          txt.textContent = 'Selected';
          e.currentTarget.style.background = 'var(--vk-green-dark)';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.border = '1px solid var(--vk-green-dark)';
        } else {
          txt.textContent = 'Select';
          e.currentTarget.style.background = '';
          e.currentTarget.style.color = '';
          e.currentTarget.style.border = '';
        }
        
        // Save selected farmers to shared state (for supply journey/orders)
        if (!sharedState.db.selectedFarmers) sharedState.db.selectedFarmers = [];
        if (txt.textContent === 'Selected') {
          if (!sharedState.db.selectedFarmers.includes(farmerId)) {
            sharedState.db.selectedFarmers.push(farmerId);
          }
        } else {
          sharedState.db.selectedFarmers = sharedState.db.selectedFarmers.filter(id => id !== farmerId);
        }
        sharedState.saveDB();
      });
      
      // Initialize state if already selected
      const fid = btn.getAttribute('data-farmer-id');
      if (sharedState.db.selectedFarmers && sharedState.db.selectedFarmers.includes(fid)) {
        const txt = btn.querySelector('.btn-txt');
        txt.textContent = 'Selected';
        btn.style.background = 'var(--vk-green-dark)';
        btn.style.color = 'white';
        btn.style.border = '1px solid var(--vk-green-dark)';
      }
    });
    
    if (!matchData.isFullyMatched) {
      const emptySlot = `
        <div class="fc-empty">
          <div class="fc-empty-icon">
            <svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
          </div>
          <div class="fce-main">
            <h3>More farmers joining soon</h3>
            <p>Once more farmers update their crop details, they will appear here.</p>
          </div>
          <button class="btn-coming-soon" disabled>Coming Soon</button>
        </div>
      `;
      list.insertAdjacentHTML('beforeend', emptySlot);
    }
    
    // Update donut metrics
    const donutVal = document.querySelector('.donut-val');
    if (donutVal) donutVal.textContent = matchData.totalMatchedQty.toLocaleString() + ' /';
    
    const reqVal = document.querySelector('.req-val');
    if (reqVal) reqVal.textContent = potatoReq.quantity.toLocaleString() + ' kg';
    
    const pct = Math.min(100, Math.round((matchData.totalMatchedQty / potatoReq.quantity) * 100));
    const donutFill = document.querySelector('.donut-fill');
    if (donutFill) {
      const dash = (pct / 100) * 251.2;
      donutFill.style.strokeDasharray = `${dash}, 251.2`;
    }
    
    // Summary info
    const summaryHeader = document.querySelector('.mh-title h2');
    if (summaryHeader) summaryHeader.textContent = `Matched: ${matchData.totalMatchedQty.toLocaleString()} kg from ${matchData.matches.length} Farmers`;
  }
  
  renderHome() {
    // In consumer-home, we just need to update the matched quantity of Potato req if exists
    const reqs = Object.values(sharedState.db.requirements);
    const potatoReq = reqs.find(r => r.crop === 'Potato' && r.status === 'active');
    
    if (potatoReq) {
      const matchData = sharedState.matchRequirementToFarmers(potatoReq);
      const pct = Math.min(100, Math.round((matchData.totalMatchedQty / potatoReq.quantity) * 100));
      
      const qtyText = document.querySelector('.flex-between span:first-child');
      if (qtyText) qtyText.textContent = `${matchData.totalMatchedQty.toLocaleString()} / ${potatoReq.quantity.toLocaleString()} kg matched`;
      
      const pctText = document.querySelector('.flex-between span:last-child');
      if (pctText) pctText.textContent = `${pct}%`;
      
      const barFill = document.querySelector('.progress-bar-fill');
      if (barFill) barFill.style.width = `${pct}%`;
      
      // Update top status pill logic if needed, skipping to avoid breaking other elements
    } else {
      const qtyText = document.querySelector('.flex-between span:first-child');
      if (qtyText) qtyText.textContent = `0 / 0 kg matched`;
      
      const pctText = document.querySelector('.flex-between span:last-child');
      if (pctText) pctText.textContent = `0%`;
      
      const barFill = document.querySelector('.progress-bar-fill');
      if (barFill) barFill.style.width = `0%`;
    }
  }
}

export const buyerApp = new BuyerApp();
