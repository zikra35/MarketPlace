import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiX } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { orderApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Order } from '@/lib/apiTypes';

export const Route = createFileRoute('/account/orders')({
  component: CustomerOrdersPage,
});

function CustomerOrdersPage() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['customer-orders'],
    queryFn: () => orderApi.getAll(),
  });

  const orders = response?.data || [];

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancel(orderId),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
    },
  });

  const handleCancel = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelMutation.mutate(orderId);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['customer']}>
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
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          </div>
        </div>

        {/* Orders */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet</p>
              <Button onClick={() => window.location.href = '/shop'}>
                Continue Shopping
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {orders.map((order: Order) => (
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
                        {new Date(order.createdAt).toLocaleDateString()} • ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
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
                        {order.status === 'pending' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(order._id)}
                            disabled={cancelMutation.isPending}
                            className="w-full"
                          >
                            <FiX className="mr-2" size={16} />
                            Cancel Order
                          </Button>
                        )}
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
