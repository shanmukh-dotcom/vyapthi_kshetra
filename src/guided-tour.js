/**
 * Guided Voice Assistant Tour for Farmer Profile / Onboarding
 */

class GuidedAssistant {
  constructor() {
    this.steps = [
      {
        id: 'name-input',
        text: 'Look here, this is where you enter your full name.'
      },
      {
        id: 'phone-input',
        text: 'Here, enter your ten digit mobile number.'
      },
      {
        id: 'village-input',
        text: 'This is where you type the name of your village and district.'
      },
      {
        id: 'crop-input',
        text: 'This is where you enter your crop detail, like tomato or rice.'
      },
      {
        id: 'quantity-input',
        text: 'Here, enter the approximate quantity you want to sell.'
      },
      {
        id: 'continue-profile-btn',
        text: 'Once you are done filling these details, click the continue button to go to your farm dashboard.'
      }
    ];
    this.currentStep = 0;
    this.isPlaying = false;
  }

  startTour() {
    if(this.isPlaying) return;
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
    const element = document.getElementById(step.id);
    
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
