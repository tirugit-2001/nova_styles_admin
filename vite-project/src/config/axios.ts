import axiosLib from 'axios';

// In development, use empty baseURL to leverage Vite proxy (avoids CORS)
// In production, use the full backend URL from environment variable
const getBaseURL = () => {
  if (import.meta.env.DEV) {
    // Development: Use relative URLs so Vite proxy can handle it
    return '';
  }
  // Production: Use full backend URL
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:8500';
};

export const axios = axiosLib.create({
  baseURL: getBaseURL(),
  timeout: 100000,
  withCredentials: true, // ✅ Required for HTTP-only cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Note: No Authorization header interceptor needed
// Backend uses HTTP-only cookies which are automatically sent with withCredentials: true