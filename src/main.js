const STORAGE_KEY = 'vyapti_selected_language';
const DEFAULT_LANG = 'te'; // Telugu default

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
  }
});
