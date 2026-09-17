import os

with open('src/guided-tour.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import at the top
if 'import { TextToSpeech }' not in content:
    content = "import { TextToSpeech } from '@capacitor-community/text-to-speech';\n" + content

# Patch cancel
content = content.replace('window.speechSynthesis.cancel();', '''
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();
''')

# Patch speak
speak_patch = """
    try {
      TextToSpeech.speak({
        text: spokenText,
        lang: langCodes[langKey] || 'en-IN',
        rate: 0.92
      });
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.lang = langCodes[langKey] || 'en-IN';
        utterance.rate = 0.92;
        window.speechSynthesis.speak(utterance);
      }
    }
"""

content = content.replace('const utterance = new SpeechSynthesisUtterance(spokenText);', speak_patch + '\n// removed utterance')
content = content.replace('utterance.lang = langCodes[langKey] || \'en-IN\';', '// removed')
content = content.replace('utterance.rate = 0.92;', '// removed')
content = content.replace('const voices = window.speechSynthesis.getVoices();', '// removed')
content = content.replace('const nativeVoice = voices.find(v => v.lang.toLowerCase().includes(langKey));', '// removed')
content = content.replace('if (nativeVoice) {', 'if (false) {')
content = content.replace('window.speechSynthesis.speak(utterance);', '// removed')

with open('src/guided-tour.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched guided-tour.js")
