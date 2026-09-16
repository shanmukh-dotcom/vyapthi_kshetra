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
    location: 'Kolar, Karnataka',
    farmName: 'Chennuboina Farm',
    mobile: '9876543210',
    experience: '6 Years',
    landArea: '2.50 Acres',
    soilType: 'Red Loamy (pH 6.8)',
    irrigation: 'Borewell + Drip'
  },
  currentCrop: {
    name: 'Tomato',
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
      name: 'Tomato',
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
    { id: 'TXN-8842', date: '14 May 2025', type: 'SALE', crop: 'Tomato (500 kg lot)', buyer: 'Kolar Fresh Mart', amount: 11500, method: 'UPI Payment', status: 'Received' },
    { id: 'TXN-8839', date: '10 May 2025', type: 'SALE', crop: 'Tomato (1,200 kg lot)', buyer: 'South India Fresh Foods', amount: 27600, method: 'Bank Transfer', status: 'Pending' },
    { id: 'TXN-8820', date: '02 May 2025', type: 'SALE', crop: 'Chilli (800 kg lot)', buyer: 'Bengaluru Organic Hub', amount: 28000, method: 'UPI Payment', status: 'Received' },
    { id: 'TXN-8815', date: '28 Apr 2025', type: 'PAYOUT', crop: 'Bank Payout', buyer: 'Escrow → SBI Account (•••• 4892)', amount: 39500, method: 'IMPS Transfer', status: 'Completed' },
    { id: 'TXN-8790', date: '18 Apr 2025', type: 'SALE', crop: 'Tomato (800 kg lot)', buyer: 'Karnataka Institutional Buyer', amount: 18400, method: 'Bank Transfer', status: 'Received' },
    { id: 'TXN-8762', date: '05 Apr 2025', type: 'SALE', crop: 'Chilli (500 kg lot)', buyer: 'Chikkaballapur Produce Buyer', amount: 17500, method: 'Direct Transfer', status: 'Pending' }
  ]
};

// Page Summaries for Voice Read Aloud in supported languages
const PAGE_READ_DATA = {
  home: {
    en: "Good morning Ramesh Kumar. Today your sellable lot is Tomato, 500 kilograms ready for sale out of 12 thousand kilograms total crop. Indicative market price is 22 rupees per kilogram. 3 strong matches are interested in your lot. Click Sell My Tomato to inspect quality and connect with buyers.",
    te: "శుభోదయం రమేష్ కుమార్. నేడు మీ అమ్మకానికి సిద్ధంగా ఉన్న టమాటా లాట్ 500 కిలోలు. సూచిక మార్కెట్ ధర కిలోకు 22 రూపాయలు."
  },
  myFarm: {
    en: "My Farm Overview. Chennuboina Farm, verified 2.5 acres in Kolar, Karnataka. You have 3 crops: Tomato 12,000 kg expected with 500 kg sellable lot harvesting, Chilli 3,000 kg growing, and Maize in planning stage.",
    te: "నా పొలం వివరాలు. చెన్నుబోయిన ఫార్మ్, కోలార్, కర్ణాటక. మీ వద్ద టమాటా, మిర్చి మరియు మొక్కజొన్న సాగులో ఉన్నాయి."
  },
  market: {
    en: "Market and Fair Price. Tomato indicative price is 22 rupees per kilogram. Indicative fair-value range for farmers is 21 to 23 rupees per kilogram based on demand and quality analysis.",
    te: "మార్కెట్ మరియు న్యాయమైన ధర. టమాటా సూచిక ధర కిలోకు 22 రూపాయలు. న్యాయమైన ధర 21 నుండి 23 రూపాయలు."
  },
  gradeSell: {
    en: "Grade and Sell. AI visual pre-grade analysis for Tomato: Estimated Visual Grade A with 94 percent model confidence. Indicative fair-value range is 21 to 23 rupees per kilogram.",
    te: "గ్రేడ్ మరియు సేల్. టమాటా AI గ్రేడింగ్ ఫలితం గ్రేడ్ A."
  },
  findBuyers: {
    en: "Find Buyers. Demo marketplace with 128 available buyer profiles in Karnataka. Top matches include Kolar Fresh Mart offering 24 rupees per kilogram, and South India Fresh Foods offering 26 rupees per kilogram.",
    te: "కొనుగోలుదారులను కనుగొనండి. కర్ణాటకలో 128 మంది కొనుగోలు ప్రొఫైల్స్ అందుబాటులో ఉన్నాయి."
  },
  logistics: {
    en: "Collective and Logistics. 12 active farmer groups and 8 demo transport partners available in Kolar. Shared transport allows lower transport costs per kilogram.",
    te: "రవాణా మరియు లాజిస్టిక్స్. ఉమ్మడి రవాణా ద్వారా ఖర్చులు తగ్గించుకోవచ్చు."
  },
  transactions: {
    en: "My Transactions. Total sales 1 lakh 3 thousand rupees across 5 sales deals. Amount received 57 thousand 900 rupees. Pending payments 45 thousand 100 rupees.",
    te: "నా లావాదేవీలు. మొత్తం అమ్మకాలు 1 లక్ష 3 వేల రూపాయలు."
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

      // Force Master Profile Kolar Location
      state.farmer.name = profileSaved.name || 'Ramesh Kumar';
      state.farmer.location = 'Kolar, Karnataka';
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
        const selectedLang = e.target.value;
        localStorage.setItem(LANG_KEY, selectedLang);
        
        // Update Google Translate cookie
        if (selectedLang === 'en') {
          document.cookie = "googtrans=/en/en; path=/;";
          document.cookie = "googtrans=/en/en; domain=localhost; path=/;";
        } else {
          document.cookie = `googtrans=/en/${selectedLang}; path=/;`;
          document.cookie = `googtrans=/en/${selectedLang}; domain=localhost; path=/;`;
        }
        
        window.location.reload();
      });
    }
  }

  /**
   * Play Custom Pre-recorded Audio for current page
   */
  setupReadAloud() {
    const readBtns = Array.from(document.querySelectorAll('.btn-read-aloud'));
    let currentAudio = null;
    let isPlaying = false;

    // Determine the current language
    const currentLang = localStorage.getItem(LANG_KEY) || 'en';

    // Map page keys to the actual uploaded audio files based on language
    const getAudioSrc = (pageKey) => {
      if (currentLang === 'hi') {
        const HINDI_FILES = {
          home: 'hindi mp3/hindi home.mpeg',
          myFarm: 'hindi mp3/hindi my farm.mpeg',
          market: 'hindi mp3/hindi market and price.mpeg',
          gradeSell: 'hindi mp3/hindi grade.mpeg',
          findBuyers: 'hindi mp3/hindi find buyers.mpeg',
          logistics: 'hindi mp3/hindi collective logistics.mpeg',
          transactions: 'hindi mp3/hindi transcations.mpeg'
        };
        return HINDI_FILES[pageKey];
      } else {
        // Default to English
        const ENGLISH_FILES = {
          home: 'mp3/farmer_home.mpeg',
          myFarm: 'mp3/my_farm.mpeg',
          market: 'mp3/market_fair price.mpeg',
          gradeSell: 'mp3/grade and scale.mpeg',
          findBuyers: 'mp3/find buyers.mpeg',
          logistics: 'mp3/collective logistics.mpeg',
          transactions: 'mp3/my transcations.mpeg'
        };
        return ENGLISH_FILES[pageKey];
      }
    };

    readBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (isPlaying && currentAudio) {
          // Stop audio if it's currently playing
          currentAudio.pause();
          currentAudio.currentTime = 0;
          isPlaying = false;
          
          btn.classList.remove('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Read Aloud</span>
          `;
          return;
        }

        // Determine which page we are on
        const pageKey = document.body.getAttribute('data-page') || 'home';
        const audioSrc = getAudioSrc(pageKey);

        if (!audioSrc) {
          alert('No audio file found for this page.');
          return;
        }

        // Initialize and play the new audio
        currentAudio = new Audio(audioSrc);
        
        currentAudio.play().then(() => {
          isPlaying = true;
          btn.classList.add('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            <span>Stop Audio</span>
          `;
        }).catch(err => {
          console.error("Audio playback failed:", err);
          alert("Could not play the audio file. Make sure you are interacting with the page first.");
        });

        // Reset button when audio finishes
        currentAudio.onended = () => {
          isPlaying = false;
          btn.classList.remove('speaking');
          btn.innerHTML = `
            <svg class="icon-read" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Read Aloud</span>
          `;
        };
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

// Export singleton instance
export const farmerApp = new FarmerApp();
