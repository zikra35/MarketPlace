import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { orderApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface Product {
  id: string;
  _id?: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  // Extended properties from mock-data
  originalPrice?: number;
  discount?: number;
  reviewCount?: number;
  seller?: string | { _id?: string; name?: string; storeName?: string };
  sellerVerified?: boolean;
  brand?: string;
  condition?: "New" | "Used" | "Refurbished";
  inStock?: boolean;
  stockCount?: number;
  colors?: string[];
  sizes?: string[];
  description?: string;
  specifications?: Record<string, string>;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, color: string, size?: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (shippingAddress: string, paymentMethod: string) => Promise<any>;
  totalItems: number;
  subtotal: number;
  isCreatingOrder: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "marketplace-cart";

const productIdOf = (p: { id?: string; _id?: string }) => p.id || p._id || "";

function loadStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const navigate = useNavigate();

  // Restore the cart after mount (not during render) so server and client HTML match
  useEffect(() => {
    setItems(loadStoredCart());
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable (private mode etc.) - cart just won't survive a reload
    }
  }, [items, hasLoaded]);

  const addToCart = useCallback((product: Product, color: string, size?: string, quantity: number = 1) => {
    const productId = productIdOf(product);
    const normalized = { ...product, id: productId };
    setItems(prev => {
      const existing = prev.find(i =>
        productIdOf(i.product) === productId && i.selectedColor === color && i.selectedSize === size
      );
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product: normalized, quantity, selectedColor: color, selectedSize: size }];
    });
    toast.success('Added to cart!');
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => productIdOf(i.product) !== productId));
    toast.success('Removed from cart!');
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => productIdOf(i.product) === productId ? { ...i, quantity } : i));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const createOrder = useCallback(async (shippingAddress: string, paymentMethod: string) => {
    try {
      setIsCreatingOrder(true);
      
      const orderItems = items.map(item => ({
        productId: productIdOf(item.product),
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      }));

      const response = await orderApi.place({
        items: orderItems,
        shippingAddress,
        paymentMethod,
      });

      if (response.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate({ to: '/orders' });
        return response.data;
      }
    } catch (error) {
      // The API interceptor already showed the error toast (e.g. insufficient stock)
      handleApiError(error);
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  }, [items, clearCart, navigate]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, createOrder, totalItems, subtotal, isCreatingOrder }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
