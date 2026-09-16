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
        { id: 'crop-input', text: 'This is where you enter your crop detail, like potato or rice.' },
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

    // Language mapping
    const langKey = localStorage.getItem('vyapti_selected_language') || 'en';
    const langCodes = { 'en': 'en-IN', 'hi': 'hi-IN', 'te': 'te-IN', 'ta': 'ta-IN', 'kn': 'kn-IN', 'mr': 'mr-IN' };
    
    const translations = {
      'hi': {
        'Look here, this is where you enter your full name.': 'यहाँ देखें, यहाँ आपको अपना पूरा नाम दर्ज करना है।',
        'Here, enter your ten digit mobile number.': 'यहाँ अपना दस अंकों का मोबाइल नंबर दर्ज करें।',
        'This is where you type the name of your village and district.': 'यहाँ आप अपने गाँव और जिले का नाम टाइप करें।',
        'This is where you enter your crop detail, like potato or rice.': 'यहाँ अपनी फसल का विवरण दर्ज करें, जैसे टमाटर या चावल।',
        'Here, enter the approximate quantity you want to sell.': 'यहाँ वह अनुमानित मात्रा दर्ज करें जिसे आप बेचना चाहते हैं।',
        'Once you are done filling these details, click the continue button to go to your farm dashboard.': 'विवरण भरने के बाद, अपने फार्म डैशबोर्ड पर जाने के लिए जारी रखें बटन पर क्लिक करें।',
        'First, click or drag here to upload clear photos of your crop so the AI can analyze it.': 'सबसे पहले, अपनी फसल की स्पष्ट तस्वीरें अपलोड करने के लिए यहाँ क्लिक करें।',
        'Next, the AI will grade your crop automatically and show you the quality and confidence score here.': 'इसके बाद, एआई स्वचालित रूप से आपकी फसल की ग्रेडिंग करेगा और यहाँ गुणवत्ता स्कोर दिखाएगा।',
        'Based on the grade, we will show you the fair market price and find matching buyers instantly.': 'ग्रेड के आधार पर, हम आपको उचित बाजार मूल्य दिखाएंगे और तुरंत खरीदार खोजेंगे।',
        'Finally, click the green button to list your crop for sale and view the buyers!': 'अंत में, अपनी फसल को बिक्री के लिए सूचीबद्ध करने और खरीदारों को देखने के लिए हरे बटन पर क्लिक करें!',
        'Welcome to your farm dashboard. Here is your daily summary.': 'आपके फार्म डैशबोर्ड में आपका स्वागत है। यह आपका दैनिक सारांश है।',
        'This card shows your active crop and how much is ready to harvest.': 'यह कार्ड आपकी सक्रिय फसल को दर्शाता है।',
        'Here you can check today\'s average market price in your area.': 'यहाँ आप अपने क्षेत्र में आज की औसत बाजार कीमत देख सकते हैं।',
        'This shows how many verified buyers are currently looking for your crop.': 'यह दिखाता है कि कितने खरीदार आपकी फसल की तलाश में हैं।',
        'Click here when you are ready to grade and sell your produce.': 'जब आप अपनी उपज बेचने के लिए तैयार हों तो यहाँ क्लिक करें।'
      },
      'te': {
        'Look here, this is where you enter your full name.': 'ఇక్కడ చూడండి, ఇక్కడ మీరు మీ పేరును నమోదు చేయాలి.',
        'Here, enter your ten digit mobile number.': 'ఇక్కడ, మీ మొబైల్ నంబర్‌ను నమోదు చేయండి.',
        'This is where you type the name of your village and district.': 'ఇక్కడ మీరు మీ గ్రామం మరియు జిల్లా పేరును టైప్ చేయాలి.',
        'This is where you enter your crop detail, like potato or rice.': 'ఇక్కడ మీరు మీ పంట వివరాలను నమోదు చేయాలి.',
        'Here, enter the approximate quantity you want to sell.': 'ఇక్కడ, మీరు విక్రయించదలుచుకున్న పరిమాణాన్ని నమోదు చేయండి.',
        'Once you are done filling these details, click the continue button to go to your farm dashboard.': 'ఈ వివరాలను పూరించిన తర్వాత, కొనసాగించు బటన్‌ను క్లిక్ చేయండి.',
        'First, click or drag here to upload clear photos of your crop so the AI can analyze it.': 'మొదట, AI విశ్లేషించడానికి మీ పంట ఫోటోలను అప్‌లోడ్ చేయడానికి ఇక్కడ క్లిక్ చేయండి.',
        'Next, the AI will grade your crop automatically and show you the quality and confidence score here.': 'తరువాత, AI మీ పంటను గ్రేడ్ చేస్తుంది మరియు నాణ్యత స్కోర్‌ను చూపుతుంది.',
        'Based on the grade, we will show you the fair market price and find matching buyers instantly.': 'గ్రేడ్ ఆధారంగా, మేము మీకు సరసమైన మార్కెట్ ధరను చూపుతాము.',
        'Finally, click the green button to list your crop for sale and view the buyers!': 'చివరగా, మీ పంటను అమ్మకానికి ఉంచడానికి ఆకుపచ్చ బటన్‌ను క్లిక్ చేయండి!'
      }
    };

    let spokenText = step.text;
    if (langKey !== 'en' && translations[langKey] && translations[langKey][step.text]) {
      spokenText = translations[langKey][step.text];
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = langCodes[langKey] || 'en-IN';
    utterance.rate = 0.9;
    
    // Attempt to find a native voice for the selected language
    let voices = window.speechSynthesis.getVoices();
    let nativeVoice = voices.find(v => v.lang.toLowerCase().includes(langKey));
    
    if (nativeVoice) {
      utterance.voice = nativeVoice;
    } else if (langKey === 'en') {
      const indVoice = voices.find(v => v.lang.includes('en-IN'));
      if (indVoice) utterance.voice = indVoice;
    } else if (voices.length > 0 && !nativeVoice) {
      // Voices are loaded, but Telugu/Hindi isn't available on this device!
      console.warn(`No native voice found for language: ${langKey}. The browser may stay silent.`);
      // We will not force an English voice, we let the browser try to use network voices if utterance.lang is set.
    }
    
    utterance.onend = () => {
      setTimeout(() => {
        this.currentStep++;
        this.playNextStep();
      }, 600);
    };

    utterance.onerror = (e) => {
      console.error('SpeechSynthesis error:', e);
      // Skip to next step on error so it doesn't hang forever
      setTimeout(() => {
        this.currentStep++;
        this.playNextStep();
      }, 600);
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
