
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Permite que o código use process.env.API_KEY no navegador
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 443
    }
  }
});
