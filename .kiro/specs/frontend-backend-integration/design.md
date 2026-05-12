# Frontend-Backend Integration - Design Document

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend                            │
│  (src/lib/api.ts - Centralized Axios Instance)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │ (credentials: 'include')
                     │ (httpOnly cookies)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Express Backend API                             │
│  (http://localhost:5000/api)                                │
│  - Authentication endpoints                                  │
│  - Product endpoints                                         │
│  - Order endpoints                                           │
│  - Wishlist endpoints                                        │
│  - Review endpoints                                          │
│  - Admin endpoints                                           │
└─────────────────────────────────────────────────────────────┘
```

## API Integration Layer

### 1. Centralized Axios Instance (src/lib/api.ts)

```typescript
// Configuration
- baseURL: VITE_API_URL (default: http://localhost:5000/api)
- withCredentials: true (include cookies)
- timeout: 10000ms
- headers: { 'Content-Type': 'application/json' }

// Interceptors
- Request: Add auth headers if needed
- Response: Handle 401, 403, 4xx, 5xx errors
- Error: Call handleApiError utility
```

### 2. Error Handling Utility (src/lib/handleApiError.ts)

```typescript
handleApiError(error) {
  - Extract error message from response
  - Show toast notification
  - Log to console.error
  - Handle specific status codes:
    - 401: Redirect to /login
    - 403: Show permission denied message
    - 400/422: Show validation message
    - 500: Show server error message
    - Network: Show offline message
}
```

### 3. Loading State Management

```typescript
// Per-element loading states
- Button: isLoading boolean
- Section: isLoading boolean
- Form: isSubmitting boolean

// Skeleton Loaders
- ProductCard skeleton
- OrderRow skeleton
- WishlistItem skeleton
- ReviewCard skeleton
```

### 4. Authentication Flow

```
User Registration
  ↓
POST /auth/register
  ↓
Backend sets httpOnly cookies
  ↓
Frontend stores user in context
  ↓
Redirect to /login

User Login
  ↓
POST /auth/login
  ↓
Backend sets httpOnly cookies
  ↓
Frontend stores user in context
  ↓
Redirect to /shop

Session Expiration
  ↓
API returns 401
  ↓
Axios interceptor catches 401
  ↓
Clear user context
  ↓
Redirect to /login
  ↓
Show toast "Session expired"
```

## File Structure

```
src/
├── lib/
│   ├── api.ts                    # Centralized axios instance
│   ├── handleApiError.ts         # Error handling utility
│   ├── apiClient.ts              # API service methods
│   └── mock-data.ts              # REMOVED (no mock data)
├── components/
│   ├── SkeletonLoaders.tsx       # Skeleton components
│   ├── LoadingButton.tsx         # Button with loading state
│   └── ... (other components)
├── context/
│   ├── AuthContext.tsx           # User auth state
│   ├── CartContext.tsx           # Cart state (uses API)
│   └── WishlistContext.tsx       # Wishlist state (uses API)
├── routes/
│   ├── Login.tsx                 # Uses /auth/login
│   ├── Register.tsx              # Uses /auth/register
│   ├── Shop.tsx                  # Uses /products
│   ├── ProductDetail.tsx         # Uses /products/:id, /reviews
│   ├── Checkout.tsx              # Uses /orders
│   ├── Orders.tsx                # Uses /orders
│   ├── Wishlist.tsx              # Uses /wishlist
│   └── ... (other routes)
├── .env.example                  # VITE_API_URL=http://localhost:5000/api
└── .env                          # (local, not committed)
```

## API Endpoints Used

### Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh

### Products
- GET /products (with filters, pagination, search, sort)
- GET /products/:id
- POST /products (seller only)
- PUT /products/:id (seller/admin)
- DELETE /products/:id (seller/admin)
- GET /products/seller/mine (seller only)

### Orders
- POST /orders (customer only)
- GET /orders
- GET /orders/:id
- PATCH /orders/:id/cancel
- PATCH /orders/:id/status (admin only)
- GET /orders/admin/all (admin only)

### Wishlist
- GET /wishlist
- POST /wishlist/:productId
- DELETE /wishlist/:productId

### Reviews
- GET /reviews/product/:productId
- POST /reviews/product/:productId
- DELETE /reviews/:reviewId

### Users
- GET /users/me
- PUT /users/me
- PUT /users/me/password

### Admin
- GET /admin/users
- PATCH /admin/users/:id/role
- DELETE /admin/users/:id
- PATCH /admin/sellers/:id/approve
- PATCH /admin/sellers/:id/reject
- GET /admin/sellers/pending
- GET /admin/stats

## Response Format

All API responses follow this format:

```typescript
// Success
{
  success: true,
  data: { ... },
  message?: "Optional message"
}

// Error
{
  success: false,
  message: "Error message"
}
```

## Error Handling Flow

```
API Call
  ↓
Response received
  ↓
Is success: true?
  ├─ YES: Return data
  └─ NO: Check status code
         ├─ 401: Redirect to /login + toast
         ├─ 403: Toast "Permission denied"
         ├─ 400/422: Toast validation message
         ├─ 500: Toast "Server error"
         └─ Network: Toast "No internet"
  ↓
Log to console.error
  ↓
Show toast notification
```

## Loading State Flow

```
User Action (click button, load page)
  ↓
Set isLoading = true
  ↓
Disable button / Show skeleton
  ↓
Make API call
  ↓
Response received
  ↓
Set isLoading = false
  ↓
Enable button / Show content
```

## Security Considerations

1. **httpOnly Cookies**: Tokens stored in httpOnly cookies, not accessible by JavaScript
2. **CORS**: Backend configured to allow requests from http://localhost:5173
3. **Credentials**: All requests include credentials: 'include' to send cookies
4. **No Mock Data**: No fallback to mock data if backend is unavailable
5. **Session Management**: Automatic redirect to /login on 401
6. **Error Messages**: Sensitive errors logged to console, user-friendly messages in toasts

## Environment Configuration

```
Development:
VITE_API_URL=http://localhost:5000/api

Production:
VITE_API_URL=https://api.shopsparkle.com/api
```

## Dependencies

```json
{
  "axios": "^1.6.0",
  "react-hot-toast": "^2.4.0",
  "react": "^18.0.0",
  "react-router-dom": "^6.0.0"
}
```

## Implementation Order

1. Create src/lib/api.ts (axios instance)
2. Create src/lib/handleApiError.ts (error handling)
3. Create src/lib/apiClient.ts (API service methods)
4. Create skeleton loader components
5. Update AuthContext to use API
6. Update CartContext to use API
7. Update WishlistContext to use API
8. Update all route components to use API
9. Remove mock-data.ts imports
10. Test all endpoints
