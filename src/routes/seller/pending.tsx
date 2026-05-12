import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { FiClock, FiLogOut } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/seller/pending')({
  component: SellerPendingPage,
});

function SellerPendingPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-card rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
              <FiClock className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Account Under Review</h1>
            <p className="text-muted-foreground">
              Your seller account is pending admin approval. You'll be notified once approved.
            </p>
          </div>

          <div className="bg-muted rounded-lg p-4 mb-6 text-left">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Store Name</p>
                <p className="font-semibold text-foreground">{user?.storeName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Name</p>
                <p className="font-semibold text-foreground">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This usually takes 24-48 hours. Check your email for updates.
            </p>
            <Button
              onClick={() => logout()}
              variant="outline"
              className="w-full"
            >
              <FiLogOut className="mr-2" size={16} />
              Logout
            </Button>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
