/**
 * Ask Vyapti — AI Farmer Assistant and Agricultural Intelligence
 * Powered by Verified Knowledge Base: 300 Questions & Answers across 20 Categories
 * Core Philosophy: Farmer Knowledge + Platform Action Integration
 */

// Dynamically ensure KB script is loaded if not already in window
if (!window.VYAPTI_KB) {
  const kbScript = document.createElement('script');
  kbScript.src = '/src/vyapti-kb.js';
  document.head.appendChild(kbScript);
}

class AskVyapti {
  constructor() {
    this.farmerName = 'Ramesh Kumar';
    this.farmerLocation = 'Krishna District, Andhra Pradesh';
    this.isPanelOpen = false;
    this.init();
  }

  init() {
    if (document.getElementById('ask-vyapti-btn')) return;

    this.injectUI();
    this.bindEvents();
    this.renderContextualQuickActions();
  }

  injectUI() {
    const container = document.createElement('div');
    container.innerHTML = `
      <!-- Floating Button -->
      <div id="ask-vyapti-btn" role="button" aria-label="Ask Vyapti">
        <span class="vyapti-icon">🌿</span>
        <span class="vyapti-label">Ask Vyapti</span>
      </div>

      <!-- Assistant Panel -->
      <div id="ask-vyapti-panel" class="vyapti-hidden">
        <div class="vyapti-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 18px;">🌿</span>
            <div>
              <div style="font-weight: 800; font-size: 15px; line-height: 1.2;">Ask Vyapti</div>
              <div style="font-size: 10.5px; opacity: 0.85; font-weight: 500;">300+ Verified Farmer Answers</div>
            </div>
          </div>
          <button id="vyapti-close" aria-label="Close">×</button>
        </div>
        
        <div id="vyapti-chat-body">
          <div class="vyapti-msg vyapti-system">
            <strong>Namaskaram, ${this.farmerName}!</strong><br>
            I am Vyapti, your agricultural intelligence assistant for ${this.farmerLocation}.<br><br>
            Ask me about crop diseases, pest remedies, market prices, buyer matching, shared logistics, or government schemes (PM-KISAN, PMFBY, KCC loans, subsidies).
          </div>
        </div>
        
        <div id="vyapti-quick-actions"></div>
        
        <div class="vyapti-input-area">
          <button id="vyapti-cam-btn" class="vyapti-icon-btn" aria-label="Upload Photo" title="Upload crop photo for visual diagnosis">📷</button>
          <button id="vyapti-mic-btn" class="vyapti-icon-btn" aria-label="Speak" title="Voice assistance">🎙</button>
          <input type="text" id="vyapti-input" placeholder="Ask about crops, pests, prices, schemes..." aria-label="Message Vyapti" />
          <button id="vyapti-send-btn" aria-label="Send">➤</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    this.btn = document.getElementById('ask-vyapti-btn');
    this.panel = document.getElementById('ask-vyapti-panel');
    this.closeBtn = document.getElementById('vyapti-close');
    this.chatBody = document.getElementById('vyapti-chat-body');
    this.quickActions = document.getElementById('vyapti-quick-actions');
    this.input = document.getElementById('vyapti-input');
    this.sendBtn = document.getElementById('vyapti-send-btn');
    this.micBtn = document.getElementById('vyapti-mic-btn');
    this.camBtn = document.getElementById('vyapti-cam-btn');
  }

  bindEvents() {
    this.btn.addEventListener('click', () => this.togglePanel());
    this.closeBtn.addEventListener('click', () => this.togglePanel());
    
    // Bind any buttons across the page with class .ask-vyapti-btn
    const imageBtns = document.querySelectorAll('.ask-vyapti-btn');
    imageBtns.forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.isPanelOpen) this.togglePanel();
      });
    });

    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    // Mic simulation
    this.micBtn.addEventListener('click', () => {
      this.input.value = "Listening...";
      setTimeout(() => {
        this.input.value = "My crop leaves are turning yellow";
        this.handleSend();
      }, 1200);
    });

    // Camera action routes to AI grade / crop check
    this.camBtn.addEventListener('click', () => {
      this.appendMessage("Opening camera & AI Crop Assistant. You can upload or scan crop photos for quality grading and pest inspection.", "system");
      setTimeout(() => {
        window.location.href = '/farmer-grade-sell.html';
      }, 1000);
    });
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
    if (this.isPanelOpen) {
      this.panel.classList.remove('vyapti-hidden');
      this.input.focus();
    } else {
      this.panel.classList.add('vyapti-hidden');
    }
  }

  renderContextualQuickActions() {
    const path = window.location.pathname;
    let actions = [
      '🍂 Leaf Yellowing',
      '🏛 PM-KISAN ₹6,000',
      '💳 KCC 4% Loan',
      '🛡 PMFBY Crop Insurance',
      '🚜 Tractor Subsidy',
      '🚚 Shared Logistics',
      '📈 Fair Price Guard'
    ];
    
    if (path.includes('market')) {
      actions = ['📈 Today Potato Price', '⚖️ Fair Price Range', '🤝 Find Nearby Buyers', '📉 Price Trends'];
    } else if (path.includes('grade')) {
      actions = ['🔬 AI Quality Grading', '🍂 Disease Identification', '🧪 Chemical Residue Check', '🌾 Grade A Meaning'];
    } else if (path.includes('logistics')) {
      actions = ['🚚 Shared Transport Options', '💰 Reduce Transport Cost', '📍 Nearby Collection Centers', '🤝 Join Farmer Groups'];
    } else if (path.includes('transactions')) {
      actions = ['💳 Payment Status', '🔍 Transparent Deductions', '🏛 Bank Account Update', '⚖️ Dispute Resolution'];
    }

    this.quickActions.innerHTML = actions.map(action => 
      `<button class="vyapti-quick-btn">${action}</button>`
    ).join('');

    this.quickActions.querySelectorAll('.vyapti-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.input.value = btn.innerText.replace(/^[^\w]+/, '').trim();
        this.handleSend();
      });
    });
  }

  handleSend() {
    const text = this.input.value.trim();
    if (!text || text === "Listening...") return;

    this.appendMessage(text, 'user');
    this.input.value = '';
    this.chatBody.scrollTop = this.chatBody.scrollHeight;

    setTimeout(() => {
      this.processQuery(text);
    }, 400);
  }

  appendMessage(htmlContent, sender) {
    const msg = document.createElement('div');
    msg.className = `vyapti-msg vyapti-${sender}`;
    msg.innerHTML = htmlContent;
    this.chatBody.appendChild(msg);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  processQuery(text) {
    const query = text.trim();
    const lower = query.toLowerCase();

    // 1. Dragon fruit comparison scenario from previous demos
    if (lower.includes('dragon fruit')) {
      this.showCropComparison();
      return;
    }

    const kb = window.VYAPTI_KB || [];
    if (kb.length === 0) {
      this.appendMessage("Loading the 300 Questions Knowledge Base. Please try again in 2 seconds!", "system");
      return;
    }

    // Common stop words to ignore during tokenization
    const stopWords = new Set([
      'what', 'when', 'where', 'which', 'who', 'whom', 'this', 'that', 'these', 'those',
      'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or',
      'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
      'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above',
      'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under',
      'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
      'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should',
      'now', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'how', 'get', 'tell'
    ]);

    // Tokenize
    const rawTokens = lower.replace(/[^\w\s-]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    // Domain Synonym Mapping for robust farmer matching
    const synonymMap = {
      'yellow': ['chlorosis', 'nitrogen', 'nutrient', 'iron', 'manganese', 'waterlogging'],
      'spot': ['spots', 'blight', 'alternaria', 'septoria', 'bacterial'],
      'pest': ['insect', 'insects', 'aphid', 'whitefly', 'thrip', 'caterpillar', 'borer'],
      'insect': ['pest', 'insects', 'aphid', 'whitefly', 'caterpillar', 'borer'],
      'spray': ['pesticide', 'fungicide', 'insecticide', 'chemical', 'neem'],
      'pesticide': ['spray', 'dose', 'insecticide', 'fungicide', 'phi'],
      'pmkisan': ['pm-kisan', 'kisan', 'samman', '6000', 'installment', 'dbt', 'beneficiary'],
      'kisan': ['pm-kisan', 'samman', 'credit', 'kcc', 'farmer'],
      'pmfby': ['insurance', 'bima', 'claim', 'loss', 'damage', '72-hour', 'calamity'],
      'insurance': ['pmfby', 'bima', 'claim', 'crop loss', 'compensation'],
      'kcc': ['loan', 'credit', 'interest', 'subvention', '4%', 'bank'],
      'loan': ['kcc', 'credit', 'interest', 'subvention', 'waiver', 'collateral'],
      'tractor': ['smam', 'machinery', 'equipment', 'power tiller', 'custom hiring'],
      'subsidy': ['smam', 'pmksy', 'kusum', 'scheme', 'grant', 'subsidised'],
      'drip': ['irrigation', 'sprinkler', 'pmksy', 'per drop', 'water'],
      'solar': ['kusum', 'pm-kusum', 'pump', 'renewable', 'component'],
      'soil': ['health card', 'npk', 'testing', 'fertility', 'ph'],
      'organic': ['pgs-india', 'npop', 'pkvy', 'natural farming', 'compost'],
      'fpo': ['producer organisation', 'cooperative', 'equity grant', 'members'],
      'flood': ['disaster', 'sdrf', 'ndrf', 'compensation', 'drought', 'relief'],
      'drought': ['disaster', 'sdrf', 'ndrf', 'relief', 'waterlogging'],
      'transport': ['truck', 'logistics', 'fare', 'booking', 'eicher', 'vehicle', 'carrier'],
      'truck': ['transport', 'logistics', 'vehicle', 'eicher', 'fare'],
      'buyer': ['buyers', 'factory', 'bulk', 'mandap', 'retailer', 'wholesaler'],
      'price': ['rate', 'mandi', 'fair price', 'market price', 'msp'],
      'payment': ['deduction', 'money breakdown', 'payout', 'bank', 'delay'],
      'dispute': ['protection', 'verification', 'complaint', 'proof']
    };

    const expandedTokens = [...rawTokens];
    for (const token of rawTokens) {
      for (const [key, syns] of Object.entries(synonymMap)) {
        if (token.includes(key) || key.includes(token)) {
          expandedTokens.push(...syns);
        }
      }
    }

    const scoredList = [];

    for (const item of kb) {
      let score = 0;
      const qLower = item.question.toLowerCase();
      const aLower = item.answer.toLowerCase();
      const catLower = item.category.toLowerCase();
      const actLower = item.action.toLowerCase();

      // Exact phrase match
      if (lower.length > 8 && qLower.includes(lower)) score += 90;
      if (lower.length > 12 && aLower.includes(lower)) score += 45;

      // Exact word boundary matches in question
      for (const token of rawTokens) {
        const regex = new RegExp('\\b' + token + '\\b', 'i');
        if (regex.test(qLower)) score += 25;
        if (regex.test(catLower)) score += 12;
        if (regex.test(actLower)) score += 8;
      }

      // General token hits
      for (const token of expandedTokens) {
        if (qLower.includes(token)) score += 12;
        if (catLower.includes(token)) score += 6;
        if (actLower.includes(token)) score += 4;
        if (aLower.includes(token)) score += 2;
      }

      if (score > 0) {
        scoredList.push({ item, score });
      }
    }

    scoredList.sort((a, b) => b.score - a.score);

    if (scoredList.length > 0 && scoredList[0].score >= 18) {
      const best = scoredList[0].item;
      // Get 2 related items from same or adjacent results
      const related = scoredList.slice(1, 3).map(s => s.item);
      this.renderKnowledgeAnswer(best, related);
    } else {
      this.renderFallback(query);
    }
  }

  renderKnowledgeAnswer(item, related) {
    let ansFormatted = item.answer;

    // Enhance formatting for readability
    ansFormatted = ansFormatted.replace(/\((\d+)\)/g, '<br><strong>($1)</strong>');
    ansFormatted = ansFormatted.replace(/\(VERIFIED[^\)]*\)/g, '<span style="color:#1B4D35; font-weight:700;">$&</span>');

    let actionBtnHtml = '';
    if (item.route) {
      const isExt = item.route.external;
      const target = isExt ? 'target="_blank" rel="noopener"' : '';
      const onclick = isExt ? '' : `onclick="window.location.href='${item.route.url}'; return false;"`;
      actionBtnHtml = `
        <a href="${item.route.url}" ${target} ${onclick} class="vyapti-action-btn">
          <span>${item.route.icon || '👉'}</span>
          <span>${item.route.label}</span>
          <svg style="width:14px;height:14px;stroke:currentColor;fill:none;margin-left:auto;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </a>
      `;
    }

    let relatedHtml = '';
    if (related && related.length > 0) {
      relatedHtml = `
        <div class="vyapti-related-wrap">
          <div class="vyapti-related-label">Related Questions:</div>
          ${related.map(r => `<button type="button" class="vyapti-related-chip" data-q="${r.question.replace(/"/g, '&quot;')}">${r.question}</button>`).join('')}
        </div>
      `;
    }

    const html = `
      <div class="vyapti-kb-card">
        <div class="vyapti-kb-badge">
          <span>✓</span> Verified Knowledge &bull; ${item.category}
        </div>
        <div class="vyapti-kb-q">Q: ${item.question}</div>
        <div class="vyapti-kb-ans">${ansFormatted}</div>
        ${actionBtnHtml}
        ${relatedHtml}
      </div>
    `;

    this.appendMessage(html, 'system');

    // Bind related question click handlers
    this.chatBody.querySelectorAll('.vyapti-related-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        const qText = chip.getAttribute('data-q');
        this.input.value = qText;
        this.handleSend();
      };
    });
  }

  renderFallback(query) {
    const sampleQuestions = [
      "Which crop should I grow next season?",
      "My crop leaves are turning yellow.",
      "How do I check if I'm receiving PM-KISAN payments?",
      "What documents do I need to claim crop insurance (PMFBY)?",
      "How can I get a low-interest loan (KCC)?",
      "Can I get a subsidy for a tractor or drip irrigation?",
      "How can I transport my produce to the buyer?",
      "What is Fair Price Guard for potato?"
    ];
    // Shuffle and pick 3
    const shuffled = sampleQuestions.sort(() => 0.5 - Math.random()).slice(0, 3);

    const html = `
      I am trained on <strong>300 verified agricultural questions</strong> spanning crop health, disease management, price intelligence, buyer connection, shared transport, and government schemes (PM-KISAN, PMFBY, KCC, SMAM subsidies).
      <br><br>
      You can try asking:
      <div class="vyapti-related-wrap" style="border:none; padding:0; margin-top:8px;">
        ${shuffled.map(q => `<button type="button" class="vyapti-related-chip" data-q="${q}">${q}</button>`).join('')}
      </div>
    `;
    this.appendMessage(html, 'system');

    this.chatBody.querySelectorAll('.vyapti-related-chip').forEach(chip => {
      chip.onclick = (e) => {
        e.preventDefault();
        this.input.value = chip.getAttribute('data-q');
        this.handleSend();
      };
    });
  }

  showCropComparison() {
    this.appendMessage(`
      <div class="vyapti-comparison-card">
        <h4>DRAGON FRUIT</h4>
        <div class="vyapti-score-row"><span>Farm suitability</span> <span class="vyapti-score-val">72 / 100</span></div>
        <div class="vyapti-score-row"><span>Market opportunity</span> <span class="vyapti-score-val">81 / 100</span></div>
        <div class="vyapti-score-row"><span>Water compatibility</span> <span class="vyapti-score-val">55 / 100</span></div>
        <div class="vyapti-score-row"><span>Regional risk</span> <span class="vyapti-score-val">51 / 100</span></div>
        <div style="font-size:11px; margin-top:8px;">Confidence: Medium</div>
      </div>
      
      <div class="vyapti-comparison-card" style="border-color:#1B4D35;">
        <h4>POTENTIAL ALTERNATIVE: POTATO</h4>
        <div class="vyapti-score-row"><span>Farm suitability</span> <span class="vyapti-score-val">88 / 100</span></div>
        <div class="vyapti-score-row"><span>Market opportunity</span> <span class="vyapti-score-val">74 / 100</span></div>
        <div class="vyapti-score-row"><span>Water compatibility</span> <span class="vyapti-score-val">82 / 100</span></div>
        <div class="vyapti-score-row"><span>Regional risk</span> <span class="vyapti-score-val">76 / 100</span></div>
        <div style="font-size:11px; margin-top:8px;">Confidence: High</div>
      </div>
      <br>
      <button class="vyapti-action-btn" onclick="window.location.href='/farmer-my-farm.html'">Check My Farm</button>
    `, 'system');
  }
}

// Initialize immediately or on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.vyaptiInstance) window.vyaptiInstance = new AskVyapti();
  });
} else {
  if (!window.vyaptiInstance) window.vyaptiInstance = new AskVyapti();
}

