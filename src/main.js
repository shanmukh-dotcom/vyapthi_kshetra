const STORAGE_KEY = 'vyapti_selected_language';
const DEFAULT_LANG = 'te'; // Telugu default

const TRANSLATIONS = {
  en: {
    title: "Choose Your Language",
    subtitle: "Select your preferred language to continue",
    continueBtn: "Continue",
    note: "You can change language later in settings"
  },
  te: {
    title: "మీ భాషను ఎంచుకోండి",
    subtitle: "కొనసాగించడానికి మీ ప్రాధాన్య భాషను ఎంచుకోండి",
    continueBtn: "కొనసాగించండి",
    note: "మీరు సెట్టింగ్‌లలో తర్వాత భాషను మార్చవచ్చు"
  },
  hi: {
    title: "अपनी भाषा चुनें",
    subtitle: "जारी रखने के लिए अपनी पसंदीदा भाषा चुनें",
    continueBtn: "जारी रखें",
    note: "आप बाद में सेटिंग्स में भाषा बदल सकते हैं"
  },
  kn: {
    title: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    subtitle: "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    continueBtn: "ಮುಂದುವರಿಸಿ",
    note: "ನೀವು ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ನಂತರ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು"
  },
  ta: {
    title: "உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்",
    subtitle: "தொடர உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",
    continueBtn: "தொடரவும்",
    note: "அமைப்புகளில் பின்னர் மொழியை மாற்றலாம்"
  },
  mr: {
    title: "तुमची भाषा निवडा",
    subtitle: "पुढे जाण्यासाठी तुमची पसंतीची भाषा निवडा",
    continueBtn: "पुढे जा",
    note: "तुम्ही सेटिंग्जमध्ये नंतर भाषा बदलू शकता"
  },
  bn: {
    title: "আপনার ভাষা চয়ন করুন",
    subtitle: "চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন",
    continueBtn: "অবিরত রাখুন",
    note: "আপনি পরে সেটিংসে ভাষা পরিবর্তন করতে পারেন"
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const languageOptions = Array.from(document.querySelectorAll('.language-option'));
  const continueBtn = document.getElementById('continue-btn');

  // Load stored language or fallback to default
  const storedLang = localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  selectLanguage(storedLang, false);

  // Attach click listeners to each row
  languageOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const langCode = option.getAttribute('data-lang');
      selectLanguage(langCode, true);
    });

    // Keyboard interaction (Space / Enter / Arrow keys)
    option.addEventListener('keydown', (e) => {
      const currentIndex = languageOptions.indexOf(option);

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const langCode = option.getAttribute('data-lang');
        selectLanguage(langCode, true);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % languageOptions.length;
        const nextOption = languageOptions[nextIndex];
        const nextLang = nextOption.getAttribute('data-lang');
        selectLanguage(nextLang, true);
        nextOption.focus();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + languageOptions.length) % languageOptions.length;
        const prevOption = languageOptions[prevIndex];
        const prevLang = prevOption.getAttribute('data-lang');
        selectLanguage(prevLang, true);
        prevOption.focus();
      }
    });
  });

  // Continue Button Navigation
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      const selectedOption = document.querySelector('.language-option.selected');
      const langCode = selectedOption ? selectedOption.getAttribute('data-lang') : DEFAULT_LANG;
      const langName = selectedOption ? selectedOption.getAttribute('data-name') : 'Telugu';
      
      // Store choice
      localStorage.setItem(STORAGE_KEY, langCode);

      // Add click animation state
      continueBtn.style.opacity = '0.85';
      continueBtn.style.transform = 'scale(0.98)';

      setTimeout(() => {
        // Navigate to Role Selection
        window.location.href = '/role.html';
      }, 150);
    });
  }

  /**
   * Updates UI state and selects the given language
   * @param {string} langCode 
   * @param {boolean} persist 
   */
  function selectLanguage(langCode, persist = true) {
    let targetOption = languageOptions.find((opt) => opt.getAttribute('data-lang') === langCode);
    if (!targetOption) {
      targetOption = languageOptions.find((opt) => opt.getAttribute('data-lang') === DEFAULT_LANG);
    }

    languageOptions.forEach((opt) => {
      const isSelected = opt === targetOption;
      const radioInput = opt.querySelector('input[type="radio"]');

      if (isSelected) {
        opt.classList.add('selected');
        opt.setAttribute('aria-checked', 'true');
        opt.setAttribute('tabindex', '0');
        if (radioInput) radioInput.checked = true;
      } else {
        opt.classList.remove('selected');
        opt.setAttribute('aria-checked', 'false');
        opt.setAttribute('tabindex', '-1');
        if (radioInput) radioInput.checked = false;
      }
    });

    if (persist && targetOption) {
      const selectedLang = targetOption.getAttribute('data-lang');
      localStorage.setItem(STORAGE_KEY, selectedLang);
    }

    // Apply translations to the page
    const currentLangCode = targetOption.getAttribute('data-lang');
    const dict = TRANSLATIONS[currentLangCode] || TRANSLATIONS['en'];
    
    const titleEl = document.querySelector('.card-title');
    const subtitleEl = document.querySelector('.card-subtitle');
    const btnSpan = document.querySelector('#continue-btn span');
    const noteSpan = document.querySelector('.bottom-note span');

    if(titleEl) titleEl.innerText = dict.title;
    if(subtitleEl) subtitleEl.innerText = dict.subtitle;
    if(btnSpan) btnSpan.innerText = dict.continueBtn;
    if(noteSpan) noteSpan.innerText = dict.note;
  }
});
