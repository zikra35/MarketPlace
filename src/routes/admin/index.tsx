import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiUsers, FiPackage, FiShoppingCart, FiTrendingUp, FiCheck, FiX } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { adminApi, orderApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/currency';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache
  });

  const { data: sellersResponse, isLoading: sellersLoading } = useQuery({
    queryKey: ['pending-sellers'],
    queryFn: () => adminApi.getPendingSellers(),
    retry: 1,
  });

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => orderApi.getAll(),
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
  });

  const stats = statsResponse?.data;
  const pendingSellers = sellersResponse?.data || [];
  const allOrders = ordersResponse?.data || [];
  const recentOrders = allOrders.slice(0, 5);

  // Chart data - show last 6 months including current month
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    const monthNum = date.getMonth();
    const year = date.getFullYear();

    const monthRevenue = allOrders
      .filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === monthNum && oDate.getFullYear() === year;
      })
      .reduce((sum, o) => sum + o.total, 0);

    console.log(`[Chart] ${month} ${year}: ${monthRevenue} (${allOrders.filter(o => {
      const oDate = new Date(o.createdAt);
      return oDate.getMonth() === monthNum && oDate.getFullYear() === year;
    }).length} orders)`);

    return { month, revenue: monthRevenue };
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveSeller(id),
    onSuccess: () => {
      toast.success('Seller approved');
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => adminApi.rejectSeller(id),
    onSuccess: () => {
      toast.success('Seller rejected');
      queryClient.invalidateQueries({ queryKey: ['pending-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const isLoading = statsLoading || sellersLoading || ordersLoading;

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your marketplace</p>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            >
              {[
                { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: 'from-blue-500 to-blue-600' },
                { icon: FiPackage, label: 'Total Products', value: stats?.totalProducts || 0, color: 'from-purple-500 to-purple-600' },
                { icon: FiShoppingCart, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'from-green-500 to-green-600' },
                { icon: FiTrendingUp, label: 'Total Revenue', value: formatPrice(stats?.totalRevenue || 0), color: 'from-yellow-500 to-yellow-600' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={i}
                    className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                      </div>
                      <Icon size={32} className="opacity-50" />
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Admin Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border border-border p-6 mb-8"
          >
            <h2 className="text-lg font-semibold text-foreground mb-4">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => navigate({ to: '/admin/users' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">Manage Users</p>
                <p className="text-sm text-muted-foreground">View and manage all users</p>
              </button>
              <button onClick={() => navigate({ to: '/admin/products' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">Manage Products</p>
                <p className="text-sm text-muted-foreground">View and manage all products</p>
              </button>
              <button onClick={() => navigate({ to: '/admin/orders' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">Manage Orders</p>
                <p className="text-sm text-muted-foreground">View and manage all orders</p>
              </button>
              <button onClick={() => navigate({ to: '/admin/sellers' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">Approve Sellers</p>
                <p className="text-sm text-muted-foreground">Review pending seller applications</p>
              </button>
              <button onClick={() => navigate({ to: '/admin/reports' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">View Reports</p>
                <p className="text-sm text-muted-foreground">View analytics and reports</p>
              </button>
              <button onClick={() => navigate({ to: '/admin/settings' })} className="p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-left">
                <p className="font-semibold text-foreground">System Settings</p>
                <p className="text-sm text-muted-foreground">Configure system settings</p>
              </button>
            </div>
          </motion.div>



          {/* Revenue Chart */}
          {isLoading ? (
            <Skeleton className="h-96 w-full mb-8" />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg border border-border p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Revenue (Last 6 Months)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tickFormatter={(value) => `₨${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => formatPrice(value as number)}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="var(--accent)" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: '/admin/orders' })}>
                View All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Total</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-mono">{order._id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{order.customer.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
