import axiosLib from 'axios';

// Always use the full backend URL from environment variable or fallback to Render backend
// Note: Backend must have CORS configured to allow requests from the frontend origin
const getBaseURL = () => {
  return import.meta.env.VITE_BACKEND_URL || 'https://nova-styles-backend.onrender.com' || 'http://localhost:8500';
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