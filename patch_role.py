import re

with open('src/role.js', 'r', encoding='utf-8') as f:
    content = f.read()

if 'import { TextToSpeech }' not in content:
    content = "import { TextToSpeech } from '@capacitor-community/text-to-speech';\n" + content

# Replace the alert block
content = content.replace("if (!('speechSynthesis' in window)) {", "if (false) {")

content = content.replace('window.speechSynthesis.cancel();', '''
    try {
      TextToSpeech.stop();
    } catch(e) {}
    if(window.speechSynthesis) window.speechSynthesis.cancel();
''')

# We'll just replace everything from `const utterance` down to `window.speechSynthesis.speak(utterance);`
regex = re.compile(r'const utterance = new SpeechSynthesisUtterance\(langConfig\.text\);.*?window\.speechSynthesis\.speak\(utterance\);', re.DOTALL)

speak_patch = """
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
"""

content = regex.sub(speak_patch, content)

with open('src/role.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched role.js")
