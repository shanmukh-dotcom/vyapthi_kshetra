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
    } else {
      this.steps = [];
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
  
  // Find the Listen button
  const readBtn = document.querySelector('#voice-guidance-btn') || document.querySelector('.btn-read-aloud');
  
  if (readBtn) {
    // Clone to remove existing event listeners from farmer-app.js
    const clone = readBtn.cloneNode(true);
    readBtn.parentNode.replaceChild(clone, readBtn);
    
    clone.addEventListener('click', (e) => {
      e.preventDefault();
      // Stop any existing speech
      window.speechSynthesis.cancel();
      assistant.startTour();
    });
  }
});
