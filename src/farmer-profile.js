import { TextToSpeech } from '@capacitor-community/text-to-speech';
const LANG_KEY = 'vyapti_selected_language';
const ROLE_KEY = 'vyapti_selected_role';
const PROFILE_KEY = 'vyapti_farmer_profile';

const DEFAULT_LANG = 'te';

// Spoken Guidance Instructions per language locale
const GUIDANCE_DATA = {
  te: {
    name: 'Telugu',
    locale: 'te-IN',
    text: 'మీ రైతు ప్రొఫైల్ను సృష్టించడానికి మీ పేరు, మొబైల్ నంబర్, గ్రామం, ప్రధాన పంట మరియు పంట పరిమాణాన్ని నమోదు చేయండి. మీరు టైప్ చేయవచ్చు లేదా మాట్లాడి వివరాలను నమోదు చేయవచ్చు.'
  },
  hi: {
    name: 'Hindi',
    locale: 'hi-IN',
    text: 'अपनी किसान प्रोफाइल बनाने के लिए अपना नाम, मोबाइल नंबर, गांव, मुख्य फसल और अनुमानित मात्रा दर्ज करें। आप टाइप कर सकते हैं या बोलकर विवरण दर्ज कर सकते हैं।'
  },
  kn: {
    name: 'Kannada',
    locale: 'kn-IN',
    text: 'ನಿಮ್ಮ ರೈತ ಪ್ರೊಫೈಲ್ ರಚಿಸಲು ನಿಮ್ಮ ಹೆಸರು, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ, ಗ್ರಾಮ, ಮುಖ್ಯ ಬೆಳೆ ಮತ್ತು ಅಂದಾಜು ಪ್ರಮಾಣವನ್ನು ನಮೂದಿಸಿ. ನೀವು ಟೈಪ್ ಮಾಡಬಹುದು ಅಥವಾ ಮಾತನಾಡಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಬಹುದು.'
  },
  ta: {
    name: 'Tamil',
    locale: 'ta-IN',
    text: 'உங்கள் விவசாயி சுயவிவரத்தை உருவாக்க உங்கள் பெயர், மொபைல் எண், கிராமம், முதன்மை பயிர் மற்றும் தோராயமான அளவை உள்ளிடவும். நீங்கள் தட்டச்சு செய்யலாம் அல்லது பேசி விவரங்களை உள்ளிடலாம்.'
  },
  mr: {
    name: 'Marathi',
    locale: 'mr-IN',
    text: 'तुमचे शेतकरी प्रोफाइल तयार करण्यासाठी तुमचे नाव, मोबाईल नंबर, गाव, मुख्य पीक आणि अंदाजे प्रमाण प्रविष्ट करा. तुम्ही टाईप करू शकता किंवा बोलून माहिती भरू शकता.'
  },
  bn: {
    name: 'Bengali',
    locale: 'bn-IN',
    text: 'আপনার কৃষক প্রোফাইল তৈরি করতে আপনার নাম, মোবাইল নম্বর, গ্রাম, প্রধান ফসল এবং আনুমানিক পরিমাণ লিখুন। আপনি টাইপ করতে পারেন বা কথা বলে বিবরণ লিখতে পারেন।'
  },
  en: {
    name: 'English',
    locale: 'en-IN',
    text: 'To create your farmer profile, enter your name, mobile number, village, main crop, and approximate quantity. You can type or speak to enter details.'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const currentLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
  const langConfig = GUIDANCE_DATA[currentLang] || GUIDANCE_DATA.te;

  const guidanceBtn = document.getElementById('voice-guidance-btn');
  const guidanceLabel = document.getElementById('guidance-label');
  const accessVoiceBtn = document.getElementById('access-voice-btn');
  const profileForm = document.getElementById('farmer-profile-form');
  const errorMsg = document.getElementById('form-error-msg');
  const backBtn = document.getElementById('back-profile-btn');

  const nameInput = document.getElementById('name-input');
  const mobileInput = document.getElementById('mobile-input');
  const locationInput = document.getElementById('location-input');
  const cropInput = document.getElementById('crop-input');
  const quantityInput = document.getElementById('quantity-input');

  // Update top-right Voice Guidance label
  if (guidanceLabel) {
    guidanceLabel.textContent = `Listen (${langConfig.name})`;
  }

  // Pre-fill profile from localStorage if existing
  try {
    const savedProfile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
    if (savedProfile.name) nameInput.value = savedProfile.name;
    if (savedProfile.mobile) mobileInput.value = savedProfile.mobile;
    if (savedProfile.location) locationInput.value = savedProfile.location;
    if (savedProfile.crop) cropInput.value = savedProfile.crop;
    if (savedProfile.quantity) quantityInput.value = savedProfile.quantity;
  } catch (e) {
    console.error('Error reading saved profile:', e);
  }

  // --- TYPE BUTTON HANDLERS ---
  const typeBtns = Array.from(document.querySelectorAll('.btn-type'));
  typeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.focus();
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // --- SPEAK BUTTON HANDLERS (Web Speech Recognition API) ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechBtns = Array.from(document.querySelectorAll('.btn-speech'));
  let activeRecognition = null;
  let activeSpeechBtn = null;

  speechBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetInput = document.getElementById(targetId);

      if (!targetInput) return;

      // Stop any active speech recognition
      if (activeRecognition) {
        activeRecognition.stop();
        if (activeSpeechBtn) stopMicState(activeSpeechBtn);
        if (activeSpeechBtn === btn) return; // Toggle off if clicked same button
      }

      if (!SpeechRecognition) {
        showError('Voice typing is not supported in this browser. Please type your details.');
        targetInput.focus();
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = langConfig.locale;
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
          activeRecognition = recognition;
          activeSpeechBtn = btn;
          btn.classList.add('listening');
          const textSpan = btn.querySelector('.btn-action-text');
          if (textSpan) textSpan.textContent = 'Listening...';
          hideError();
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            // Clean up mobile numbers if user speaks digits
            if (targetId === 'mobile-input') {
              const digits = transcript.replace(/\D/g, '');
              if (digits) targetInput.value = digits.slice(-10);
              else targetInput.value = transcript.trim();
            } else {
              targetInput.value = transcript.trim();
            }
          }
        };

        recognition.onend = () => {
          stopMicState(btn);
          activeRecognition = null;
          activeSpeechBtn = null;
        };

        recognition.onerror = (event) => {
          stopMicState(btn);
          activeRecognition = null;
          activeSpeechBtn = null;
          if (event.error !== 'no-speech' && event.error !== 'aborted') {
            showError('Voice input error. Please try again or type directly.');
          }
        };

        recognition.start();

      } catch (err) {
        console.error('Speech recognition exception:', err);
        showError('Could not start microphone. Please type directly.');
      }
    });
  });

  function stopMicState(btn) {
    if (!btn) return;
    btn.classList.remove('listening');
    const textSpan = btn.querySelector('.btn-action-text');
    if (textSpan) textSpan.textContent = 'Speak';
  }

  // --- VOICE GUIDANCE (SpeechSynthesis) ---
  let isSpeakingGuidance = false;

  function toggleVoiceGuidance() {
    if (false) {
      showError('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeakingGuidance) {
      
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

      stopGuidanceState();
      return;
    }

    
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();

    
    try {
      TextToSpeech.speak({
        text: langConfig.text,
        lang: langConfig.locale,
        rate: 0.92
      });
      // emulate onend since capacitor doesn't easily support callbacks here
      setTimeout(() => stopGuidanceState(), langConfig.text.length * 60);
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(langConfig.text);
        // removed
        // removed
        // removed
        // removed
        // removed
      }
    }

// removed utterance
    // removed
    // removed

    // removed
    if (false) {
      const match = voices.find((v) => v.lang === langConfig.locale || v.lang.startsWith(currentLang));
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      isSpeakingGuidance = true;
      if (guidanceBtn) {
        guidanceBtn.classList.add('speaking');
        if (guidanceLabel) guidanceLabel.textContent = 'Stop Listening';
      }
    };

    // removed
    // removed

    // removed
  }

  function stopGuidanceState() {
    isSpeakingGuidance = false;
    if (guidanceBtn) {
      guidanceBtn.classList.remove('speaking');
      if (guidanceLabel) guidanceLabel.textContent = `Listen (${langConfig.name})`;
    }
  }

  if (guidanceBtn) {
    guidanceBtn.addEventListener('click', toggleVoiceGuidance);
  }

  if (accessVoiceBtn) {
    accessVoiceBtn.addEventListener('click', toggleVoiceGuidance);
  }

  // --- FORM SUBMISSION & VALIDATION ---
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const mobile = mobileInput.value.trim();
      const location = locationInput.value.trim();
      const crop = cropInput.value.trim();
      const quantity = quantityInput.value.trim();

      // Validate empty required fields
      if (!name) {
        showError('Please enter your name.');
        nameInput.focus();
        return;
      }

      if (!mobile) {
        showError('Please enter your 10-digit mobile number.');
        mobileInput.focus();
        return;
      }

      // Validate Indian 10-digit mobile number format
      const cleanMobile = mobile.replace(/\D/g, '');
      if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
        showError('Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.');
        mobileInput.focus();
        return;
      }

      if (!location) {
        showError('Please enter your village or area.');
        locationInput.focus();
        return;
      }

      if (!crop) {
        showError('Please enter your main crop.');
        cropInput.focus();
        return;
      }

      if (!quantity) {
        showError('Please enter your approximate crop quantity.');
        quantityInput.focus();
        return;
      }

      // Save Farmer Profile Context
      const farmerProfileData = {
        name: name,
        mobile: cleanMobile,
        location: location,
        crop: crop,
        quantity: quantity,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(PROFILE_KEY, JSON.stringify(farmerProfileData));
      localStorage.setItem(ROLE_KEY, 'farmer');
      localStorage.setItem(LANG_KEY, currentLang);

      hideError();

      const submitBtn = document.getElementById('continue-profile-btn');
      if (submitBtn) {
        submitBtn.style.opacity = '0.85';
        submitBtn.style.transform = 'scale(0.98)';
      }

      setTimeout(() => {
        window.location.href = '/farmer-home.html';
      }, 150);
    });
  }

  // --- BACK BUTTON HANDLER ---
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = '/role.html';
    });
  }

  // Helper Functions
  function showError(msg) {
    if (errorMsg) {
      errorMsg.textContent = msg;
      errorMsg.style.display = 'block';
      errorMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideError() {
    if (errorMsg) {
      errorMsg.style.display = 'none';
      errorMsg.textContent = '';
    }
  }
});
