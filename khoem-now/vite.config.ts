import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import fs from 'node:fs';

// Reads the gateway secret on the server side only (never sent to the browser).
function gatewayToken(): string {
  try {
    const f = fileURLToPath(new URL('../gateway/.env', import.meta.url));
    const m = fs.readFileSync(f, 'utf8').match(/^\s*(?:export\s+)?GATEWAY_TOKEN\s*=\s*(.*)$/m);
    return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : '';
  } catch {
    return '';
  }
}


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/ksv-api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/ksv-api/, '/api/ksv'),
        headers: { 'x-gateway-token': gatewayToken() },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
        },
      },
    },
  },
});
