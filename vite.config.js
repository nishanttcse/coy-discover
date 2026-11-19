import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/feed': 'http://localhost:3001',
      '/swipe': 'http://localhost:3001',
      '/matches': 'http://localhost:3001'
    }
  }
});
