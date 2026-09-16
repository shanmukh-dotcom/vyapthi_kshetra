// Synthetic Demo Data for Crop Production Alerts
const demoProductionData = [
  { crop: 'Potato', district: 'Krishna', year: '2026', production: 82, threshold: 100, farmers: 42 },
  { crop: 'Tomato', district: 'Krishna', year: '2026', production: 145, threshold: 120, farmers: 58 },
  { crop: 'Rice', district: 'Krishna', year: '2026', production: 920, threshold: 800, farmers: 110 },
  { crop: 'Onion', district: 'Krishna', year: '2026', production: 68, threshold: 75, farmers: 15 },
  { crop: 'Maize', district: 'Krishna', year: '2026', production: 410, threshold: 350, farmers: 23 },
  { crop: 'Groundnut', district: 'Krishna', year: '2026', production: 280, threshold: 250, farmers: 31 }
];

let currentFilters = {
  state: 'Andhra Pradesh',
  district: 'Krishna',
  crop: 'All',
  year: '2026'
};

function calculateAlertStatus(production, threshold) {
  const percentageDiff = ((production - threshold) / threshold) * 100;
  let status = 'NORMAL';
  
  // Normal >= 0, Warning < 0 but > -10, Critical <= -10
  if (percentageDiff <= -10) {
    status = 'CRITICAL';
  } else if (percentageDiff < 0) {
    status = 'WARNING';
  } else {
    status = 'NORMAL';
  }
  
  return { percentageDiff, status };
}

function processData(data, filters) {
  let filtered = data;
  if (filters.crop !== 'All') {
    filtered = filtered.filter(d => d.crop === filters.crop);
  }
  
  return filtered.map(d => {
    const { percentageDiff, status } = calculateAlertStatus(d.production, d.threshold);
    return { ...d, percentageDiff, status };
  });
}

function renderDashboard() {
  const processedData = processData(demoProductionData, currentFilters);
  
  // 1. Summary Cards
  const totalCrops = processedData.length;
  const totalFarmers = processedData.reduce((sum, d) => sum + d.farmers, 0);
  const activeAlerts = processedData.filter(d => d.status !== 'NORMAL').length;
  const aboveThreshold = processedData.filter(d => d.status === 'NORMAL').length;
  
  const cardsContainer = document.getElementById('pa-summary-cards');
  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🌾</div>
        <div style="font-size: 12px; color: #65796E; font-weight: 600;">Crops Monitored</div>
        <div style="font-size: 28px; font-weight: 800; color: #11261A; margin-top: 4px;">${totalCrops}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">👨‍🌾</div>
        <div style="font-size: 12px; color: #65796E; font-weight: 600;">Farmers Reporting</div>
        <div style="font-size: 28px; font-weight: 800; color: #11261A; margin-top: 4px;">${totalFarmers}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">🚨</div>
        <div style="font-size: 12px; color: #65796E; font-weight: 600;">Active Alerts</div>
        <div style="font-size: 28px; font-weight: 800; color: #E03131; margin-top: 4px;">${activeAlerts}</div>
      </div>
      <div class="card" style="padding: 16px; text-align: center;">
        <div style="font-size: 24px; margin-bottom: 8px;">📈</div>
        <div style="font-size: 12px; color: #65796E; font-weight: 600;">Crops Above Threshold</div>
        <div style="font-size: 28px; font-weight: 800; color: #165A31; margin-top: 4px;">${aboveThreshold}</div>
      </div>
    `;
  }
  
  // 2. Active Alerts Section
  const alertsContainer = document.getElementById('pa-active-alerts');
  if (alertsContainer) {
    const alerts = processedData.filter(d => d.status !== 'NORMAL');
    if (alerts.length === 0) {
      alertsContainer.innerHTML = `<div style="font-size: 13px; color: #65796E;">No active alerts at this time. All crops are at expected levels.</div>`;
    } else {
      alertsContainer.innerHTML = alerts.map(alert => {
        const icon = alert.status === 'CRITICAL' ? '🚨 CRITICAL' : '⚠️ WARNING';
        const color = alert.status === 'CRITICAL' ? '#991B1B' : '#92400E';
        const absDiff = Math.abs(alert.production - alert.threshold);
        const absPct = Math.abs(alert.percentageDiff).toFixed(1);
        
        return `
          <div style="background: white; border: 1px solid #FECACA; border-radius: 8px; padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div>
              <h4 style="margin: 0 0 8px; font-size: 14px; font-weight: 800; color: ${color};">${icon} — ${alert.crop}</h4>
              <div style="font-size: 12px; color: #65796E; margin-bottom: 8px;">${alert.district} District</div>
              <div style="font-size: 13px; color: #11261A; line-height: 1.5;">
                <strong>Expected production:</strong> ${alert.production} tonnes<br>
                <strong>Threshold:</strong> ${alert.threshold} tonnes<br>
                <strong>Shortfall:</strong> ${absDiff.toFixed(1)} tonnes (${absPct}% below threshold)
              </div>
              <div style="font-size: 11px; color: #8F9E96; margin-top: 8px;">Source: Demo farmer production data</div>
            </div>
            <button onclick="window.paViewDetails('${alert.crop}')" class="btn-solid" style="background: ${color}; border: none; font-size: 12px; padding: 8px 16px;">View Details</button>
          </div>
        `;
      }).join('');
    }
  }
  
  // 3. Table
  const tableBody = document.getElementById('pa-table-body');
  if (tableBody) {
    tableBody.innerHTML = processedData.map(d => {
      let badge = '';
      if (d.status === 'CRITICAL') badge = `<span style="background: #FEF2F2; color: #991B1B; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; border: 1px solid #FCA5A5;">CRITICAL</span>`;
      else if (d.status === 'WARNING') badge = `<span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; border: 1px solid #FCD34D;">WARNING</span>`;
      else badge = `<span style="background: #F0FDF4; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; border: 1px solid #86EFAC;">NORMAL</span>`;
      
      const diffSign = d.percentageDiff > 0 ? '+' : '';
      return `
        <tr style="border-bottom: 1px solid #E4EBE6;">
          <td style="padding: 12px; font-weight: 600; color: #11261A;">${d.crop}</td>
          <td style="padding: 12px; color: #65796E;">${d.district}</td>
          <td style="padding: 12px; font-weight: 600;">${d.production} t</td>
          <td style="padding: 12px; color: #65796E;">${d.threshold} t</td>
          <td style="padding: 12px; font-weight: 600; color: ${d.percentageDiff < 0 ? '#E03131' : '#165A31'};">${diffSign}${d.percentageDiff.toFixed(1)}%</td>
          <td style="padding: 12px;">${badge}</td>
        </tr>
      `;
    }).join('');
  }
  
  // 4. Chart
  const chartContainer = document.getElementById('pa-chart-container');
  if (chartContainer) {
    // Find max value to scale chart
    let maxVal = 100;
    processedData.forEach(d => {
      if (d.production > maxVal) maxVal = d.production;
      if (d.threshold > maxVal) maxVal = d.threshold;
    });
    
    chartContainer.innerHTML = processedData.map(d => {
      const prodHeight = (d.production / maxVal) * 150;
      const threshHeight = (d.threshold / maxVal) * 150;
      
      return `
        <div style="display: flex; flex-direction: column; align-items: center; width: 60px; flex-shrink: 0;">
          <div style="display: flex; gap: 4px; align-items: flex-end; height: 150px;">
            <div style="width: 20px; background: #E4EBE6; height: ${threshHeight}px; border-radius: 4px 4px 0 0;" title="Threshold: ${d.threshold}t"></div>
            <div style="width: 20px; background: var(--vk-green); height: ${prodHeight}px; border-radius: 4px 4px 0 0;" title="Production: ${d.production}t"></div>
          </div>
          <div style="margin-top: 8px; font-size: 11px; font-weight: 600; color: #11261A;">${d.crop}</div>
        </div>
      `;
    }).join('');
  }
}

window.paViewDetails = function(cropName) {
  const d = processData(demoProductionData, currentFilters).find(c => c.crop === cropName);
  if (!d) return;
  
  const diffTonnes = d.production - d.threshold;
  let statusBadge = '';
  let suggestion = '';
  if (d.status === 'CRITICAL') {
    statusBadge = `<span style="background: #FEF2F2; color: #991B1B; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid #FCA5A5;">🚨 CRITICAL</span>`;
    suggestion = `Monitor upcoming ${d.crop.toLowerCase()} supply and consider alternative sourcing if the shortage persists.`;
  } else if (d.status === 'WARNING') {
    statusBadge = `<span style="background: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid #FCD34D;">⚠️ WARNING</span>`;
    suggestion = `${d.crop} production is slightly below expected. Monitor market prices closely.`;
  } else {
    statusBadge = `<span style="background: #F0FDF4; color: #166534; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; border: 1px solid #86EFAC;">✅ NORMAL</span>`;
    suggestion = `Production is healthy. No immediate action required.`;
  }

  const modalBody = document.getElementById('pa-modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h4 style="margin: 0; font-size: 18px; font-weight: 800;">${d.crop}</h4>
        ${statusBadge}
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #F8FAF9; padding: 12px; border-radius: 8px;">
        <div>
          <div style="color: #65796E; font-size: 11px;">District</div>
          <div style="font-weight: 600;">${d.district}</div>
        </div>
        <div>
          <div style="color: #65796E; font-size: 11px;">Year</div>
          <div style="font-weight: 600;">${d.year}</div>
        </div>
        <div>
          <div style="color: #65796E; font-size: 11px;">Expected Production</div>
          <div style="font-weight: 600;">${d.production} tonnes</div>
        </div>
        <div>
          <div style="color: #65796E; font-size: 11px;">Threshold</div>
          <div style="font-weight: 600;">${d.threshold} tonnes</div>
        </div>
        <div>
          <div style="color: #65796E; font-size: 11px;">Difference</div>
          <div style="font-weight: 600; color: ${diffTonnes < 0 ? '#E03131' : '#165A31'};">${diffTonnes > 0 ? '+' : ''}${diffTonnes.toFixed(1)} tonnes</div>
        </div>
        <div>
          <div style="color: #65796E; font-size: 11px;">Deviation</div>
          <div style="font-weight: 600; color: ${d.percentageDiff < 0 ? '#E03131' : '#165A31'};">${d.percentageDiff > 0 ? '+' : ''}${d.percentageDiff.toFixed(1)}%</div>
        </div>
      </div>
      
      <div style="margin-top: 12px; padding: 12px; border-top: 1px dashed #E4EBE6;">
        <div style="font-size: 11px; color: #65796E; font-weight: 600;">Suggested Action</div>
        <div style="font-size: 13px; color: #11261A; margin-top: 4px;">${suggestion}</div>
      </div>
      
      <div style="margin-top: 8px; font-size: 10px; color: #8F9E96; text-align: center;">
        Demo reporting farmers: ${d.farmers} <br>
        Data Source: Synthetic Demo Data
      </div>
    `;
    
    document.getElementById('pa-details-modal').style.display = 'flex';
  }
};

// Event Listeners for Filters
document.addEventListener('DOMContentLoaded', () => {
  const filterCrop = document.getElementById('pa-filter-crop');
  if (filterCrop) {
    // Populate crop filter options
    const crops = [...new Set(demoProductionData.map(d => d.crop))];
    crops.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      filterCrop.appendChild(opt);
    });
    
    // Listeners
    ['pa-filter-state', 'pa-filter-district', 'pa-filter-crop', 'pa-filter-year'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          const key = id.split('-').pop(); // state, district, crop, year
          currentFilters[key] = e.target.value;
          renderDashboard();
        });
      }
    });
    
    // Initial Render
    renderDashboard();
  }
});
