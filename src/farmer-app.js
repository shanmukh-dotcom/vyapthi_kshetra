import { TextToSpeech } from '@capacitor-community/text-to-speech';
/**
 * VYAPTI KSHETRA - Core Farmer Application Module
 * SIH26033: Bridging Fields to Fair Markets
 * Handles connected farmer state, collapsible sidebar drawer, top header controls,
 * Web Speech Synthesis Read Aloud, reactive financial transactions calculation,
 * and accessibility support actions.
 */

const STATE_KEY = 'vyapti_farmer_state';
const LANG_KEY = 'vyapti_selected_language';
const PROFILE_KEY = 'vyapti_farmer_profile';

// DEMO DATE anchor for hackathon prototype consistency
export const DEMO_DATE = '26 May 2025';

// Master Farmer Demo State (synchronized with localStorage)
const DEFAULT_FARMER_STATE = {
  farmer: {
    name: 'Ramesh Kumar',
    role: 'Farmer',
    location: 'Krishna District, Andhra Pradesh',
    farmName: 'Chennuboina Farm',
    mobile: '9876543210',
    experience: '6 Years',
    landArea: '2.50 Acres',
    soilType: 'Red Loamy (pH 6.8)',
    irrigation: 'Borewell + Drip'
  },
  currentCrop: {
    name: 'Potato',
    variety: 'Arka Rakshak',
    currentSellableLot: '500 kg', // Current lot ready for sale
    totalExpectedCrop: '12,000 kg', // Total seasonal expected yield
    status: 'Harvesting',
    indicativePrice: 22,
    priceRange: '₹ 20 – 24 / kg',
    indicativeFairPrice: '₹ 21 – 23 / kg',
    buyersInterested: 3,
    readyToBuyNow: 2,
    aiVisualPreGrade: 'A',
    modelConfidence: '94%'
  },
  myCrops: [
    {
      id: 'c1',
      name: 'Potato',
      variety: 'Arka Rakshak',
      totalExpectedCrop: '12,000 kg',
      currentSellableLot: '500 kg',
      area: '1.00 Acre',
      expectedHarvest: 'Harvesting in progress',
      aiVisualPreGrade: 'A (Visual estimate)',
      status: 'Harvesting'
    },
    {
      id: 'c2',
      name: 'Chilli',
      variety: 'Byadgi',
      totalExpectedCrop: '3,000 kg',
      currentSellableLot: '0 kg',
      area: '0.50 Acre',
      expectedHarvest: 'Late May 2025',
      aiVisualPreGrade: 'Pending analysis',
      status: 'Growing'
    },
    {
      id: 'c3',
      name: 'Maize',
      variety: 'Pioneer 3396',
      totalExpectedCrop: 'Planned',
      currentSellableLot: '0 kg',
      area: '0.50 Acre',
      expectedHarvest: 'Jan 2026',
      aiVisualPreGrade: 'Planning phase',
      status: 'Planning'
    }
  ],
  transactions: [
    { id: 'TXN-8842', date: '14 May 2025', type: 'SALE', crop: 'Potato (500 kg lot)', buyer: 'Krishna Fresh Mart', amount: 11500, method: 'UPI Payment', status: 'Received' },
    { id: 'TXN-8839', date: '10 May 2025', type: 'SALE', crop: 'Potato (1,200 kg lot)', buyer: 'South India Fresh Foods', amount: 27600, method: 'Bank Transfer', status: 'Pending' },
    { id: 'TXN-8820', date: '02 May 2025', type: 'SALE', crop: 'Chilli (800 kg lot)', buyer: 'Vijayawada Organic Hub', amount: 28001, method: 'UPI Payment', status: 'Received' },
    { id: 'TXN-8815', date: '28 Apr 2025', type: 'PAYOUT', crop: 'Bank Payout', buyer: 'Escrow → SBI Account (•••• 4892)', amount: 39500, method: 'IMPS Transfer', status: 'Completed' },
    { id: 'TXN-8790', date: '18 Apr 2025', type: 'SALE', crop: 'Potato (800 kg lot)', buyer: 'Andhra Pradesh Institutional Buyer', amount: 18400, method: 'Bank Transfer', status: 'Received' },
    { id: 'TXN-8762', date: '05 Apr 2025', type: 'SALE', crop: 'Chilli (500 kg lot)', buyer: 'Guntur Produce Buyer', amount: 17500, method: 'Direct Transfer', status: 'Pending' }
  ]
};

// Page Summaries for Voice Read Aloud in supported languages
const PAGE_READ_DATA = {
    home: {
      en: "Good morning Ramesh Kumar. Today your sellable lot is Potato, 500 kilograms ready for sale out of 12 thousand kilograms total crop. Indicative market price is 22 rupees per kilogram. 3 strong matches are interested in your lot.",
      te: "శుభోదయం రమేష్ కుమార్. నేడు మీ అమ్మకానికి సిద్ధంగా ఉన్న బంగాళాదుంప లాట్ 500 కిలోలు. సూచిక మార్కెట్ ధర కిలోకు 22 రూపాయలు.",
      hi: "सुप्रभात रमेश कुमार। आज आपकी बिक्री के लिए तैयार आलू 500 किलो है। बाज़ार का सांकेतिक मूल्य 22 रुपये प्रति किलो है।"
    },
    myFarm: {
      en: "My Farm Overview. Chennuboina Farm, verified 2.5 acres in Krishna District, Andhra Pradesh. You have 3 crops: Potato 12,000 kg expected with 500 kg sellable lot harvesting, Chilli 3,000 kg growing, and Maize in planning stage.",
      te: "నా పొలం వివరాలు. చెన్నుబోయిన ఫార్మ్, కృష్ణా జిల్లా, ఆంధ్రప్రదేశ్. మీ వద్ద బంగాళాదుంప, మిర్చి మరియు మొక్కజొన్న సాగులో ఉన్నాయి.",
      hi: "मेरा खेत। चेन्नुबोइना फार्म, कृष्णा जिला, आंध्र प्रदेश में 2.5 एकड़। आपके पास 3 फसलें हैं: आलू, मिर्च, और मक्का।"
    },
    market: {
      en: "Market and Fair Price. Potato indicative price is 22 rupees per kilogram. Indicative fair-value range for farmers is 21 to 23 rupees per kilogram based on demand and quality analysis.",
      te: "మార్కెట్ మరియు న్యాయమైన ధర. బంగాళాదుంప సూచిక ధర కిలోకు 22 రూపాయలు. న్యాయమైన ధర 21 నుండి 23 రూపాయలు.",
      hi: "बाज़ार और उचित मूल्य। आलू का सांकेतिक मूल्य 22 रुपये प्रति किलो है। किसानों के लिए उचित मूल्य 21 से 23 रुपये के बीच है।"
    },
    productionAlerts: {
      en: "Crop Production Alerts. Currently monitoring regional crop production. There is a production shortfall for Potato in Krishna District. Please monitor market prices.",
      te: "పంట ఉత్పత్తి హెచ్చరికలు. ప్రస్తుతం కృష్ణా జిల్లాలో బంగాళాదుంప ఉత్పత్తి తగ్గుదల ఉంది. దయచేసి మార్కెట్ ధరలను గమనించండి.",
      hi: "फसल उत्पादन अलर्ट। वर्तमान में कृष्णा जिले में आलू के उत्पादन में कमी है। कृपया बाज़ार की कीमतों पर नज़र रखें।"
    },
    gradeSell: {
      en: "Grade and Sell. AI visual pre-grade analysis for Potato: Estimated Visual Grade A with 94 percent model confidence. Indicative fair-value range is 21 to 23 rupees per kilogram.",
      te: "గ్రేడ్ మరియు సేల్. బంగాళాదుంప AI గ్రేడింగ్ ఫలితం గ్రేడ్ A.",
      hi: "ग्रेड और बिक्री। आलू के लिए एआई विजुअल विश्लेषण: अनुमानित ग्रेड ए। उचित मूल्य 21 से 23 रुपये प्रति किलो है।"
    },
    findBuyers: {
      en: "Find Buyers. Demo marketplace with 128 available buyer profiles in Andhra Pradesh. Top matches include Krishna Fresh Mart offering 24 rupees per kilogram, and South India Fresh Foods offering 26 rupees per kilogram.",
      te: "కొనుగోలుదారులను కనుగొనండి. కృష్ణా జిల్లాలో కొనుగోలు ప్రొఫైల్స్ అందుబాటులో ఉన్నాయి.",
      hi: "खरीदार खोजें। आंध्र प्रदेश में 128 उपलब्ध खरीदार हैं। शीर्ष खरीदार 24 और 26 रुपये प्रति किलो की पेशकश कर रहे हैं।"
    },
    logistics: {
      en: "Collective and Logistics. 12 active farmer groups and 8 demo transport partners available in Krishna District. Shared transport allows lower transport costs per kilogram.",
      te: "రవాణా మరియు లాజిస్టిక్స్. ఉమ్మడి రవాణా ద్వారా ఖర్చులు తగ్గించుకోవచ్చు.",
      hi: "लॉजिस्टिक्स। कृष्णा जिले में 12 किसान समूह और 8 ट्रांसपोर्ट पार्टनर उपलब्ध हैं। साझा परिवहन से लागत कम होती है।"
    },
    transactions: {
      en: "My Transactions. Total sales 1 lakh 3 thousand rupees across 5 sales deals. Amount received 57 thousand 900 rupees. Pending payments 45 thousand 100 rupees.",
      te: "నా లావాదేవీలు. మొత్తం అమ్మకాలు 1 లక్ష 3 వేల రూపాయలు.",
      hi: "मेरा लेन-देन। कुल बिक्री 1 लाख 3 हजार रुपये। प्राप्त राशि 57 हजार 900 रुपये। शेष राशि 45 हजार 100 रुपये है।"
    }
  };
class FarmerApp {
  constructor() {
    this.state = this.loadState();
    this.init();
  }

  loadState() {
    try {
      const savedState = localStorage.getItem(STATE_KEY);
      const profileSaved = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
      
      let state = savedState ? JSON.parse(savedState) : DEFAULT_FARMER_STATE;

      // Force Master Profile Krishna Location
      state.farmer.name = profileSaved.name || 'Ramesh Kumar';
      state.farmer.location = 'Krishna District, Andhra Pradesh';
      state.farmer.farmName = 'Chennuboina Farm';
      
      if (profileSaved.mobile) state.farmer.mobile = profileSaved.mobile;
      if (profileSaved.crop) state.currentCrop.name = profileSaved.crop;

      return state;
    } catch (e) {
      console.error('State load error:', e);
      return DEFAULT_FARMER_STATE;
    }
  }

  saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('State save error:', e);
    }
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupSidebarDrawer();
      this.setupHeaderControls();
      this.setupReadAloud();
      this.setupAccessibilityBar();
      this.syncStateToUI();
      this.renderTransactionsIfOnPage();
    });
  }

  /**
   * Helper Financial Calculations from Single Source of Truth
   */
  getFinancialSummary() {
    const salesTxns = this.state.transactions.filter(t => t.type === 'SALE');
    
    const totalSales = salesTxns.reduce((sum, t) => sum + t.amount, 0);
    const amountReceived = salesTxns.filter(t => t.status === 'Received').reduce((sum, t) => sum + t.amount, 0);
    const pendingPayments = salesTxns.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
    const totalCount = this.state.transactions.length;

    return {
      totalSales,
      amountReceived,
      pendingPayments,
      totalCount,
      salesCount: salesTxns.length,
      receivedPercent: totalSales > 0 ? Math.round((amountReceived / totalSales) * 100) : 0,
      pendingPercent: totalSales > 0 ? Math.round((pendingPayments / totalSales) * 100) : 0
    };
  }

  /**
   * Collapsible / Hidden Sidebar Overlay setup (ChatGPT desktop style)
   */
  setupSidebarDrawer() {
    const menuBtn = document.getElementById('app-menu-toggle');
    const sidebar = document.getElementById('app-sidebar-drawer');
    const backdrop = document.getElementById('app-drawer-backdrop');

    if (!menuBtn || !sidebar || !backdrop) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSidebar();
    });

    backdrop.addEventListener('click', () => {
      this.closeSidebar();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
      }
    });

    const currentPath = window.location.pathname;
    const navLinks = Array.from(sidebar.querySelectorAll('.sidebar-nav-link'));
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('.html', ''))) {
        link.classList.add('active');
      }
      link.addEventListener('click', () => {
        this.closeSidebar();
      });
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('app-sidebar-drawer');
    const backdrop = document.getElementById('app-drawer-backdrop');
    if (!sidebar || !backdrop) return;

    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    const sidebar = document.getElementById('app-sidebar-drawer');
    const backdrop = document.getElementById('app-drawer-backdrop');
    if (sidebar && backdrop) {
      sidebar.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById('app-sidebar-drawer');
    const backdrop = document.getElementById('app-drawer-backdrop');
    if (sidebar && backdrop) {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  /**
   * Header Controls (Search, Language dropdown)
   */
  setupHeaderControls() {
    const langSelect = document.getElementById('header-lang-select');
    if (langSelect) {
      const currentLang = localStorage.getItem(LANG_KEY) || 'en';
      langSelect.value = currentLang;

      langSelect.addEventListener('change', (e) => {
        localStorage.setItem(LANG_KEY, e.target.value);
        window.location.reload();
      });
    }
  }

  /**
   * Web Speech Synthesis Read Aloud for current page
   */
  setupReadAloud() {
    const readBtns = Array.from(document.querySelectorAll('.btn-read-aloud'));
    let isSpeaking = false;

    readBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (false) {
          alert('Read Aloud is not supported in this browser.');
          return;
        }

        if (isSpeaking) {
          
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

          isSpeaking = false;
          btn.classList.remove('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Read Aloud</span>
          `;
          return;
        }

        const pageKey = document.body.getAttribute('data-page') || 'home';
        const currentLang = localStorage.getItem(LANG_KEY) || 'en';
        const pageData = PAGE_READ_DATA[pageKey] || PAGE_READ_DATA.home;
        const speechText = pageData[currentLang] || pageData.en;

        
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

        
    try {
      TextToSpeech.speak({
        text: speechText,
        lang: currentLang === 'te' ? 'te-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN'),
        rate: 0.95
      });
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        // removed
        // removed
        // removed
      }
    }

// removed utterance
        // removed
        // removed

        utterance.onstart = () => {
          isSpeaking = true;
          btn.classList.add('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            <span>Stop Audio</span>
          `;
        };

        utterance.onend = utterance.onerror = () => {
          isSpeaking = false;
          btn.classList.remove('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Read Aloud</span>
          `;
        };

        // removed
      });
    });
  }

  /**
   * Setup Persistent Accessibility Bar
   */
  setupAccessibilityBar() {
    const callBtn = document.getElementById('acc-call-btn');
    const waBtn = document.getElementById('acc-wa-btn');

    if (callBtn) callBtn.href = 'tel:18001234567';
    if (waBtn) waBtn.href = 'https://wa.me/919876543210';
  }

  /**
   * Sync State across UI elements
   */
  syncStateToUI() {
    const farmerNameElems = document.querySelectorAll('.sync-farmer-name');
    const farmerLocElems = document.querySelectorAll('.sync-farmer-loc');
    const cropNameElems = document.querySelectorAll('.sync-crop-name');
    const cropQtyElems = document.querySelectorAll('.sync-crop-qty');

    farmerNameElems.forEach(el => el.textContent = this.state.farmer.name);
    farmerLocElems.forEach(el => el.textContent = `${this.state.farmer.role} | ${this.state.farmer.location}`);
    cropNameElems.forEach(el => el.textContent = this.state.currentCrop.name);
    cropQtyElems.forEach(el => el.textContent = this.state.currentCrop.currentSellableLot);
  }

  /**
   * Dynamic Financial Rendering for My Transactions
   */
  renderTransactionsIfOnPage() {
    const pageKey = document.body.getAttribute('data-page');
    if (pageKey !== 'transactions') return;

    const summary = this.getFinancialSummary();

    // Render Metrics
    const totalSalesElem = document.getElementById('dyn-total-sales');
    const recAmountElem = document.getElementById('dyn-received-amount');
    const recPercentElem = document.getElementById('dyn-received-percent');
    const pendAmountElem = document.getElementById('dyn-pending-amount');
    const pendPercentElem = document.getElementById('dyn-pending-percent');
    const totalTxnElem = document.getElementById('dyn-total-txns');

    if (totalSalesElem) totalSalesElem.textContent = `₹ ${summary.totalSales.toLocaleString('en-IN')}`;
    if (recAmountElem) recAmountElem.textContent = `₹ ${summary.amountReceived.toLocaleString('en-IN')}`;
    if (recPercentElem) recPercentElem.textContent = `${summary.receivedPercent}% of total sales`;
    if (pendAmountElem) pendAmountElem.textContent = `₹ ${summary.pendingPayments.toLocaleString('en-IN')}`;
    if (pendPercentElem) pendPercentElem.textContent = `${summary.pendingPercent}% awaiting payout`;
    if (totalTxnElem) totalTxnElem.textContent = summary.totalCount;

    // Render Table
    const tbody = document.getElementById('dyn-txn-tbody');
    if (tbody && this.state.transactions) {
      tbody.innerHTML = this.state.transactions.map(t => `
        <tr style="border-bottom: 1px solid #EDF2EE;">
          <td style="padding: 10px 12px; font-weight: 600; color: #1B4D35;">${t.id}</td>
          <td style="padding: 10px 12px; color: #65796E;">${t.date}</td>
          <td style="padding: 10px 12px;">${t.crop}</td>
          <td style="padding: 10px 12px; font-weight: 600;">${t.buyer}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: ${t.status === 'Pending' ? '#D97706' : '#165A31'};">₹ ${t.amount.toLocaleString('en-IN')}</td>
          <td style="padding: 10px 12px; color: #65796E;">${t.method}</td>
          <td style="padding: 10px 12px;">
            <span style="background: ${t.status === 'Received' ? '#E8F5E9' : (t.status === 'Pending' ? '#FEF3C7' : '#E3F2FD')}; color: ${t.status === 'Received' ? '#2E7D32' : (t.status === 'Pending' ? '#D97706' : '#1976D2')}; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: 700;">
              ${t.status}
            </span>
          </td>
          <td style="padding: 10px 12px;">
            <button type="button" class="btn-action-sm" style="padding: 4px 8px; border: 1px solid #D0DBCE; background: #FFF; border-radius: 4px; cursor: pointer; font-size: 11px;">
              ${t.type === 'SALE' ? (t.status === 'Pending' ? 'Track 🚚' : 'Invoice 📄') : 'Receipt 🧾'}
            </button>
          </td>
        </tr>
      `).join('');
    }
  }
}

// ============================================================
// FUTURE CROPS MODULE
// ============================================================

// --- Modal open/close ---
window.openFutureCropForm = function() {
  document.getElementById('fc-id').value = '';
  document.getElementById('fc-modal-title').textContent = '🌱 Plan Your Next Crop';
  document.getElementById('fc-modal-subtitle').textContent = 'Enter the details of the crop you plan to grow next.';
  document.getElementById('future-crop-form').reset();
  document.getElementById('fc-custom-crop-wrap').style.display = 'none';
  hideValidation();
  document.getElementById('future-crop-modal').style.display = 'flex';
};
window.closeFutureCropForm = function() {
  document.getElementById('future-crop-modal').style.display = 'none';
  document.getElementById('future-crop-form').reset();
  document.getElementById('fc-custom-crop-wrap').style.display = 'none';
  hideValidation();
};
window.closeViewCropModal = function() {
  document.getElementById('future-crop-view-modal').style.display = 'none';
};

// --- Validation helper ---
function showValidation(msg) {
  const el = document.getElementById('fc-validation-msg');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function hideValidation() {
  const el = document.getElementById('fc-validation-msg');
  if (el) { el.textContent = ''; el.style.display = 'none'; }
}

// --- Success toast ---
function showSuccessToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
    background: '#165A31', color: '#fff', padding: '10px 24px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', zIndex: '9999', boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  });
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// --- Synthetic demo data ---
let demoFutureCrops = [
  {
    id: 1,
    crop_name: 'Rice',
    variety: 'BPT 5204',
    previous_crop: 'Potato',
    planned_area: 1.5,
    expected_sowing: '2026-07-15',
    expected_harvest: '2026-10-20',
    expected_production: 3.5,
    production_unit: 'Tonnes',
    notes: 'Planning to plant after potato harvest.',
    status: 'PLANNED'
  }
];

// --- Date formatting ---
function formatDate(dateStr) {
  if (!dateStr) return 'Not specified';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- Get resolved crop name (handles 'Other') ---
function getResolvedCropName() {
  const sel = document.getElementById('fc-crop-name');
  if (sel.value === 'Other') {
    return document.getElementById('fc-custom-crop').value.trim();
  }
  return sel.value;
}

// --- Render all future crop cards ---
window.renderFutureCrops = function() {
  const listDiv = document.getElementById('future-crops-list');
  if (!listDiv) return;

  if (demoFutureCrops.length === 0) {
    listDiv.innerHTML = `
      <div style="border: 1px dashed #A8C7B4; border-radius: 8px; padding: 32px; text-align: center;">
        <h4 style="color: #11261A; font-size: 16px; margin: 0 0 8px 0;">🌱 No Future Crop Planned</h4>
        <p style="color: #65796E; font-size: 14px; margin: 0;">Plan your next crop after your current harvest.</p>
      </div>
    `;
    return;
  }

  listDiv.innerHTML = demoFutureCrops.map(crop => {
    const prodDisplay = (crop.expected_production != null && crop.expected_production !== '')
      ? `${crop.expected_production} ${crop.production_unit || 'Tonnes'}`
      : 'Not specified';

    return `
    <div style="border: 1px solid #E4EBE6; border-radius: 8px; padding: 16px; background: #fff;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <div style="font-size: 18px; font-weight: 700; color: #11261A; display: flex; align-items: center; gap: 8px;">
          🌾 ${crop.crop_name}
        </div>
        <div style="font-size: 11px; font-weight: 700; background: #E8F4EC; color: #165A31; padding: 4px 10px; border-radius: 12px; text-transform: uppercase;">
          🌱 ${crop.status}
        </div>
      </div>
      
      <div style="font-size: 13px; color: #65796E; margin-bottom: 16px;">
        Next crop after <strong>${crop.previous_crop}</strong> harvest
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700; margin-bottom: 4px;">VARIETY</div>
          <div style="font-size: 14px; color: #11261A; font-weight: 600;">${crop.variety || 'Not specified'}</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700; margin-bottom: 4px;">PLANNED AREA</div>
          <div style="font-size: 14px; color: #11261A; font-weight: 600;">${crop.planned_area} Acres</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700; margin-bottom: 4px;">EXPECTED SOWING</div>
          <div style="font-size: 14px; color: #11261A; font-weight: 600;">${formatDate(crop.expected_sowing)}</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700; margin-bottom: 4px;">EXPECTED HARVEST</div>
          <div style="font-size: 14px; color: #11261A; font-weight: 600;">${formatDate(crop.expected_harvest)}</div>
        </div>
        <div>
          <div style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700; margin-bottom: 4px;">EXPECTED PRODUCTION</div>
          <div style="font-size: 14px; color: #11261A; font-weight: 600;">${prodDisplay}</div>
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <button onclick="viewFutureCrop(${crop.id})" class="btn-action-sm" style="background: #F4F8FA; color: #11261A; border: 1px solid #E4EBE6; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">View Plan</button>
        <button onclick="editFutureCrop(${crop.id})" class="btn-action-sm" style="background: #F4F8FA; color: #11261A; border: 1px solid #E4EBE6; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600;">Edit</button>
        <a href="/farmer-market.html" class="btn-action-sm" style="background: transparent; color: #165A31; border: none; font-weight: 600; padding: 6px 12px; text-decoration: none; margin-left: auto;">See Market Outlook →</a>
      </div>
      
      <div style="font-size: 10px; color: #A8C7B4; margin-top: 12px; text-align: right;">Demo Plan</div>
    </div>
  `;
  }).join('');
};

// --- Edit a future crop ---
window.editFutureCrop = function(id) {
  const crop = demoFutureCrops.find(c => c.id === id);
  if (!crop) return;
  
  document.getElementById('fc-id').value = crop.id;
  document.getElementById('fc-modal-title').textContent = '✏️ Edit Crop Plan';
  document.getElementById('fc-modal-subtitle').textContent = 'Update the details of your planned crop.';
  
  // Set crop name — check if it's a standard option or custom
  const cropSelect = document.getElementById('fc-crop-name');
  const standardOptions = Array.from(cropSelect.options).map(o => o.value);
  if (standardOptions.includes(crop.crop_name)) {
    cropSelect.value = crop.crop_name;
    document.getElementById('fc-custom-crop-wrap').style.display = 'none';
  } else {
    cropSelect.value = 'Other';
    document.getElementById('fc-custom-crop-wrap').style.display = 'block';
    document.getElementById('fc-custom-crop').value = crop.crop_name;
  }
  
  document.getElementById('fc-prev-crop').value = crop.previous_crop;
  document.getElementById('fc-variety').value = crop.variety || '';
  document.getElementById('fc-area').value = crop.planned_area;
  document.getElementById('fc-sowing').value = crop.expected_sowing || '';
  document.getElementById('fc-harvest').value = crop.expected_harvest || '';
  document.getElementById('fc-production').value = crop.expected_production || '';
  document.getElementById('fc-unit').value = crop.production_unit || 'Tonnes';
  document.getElementById('fc-notes').value = crop.notes || '';
  
  hideValidation();
  document.getElementById('future-crop-modal').style.display = 'flex';
};

// --- View a future crop ---
window.viewFutureCrop = function(id) {
  const crop = demoFutureCrops.find(c => c.id === id);
  if (!crop) return;
  
  const prodDisplay = (crop.expected_production != null && crop.expected_production !== '')
    ? `${crop.expected_production} ${crop.production_unit || 'Tonnes'}`
    : 'Not specified';

  const content = `
    <div style="margin-bottom: 12px;">
      <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">FUTURE CROP</span>
      <div style="font-size: 18px; font-weight: 700; color: #11261A;">🌾 ${crop.crop_name}</div>
    </div>
    <div style="margin-bottom: 12px;">
      <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">STATUS</span>
      <div style="font-size: 14px; color: #165A31; font-weight: 600;">🌱 ${crop.status}</div>
    </div>
    <div style="margin-bottom: 12px;">
      <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">AFTER</span>
      <div style="font-size: 14px; color: #11261A;">${crop.previous_crop} Harvest</div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">VARIETY</span>
        <div style="font-size: 14px; color: #11261A;">${crop.variety || 'Not specified'}</div>
      </div>
      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">PLANNED AREA</span>
        <div style="font-size: 14px; color: #11261A;">${crop.planned_area} Acres</div>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">EXPECTED SOWING</span>
        <div style="font-size: 14px; color: #11261A;">${formatDate(crop.expected_sowing)}</div>
      </div>
      <div>
        <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">EXPECTED HARVEST</span>
        <div style="font-size: 14px; color: #11261A;">${formatDate(crop.expected_harvest)}</div>
      </div>
    </div>
    <div style="margin-bottom: 12px;">
      <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">EXPECTED PRODUCTION</span>
      <div style="font-size: 14px; color: #11261A;">${prodDisplay}</div>
    </div>
    ${crop.notes ? `
    <div style="margin-bottom: 0;">
      <span style="font-size: 10px; text-transform: uppercase; color: #8F9E96; font-weight: 700;">NOTES</span>
      <div style="font-size: 14px; color: #11261A;">${crop.notes}</div>
    </div>
    ` : ''}
  `;
  document.getElementById('view-crop-content').innerHTML = content;
  
  // Wire up delete button
  const deleteBtn = document.getElementById('view-modal-delete-btn');
  deleteBtn.onclick = function() {
    if (confirm('Are you sure you want to remove this future crop plan?')) {
      demoFutureCrops = demoFutureCrops.filter(c => c.id !== id);
      window.renderFutureCrops();
      window.closeViewCropModal();
      showSuccessToast('Future crop plan deleted.');
    }
  };
  
  document.getElementById('future-crop-view-modal').style.display = 'flex';
};

// --- DOMContentLoaded: form submit + Other toggle + Escape key ---
document.addEventListener("DOMContentLoaded", () => {
  const futureForm = document.getElementById('future-crop-form');
  const cropSelect = document.getElementById('fc-crop-name');
  
  // Toggle custom crop name input when "Other" is selected
  if (cropSelect) {
    cropSelect.addEventListener('change', () => {
      const wrap = document.getElementById('fc-custom-crop-wrap');
      if (cropSelect.value === 'Other') {
        wrap.style.display = 'block';
      } else {
        wrap.style.display = 'none';
        document.getElementById('fc-custom-crop').value = '';
      }
    });
  }
  
  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('future-crop-modal').style.display === 'flex') {
        closeFutureCropForm();
      }
      if (document.getElementById('future-crop-view-modal').style.display === 'flex') {
        closeViewCropModal();
      }
    }
  });

  if (futureForm) {
    futureForm.addEventListener('submit', (e) => {
      e.preventDefault();
      hideValidation();
      
      // Resolve crop name
      const cropName = getResolvedCropName();
      if (!cropName) {
        showValidation('Please select or enter a crop name.');
        return;
      }
      
      // Validate area
      const area = parseFloat(document.getElementById('fc-area').value);
      if (!area || area <= 0) {
        showValidation('Planned area must be greater than 0.');
        return;
      }
      
      // Validate dates
      const sowingVal = document.getElementById('fc-sowing').value;
      const harvestVal = document.getElementById('fc-harvest').value;
      if (!sowingVal || !harvestVal) {
        showValidation('Both sowing and harvest dates are required.');
        return;
      }
      if (new Date(harvestVal) <= new Date(sowingVal)) {
        showValidation('Expected harvest date must be after sowing date.');
        return;
      }
      
      // Validate production if entered
      const prodVal = document.getElementById('fc-production').value;
      if (prodVal && parseFloat(prodVal) < 0) {
        showValidation('Expected production cannot be negative.');
        return;
      }
      
      const idVal = document.getElementById('fc-id').value;
      const isEdit = !!idVal;
      
      const planData = {
        crop_name: cropName,
        variety: document.getElementById('fc-variety').value.trim() || '',
        previous_crop: document.getElementById('fc-prev-crop').value,
        planned_area: area,
        expected_sowing: sowingVal,
        expected_harvest: harvestVal,
        expected_production: prodVal ? parseFloat(prodVal) : null,
        production_unit: document.getElementById('fc-unit').value,
        notes: document.getElementById('fc-notes').value.trim(),
        status: 'PLANNED'
      };
      
      if (isEdit) {
        const cropIndex = demoFutureCrops.findIndex(c => c.id == idVal);
        if (cropIndex !== -1) {
          demoFutureCrops[cropIndex] = { ...demoFutureCrops[cropIndex], ...planData };
        }
        showSuccessToast('Crop plan updated successfully.');
      } else {
        demoFutureCrops.push({ id: Date.now(), ...planData });
        showSuccessToast('Future crop plan saved successfully.');
      }
      
      window.renderFutureCrops();
      window.closeFutureCropForm();
    });
    
    // Initial Render
    window.renderFutureCrops();
  }
});

// Export singleton instance
export const farmerApp = new FarmerApp();


// Global Toast System
window.showToast = function(message, type = 'success') {
  let container = document.getElementById('vk-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'vk-toast-container';
    container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none;';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  const bg = type === 'success' ? '#E8F4EC' : (type === 'error' ? '#FEF2F2' : '#F4F8FA');
  const color = type === 'success' ? '#165A31' : (type === 'error' ? '#991B1B' : '#00529B');
  const border = type === 'success' ? '#A8C7B4' : (type === 'error' ? '#FCA5A5' : '#A5C8FC');
  
  toast.style.cssText = `background: ${bg}; color: ${color}; border: 1px solid ${border}; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.1); opacity: 0; transform: translateY(20px); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 8px; pointer-events: auto;`;
  
  const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
  toast.innerHTML = `<span style="font-family: 'Segoe UI Emoji', sans-serif;">${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  // Animate in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  
  // Animate out
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3000);
};

document.addEventListener('DOMContentLoaded', () => {
    const bell = document.querySelector('.header-bell');
    if (bell) bell.onclick = () => window.showToast('You have 2 new notifications', 'info');
    
    const profile = document.querySelector('.profile-pill');
    if (profile) profile.onclick = () => window.showToast('Profile and network settings synced', 'success');
});

// OFFLINE NETWORK DETECTOR (Android / Web)
window.addEventListener('load', () => {
    const updateOnlineStatus = () => {
        if (!navigator.onLine) {
            if (window.showToast) {
                window.showToast('You are offline. Some features may be limited.', 'error');
            } else {
                alert('You are offline. Some features may be limited.');
            }
        } else {
            if (window.showToast) {
                window.showToast('Back online!', 'success');
            }
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
});
