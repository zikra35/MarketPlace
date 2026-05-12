// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'seller';
  storeName?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'customer' | 'seller' | 'admin';
  storeName?: string;
  address?: string;
  phone?: string;
  description?: string;
  sellerStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
  message?: string;
}

// Product Types
export interface Product {
  _id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  stockCount: number;
  condition: 'new' | 'used' | 'refurbished';
  colors?: string[];
  sizes?: string[];
  specifications?: Record<string, string>;
  image?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
  seller: {
    _id: string;
    name: string;
    storeName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: string;
  inStock?: boolean;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface ProductResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateProductRequest {
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  stockCount: number;
  condition: 'new' | 'used' | 'refurbished';
  colors?: string[];
  sizes?: string[];
  specifications?: Record<string, string>;
  image?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

// Order Types
export interface OrderItem {
  _id?: string;
  product: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  seller?: string;
}

export interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
}

// Review Types
export interface Review {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  customer: {
    _id: string;
    name: string;
  };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}

// Wishlist Types
export interface WishlistItem {
  _id: string;
  product: Product;
  addedAt: string;
}

// Admin Types
export interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingSellers: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
