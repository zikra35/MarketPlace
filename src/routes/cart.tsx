import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";
import { productApi } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { DELIVERY_CONFIG, DEBOUNCE_CONFIG } from "@/lib/constants";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const deliveryFee = subtotal > DELIVERY_CONFIG.FREE_THRESHOLD ? 0 : DELIVERY_CONFIG.STANDARD_FEE;
  const total = subtotal + deliveryFee;

  // Validate stock on cart changes with debouncing
  useEffect(() => {
    const timer = setTimeout(async () => {
      for (const item of items) {
        try {
          const response = await productApi.getOne(item.product._id || item.product.id);
          if (response.success && response.data) {
            const product = response.data;
            const availableStock = product.stockCount || 0;
            
            if (item.quantity > availableStock) {
              if (availableStock === 0) {
                removeFromCart(item.product.id);
                toast.error(`${item.product.name} is out of stock and has been removed from cart`);
              } else {
                updateQuantity(item.product.id, availableStock);
                toast.warning(`${item.product.name} quantity adjusted to ${availableStock} (available stock)`);
              }
            }
          }
        } catch (error) {
          console.error('Stock validation error:', error);
        }
      }
    }, DEBOUNCE_CONFIG.STOCK_VALIDATION);

    return () => clearTimeout(timer);
  }, [items, removeFromCart, updateQuantity]);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <FiShoppingBag className="mx-auto text-muted-foreground/30" size={80} />
          <h1 className="text-2xl font-bold text-foreground mt-6">Your cart is empty</h1>
          <p className="text-muted-foreground mt-2">Discover amazing products and add them to your cart.</p>
          <Link to="/" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors">
            <FiArrowLeft /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart ({items.length} items)</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, i) => {
            const productId = item.product.id || item.product._id;
            return (
            <motion.div
              key={productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4 p-4 bg-card rounded-xl shadow-card"
            >
              <Link to="/products/$id" params={{ id: productId }} className="shrink-0">
                <img src={item.product.image} alt={item.product.name} className="w-24 h-24 object-cover rounded-lg" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/products/$id" params={{ id: productId }}>
                  <h3 className="font-semibold text-card-foreground line-clamp-1 hover:text-accent transition-colors">{item.product.name}</h3>
                </Link>
                <p className="text-xs text-muted-foreground mt-0.5">{typeof item.product.seller === 'object' ? item.product.seller.storeName || item.product.seller.name : item.product.seller} • {item.selectedColor}{item.selectedSize ? ` • ${item.selectedSize}` : ""}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(productId, Math.max(1, item.quantity - 1))} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"><FiMinus size={12} /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => {
                      const maxStock = item.product.stockCount || 1;
                      if (item.quantity + 1 > maxStock) {
                        toast.warning(`Only ${maxStock} available in stock`);
                        return;
                      }
                      updateQuantity(productId, item.quantity + 1);
                    }} className="w-7 h-7 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"><FiPlus size={12} /></button>
                  </div>
                  <span className="font-bold text-card-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              </div>
              <button 
                onClick={() => removeFromCart(productId)} 
                className="self-start p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <FiTrash2 size={16} />
              </button>
            </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4 sticky top-28">
            <h2 className="text-lg font-bold text-card-foreground">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="text-card-foreground">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? "text-success font-medium" : "text-card-foreground"}>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span></div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold text-card-foreground">Total</span>
              <span className="text-xl font-extrabold text-card-foreground">{formatPrice(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl font-bold hover:bg-orange-hover transition-colors"
            >
              Proceed to Checkout
            </Link>
            <Link to="/" className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
              <FiArrowLeft size={14} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
