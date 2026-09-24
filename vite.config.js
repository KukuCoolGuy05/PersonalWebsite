import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Bind IPv4 loopback explicitly: on Windows, Node resolves "localhost" to ::1 only,
  // which some browsers can't reach ("site can't be reached").
  server: { host: '127.0.0.1', port: 3000 },
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks so a content edit doesn't bust the whole cache.
        manualChunks(id) {
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/.test(id)) return 'react';
          if (/[\\/]node_modules[\\/](motion|framer-motion|motion-dom|motion-utils|lenis)[\\/]/.test(id)) return 'motion';
        },
      },
    },
  },
  test: { environment: 'node' },
});
