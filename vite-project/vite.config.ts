import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // allows external connections
    proxy: {
      '/api': {
        target: 'https://nova-styles-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true,
        // Rewrite the request to maintain the /api path
        // This will forward /api/v1/auth/login to https://nova-styles-backend.onrender.com/api/v1/auth/login
      },
    },
  },
})
