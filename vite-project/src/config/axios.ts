import axiosLib from 'axios';

export const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8500',
  timeout: 100000,
  withCredentials: true, // ✅ Required for HTTP-only cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: No Authorization header interceptor needed
// Backend uses HTTP-only cookies which are automatically sent with withCredentials: true