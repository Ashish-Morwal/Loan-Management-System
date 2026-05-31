import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      console.debug('AXIOS REQUEST INTERCEPTOR', {
        method: config.method,
        url: config.url,
        tokenExists: !!token,
      });

      config.headers = config.headers || {};
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.debug('AXIOS RESPONSE ERROR', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    }
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
