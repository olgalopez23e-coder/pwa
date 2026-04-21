import axios from 'axios';
import { saveOfflineRequest } from './db';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://lively-vitality-production.up.railway.app/api'
});

// Interceptor para manejar el token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores y modo offline
api.interceptors.response.use(
  response => response,
  async error => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-change'));
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Si no hay conexión y es una petición de modificación (POST, PUT, DELETE)
    if (!navigator.onLine && ['post', 'put', 'delete'].includes(error.config.method?.toLowerCase())) {
      console.warn('Sin conexión. Guardando petición para reintento posterior...');
      await saveOfflineRequest({
        url: error.config.url,
        method: error.config.method,
        data: error.config.data,
        headers: error.config.headers
      });

      // Registrar para Background Sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-requests');
      }

      return Promise.resolve({ data: { message: 'Petición guardada offline', offline: true } });
    }
    return Promise.reject(error);
  }
);

export default api;