import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPackage, FiArrowLeft } from "react-icons/fi";
import { orderApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { ListSkeleton } from "@/components/SkeletonLoaders";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getAll();
        if (response.success && response.data) {
          setOrders(response.data);
        }
      } catch (error) {
        handleApiError(error, navigate);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>
        <ListSkeleton count={5} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <FiPackage className="mx-auto text-muted-foreground/30" size={80} />
          <h1 className="text-2xl font-bold text-foreground mt-6">No orders yet</h1>
          <p className="text-muted-foreground mt-2">Start shopping to place your first order.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders ({orders.length})</h1>
      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-xl shadow-card p-6"
          >
            <div className="grid md:grid-cols-4 gap-4 items-center">
              <div>
                <p className="text-xs text-muted-foreground">Order ID</p>
                <p className="font-semibold text-card-foreground">{order._id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-semibold text-card-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className={`font-semibold capitalize ${
                  order.status === 'delivered' ? 'text-success' :
                  order.status === 'cancelled' ? 'text-destructive' :
                  'text-accent'
                }`}>
                  {order.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold text-card-foreground">${(order.totalAmount || order.total || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Items: {order.items?.length || 0}</p>
              <div className="flex flex-wrap gap-2">
                {order.items?.slice(0, 3).map((item: any, index: number) => (
                  <div key={item._id || item.id || index} className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                    <img src={item.product?.image} alt={item.product?.name} className="w-6 h-6 rounded object-cover" />
                    <span className="text-muted-foreground">x{item.quantity}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    +{order.items.length - 3} more
                  </div>
                )}
              </div>
            </div>
            <Link
              to="/orders/$id"
              params={{ id: order._id }}
              className="mt-4 inline-block text-sm text-accent hover:underline font-medium"
            >
              View Details →
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
