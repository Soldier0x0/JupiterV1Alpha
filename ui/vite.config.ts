import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'secvisihub.preview.emergentagent.com',
      'threatdefend.preview.emergentagent.com',
      'threat-defender-2.preview.emergentagent.com',
      'pending-review-1.preview.emergentagent.com',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://siem-api:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      '/socket.io': {
        target: 'http://siem-api:8080',
        ws: true,
      },
    },
  },
});
