const fs = require('fs');

const orig = fs.readFileSync('original-farmer-profile.css', 'utf8');
let current = fs.readFileSync('src/style.css', 'utf8');

const classes = [
  'farmer-profile-bg', 'profile-card', 'voice-button', 'speaker-icon', 'sprout-icon', 
  'people-icon', 'profile-form', 'error-toast', 'form-row-card', 'field-icon-wrap', 
  'field-icon', 'field-body', 'field-label', 'req-star', 'field-input', 'field-actions', 
  'action-divider', 'btn-speech', 'btn-type', 'mic-icon', 'pencil-icon', 
  'back-link-btn', 'back-arrow-icon', 'bottom-access-bar', 'access-bar-btn', 'access-icon',
  'micPulse', 'pulseSpeaking' // keyframes
];

let toAppend = '\n\n/* Restored missing farmer profile styles */\n';

const blocks = orig.split(/(?=\n[.#@])/);

for (const block of blocks) {
  let include = false;
  for (const cls of classes) {
    if (block.includes(cls)) {
      include = true;
      break;
    }
  }
  
  if (include) {
    // Only append if it's not already in current (loose check)
    const blockHeader = block.split('{')[0].trim();
    if (blockHeader && !current.includes(blockHeader)) {
      toAppend += block + '\n';
    }
  }
}

fs.writeFileSync('src/style.css', current + toAppend, 'utf8');
console.log("Restored missing classes!");
