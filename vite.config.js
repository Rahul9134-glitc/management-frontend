import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, 
    allowedHosts: [
      'pseudoimpartial-multiply-janeth.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'https://management-backend-a3je.onrender.com/', 
        changeOrigin: true,
        secure: false,
      }
    }
  }
})