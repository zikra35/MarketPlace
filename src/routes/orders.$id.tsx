import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiArrowLeft, FiPackage, FiMapPin, FiCreditCard, FiCalendar } from "react-icons/fi";
import { orderApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/$id")({
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        const response = await orderApi.getOne(id);
        if (response.success && response.data) {
          setOrder(response.data);
        }
      } catch (error) {
        handleApiError(error, navigate);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <FiPackage className="mx-auto text-muted-foreground/30 mb-4" size={60} />
        <h1 className="text-2xl font-bold text-foreground mb-2">Order Not Found</h1>
        <p className="text-muted-foreground mb-6">We couldn't find the order you're looking for.</p>
        <Link to="/orders" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors">
          <FiArrowLeft /> Back to Orders
        </Link>
      </div>
    );
  }

  const statusColors = {
    pending: 'text-yellow-600 bg-yellow-100',
    confirmed: 'text-blue-600 bg-blue-100',
    shipped: 'text-blue-600 bg-blue-100',
    delivered: 'text-green-600 bg-green-100',
    cancelled: 'text-red-600 bg-red-100',
  };

  const paymentStatusColors = {
    pending: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-accent hover:underline mb-6">
        <FiArrowLeft /> Back to Orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order ID</p>
              <p className="text-2xl font-bold text-card-foreground">{order._id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColors[order.status as keyof typeof statusColors] || 'text-gray-600 bg-gray-100'}`}>
                {order.status}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FiCalendar className="text-accent" />
              <span>{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <FiCreditCard className="text-accent" />
              <span className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Payment Method</p>
              <p className="font-semibold text-card-foreground capitalize">{order.paymentMethod}</p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <FiPackage className="text-accent" /> Order Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item: any, index: number) => (
              <div key={item._id || item.id || index} className="flex items-center gap-4 pb-3 border-b border-border last:border-0">
                <img 
                  src={item.product?.image || 'https://via.placeholder.com/80'} 
                  alt={item.product?.name} 
                  className="w-16 h-16 rounded object-cover" 
                />
                <div className="flex-1">
                  <p className="font-semibold text-card-foreground">{item.product?.name || 'Unknown Product'}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-bold text-card-foreground">${(item.price || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-4 flex items-center gap-2">
            <FiMapPin className="text-accent" /> Shipping Address
          </h2>
          <p className="text-card-foreground whitespace-pre-wrap">{order.shippingAddress}</p>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-xl shadow-card p-6">
          <h2 className="text-lg font-bold text-card-foreground mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-card-foreground">${(order.total || order.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-card-foreground">Total</span>
                <span className="text-xl font-bold text-accent">${(order.total || order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
