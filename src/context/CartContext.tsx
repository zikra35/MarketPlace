import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { orderApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export interface Product {
  id: string;
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
  seller?: string;
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
  addToCart: (product: Product, color: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (shippingAddress: string, paymentMethod: string) => Promise<any>;
  totalItems: number;
  subtotal: number;
  isCreatingOrder: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const navigate = useNavigate();

  const addToCart = useCallback((product: Product, color: string, size?: string) => {
    const productId = product.id || (product as any)._id;
    setItems(prev => {
      const existing = prev.find(i => {
        const itemId = i.product.id || (i.product as any)._id;
        return itemId === productId && i.selectedColor === color && i.selectedSize === size;
      });
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1, selectedColor: color, selectedSize: size }];
    });
    toast.success('Added to cart!');
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prev => prev.filter(i => {
      const itemId = i.product.id || i.product._id;
      return itemId !== productId;
    }));
    toast.success('Removed from cart!');
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    setItems(prev => prev.map(i => {
      const itemId = i.product.id || i.product._id;
      return itemId === productId ? { ...i, quantity } : i;
    }));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setItems([]), []);

  const createOrder = useCallback(async (shippingAddress: string, paymentMethod: string) => {
    try {
      setIsCreatingOrder(true);
      
      const orderItems = items.map(item => ({
        productId: item.product.id || (item.product as any)._id,
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
      handleApiError(error, navigate);
      throw error;
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
