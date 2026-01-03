import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          vendor: ['react-router-dom', 'socket.io-client']
        }
      }
    }
  },
  server: {
    port: 8080,
    host: true,
    strictPort: true
  },
  base: './', 
  resolve: {
    alias: {
      '@': '/src' 
    }
  }
});