import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { wishlistApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
}

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [isAuthenticated]);

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.get();
      if (response.success && response.data && Array.isArray(response.data)) {
        setItems(response.data);
      } else {
        setItems([]); // Fallback to empty array if no data
      }
    } catch (error) {
      setItems([]); // Ensure items is always an array on error
      handleApiError(error, navigate);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const addToWishlist = useCallback(async (product: Product) => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.add(product.id);
      if (response.success) {
        setItems(prev => prev.some(i => i.id === product.id) ? prev : [...prev, product]);
      }
    } catch (error) {
      handleApiError(error, navigate);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.remove(productId);
      if (response.success) {
        setItems(prev => prev.filter(i => i.id !== productId));
      }
    } catch (error) {
      handleApiError(error, navigate);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const isInWishlist = useCallback((productId: string) => items.some(i => i.id === productId), [items]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist, totalItems: items.length, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
