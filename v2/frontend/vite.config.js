import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The frontend talks ONLY to the gateway (port 4000) — never directly
    // to a strategy microservice. See /v2/backend/gateway/README.md.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});
