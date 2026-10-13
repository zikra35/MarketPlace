import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';

type Role = 'customer' | 'seller' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const PENDING_PATH = '/seller/pending';

export function ProtectedRoute({ children, allowedRoles = [] }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  // A new array literal is passed on every render; key the effect on its contents instead
  const rolesKey = allowedRoles.join(',');

  const roleAllowed = allowedRoles.length === 0 || (!!user && allowedRoles.includes(user.role as Role));
  const isSellerRoute = !!user && user.role === 'seller' && allowedRoles.includes('seller');
  const sellerBlocked =
    isSellerRoute && (user!.sellerStatus === 'pending' || user!.sellerStatus === 'suspended' || !!user!.isSuspended);
  const sellerRejected = isSellerRoute && user!.sellerStatus === 'rejected';
  const onPendingPage = pathname.replace(/\/$/, '') === PENDING_PATH;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.error('Please log in to continue');
      navigate({ to: '/login' });
      return;
    }

    if (!roleAllowed) {
      toast.error('You do not have permission to access this page');
      navigate({ to: '/shop' });
      return;
    }

    if (sellerRejected) {
      toast.error('Your seller account has been rejected');
      navigate({ to: '/shop' });
      return;
    }

    // Pending/suspended sellers can only see the pending page (and must not be bounced
    // back to it while already on it - that caused a redirect loop)
    if (sellerBlocked && !onPendingPage) {
      navigate({ to: PENDING_PATH });
      return;
    }

    // An approved seller who lands on the pending page goes to the dashboard
    if (isSellerRoute && !sellerBlocked && !sellerRejected && onPendingPage) {
      navigate({ to: '/seller' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, user?.role, user?.sellerStatus, user?.isSuspended, rolesKey, onPendingPage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !roleAllowed || sellerRejected || (sellerBlocked && !onPendingPage)) {
    return null;
  }

  return <>{children}</>;
}
