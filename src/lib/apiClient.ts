import api from './api';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Product,
  ProductFilters,
  ProductResponse,
  CreateProductRequest,
  Order,
  CreateOrderRequest,
  Review,
  CreateReviewRequest,
  WishlistItem,
  Stats,
  ApiResponse,
  User,
} from './apiTypes';

// Auth API
export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<any, ApiResponse<User>>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<any, ApiResponse<User>>('/auth/login', data),

  logout: () =>
    api.post<any, ApiResponse<null>>('/auth/logout'),

  getMe: () =>
    api.get<any, ApiResponse<User>>('/users/me'),
};

// Product API
export const productApi = {
  getAll: (filters?: ProductFilters) =>
    api.get<any, ApiResponse<Product[]>>('/products', { params: filters }),

  getOne: (id: string) =>
    api.get<any, ApiResponse<Product>>(`/products/${id}`),

  create: (data: CreateProductRequest) =>
    api.post<any, ApiResponse<Product>>('/products', data),

  update: (id: string, data: Partial<CreateProductRequest>) =>
    api.put<any, ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<any, ApiResponse<null>>(`/products/${id}`),

  getMine: () =>
    api.get<any, ApiResponse<Product[]>>('/products/seller/mine'),
};

// Order API
export const orderApi = {
  place: (data: CreateOrderRequest) =>
    api.post<any, ApiResponse<Order>>('/orders', data),

  getAll: (filters?: any) =>
    api.get<any, ApiResponse<Order[]>>('/orders', { params: filters }),

  getOne: (id: string) =>
    api.get<any, ApiResponse<Order>>(`/orders/${id}`),

  cancel: (id: string) =>
    api.patch<any, ApiResponse<Order>>(`/orders/${id}/cancel`),

  updateStatus: (id: string, status: string) =>
    api.patch<any, ApiResponse<Order>>(`/orders/${id}/status`, { newStatus: status }),
};

// Wishlist API
export const wishlistApi = {
  get: () =>
    api.get<any, ApiResponse<WishlistItem[]>>('/wishlist'),

  add: (productId: string) =>
    api.post<any, ApiResponse<WishlistItem>>(`/wishlist/${productId}`),

  remove: (productId: string) =>
    api.delete<any, ApiResponse<null>>(`/wishlist/${productId}`),
};

// Review API
export const reviewApi = {
  getByProduct: (productId: string) =>
    api.get<any, ApiResponse<Review[]>>(`/reviews/product/${productId}`),

  add: (productId: string, data: CreateReviewRequest) =>
    api.post<any, ApiResponse<Review>>(`/reviews/product/${productId}`, data),

  delete: (reviewId: string) =>
    api.delete<any, ApiResponse<null>>(`/reviews/${reviewId}`),
};

// Admin API
export const adminApi = {
  getStats: () =>
    api.get<any, ApiResponse<Stats>>('/admin/stats'),

  getUsers: (filters?: any) =>
    api.get<any, ApiResponse<User[]>>('/admin/users', { params: filters }),

  getPendingSellers: () =>
    api.get<any, ApiResponse<User[]>>('/admin/sellers/pending'),

  getAllSellers: (filters?: any) =>
    api.get<any, ApiResponse<User[]>>('/admin/sellers', { params: filters }),

  getSellerDetails: (id: string) =>
    api.get<any, ApiResponse<any>>(`/admin/sellers/${id}`),

  approveSeller: (id: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/approve`),

  rejectSeller: (id: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/reject`),

  warnSeller: (id: string, reason?: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/warn`, { reason }),

  removeWarning: (id: string, warningIndex: number) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/warning/${warningIndex}/remove`),

  suspendSeller: (id: string, reason?: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/suspend`, { reason }),

  unsuspendSeller: (id: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/sellers/${id}/unsuspend`),

  deleteSeller: (id: string) =>
    api.delete<any, ApiResponse<null>>(`/admin/sellers/${id}`),

  getAllOrders: (filters?: any) =>
    api.get<any, ApiResponse<Order[]>>('/admin/orders', { params: filters }),

  updateOrderStatus: (id: string, status: string) =>
    api.patch<any, ApiResponse<Order>>(`/admin/orders/${id}/status`, { newStatus: status }),

  deleteOrder: (id: string) =>
    api.delete<any, ApiResponse<null>>(`/admin/orders/${id}`),

  changeUserRole: (id: string, role: string) =>
    api.patch<any, ApiResponse<User>>(`/admin/users/${id}/role`, { newRole: role }),

  deleteUser: (id: string) =>
    api.delete<any, ApiResponse<null>>(`/admin/users/${id}`),
};

// User API
export const userApi = {
  updateProfile: (data: Partial<User>) =>
    api.put<any, ApiResponse<User>>('/users/me', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<any, ApiResponse<null>>('/users/me/password', { currentPassword, newPassword }),
};
