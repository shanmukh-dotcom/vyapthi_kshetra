import os

with open('src/farmer-app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import at the top
if 'import { TextToSpeech }' not in content:
    content = "import { TextToSpeech } from '@capacitor-community/text-to-speech';\n" + content

# Patch !('speechSynthesis' in window) check
content = content.replace("if (!('speechSynthesis' in window)) {", "if (false) {")

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
        text: speechText,
        lang: currentLang === 'te' ? 'te-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN'),
        rate: 0.95
      });
    } catch(e) {
      if(window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.lang = currentLang === 'te' ? 'te-IN' : (currentLang === 'hi' ? 'hi-IN' : 'en-IN');
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    }
"""

content = content.replace('const utterance = new SpeechSynthesisUtterance(speechText);', speak_patch + '\n// removed utterance')
content = content.replace('utterance.lang = currentLang === \'te\' ? \'te-IN\' : (currentLang === \'hi\' ? \'hi-IN\' : \'en-IN\');', '// removed')
content = content.replace('utterance.rate = 0.95;', '// removed')
content = content.replace('window.speechSynthesis.speak(utterance);', '// removed')

with open('src/farmer-app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched farmer-app.js")
