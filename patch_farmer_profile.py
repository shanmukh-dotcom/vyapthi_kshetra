import os

with open('src/farmer-profile.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import at the top
if 'import { TextToSpeech }' not in content:
    content = "import { TextToSpeech } from '@capacitor-community/text-to-speech';\n" + content

content = content.replace("if (!('speechSynthesis' in window)) {", "if (false) {")

content = content.replace('window.speechSynthesis.cancel();', '''
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();
''')

speak_patch = """
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
        utterance.lang = langConfig.locale;
        utterance.rate = 0.92;
        utterance.onend = () => stopGuidanceState();
        utterance.onerror = () => stopGuidanceState();
        window.speechSynthesis.speak(utterance);
      }
    }
"""

content = content.replace('const utterance = new SpeechSynthesisUtterance(langConfig.text);', speak_patch + '\n// removed utterance')
content = content.replace('utterance.lang = langConfig.locale;', '// removed')
content = content.replace('utterance.rate = 0.92;', '// removed')
content = content.replace('const voices = window.speechSynthesis.getVoices();', '// removed')
content = content.replace('if (voices && voices.length > 0) {', 'if (false) {')
content = content.replace('utterance.onend = () => stopGuidanceState();', '// removed')
content = content.replace('utterance.onerror = () => stopGuidanceState();', '// removed')
content = content.replace('window.speechSynthesis.speak(utterance);', '// removed')

with open('src/farmer-profile.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched farmer-profile.js")
