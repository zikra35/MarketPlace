import axios, { AxiosError, AxiosInstance } from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const currentPath = window.location.pathname;

    if (status === 401) {
      const originalRequest = error.config as any;

      if (!isRefreshing) {
        isRefreshing = true;
        // Try to refresh token
        return api.post('/auth/refresh')
          .then(() => {
            processQueue(null);
            return api(originalRequest);
          })
          .catch(err => {
            processQueue(err, null);
            // Only redirect if not already on login page
            if (!currentPath.includes('/login')) {
              toast.error('Session expired. Please log in again.');
              window.location.href = '/login';
            }
            return Promise.reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
      // Queue the request while token is refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    } else if (status === 403) {
      // Silently log access denied errors without showing toast
    } else if (status === 404) {
      toast.error('Resource not found');
    } else if (status === 400 || status === 422) {
      toast.error(message || 'Validation error');
    } else if (!error.response) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error(message || 'An error occurred');
    }

    console.error(`[API Error] ${error.config?.url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
