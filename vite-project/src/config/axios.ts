import axiosLib from 'axios';

// Note: Backend must have CORS configured to allow requests from the frontend origin
const normalizeBaseURL = (url: string) => {
  if (!url) return '';
  let normalized = url.trim();
  if (!normalized) return '';

  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, '');

  // If someone mistakenly includes /api/v1 in the base URL (e.g., https://domain.com/api/v1),
  // strip it so that requests like axios.get('/api/v1/...') don't become /api/v1/api/v1/...
  if (normalized.endsWith('/api/v1')) {
    normalized = normalized.replace(/\/api\/v1$/, '');
  }

  return normalized;
};

const getBaseURL = () => {
  const envBase = import.meta.env.VITE_BACKEND_URL;
  const fallback = 'https://nova-styles-backend.onrender.com';
  const local = 'http://localhost:8500';

  // Prefer env → fallback → local, but always normalize
  return normalizeBaseURL(envBase || fallback || local);
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