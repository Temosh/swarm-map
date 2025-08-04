import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.foursquare.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/oauth2/access_token': {
        target: 'https://foursquare.com',
        changeOrigin: true,
      },
    },
    port: 3000, // Explicitly set the port to 3000
  },
});
