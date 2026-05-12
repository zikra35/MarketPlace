import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiPlus, FiPackage, FiShoppingCart, FiStar, FiTrendingUp, FiSettings, FiLogOut } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { productApi, orderApi, reviewApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/currency';

export const Route = createFileRoute('/seller/')({
  component: SellerDashboard,
});

function SellerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/login' });
  };

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => productApi.getMine(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => orderApi.getAll(),
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['seller-reviews'],
    queryFn: async () => {
      if (!products?.data) return [];
      const allReviews = [];
      for (const product of products.data) {
        try {
          const res = await reviewApi.getByProduct(product._id);
          allReviews.push(...(res.data || []));
        } catch (error) {
          // Continue if review fetch fails
        }
      }
      return allReviews;
    },
    enabled: !!products?.data,
  });

  const isLoading = productsLoading || ordersLoading || reviewsLoading;

  const totalProducts = products?.data?.length || 0;
  const totalOrders = orders?.data?.length || 0;
  const totalEarnings = orders?.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  const actionCards = [
    {
      icon: FiPlus,
      title: 'Add New Product',
      description: 'List a new product for sale',
      action: () => navigate({ to: '/seller/add-product' }),
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FiPackage,
      title: 'My Products',
      description: 'Manage your product listings',
      action: () => navigate({ to: '/seller/products' }),
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FiShoppingCart,
      title: 'Orders',
      description: 'View and manage orders',
      action: () => navigate({ to: '/seller/orders' }),
      color: 'from-green-500 to-green-600',
    },
    {
      icon: FiStar,
      title: 'Reviews',
      description: 'Check customer reviews',
      action: () => navigate({ to: '/seller/reviews' }),
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: FiTrendingUp,
      title: 'Earnings',
      description: 'View your earnings',
      action: () => navigate({ to: '/seller/earnings' }),
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: FiSettings,
      title: 'Store Settings',
      description: 'Manage your store',
      action: () => navigate({ to: '/seller/settings' }),
      color: 'from-gray-500 to-gray-600',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-muted-foreground mt-1">
                  {user?.storeName && `Store: ${user.storeName}`}
                </p>
              </motion.div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                <FiLogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: 'Total Products', value: isLoading ? <Skeleton className="h-8 w-12" /> : totalProducts },
              { label: 'Total Orders', value: isLoading ? <Skeleton className="h-8 w-12" /> : totalOrders },
              { label: 'Total Earnings', value: isLoading ? <Skeleton className="h-8 w-20" /> : formatPrice(totalEarnings) },
              { label: 'Avg Rating', value: isLoading ? <Skeleton className="h-8 w-12" /> : avgRating },
            ].map((stat, i) => (
              <div key={i} className="bg-card rounded-lg border border-border p-6">
                <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              </div>
            ))}
          </motion.div>

          {/* Action Cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {actionCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  onClick={card.action}
                  className="group relative overflow-hidden rounded-xl bg-card border border-border p-6 text-left transition-all hover:border-accent hover:shadow-lg"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative z-10">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${card.color} text-white mb-4`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{card.title}</h3>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
