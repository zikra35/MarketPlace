# Frontend-Backend Integration - Implementation Tasks

## Overview

This implementation plan breaks down the frontend-backend integration into discrete, testable tasks. Tasks are organized into logical phases: API layer setup, context updates, component updates, and testing.

## Tasks

- [x] 1. API Layer Setup
  - [x] 1.1 Create centralized axios instance (src/lib/api.ts)
  - [x] 1.2 Create error handling utility (src/lib/handleApiError.ts)
  - [x] 1.3 Create API service methods (src/lib/apiClient.ts)
  - [x] 1.4 Create environment configuration (.env.example)

- [x] 2. Skeleton Loaders & Loading Components
  - [x] 2.1 Create ProductCardSkeleton component
  - [x] 2.2 Create OrderRowSkeleton component
  - [x] 2.3 Create WishlistItemSkeleton component
  - [x] 2.4 Create ReviewCardSkeleton component
  - [x] 2.5 Create LoadingButton component

- [x] 3. Context Updates
  - [x] 3.1 Update AuthContext to use API
  - [x] 3.2 Update CartContext to use API
  - [x] 3.3 Update WishlistContext to use API

- [x] 4. Route Component Updates
  - [x] 4.1 Update Login route to use API
  - [x] 4.2 Update Register route to use API
  - [x] 4.3 Update Shop route to use API
  - [x] 4.4 Update ProductDetail route to use API
  - [x] 4.5 Update Checkout route to use API
  - [x] 4.6 Update Orders route to use API
  - [x] 4.7 Update Wishlist route to use API
  - [x] 4.8 Update Profile route to use API
  - [x] 4.9 Update Admin routes to use API

- [ ] 5. Remove Mock Data
  - [x] 5.1 Remove mock-data.ts imports from all components
  - [x] 5.2 Verify no hardcoded mock data remains

- [x] 6. Testing & Validation
  - [x] 6.1 Test authentication flow (register, login, logout)
  - [x] 6.2 Test product browsing and filtering
  - [x] 6.3 Test cart and checkout
  - [x] 6.4 Test wishlist operations
  - [x] 6.5 Test review creation and deletion
  - [x] 6.6 Test user profile management
  - [x] 6.7 Test admin dashboard
  - [x] 6.8 Test error handling and toasts
  - [x] 6.9 Test loading states and skeleton loaders
  - [x] 6.10 Test session expiration and redirect

## Task Details

### Task 1: API Layer Setup

#### 1.1 Create centralized axios instance (src/lib/api.ts)
- Import axios
- Read VITE_API_URL from environment (default: http://localhost:5000/api)
- Create axios instance with:
  - baseURL: VITE_API_URL
  - withCredentials: true
  - timeout: 10000
  - headers: { 'Content-Type': 'application/json' }
- Add request interceptor to log requests (optional)
- Add response interceptor to handle errors
- Export axios instance

#### 1.2 Create error handling utility (src/lib/handleApiError.ts)
- Create handleApiError(error) function
- Extract error message from response.data.message
- Show toast notification with error message
- Log to console.error with endpoint and full error
- Handle specific status codes:
  - 401: Redirect to /login, show "Session expired" toast
  - 403: Show "Permission denied" toast
  - 400/422: Show validation message from response
  - 500: Show "Server error" toast
  - Network error: Show "No internet connection" toast
- Export handleApiError function

#### 1.3 Create API service methods (src/lib/apiClient.ts)
- Create auth service:
  - register(email, password, name, role)
  - login(email, password)
  - logout()
  - refresh()
- Create product service:
  - getProducts(filters, page, limit, sort, search)
  - getProductById(id)
  - createProduct(data)
  - updateProduct(id, data)
  - deleteProduct(id)
  - getSellerProducts()
- Create order service:
  - createOrder(items, shippingAddress, paymentMethod)
  - getOrders()
  - getOrderById(id)
  - cancelOrder(id)
  - updateOrderStatus(id, status)
  - getAllOrders(filters, page, limit)
- Create wishlist service:
  - getWishlist()
  - addToWishlist(productId)
  - removeFromWishlist(productId)
- Create review service:
  - getReviews(productId, page, limit)
  - createReview(productId, rating, comment)
  - deleteReview(reviewId)
- Create user service:
  - getProfile()
  - updateProfile(name, address, storeName)
  - changePassword(currentPassword, newPassword)
- Create admin service:
  - getUsers(role, page, limit)
  - changeUserRole(userId, newRole)
  - deleteUser(userId)
  - approveSeller(sellerId)
  - rejectSeller(sellerId)
  - getPendingSellers(page, limit)
  - getStats()

#### 1.4 Create environment configuration (.env.example)
- Add VITE_API_URL=http://localhost:5000/api
- Add comments explaining each variable

### Task 2: Skeleton Loaders & Loading Components

#### 2.1 Create ProductCardSkeleton component
- Create skeleton that matches ProductCard layout
- Show placeholder for image, title, price, rating
- Use CSS or library for shimmer effect

#### 2.2 Create OrderRowSkeleton component
- Create skeleton that matches order row layout
- Show placeholders for order ID, date, status, total

#### 2.3 Create WishlistItemSkeleton component
- Create skeleton that matches wishlist item layout
- Show placeholder for product image, name, price

#### 2.4 Create ReviewCardSkeleton component
- Create skeleton that matches review layout
- Show placeholders for author, rating, comment

#### 2.5 Create LoadingButton component
- Accept isLoading prop
- Disable button when isLoading is true
- Show spinner inside button while loading
- Maintain button width to prevent layout shift

### Task 3: Context Updates

#### 3.1 Update AuthContext to use API
- Replace mock login/register with API calls
- Use apiClient.auth.login() and apiClient.auth.register()
- Store user data in context after successful auth
- Handle 401 errors by clearing context and redirecting
- Add logout function that calls apiClient.auth.logout()

#### 3.2 Update CartContext to use API
- Keep cart in context (frontend state)
- On checkout, call apiClient.order.createOrder() with cart items
- Clear cart after successful order
- Handle order creation errors

#### 3.3 Update WishlistContext to use API
- Replace mock wishlist with API calls
- Load wishlist on app mount using apiClient.wishlist.getWishlist()
- Add product using apiClient.wishlist.addToWishlist()
- Remove product using apiClient.wishlist.removeFromWishlist()
- Update context after each operation

### Task 4: Route Component Updates

#### 4.1 Update Login route to use API
- Replace mock login with apiClient.auth.login()
- Show loading state on submit button
- Show error toast on failure
- Redirect to /shop on success

#### 4.2 Update Register route to use API
- Replace mock register with apiClient.auth.register()
- Show loading state on submit button
- Show error toast on failure
- Redirect to /login on success

#### 4.3 Update Shop route to use API
- Replace mock products with apiClient.product.getProducts()
- Show skeleton loaders while loading
- Pass filters, page, limit, sort, search as query params
- Handle errors with toast

#### 4.4 Update ProductDetail route to use API
- Replace mock product with apiClient.product.getProductById()
- Replace mock reviews with apiClient.review.getReviews()
- Show skeleton loaders while loading
- Handle errors with toast

#### 4.5 Update Checkout route to use API
- Call apiClient.order.createOrder() on submit
- Show loading state on submit button
- Show error toast on failure
- Redirect to /orders on success

#### 4.6 Update Orders route to use API
- Replace mock orders with apiClient.order.getOrders()
- Show skeleton loaders while loading
- Handle errors with toast

#### 4.7 Update Wishlist route to use API
- Replace mock wishlist with context (which uses API)
- Show skeleton loaders while loading
- Handle errors with toast

#### 4.8 Update Profile route to use API
- Load profile using apiClient.user.getProfile()
- Update profile using apiClient.user.updateProfile()
- Change password using apiClient.user.changePassword()
- Show loading states on buttons
- Show success/error toasts

#### 4.9 Update Admin routes to use API
- Update admin dashboard to use apiClient.admin.getStats()
- Update user management to use apiClient.admin.getUsers()
- Update seller approval to use apiClient.admin.approveSeller()
- Update seller rejection to use apiClient.admin.rejectSeller()
- Show loading states and toasts

### Task 5: Remove Mock Data

#### 5.1 Remove mock-data.ts imports from all components
- Search for imports from 'src/lib/mock-data'
- Remove all imports
- Verify components use API instead

#### 5.2 Verify no hardcoded mock data remains
- Search for hardcoded product arrays
- Search for hardcoded user data
- Ensure all data comes from API

### Task 6: Testing & Validation

#### 6.1 Test authentication flow
- Register new user
- Login with credentials
- Verify user data in context
- Logout and verify redirect

#### 6.2 Test product browsing and filtering
- Load shop page
- Verify products load from API
- Test filtering by category
- Test search functionality
- Test sorting
- Test pagination

#### 6.3 Test cart and checkout
- Add products to cart
- Proceed to checkout
- Submit order
- Verify order created in backend
- Verify cart cleared

#### 6.4 Test wishlist operations
- Add product to wishlist
- Verify wishlist updated
- Remove product from wishlist
- Verify wishlist updated

#### 6.5 Test review creation and deletion
- Create review on product detail page
- Verify review appears
- Delete review
- Verify review removed

#### 6.6 Test user profile management
- Load profile page
- Update profile information
- Change password
- Verify updates saved

#### 6.7 Test admin dashboard
- Load admin dashboard
- View statistics
- View users
- Approve/reject sellers
- Verify operations succeed

#### 6.8 Test error handling and toasts
- Trigger 401 error (expired session)
- Verify redirect to /login
- Trigger 403 error
- Verify permission denied toast
- Trigger 400 error
- Verify validation message toast
- Trigger network error
- Verify offline toast

#### 6.9 Test loading states and skeleton loaders
- Load product grid
- Verify skeleton loaders show
- Verify content replaces skeleton
- Test button loading states
- Verify buttons disabled while loading

#### 6.10 Test session expiration and redirect
- Login successfully
- Wait for access token to expire (or mock expiration)
- Make API call
- Verify 401 response
- Verify redirect to /login
- Verify session expired toast

## Requirements Coverage

All 20 requirements are covered by these tasks:
- Req 1-5: Task 1 (API layer setup)
- Req 6-12: Task 3-4 (Context and route updates)
- Req 13-16: Task 1 (Error handling and interceptors)
- Req 17: Task 5 (Remove mock data)
- Req 18-20: Task 1 (Environment, toasts, logging)

## Implementation Order

1. Complete Task 1 (API layer) - foundation for everything
2. Complete Task 2 (Skeleton loaders) - UI components
3. Complete Task 3 (Context updates) - state management
4. Complete Task 4 (Route updates) - component integration
5. Complete Task 5 (Remove mock data) - cleanup
6. Complete Task 6 (Testing) - validation
