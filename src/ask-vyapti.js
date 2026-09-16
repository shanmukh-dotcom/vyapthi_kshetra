/**
 * Ask Vyapti - Farmer Assistant and Crop Strategy Intelligence
 */

class AskVyapti {
  constructor() {
    this.farmerName = 'Ramesh Kumar';
    this.farmerLocation = 'Kolar, Karnataka';
    this.isPanelOpen = false;
    this.init();
  }

  init() {
    // Only inject if not already present
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
          <span>🌿 Ask Vyapti</span>
          <button id="vyapti-close" aria-label="Close">×</button>
        </div>
        
        <div id="vyapti-chat-body">
          <div class="vyapti-msg vyapti-system">
            Namaskaram, ${this.farmerName}.<br>
            I am Vyapti, your farming assistant for ${this.farmerLocation}.<br>
            How can I help you today?
          </div>
        </div>
        
        <div id="vyapti-quick-actions"></div>
        
        <div class="vyapti-input-area">
          <button id="vyapti-cam-btn" class="vyapti-icon-btn" aria-label="Upload Photo">📷</button>
          <button id="vyapti-mic-btn" class="vyapti-icon-btn" aria-label="Speak">🎙</button>
          <input type="text" id="vyapti-input" placeholder="Ask about crops, prices..." aria-label="Message Vyapti" />
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
  }

  bindEvents() {
    this.btn.addEventListener('click', () => this.togglePanel());
    this.closeBtn.addEventListener('click', () => this.togglePanel());
    
    // Bind main page image buttons if they exist
    const imageBtns = document.querySelectorAll('.ask-vyapti-btn');
    imageBtns.forEach(b => {
      b.addEventListener('click', (e) => {
        e.preventDefault();
        if(!this.isPanelOpen) this.togglePanel();
      });
    });

    this.sendBtn.addEventListener('click', () => this.handleSend());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });

    this.micBtn.addEventListener('click', () => {
      this.input.value = "Listening...";
      setTimeout(() => {
        this.input.value = "Naaku dragon fruit veyyali anipistundi.";
        this.handleSend();
      }, 1500);
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
    let actions = ['🌱 Crop Problem', '📈 Market Price', '🌾 My Next Crop', '🏛 Government Schemes', '🤝 Find Buyers', '🚚 Transport'];
    
    if (path.includes('market')) {
      actions = ['Compare Prices', 'Check Fair Price', 'Find Buyers', '📈 Price Trend'];
    } else if (path.includes('grade')) {
      actions = ['Grade Crop', 'Check Price', 'Find Buyers'];
    } else if (path.includes('logistics')) {
      actions = ['Compare Transport', 'Shared Logistics', 'Track Pickup'];
    } else if (path.includes('transactions')) {
      actions = ['Payment Status', 'Transaction Details', 'Get Support'];
    }

    this.quickActions.innerHTML = actions.map(action => 
      `<button class="vyapti-quick-btn">${action}</button>`
    ).join('');

    // Bind clicks
    this.quickActions.querySelectorAll('.vyapti-quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.input.value = btn.innerText;
        this.handleSend();
      });
    });
  }

  handleSend() {
    const text = this.input.value.trim();
    if (!text || text === "Listening...") return;

    this.appendMessage(text, 'user');
    this.input.value = '';

    // Scroll to bottom
    this.chatBody.scrollTop = this.chatBody.scrollHeight;

    // Simulate thinking delay
    setTimeout(() => {
      this.processQuery(text);
    }, 600);
  }

  appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `vyapti-msg vyapti-${sender}`;
    msg.innerHTML = text;
    this.chatBody.appendChild(msg);
    this.chatBody.scrollTop = this.chatBody.scrollHeight;
  }

  processQuery(text) {
    const lower = text.toLowerCase();

    // 1. CROP SWITCH (Dragon Fruit Scenario from FARM2WORLD)
    if (lower.includes('dragon fruit') || lower.includes('next crop')) {
      this.appendMessage(`
        Before changing your crop, I can check whether Dragon Fruit fits your farm in Kolar, and compare it with other suitable crops.
        <br><br>
        I evaluate:<br>
        • Land suitability<br>
        • Water requirement<br>
        • Regional market & export<br>
        • Regional supply risk
        <br><br>
        <button class="vyapti-action-btn" onclick="window.vyaptiInstance.showCropComparison()">Compare Crops</button>
      `, 'system');
    }
    
    // 2. MARKET PRICE
    else if (lower.includes('price') || lower.includes('market')) {
      this.appendMessage(`
        Current available potato market information for Kolar:<br><br>
        Modal: ₹22/kg<br>
        Range: ₹20–₹24/kg<br>
        Updated: Today<br>
        <br>
        <em>This is market information, not a guaranteed selling price.</em>
        <br>
        <button class="vyapti-action-btn" onclick="window.location.href='/farmer-market.html'">View Market</button>
      `, 'system');
    }

    // 3. CROP PROBLEM
    else if (lower.includes('yellow') || lower.includes('disease') || lower.includes('problem')) {
      this.appendMessage(`
        Yellow leaves can have several causes like nutrient deficiency or water stress.<br><br>
        Please upload a clear photo of the leaves, and tell me the age of the crop.
        <br><br>
        <button class="vyapti-action-btn">Upload Photo</button>
      `, 'system');
    }

    // Default Fallback
    else {
      this.appendMessage(`
        I am currently operating in Phase 1 mode. Try asking me about:<br>
        - "Should I grow dragon fruit?"<br>
        - "What is today's potato price?"<br>
        - "My tomato leaves are turning yellow."
      `, 'system');
    }
  }

  // Exposed method for buttons generated inside chat
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

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.vyaptiInstance = new AskVyapti();
});
