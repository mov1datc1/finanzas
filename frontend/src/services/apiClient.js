import axios from 'axios';

const REQUIRED_ENV_VARIABLE = 'VITE_API_BASE_URL';
const DEFAULT_DEV_API_HOST = 'http://localhost:5000';

const normaliseHost = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const resolveHost = () => {
  const envHost = normaliseHost(
    import.meta.env[REQUIRED_ENV_VARIABLE] ?? import.meta.env.VITE_API_URL,
  );

  if (envHost) {
    return envHost;
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEV_API_HOST;
  }

  throw new Error(
    `La variable de entorno ${REQUIRED_ENV_VARIABLE} es obligatoria en producción para configurar la URL del backend`,
  );
};

const hostWithoutTrailingSlash = resolveHost().replace(/\/$/, '');
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
