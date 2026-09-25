// Dynamic import: Capacitor TTS works on native (APK), falls back gracefully on web
let TextToSpeech = { speak: () => Promise.resolve(), stop: () => {} };
import('@capacitor-community/text-to-speech').then(mod => {
  if (mod && mod.TextToSpeech) TextToSpeech = mod.TextToSpeech;
}).catch(() => {});
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAN_HRT-WM9ciTB0q6BdDJ8q5jcRXpJbZQ",
    authDomain: "vyapti-kshetra.firebaseapp.com",
    projectId: "vyapti-kshetra",
    storageBucket: "vyapti-kshetra.firebasestorage.app",
    messagingSenderId: "524985728411",
    appId: "1:524985728411:web:4c60cc21987df8eca6b53e"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const LANG_KEY = 'vyapti_selected_language';
const ROLE_KEY = 'vyapti_selected_role';
const DEFAULT_LANG = 'te';
const DEFAULT_ROLE = 'farmer';

// Language metadata & Web Speech BCP-47 locale tags + translated voice instruction prompts
const VOICE_DATA = {
  te: {
    name: 'Telugu',
    locale: 'te-IN',
    text: 'దయచేసి వ్యాప్తి క్షేత్రాన్ని ఎలా ఉపయోగించాలో ఎంచుకోండి. మీరు పంటలు పండించి విక్రయిస్తే రైతు ఎంచుకోండి. తాజా సరుకులు కొనాలనుకుంటే కొనుగోలుదారు ఎంచుకోండి.'
  },
  hi: {
    name: 'Hindi',
    locale: 'hi-IN',
    text: 'कृपया चुनें कि आप व्याप्ति क्षेत्र का उपयोग कैसे करना चाहते हैं। यदि आप फसल उगाते और बेचते हैं तो किसान चुनें। यदि आप ताजा उपज खरीदना चाहते हैं तो खरीदार चुनें।'
  },
  kn: {
    name: 'Kannada',
    locale: 'kn-IN',
    text: 'ದಯವಿಟ್ಟು ವ್ಯಾಪ್ತಿ ಕ್ಷೇತ್ರವನ್ನು ಹೇಗೆ ಬಳಸಬೇಕೆಂದು ಆಯ್ಕೆಮಾಡಿ. ನೀವು ಬೆಳೆಗಳನ್ನು ಬೆಳೆಸಿ ಮಾರಾಟ ಮಾಡಿದರೆ ರೈತ ಎಂದು ಆಯ್ಕೆಮಾಡಿ. ತಾಜಾ ಪದಾರ್ಥಗಳನ್ನು ಖರೀದಿಸಲು ಬಯಸಿದರೆ ಗ್ರಾಹಕ ಎಂದು ಆಯ್ಕೆಮಾಡಿ.'
  },
  ta: {
    name: 'Tamil',
    locale: 'ta-IN',
    text: 'வியாப்தி க்ஷேத்ராவை எவ்வாறு பயன்படுத்த விரும்புகிறீர்கள் என்பதைத் தேர்ந்தெடுக்கவும். பயிர்களை வளர்த்து விற்றால் விவசாயி என்பதைத் தேர்ந்தெடுக்கவும். புதிய பொருட்களை வாங்க விரும்பினால் வாங்குபவர் என்பதைத் தேர்ந்தெடுக்கவும்.'
  },
  mr: {
    name: 'Marathi',
    locale: 'mr-IN',
    text: 'व्याप्ती क्षेत्र कसे वापरायचे ते निवडा. तुम्ही पिके पिकवत आणि विकत असाल तर शेतकरी निवडा. तुम्हाला ताजी फळे आणि भाज्या खरेदी करायच्या असतील तर ग्राहक निवडा.'
  },
  bn: {
    name: 'Bengali',
    locale: 'bn-IN',
    text: 'দয়া করে বেছে নিন আপনি কিভাবে ব্যাপ্তি ক্ষেত্র ব্যবহার করতে চান। আপনি যদি ফসল ফলান এবং বিক্রি করেন তবে কৃষক বেছে নিন। আপনি যদি তাজা জিনিস কিনতে চান তবে ক্রেতা বেছে নিন।'
  },
  en: {
    name: 'English',
    locale: 'en-IN',
    text: 'Please select how you want to use Vyapti Kshetra. Choose Farmer if you grow and sell crops. Choose Buyer if you want to buy fresh produce.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const roleCards = Array.from(document.querySelectorAll('.role-option-card'));
  const continueBtn = document.getElementById('continue-role-btn');
  const backBtn = document.getElementById('back-btn');
  const voiceBtn = document.getElementById('voice-btn');
  const voiceLabel = document.getElementById('voice-label');

  // Read stored language or default to Telugu
  const currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  const langConfig = VOICE_DATA[currentLang] || VOICE_DATA.te;

  // Update Voice Button label with active language
  if (voiceLabel) {
    voiceLabel.textContent = `Listen (${langConfig.name})`;
  }

  // Restore stored role or default to Farmer
  const storedRole = localStorage.getItem(ROLE_KEY) || DEFAULT_ROLE;
  selectRole(storedRole, false);

  // Attach click & keydown handlers to role cards
  roleCards.forEach((card) => {
    card.addEventListener('click', () => {
      const role = card.getAttribute('data-role');
      selectRole(role, true);
    });

    card.addEventListener('keydown', (e) => {
      const index = roleCards.indexOf(card);
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const role = card.getAttribute('data-role');
        selectRole(role, true);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % roleCards.length;
        const nextRole = roleCards[nextIndex].getAttribute('data-role');
        selectRole(nextRole, true);
        roleCards[nextIndex].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (index - 1 + roleCards.length) % roleCards.length;
        const prevRole = roleCards[prevIndex].getAttribute('data-role');
        selectRole(prevRole, true);
        roleCards[prevIndex].focus();
      }
    });
  });

  // Continue Button Handler — Redirect directly to role dashboard (bypassing login)
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const selectedCard = document.querySelector('.role-option-card.selected');
      const selectedRole = selectedCard ? selectedCard.getAttribute('data-role') : DEFAULT_ROLE;

      localStorage.setItem(ROLE_KEY, selectedRole);

      continueBtn.style.opacity = '0.85';
      continueBtn.style.transform = 'scale(0.98)';

      setTimeout(() => {
        if (selectedRole === 'buyer' || selectedRole === 'consumer') {
          window.location.href = '/consumer-home.html';
        } else {
          window.location.href = '/farmer-home.html';
        }
      }, 150);
    });
  }

  // Back Button Handler
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  }

  // Voice Accessibility Handler (SpeechSynthesis)
  let isSpeaking = false;

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (false) {
        alert('Voice synthesis is not supported in this browser.');
        return;
      }

      if (isSpeaking) {
        
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

        stopVoiceState();
        return;
      }

      // Stop any existing speech
      
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();


      
    try {
      TextToSpeech.speak({
        text: langConfig.text,
        lang: langConfig.locale,
        rate: 0.95
      });
      setTimeout(() => stopVoiceState(), langConfig.text.length * 60);
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(langConfig.text);
        utterance.lang = langConfig.locale;
        utterance.rate = 0.95;
        utterance.onend = () => stopVoiceState();
        utterance.onerror = () => stopVoiceState();
        window.speechSynthesis.speak(utterance);
      }
    }

    });
  }

  function stopVoiceState() {
    isSpeaking = false;
    if (voiceBtn) voiceBtn.classList.remove('speaking');
    if (voiceLabel) voiceLabel.textContent = `Listen (${langConfig.name})`;
  }

  /**
   * Helper to select role and update UI
   * @param {string} role 
   * @param {boolean} persist 
   */
  function selectRole(role, persist = true) {
    let targetCard = roleCards.find((c) => c.getAttribute('data-role') === role);
    if (!targetCard) targetCard = roleCards[0];

    roleCards.forEach((card) => {
      const isSelected = card === targetCard;
      const radioInput = card.querySelector('input[type="radio"]');

      if (isSelected) {
        card.classList.add('selected');
        card.setAttribute('aria-checked', 'true');
        card.setAttribute('tabindex', '0');
        if (radioInput) radioInput.checked = true;
      } else {
        card.classList.remove('selected');
        card.setAttribute('aria-checked', 'false');
        card.setAttribute('tabindex', '-1');
        if (radioInput) radioInput.checked = false;
      }
    });

    if (persist && targetCard) {
      localStorage.setItem(ROLE_KEY, targetCard.getAttribute('data-role'));
    }
  }
});


document.addEventListener('DOMContentLoaded', () => {
  // --- FIREBASE AUTH LOGIC ---
  
  // Consumer Google Auth
  const googleBtn = document.getElementById('google-login-btn');
  if(googleBtn) {
    googleBtn.addEventListener('click', () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                window.location.href = '/consumer-home.html';
            }).catch((error) => {
                console.error('Google Auth Error:', error);
                alert('Error signing in with Google.');
            });
    });
  }

  // Farmer Phone Auth
  let confirmationResult = null;
  const recaptchaEl = document.getElementById('recaptcha-container');
  if(recaptchaEl) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible'
      });
  }

  const sendOtpBtn = document.getElementById('send-otp-btn');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const phoneInput = document.getElementById('phone-number');
  const otpInput = document.getElementById('otp-code');
  const errorMsg = document.getElementById('error-message');
  const otpErrorMsg = document.getElementById('otp-error-message');

  if(sendOtpBtn) {
      sendOtpBtn.addEventListener('click', () => {
          const phoneNumber = '+91' + phoneInput.value.trim();
          errorMsg.style.display = 'none';
          sendOtpBtn.innerText = 'Sending...';
          sendOtpBtn.disabled = true;

          signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
              .then((result) => {
                  confirmationResult = result;
                  document.getElementById('phone-ui').style.display = 'none';
                  document.getElementById('otp-ui').style.display = 'block';
                  document.getElementById('otp-ui').classList.remove('hidden');
              }).catch((error) => {
                  console.error("Firebase Phone Auth Error: ", error);
                  errorMsg.innerText = "Error: " + error.message;
                  errorMsg.style.display = 'block';
                  sendOtpBtn.innerText = "Send OTP";
                  sendOtpBtn.disabled = false;
                  window.recaptchaVerifier.render().then(function(widgetId) {
                      grecaptcha.reset(widgetId);
                  });
              });
      });
  }

  if(verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
          const code = otpInput.value.trim();
          otpErrorMsg.style.display = 'none';
          verifyOtpBtn.innerText = 'Verifying...';
          verifyOtpBtn.disabled = true;

          confirmationResult.confirm(code).then((result) => {
              window.location.href = '/farmer-home.html';
          }).catch((error) => {
              otpErrorMsg.innerText = 'Invalid OTP code.';
              otpErrorMsg.style.display = 'block';
              verifyOtpBtn.innerText = 'Verify & Login';
              verifyOtpBtn.disabled = false;
          });
      });
  }
});
