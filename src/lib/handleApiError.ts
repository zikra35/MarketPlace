import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export const handleApiError = (error: AxiosError<any>, navigate?: any, suppressToast?: boolean) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || error.message;
  const endpoint = error.config?.url || 'Unknown endpoint';

  console.error(`API Error [${endpoint}]:`, {
    status,
    message,
    data: error.response?.data,
    error,
  });

  // Skip toast notifications if suppressToast is true
  if (suppressToast) return;

  // Only show critical errors as toasts
  if (status === 401) {
    toast.error('Session expired, please log in');
    if (navigate) {
      navigate({ to: '/login' });
    }
  } else if (status === 400 || status === 422) {
    toast.error(message || 'Validation error');
  } else if (error.message === 'Network Error') {
    toast.error('No internet connection');
  }
  // Silently log other errors (403, 404, 500) without showing toasts
};
