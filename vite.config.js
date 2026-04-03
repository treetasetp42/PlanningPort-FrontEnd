import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7264', // URL ของ Backend คุณ [cite: 2026-04-02]
        changeOrigin: true,
        secure: false,
      },
    },
  },
})