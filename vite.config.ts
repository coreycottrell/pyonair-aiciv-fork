/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index-PYO2024.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith('.css')) {
            return 'assets/index-PYO2024.css'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8097',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8097',
        ws: true,
      },
      '/hub-api': {
        target: 'http://87.99.131.49:8900',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/hub-api/, ''),
      },
      '/events-api': {
        target: 'http://87.99.131.49:8400',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/events-api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
