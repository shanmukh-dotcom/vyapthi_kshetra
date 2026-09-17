const STORAGE_KEY = 'vyapti_selected_language';

const LANG_MAP = {
  te: { native: 'తెలుగు', english: 'Telugu' },
  hi: { native: 'हिन्दी', english: 'Hindi' },
  kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
  ta: { native: 'தமிழ்', english: 'Tamil' },
  mr: { native: 'मराठी', english: 'Marathi' },
  bn: { native: 'বাংলা', english: 'Bengali' },
  en: { native: 'English', english: 'English' }
};

document.addEventListener('DOMContentLoaded', () => {
  const activeLangDisplay = document.getElementById('active-lang-display');
  const goBackBtn = document.getElementById('go-back-btn');

  const langCode = localStorage.getItem(STORAGE_KEY) || 'te';
  const langInfo = LANG_MAP[langCode] || LANG_MAP.te;

  if (activeLangDisplay) {
    activeLangDisplay.textContent = `${langInfo.english} (${langInfo.native})`;
  }

  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      window.location.href = '/index.html';
    });
  }
});
