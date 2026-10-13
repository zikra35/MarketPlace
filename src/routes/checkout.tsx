import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { FiMapPin, FiCreditCard, FiCheck } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { LoadingButton } from "@/components/LoadingButton";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { formatPrice } from "@/lib/currency";
import { DELIVERY_CONFIG } from "@/lib/constants";

export const Route = createFileRoute("/checkout")({
  component: CheckoutRoute,
});

// Orders can only be placed by logged-in customers (the API rejects anyone else)
function CheckoutRoute() {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <CheckoutPage />
    </ProtectedRoute>
  );
}

function CheckoutPage() {
  const { items, subtotal, createOrder, isCreatingOrder } = useCart();
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Same rule as the cart page and the backend (orderController)
  const deliveryFee = subtotal > DELIVERY_CONFIG.FREE_THRESHOLD ? 0 : DELIVERY_CONFIG.STANDARD_FEE;
  const total = subtotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isCreatingOrder) return;
    const fullShippingAddress = `${fullName}, ${phone}, ${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}, ${zipCode}`;
    await createOrder(fullShippingAddress, paymentMethod);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Add some products before checking out.</p>
        <Link to="/shop" className="inline-block mt-6 px-6 py-3 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-orange-hover transition-colors">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Checkout</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><FiMapPin className="text-accent" /> Shipping Address</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input 
                type="text"
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
              <input 
                type="tel"
                placeholder="Phone Number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
              <input 
                type="text"
                placeholder="Address Line 1" 
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                className="md:col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
              <input 
                type="text"
                placeholder="Address Line 2 (Optional)" 
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                className="md:col-span-2 px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
              <input 
                type="text"
                placeholder="City" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
              <input 
                type="text"
                placeholder="Zip Code" 
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                required
                className="px-4 py-2.5 bg-muted rounded-lg text-sm text-foreground outline-none focus:ring-2 focus:ring-accent" 
              />
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-6">
            <h2 className="text-lg font-bold text-card-foreground flex items-center gap-2 mb-4"><FiCreditCard className="text-accent" /> Payment Method</h2>
            <div className="space-y-3">
              {[
                { id: "cod", label: "Cash on Delivery" },
                { id: "card", label: "Credit/Debit Card" },
                { id: "easypaisa", label: "Easypaisa / JazzCash" },
              ].map(method => (
                <label key={method.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${paymentMethod === method.id ? "border-accent bg-accent/5" : "border-border hover:border-accent/50"}`}>
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-[var(--accent)]" />
                  <span className="text-sm font-medium text-card-foreground">{method.label}</span>
                </label>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <LoadingButton 
            type="submit"
            isLoading={isCreatingOrder}
            className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl font-bold hover:bg-orange-hover transition-colors"
          >
            <FiCheck /> Confirm Order
          </LoadingButton>
        </form>

        {/* Summary */}
        <div>
          <div className="bg-card rounded-xl shadow-card p-6 space-y-4 sticky top-28">
            <h2 className="text-lg font-bold text-card-foreground">Order Summary</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.product.id || item.product._id || index} className="flex items-center gap-3 text-sm">
                  <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                  <span className="flex-1 line-clamp-1 text-card-foreground">{item.product.name}</span>
                  <span className="text-muted-foreground">x{item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span className={deliveryFee === 0 ? "text-success" : ""}>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span></div>
            </div>
            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
