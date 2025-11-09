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
        target: 'http://localhost:8500',
        changeOrigin: true,
        secure: false,
        // Rewrite the request to maintain the /api path
        // This will forward /api/v1/auth/login to http://localhost:8500/api/v1/auth/login
      },
    },
  },
})
