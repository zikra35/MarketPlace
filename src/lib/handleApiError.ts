import type { AxiosError } from 'axios';

/**
 * Log an API error for debugging.
 *
 * User-facing toasts and the redirect to /login on an expired session are already
 * handled once, centrally, by the response interceptor in ./api.ts. Showing them
 * here as well produced duplicate toasts and double navigations, so this only logs.
 * The extra parameters are kept so existing call sites keep compiling.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handleApiError = (error: unknown, _navigate?: unknown, _suppressToast?: boolean) => {
  const err = error as AxiosError<any>;
  console.error(`API Error [${err?.config?.url || 'Unknown endpoint'}]:`, {
    status: err?.response?.status,
    message: err?.response?.data?.message || err?.message,
  });
};
