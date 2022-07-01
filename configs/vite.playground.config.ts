import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, '../playground'),
  base: process.env.NODE_ENV === 'production' ? '/web-bip39/' : '',
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: path.resolve(__dirname, '../playground-dist')
  }
})
