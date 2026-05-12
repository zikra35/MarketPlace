import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { orderApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Order } from '@/lib/apiTypes';

export const Route = createFileRoute('/seller/orders')({
  component: SellerOrdersPage,
});

function SellerOrdersPage() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => orderApi.getAll(),
  });

  const orders = response?.data || [];
  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  const statuses = Array.from(new Set(orders.map(o => o.status)));

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
            <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          </div>
        </div>

        {/* Filter */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-foreground"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Orders */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No orders found</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {filteredOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-foreground">Order #{order._id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name} • ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                      <FiChevronDown
                        size={20}
                        className={`transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {expandedOrder === order._id && (
                    <div className="border-t border-border p-4 bg-muted/30">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-foreground">{item.name} x {item.quantity}</span>
                                <span className="text-foreground font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Shipping Address</h4>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                            {order.shippingAddress.country}
                          </p>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-border">
                          <span className="text-foreground">Total:</span>
                          <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
