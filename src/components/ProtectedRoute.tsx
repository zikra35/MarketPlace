import { useAuth } from '@/context/AuthContext';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'seller' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.error('Please log in to continue');
      navigate({ to: '/login' });
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as any)) {
      toast.error('You do not have permission to access this page');
      navigate({ to: '/shop' });
      return;
    }

    // Check seller status if accessing seller routes
    if (user?.role === 'seller' && allowedRoles.includes('seller')) {
      if (user.sellerStatus === 'pending') {
        navigate({ to: '/seller/pending' });
        return;
      }
      if (user.sellerStatus === 'rejected') {
        toast.error('Your seller account has been rejected');
        navigate({ to: '/shop' });
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(user?.role as any))) {
    return null;
  }

  return <>{children}</>;
}
