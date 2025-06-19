import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

export default defineConfig({
  base: '/', // 👈 important for root hosting
  root: path.resolve(__dirname, '..'), // 👈 set root to parent directory
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'), // 👈 PostCSS config path
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'config/staticwebapp.config.json', // 👈 copy this file
          dest: '.' // 👈 into the dist/ root
        }
      ]
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
  }
});
