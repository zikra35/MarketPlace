import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { orderApi, adminApi } from '@/lib/apiClient';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { Order } from '@/lib/apiTypes';

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: response, isLoading } = useQuery({
    queryKey: ['all-orders'],
    queryFn: () => adminApi.getAllOrders(),
  });

  const orders = response?.data || [];
  const filteredOrders = orders.filter(o => {
    const matchesStatus = !filterStatus || o.status === filterStatus;
    const matchesSearch = !searchTerm ||
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = Array.from(new Set(orders.map(o => o.status)));

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      adminApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => adminApi.deleteOrder(orderId),
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
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
            <h1 className="text-3xl font-bold text-foreground">Manage Orders</h1>
            <p className="text-sm text-muted-foreground mt-2">View and manage all orders on the platform</p>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-6 bg-card border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {filteredOrders.map((order: Order) => (
                <div
                  key={order._id}
                  className="bg-card rounded-lg border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="w-full p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                  >
                    <div className="text-left flex-1">
                      <p className="font-semibold text-foreground">Order #{order._id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customer.name} • ${order.total.toFixed(2)} • {new Date(order.createdAt || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={order.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(order._id, e.target.value);
                        }}
                        disabled={updateStatusMutation.isPending}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order._id);
                        }}
                        disabled={deleteOrderMutation.isPending}
                        className="p-2 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Delete order"
                      >
                        <FiTrash2 size={16} className="text-red-500" />
                      </button>
                      <FiChevronDown
                        size={20}
                        className={`text-muted-foreground transition-transform ${
                          expandedOrder === order._id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </button>

                  {expandedOrder === order._id && (
                    <div className="px-4 py-4 border-t border-border bg-muted/30">
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Shipping Address</p>
                          <p className="text-sm text-foreground">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Payment Method</p>
                          <p className="text-sm text-foreground capitalize">{order.paymentMethod}</p>
                        </div>
                        <div className="border-t border-border pt-3">
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Items</p>
                          <div className="space-y-2">
                            {order.items && order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-foreground">
                                  {item.productName || 'Product'} x{item.quantity}
                                </span>
                                <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="border-t border-border pt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="text-foreground">${order.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Delivery Fee:</span>
                            <span className="text-foreground">${order.deliveryFee.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                            <span className="text-foreground">Total:</span>
                            <span className="text-foreground">${order.total.toFixed(2)}</span>
                          </div>
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
