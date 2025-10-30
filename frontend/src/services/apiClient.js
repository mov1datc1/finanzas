import axios from 'axios';

const DEFAULT_API_HOST = 'https://finanzas-gamma.vercel.app';

const rawHost = (import.meta.env.VITE_API_URL
  ?? (import.meta.env.DEV ? 'http://localhost:5000' : DEFAULT_API_HOST));

const host = rawHost.replace(/\/$/, '');
const baseURL = host.endsWith('/api') ? host : `${host}/api`;

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Error de red inesperado';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
