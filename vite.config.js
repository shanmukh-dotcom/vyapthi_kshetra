import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { cpSync } from 'fs';

// Get all html files in the root directory
const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.html') && file !== 'temp_drawer.html');
const input = {};
files.forEach(file => {
  const name = file.replace('.html', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
  input[name] = resolve(__dirname, file);
});

// Plugin to copy src/ assets (ask-vyapti, vyapti-kb, css) into dist/src/ after build
function copySrcAssets() {
  return {
    name: 'copy-src-assets',
    closeBundle() {
      const srcDir = resolve(__dirname, 'src');
      const destDir = resolve(__dirname, 'dist', 'src');
      try {
        cpSync(srcDir, destDir, { recursive: true });
        console.log('✅ Copied src/ → dist/src/ (Ask Vyapti, KB, CSS)');
      } catch (e) {
        console.warn('⚠️ Could not copy src/ to dist/src/:', e.message);
      }
    }
  };
}

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input
    },
  },
  plugins: [copySrcAssets()],
});
