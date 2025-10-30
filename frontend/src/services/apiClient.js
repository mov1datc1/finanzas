import axios from 'axios';

const DEFAULT_API_HOST = 'https://finanzas-gamma.vercel.app';

const normaliseHost = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const rawEnvHost = normaliseHost(import.meta.env.VITE_API_URL);
const fallbackHost = import.meta.env.DEV ? 'http://localhost:5000' : DEFAULT_API_HOST;

const hostWithoutTrailingSlash = (rawEnvHost ?? fallbackHost).replace(/\/$/, '');
const baseURL = hostWithoutTrailingSlash.endsWith('/api')
  ? hostWithoutTrailingSlash
  : `${hostWithoutTrailingSlash}/api`;

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
