import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/lib/apiClient";
import { toast } from "sonner";
import type { User } from "@/lib/apiTypes";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string, role: 'customer' | 'seller', storeName?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getMe();
        if (response && response.success && response.data) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error: any) {
        // Distinguish between different error types
        if (error.response?.status === 401) {
          // Expected - user not logged in
          console.log('No active session');
        } else if (!error.response) {
          // Network error - log but don't fail auth check
          console.log('Network error during auth check:', error.message);
        } else {
          // Other errors
          console.log('Auth check failed:', error.message);
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: 'customer' | 'seller', storeName?: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.register({ email, password, name, role, storeName });
      
      if (response.success) {
        toast.success('Account created successfully! Please log in.');
        navigate({ to: '/login' });
      }
    } catch (error) {
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      
      if (response.success && response.data) {
        setUser(response.data);
        toast.success('Logged in successfully!');
        
        // Redirect based on role
        if (response.data.role === 'admin') {
          navigate({ to: '/admin' });
        } else if (response.data.role === 'seller') {
          if (response.data.sellerStatus === 'pending') {
            navigate({ to: '/seller/pending' });
          } else {
            navigate({ to: '/seller' });
          }
        } else {
          navigate({ to: '/shop' });
        }
      }
    } catch (error) {
      // Error toast is handled by API interceptor
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      setUser(null);
      toast.success('Logged out successfully!');
      navigate({ to: '/login' });
    } catch (error) {
      // Even if logout fails on backend, clear local state
      setUser(null);
      navigate({ to: '/login' });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, register, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
