import { createFileRoute, useNavigate, Outlet, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/WishlistContext";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/lib/apiClient";
import { useEffect } from "react";
import { FiShoppingCart, FiHeart, FiPackage, FiMapPin, FiLogOut, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

export const Route = createFileRoute("/customer")({
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems: wishlistCount } = useWishlist();
  const { data: ordersResponse } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getAll(),
    enabled: !!user && user.role === 'customer',
  });
  const orders = ordersResponse?.data || [];
  const pendingDeliveries = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length;

  useEffect(() => {
    // Wait for the session check to finish - otherwise a page refresh always bounced to /shop
    if (isLoading) return;
    if (!user) {
      navigate({ to: '/login' });
    } else if (user.role !== 'customer' && user.role !== 'seller') {
      navigate({ to: '/shop' });
    }
  }, [user, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if we're on a child route
  const isChildRoute = location.pathname !== '/customer';

  // If on a child route, only render the Outlet
  if (isChildRoute) {
    return <Outlet />;
  }

  const handleLogout = async () => {
    await logout();
  };

  const stats = [
    { label: 'Total Orders', value: String(orders.length), icon: FiShoppingCart, color: 'bg-blue-500' },
    { label: 'Wishlist Items', value: String(wishlistCount), icon: FiHeart, color: 'bg-red-500' },
    { label: 'Pending Deliveries', value: String(pendingDeliveries), icon: FiPackage, color: 'bg-orange-500' },
    { label: 'Delivered', value: String(orders.filter(o => o.status === 'delivered').length), icon: FiMapPin, color: 'bg-green-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back, {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Customer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl p-8 border border-border"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate({ to: '/orders' })}
              className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left">
              <p className="font-semibold text-foreground">My Orders</p>
              <p className="text-sm text-muted-foreground mt-1">View order history</p>
            </button>
            <button 
              onClick={() => navigate({ to: '/wishlist' })}
              className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left">
              <p className="font-semibold text-foreground">Wishlist</p>
              <p className="text-sm text-muted-foreground mt-1">View saved items</p>
            </button>
            <button 
              onClick={() => navigate({ to: '/customer/profile' })}
              className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-left flex items-center gap-3">
              <FiUser size={20} className="text-accent" />
              <div>
                <p className="font-semibold text-foreground">Profile Settings</p>
                <p className="text-sm text-muted-foreground mt-1">Edit profile</p>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
