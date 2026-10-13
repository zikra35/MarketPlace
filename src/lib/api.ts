import axios, { AxiosError } from 'axios';
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

// Auth endpoints must never trigger a token refresh: a 401 from /auth/login means
// "wrong password", and a 401 from /auth/refresh means "no session". Retrying those
// through the refresh flow used to queue the refresh request behind itself, so the
// promise never settled and the UI hung (endless spinner on login / page load).
const NO_REFRESH_URLS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

// Requests whose 401 just means "not logged in" - never redirect for these
const SILENT_401_URLS = ['/users/me'];

let refreshPromise: Promise<unknown> | null = null;

const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh').finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const url = originalRequest?.url || '';
    const isAuthUrl = NO_REFRESH_URLS.some(u => url.includes(u));

    if (status === 401 && originalRequest && !isAuthUrl && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshSession();
        return api(originalRequest);
      } catch (refreshError) {
        const onLoginPage = typeof window !== 'undefined' && window.location.pathname.includes('/login');
        if (!onLoginPage && !SILENT_401_URLS.some(u => url.includes(u))) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    if (status === 401) {
      // Show the server's message for login failures ("Invalid credentials")
      if (url.includes('/auth/login')) {
        toast.error(message || 'Invalid email or password');
      }
    } else if (status === 403) {
      // Silently log access-denied errors; ProtectedRoute shows the user-facing message
    } else if (status === 404) {
      toast.error(message || 'Resource not found');
    } else if (status === 400 || status === 422) {
      toast.error(message || 'Validation error');
    } else if (!error.response) {
      toast.error('Network error. Is the backend running?');
    } else {
      toast.error(message || 'An error occurred');
    }

    console.error(`[API Error] ${url}:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
