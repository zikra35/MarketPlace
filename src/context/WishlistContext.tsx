import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { wishlistApi } from "@/lib/apiClient";
import { handleApiError } from "@/lib/handleApiError";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";

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
  [key: string]: any;
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

const productIdOf = (p: { id?: string; _id?: string } | null | undefined) => p?.id || p?._id || "";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  // The wishlist API is customer-only; sellers/admins would just get 403s
  const isCustomer = user?.role === "customer";

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await wishlistApi.get();
      setItems(response.success && Array.isArray(response.data) ? (response.data as Product[]) : []);
    } catch (error) {
      setItems([]);
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCustomer) {
      loadWishlist();
    } else {
      setItems([]);
    }
  }, [isCustomer, loadWishlist]);

  const addToWishlist = useCallback(async (product: Product) => {
    if (!user) {
      toast.error("Please log in to use your wishlist");
      navigate({ to: "/login" });
      return;
    }
    if (!isCustomer) {
      toast.error("Only customer accounts have a wishlist");
      return;
    }
    const productId = productIdOf(product);
    if (!productId) return;
    try {
      const response = await wishlistApi.add(productId);
      if (response.success) {
        setItems(response.data as Product[]);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      handleApiError(error);
    }
  }, [user, isCustomer, navigate]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    if (!productId) return;
    try {
      const response = await wishlistApi.remove(productId);
      if (response.success) {
        setItems(response.data as Product[]);
        toast.success("Removed from wishlist");
      }
    } catch (error) {
      handleApiError(error);
    }
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => !!productId && items.some(i => productIdOf(i) === productId),
    [items]
  );

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
