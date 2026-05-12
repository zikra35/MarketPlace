import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { orderApi } from '@/lib/apiClient';
import { Skeleton } from '@/components/ui/skeleton';
import { formatPrice } from '@/lib/currency';
import type { Order } from '@/lib/apiTypes';

export const Route = createFileRoute('/seller/earnings')({
  component: SellerEarningsPage,
});

function SellerEarningsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => orderApi.getAll(),
  });

  const orders = response?.data || [];
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  // Calculate earnings
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const thisMonth = deliveredOrders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, o) => sum + o.total, 0);

  const thisWeek = deliveredOrders
    .filter(o => {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return orderDate >= weekAgo;
    })
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  const pendingEarnings = pendingOrders.reduce((sum, o) => sum + o.total, 0);

  // Chart data - monthly earnings for last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const month = date.toLocaleString('default', { month: 'short' });
    const monthNum = date.getMonth();
    const year = date.getFullYear();

    const monthEarnings = deliveredOrders
      .filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === monthNum && oDate.getFullYear() === year;
      })
      .reduce((sum, o) => sum + o.total, 0);

    return { month, earnings: monthEarnings };
  });

  return (
    <ProtectedRoute allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <FiArrowLeft size={18} />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
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
                { label: 'Total Earnings', value: formatPrice(totalEarnings), color: 'from-green-500 to-green-600' },
                { label: 'This Month', value: formatPrice(thisMonth), color: 'from-blue-500 to-blue-600' },
                { label: 'This Week', value: formatPrice(thisWeek), color: 'from-purple-500 to-purple-600' },
                { label: 'Pending Payout', value: formatPrice(pendingEarnings), color: 'from-yellow-500 to-yellow-600' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white`}
                >
                  <p className="text-sm opacity-90 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Chart */}
          {isLoading ? (
            <Skeleton className="h-96 w-full mb-8" />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card rounded-lg border border-border p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-foreground mb-4">Earnings (Last 6 Months)</h2>
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
                  <Bar dataKey="earnings" fill="var(--accent)" name="Earnings" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Orders Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-lg border border-border overflow-hidden"
          >
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Delivered Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Order ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Customer</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground font-mono">{order._id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{order.customer.name}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-semibold">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
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
