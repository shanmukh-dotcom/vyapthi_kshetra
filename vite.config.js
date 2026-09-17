import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// Get all html files in the root directory
const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.html') && file !== 'temp_drawer.html');
const input = {};
files.forEach(file => {
  const name = file.replace('.html', '').replace(/-([a-z])/g, g => g[1].toUpperCase());
  input[name] = resolve(__dirname, file);
});

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
});
