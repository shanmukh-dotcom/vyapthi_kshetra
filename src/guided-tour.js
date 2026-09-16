/**
 * Guided Voice Assistant Tour for Farmer Profile / Onboarding
 */

class GuidedAssistant {
  constructor() {
    this.currentStep = 0;
    this.isPlaying = false;
    
    const path = window.location.pathname;
    
    if (path.includes('farmer-profile')) {
      this.steps = [
        { id: 'name-input', text: 'Look here, this is where you enter your full name.' },
        { id: 'mobile-input', text: 'Here, enter your ten digit mobile number.' },
        { id: 'village-input', text: 'This is where you type the name of your village and district.' },
        { id: 'crop-input', text: 'This is where you enter your crop detail, like tomato or rice.' },
        { id: 'quantity-input', text: 'Here, enter the approximate quantity you want to sell.' },
        { id: 'continue-profile-btn', text: 'Once you are done filling these details, click the continue button to go to your farm dashboard.' }
      ];
    } else if (path.includes('farmer-grade-sell')) {
      this.steps = [
        { classSelector: '.dropzone', text: 'First, click or drag here to upload clear photos of your crop so the AI can analyze it.' },
        { classSelector: '.card:nth-child(2)', text: 'Next, the AI will grade your crop automatically and show you the quality and confidence score here.' },
        { classSelector: '.match-banner', text: 'Based on the grade, we will show you the fair market price and find matching buyers instantly.' },
        { classSelector: '.action-btn', text: 'Finally, click the green button to list your crop for sale and view the buyers!' }
      ];
    } else if (path.includes('farmer-home')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'Welcome to your farm dashboard. Here is your daily summary.' },
        { classSelector: '.hero-card:nth-child(1)', text: 'This card shows your active crop and how much is ready to harvest.' },
        { classSelector: '.hero-card:nth-child(2)', text: 'Here you can check today\'s average market price in your area.' },
        { classSelector: '.hero-card:nth-child(3)', text: 'This shows how many verified buyers are currently looking for your crop.' },
        { classSelector: '.action-card', text: 'Click here when you are ready to grade and sell your produce.' }
      ];
    } else if (path.includes('farmer-my-farm')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'This is your farm profile. It tracks your land area, soil type, and irrigation details.' },
        { classSelector: '.card:nth-child(1)', text: 'Here you can see the details of the crops you are currently growing.' },
        { classSelector: 'button.action-btn', text: 'Use this button to add a new crop or update your existing farming records.' }
      ];
    } else if (path.includes('farmer-market')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'Welcome to Market Intelligence. Here you can track prices and demand.' },
        { classSelector: '.card:nth-child(1)', text: 'This section shows the current price trends and whether prices are rising or falling.' },
        { classSelector: '.card:nth-child(2)', text: 'This is the Fair Price Guard, helping you understand the true value of your crop today.' }
      ];
    } else if (path.includes('farmer-find-buyers')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'Here you can see all verified buyers looking for your crop.' },
        { classSelector: '.card:nth-child(1)', text: 'Each card shows the buyer requirement, price offered, and their distance from you.' },
        { classSelector: 'button', text: 'Click accept to begin the transaction securely.' }
      ];
    } else if (path.includes('farmer-collective')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'Welcome to Logistics. Here you can arrange transport for your produce.' },
        { classSelector: '.card:nth-child(1)', text: 'If you have a small quantity, you can pool your crop with nearby farmers here.' },
        { classSelector: '.card:nth-child(2)', text: 'Use this section to book a verified truck to transport your crop to the buyer.' }
      ];
    } else if (path.includes('farmer-transactions')) {
      this.steps = [
        { classSelector: '.page-title-left', text: 'This is your transaction history and payment ledger.' },
        { classSelector: '.card:nth-child(1)', text: 'Here you can track active orders, view payment status, and see transparent deductions.' }
      ];
    } else {
      this.steps = [
        { classSelector: '.page-title-left', text: 'Welcome to this page. You can use the menu on the left to navigate.' }
      ];
    }
  }

  startTour() {
    if(this.isPlaying || this.steps.length === 0) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.playNextStep();
  }

  playNextStep() {
    if (this.currentStep >= this.steps.length) {
      this.isPlaying = false;
      this.removeHighlights();
      return;
    }

    const step = this.steps[this.currentStep];
    const element = step.id ? document.getElementById(step.id) : document.querySelector(step.classSelector);
    
    if (element) {
      this.removeHighlights();
      
      // Scroll so it's vertically centered
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Add a nice glowing green highlight
      element.style.transition = 'box-shadow 0.3s, border-color 0.3s';
      element.style.boxShadow = '0 0 15px 4px rgba(46, 204, 113, 0.6)';
      element.style.borderColor = '#2ecc71';
      element.classList.add('guided-highlight');
    }

    const utterance = new SpeechSynthesisUtterance(step.text);
    
    // Use an Indian English voice if available, else default
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('en-IN'));
    if (indVoice) utterance.voice = indVoice;
    
    utterance.rate = 0.9; // Slightly slower for clarity
    
    utterance.onend = () => {
      setTimeout(() => {
        this.currentStep++;
        this.playNextStep();
      }, 600); // Pause before highlighting next field
    };

    window.speechSynthesis.speak(utterance);
  }

  removeHighlights() {
    document.querySelectorAll('.guided-highlight').forEach(el => {
      el.style.boxShadow = '';
      el.style.borderColor = '';
      el.classList.remove('guided-highlight');
    });
  }
}

// Inject CSS for the glow animation
const style = document.createElement('style');
style.innerHTML = `
  @keyframes guideGlow {
    0% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.4); }
    50% { box-shadow: 0 0 20px rgba(46, 204, 113, 0.8); }
    100% { box-shadow: 0 0 5px rgba(46, 204, 113, 0.4); }
  }
  .guided-highlight {
    animation: guideGlow 1.5s infinite;
    position: relative;
    z-index: 10;
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  // Try to load voices so they are ready
  window.speechSynthesis.getVoices();
  
  const assistant = new GuidedAssistant();
  
  setTimeout(() => {
    // Find the Listen button
    const readBtn = document.querySelector('#voice-guidance-btn') || document.querySelector('.btn-read-aloud');
    
    if (readBtn) {
      // Clone to remove existing event listeners from farmer-app.js so MP3 doesn't overlap
      const clone = readBtn.cloneNode(true);
      readBtn.parentNode.replaceChild(clone, readBtn);
      
      clone.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Stop any existing speech
        window.speechSynthesis.cancel();
        assistant.startTour();
      });
    }
  }, 100);
});
