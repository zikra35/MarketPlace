# Implementation Plan: Shop Sparkle Backend

## Overview

This implementation plan breaks down the Shop Sparkle Backend into discrete, testable coding tasks. The backend is a Node.js + Express + MongoDB REST API supporting three user roles (customer, seller, admin) with JWT authentication, product management, order processing, wishlist functionality, and review systems. Tasks are organized into logical phases with clear dependencies, starting with project setup and configuration, followed by database models, authentication, and feature implementations.

## Tasks

- [-] 1. Project Setup & Configuration
  - [x] 1.1 Initialize Node.js project with package.json
    - Create package.json with project metadata
    - Set up npm scripts for development, testing, and seeding
    - _Requirements: 39_

  - [x] 1.2 Install core dependencies
    - Install express, mongoose, bcryptjs, jsonwebtoken, express-validator, multer, cors, dotenv
    - Install dev dependencies: nodemon, jest, supertest
    - _Requirements: 39_

  - [x] 1.3 Create project directory structure
    - Create directories: src/models, src/controllers, src/routes, src/middleware, src/utils, src/config, src/seeds
    - Create main entry point: src/index.js
    - _Requirements: 39_

  - [x] 1.4 Set up environment configuration
    - Create .env.example with required variables (MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET, PORT, NODE_ENV)
    - Create src/config/env.js to load and validate environment variables
    - _Requirements: 39_

  - [x] 1.5 Configure MongoDB connection
    - Create src/config/database.js with connection logic
    - Implement connection error handling and retry logic
    - _Requirements: 39_

- [ ] 2. Database Models & Indexes
  - [x] 2.1 Create User model with role-based fields
    - Define User schema with email, password, name, role, address, storeName, sellerStatus
    - Add password hashing middleware using bcryptjs
    - Add indexes for email (unique) and role
    - _Requirements: 1, 2, 5, 6, 7, 8, 30, 31, 32_

  - [x] 2.2 Create Product model with seller reference and ratings
    - Define Product schema with name, price, category, brand, description, seller, rating, reviewCount, stockCount, image, condition, colors, sizes, specifications, featured/flashDeal/bestSeller/newArrival flags
    - Add indexes for seller, category, brand, rating, createdAt
    - _Requirements: 9, 10, 11, 12, 13, 14, 15, 47_

  - [x] 2.3 Create Order model with items array and status workflow
    - Define Order schema with customer, items (array with product details), shippingAddress, paymentMethod, status, subtotal, deliveryFee, total, createdAt
    - Add indexes for customer, status, createdAt
    - _Requirements: 16, 17, 18, 19, 20, 21, 22, 48_

  - [x] 2.4 Create Wishlist model with unique user constraint
    - Define Wishlist schema with user (unique), products array
    - Add unique index on user field
    - _Requirements: 23, 24, 25, 45_

  - [x] 2.5 Create Review model with compound unique index
    - Define Review schema with product, user, rating, comment, createdAt
    - Add compound unique index on product and user fields
    - Add indexes for product and user
    - _Requirements: 26, 27, 28, 46_

- [-] 3. Authentication & Authorization
  - [x] 3.1 Implement JWT token generation utility
    - Create src/utils/tokenUtils.js with functions to generate access and refresh tokens
    - Implement token signing with JWT_SECRET and JWT_REFRESH_SECRET
    - Set expiration times: 15 minutes for access token, 7 days for refresh token
    - _Requirements: 2, 3_

  - [x] 3.2 Create authenticate middleware
    - Create src/middleware/authenticate.js to verify access token from Authorization header
    - Extract user information and attach to request object
    - Return 401 if token is missing or invalid
    - _Requirements: 43_

  - [x] 3.3 Create requireRole middleware
    - Create src/middleware/requireRole.js to check user role
    - Support single role or array of roles
    - Return 403 if user role does not match
    - _Requirements: 44_

  - [x] 3.4 Implement auth controller
    - Create src/controllers/authController.js with functions: register, login, logout, refresh, createAdmin
    - Implement password hashing and comparison using bcryptjs
    - Implement refresh token cookie handling with httpOnly and secure flags
    - _Requirements: 1, 2, 3, 4, 5_

  - [x] 3.5 Create auth routes
    - Create src/routes/authRoutes.js with endpoints: POST /register, POST /login, POST /logout, POST /refresh, POST /admin/create
    - Apply input validation using express-validator
    - Apply authenticate and requireRole middleware where needed
    - _Requirements: 1, 2, 3, 4, 5, 42, 43, 44_

- [-] 4. User Management
  - [x] 4.1 Implement user controller
    - Create src/controllers/userController.js with functions: getProfile, updateProfile, changePassword
    - Implement profile update logic with role-specific field restrictions
    - Implement password change with current password verification
    - _Requirements: 6, 7, 8_

  - [x] 4.2 Create user routes
    - Create src/routes/userRoutes.js with endpoints: GET /me, PUT /me, PUT /me/password
    - Apply authenticate middleware to all routes
    - Apply input validation using express-validator
    - _Requirements: 6, 7, 8, 42, 43_

- [ ] 5. Product Management
  - [x] 5.1 Implement product controller - create and retrieve
    - Create src/controllers/productController.js with functions: createProduct, getAllProducts, getProductById
    - Implement filtering logic for category, brand, condition, price range, inStock, featured flags
    - Implement search functionality for name, brand, category (case-insensitive)
    - Implement sorting by price, rating, createdAt
    - Implement pagination with page and limit parameters
    - _Requirements: 9, 10, 11, 47_

  - [x] 5.2 Implement product controller - update and delete
    - Add functions to productController.js: updateProduct, deleteProduct
    - Implement seller ownership validation
    - Implement admin override for updates and deletes
    - _Requirements: 12, 13, 14_

  - [x] 5.3 Implement seller products endpoint
    - Add function to productController.js: getSellerProducts
    - Return all products where seller matches authenticated user
    - _Requirements: 15_

  - [x] 5.4 Create product routes
    - Create src/routes/productRoutes.js with endpoints: POST /products, GET /products, GET /products/:id, PUT /products/:id, DELETE /products/:id, GET /products/seller/mine
    - Apply authenticate middleware where needed
    - Apply requireRole middleware for seller/admin operations
    - Apply input validation using express-validator
    - _Requirements: 9, 10, 11, 12, 13, 14, 15, 42, 43, 44_

  - [x] 5.5 Set up Multer for image uploads
    - Create src/config/multer.js with file upload configuration
    - Configure storage destination and filename
    - Implement file type validation (images only)
    - Implement file size limits
    - _Requirements: 41_

- [-] 6. Order Management
  - [x] 6.1 Implement order controller - create and retrieve
    - Create src/controllers/orderController.js with functions: createOrder, getOrders, getOrderById
    - Implement stock validation and decrement logic
    - Implement delivery fee calculation (free if subtotal > $50, otherwise $5)
    - Implement order item details preservation (store product name, image, price, seller at order time)
    - _Requirements: 16, 17, 18, 19, 48, 50_

  - [x] 6.2 Implement order controller - cancellation and status updates
    - Add functions to orderController.js: cancelOrder, updateOrderStatus, getAllOrders
    - Implement stock restoration on cancellation
    - Implement status workflow validation
    - Implement admin-only status update
    - _Requirements: 20, 21, 22_

  - [x] 6.3 Create order routes
    - Create src/routes/orderRoutes.js with endpoints: POST /orders, GET /orders, GET /orders/:id, PATCH /orders/:id/cancel, PATCH /orders/:id/status, GET /orders/admin/all
    - Apply authenticate middleware to all routes
    - Apply requireRole middleware for customer/seller/admin operations
    - Apply input validation using express-validator
    - _Requirements: 16, 17, 18, 19, 20, 21, 22, 42, 43, 44_

- [-] 7. Wishlist Management
  - [x] 7.1 Implement wishlist controller
    - Create src/controllers/wishlistController.js with functions: getWishlist, addProduct, removeProduct
    - Implement automatic wishlist creation on first access
    - Implement duplicate product prevention
    - _Requirements: 23, 24, 25_

  - [x] 7.2 Create wishlist routes
    - Create src/routes/wishlistRoutes.js with endpoints: GET /wishlist, POST /wishlist/:productId, DELETE /wishlist/:productId
    - Apply authenticate middleware to all routes
    - Apply requireRole middleware for customer role
    - Apply input validation using express-validator
    - _Requirements: 23, 24, 25, 42, 43, 44_

- [-] 8. Review & Rating System
  - [x] 8.1 Implement review controller
    - Create src/controllers/reviewController.js with functions: createReview, getReviews, deleteReview
    - Implement product rating auto-calculation (average of all reviews)
    - Implement review count auto-calculation
    - Implement duplicate review prevention
    - _Requirements: 26, 27, 28_

  - [x] 8.2 Create review routes
    - Create src/routes/reviewRoutes.js with endpoints: POST /reviews/product/:productId, GET /reviews/product/:productId, DELETE /reviews/:reviewId
    - Apply authenticate middleware where needed
    - Apply input validation using express-validator
    - Implement pagination for review retrieval
    - _Requirements: 26, 27, 28, 42, 43, 44_

- [-] 9. Admin Dashboard
  - [x] 9.1 Implement admin controller - user management
    - Create src/controllers/adminController.js with functions: getUsers, changeUserRole, deleteUser
    - Implement role filtering
    - Implement pagination
    - _Requirements: 29, 30, 34_

  - [x] 9.2 Implement admin controller - seller management
    - Add functions to adminController.js: approveSeller, rejectSeller, getPendingSellers
    - Implement seller status workflow validation
    - _Requirements: 31, 32, 33_

  - [x] 9.3 Implement admin controller - statistics
    - Add function to adminController.js: getStats
    - Calculate total users, products, orders, revenue
    - Calculate user count by role
    - Calculate order count by status
    - _Requirements: 35_

  - [x] 9.4 Create admin routes
    - Create src/routes/adminRoutes.js with endpoints: GET /admin/users, PATCH /admin/users/:id/role, DELETE /admin/users/:id, PATCH /admin/sellers/:id/approve, PATCH /admin/sellers/:id/reject, GET /admin/sellers/pending, GET /admin/stats
    - Apply authenticate middleware to all routes
    - Apply requireRole middleware for admin role
    - Apply input validation using express-validator
    - _Requirements: 29, 30, 31, 32, 33, 34, 35, 42, 43, 44_

- [-] 10. Middleware & Error Handling
  - [x] 10.1 Create global error handler middleware
    - Create src/middleware/errorHandler.js
    - Implement error response format: { success: false, message: "error message" }
    - Implement HTTP status code mapping (400, 401, 403, 404, 500)
    - Implement error logging
    - _Requirements: 36_

  - [x] 10.2 Create 404 handler middleware
    - Create src/middleware/notFound.js
    - Return 404 with message "Route not found"
    - _Requirements: 37_

  - [x] 10.3 Set up CORS configuration
    - Create src/config/cors.js with CORS options
    - Allow requests from http://localhost:5173
    - Allow credentials (cookies) in cross-origin requests
    - Allow standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
    - _Requirements: 38_

  - [x] 10.4 Create response formatting utility
    - Create src/utils/responseFormatter.js with functions: successResponse, errorResponse
    - Implement consistent response format: { success: true/false, data: {...}, message: "..." }
    - _Requirements: 49_

- [-] 11. Application Setup & Integration
  - [x] 11.1 Create main application file
    - Create src/index.js with Express app initialization
    - Configure middleware: CORS, body parser, error handler, 404 handler
    - Mount all routes: auth, user, product, order, wishlist, review, admin
    - Start server on configured PORT
    - _Requirements: 38, 39_

  - [x] 11.2 Checkpoint - Verify all endpoints are accessible
    - Ensure all routes are properly mounted
    - Verify middleware chain is correct
    - Test basic connectivity to all endpoints
    - Ask the user if questions arise.

- [-] 12. Database Seeding
  - [x] 12.1 Create seed script
    - Create src/seeds/seed.js
    - Create default admin user (email: admin@sparkle.com, password: Admin@123)
    - Create default seller account (email: seller@sparkle.com, password: Seller@123)
    - _Requirements: 40_

  - [x] 12.2 Populate sample products from mock data
    - Import product data from frontend mock-data
    - Assign all products to default seller
    - Create 40 products in database (using all mock data)
    - _Requirements: 40_

  - [x] 12.3 Add seed script to package.json
    - Add npm script: "seed": "node src/seeds/seed.js"
    - Document seeding process in README
    - _Requirements: 40_

- [-] 13. Testing & Validation
  - [x] 13.1 Set up Jest testing framework
    - Create jest.config.js with test configuration
    - Create test directory structure: tests/unit, tests/integration
    - Configure test environment and coverage settings
    - _Requirements: 42_

  - [x] 13.2 Write authentication tests
    - Create tests/unit/auth.test.js
    - Test user registration with valid/invalid inputs
    - Test login with correct/incorrect credentials
    - Test token refresh functionality
    - Test logout functionality
    - _Requirements: 1, 2, 3, 4, 5, 42_

  - [x] 13.3 Write product management tests
    - Create tests/unit/product.test.js
    - Test product creation by seller
    - Test product filtering and pagination
    - Test product update/delete authorization
    - Test stock management
    - _Requirements: 9, 10, 11, 12, 13, 14, 15, 42_

  - [x] 13.4 Write order management tests
    - Create tests/unit/order.test.js
    - Test order creation with stock validation
    - Test delivery fee calculation
    - Test order cancellation and stock restoration
    - Test order status updates
    - _Requirements: 16, 17, 18, 19, 20, 21, 22, 42_

  - [x] 13.5 Write wishlist tests
    - Create tests/unit/wishlist.test.js
    - Test wishlist creation and retrieval
    - Test adding/removing products
    - Test duplicate prevention
    - _Requirements: 23, 24, 25, 42_

  - [x] 13.6 Write review tests
    - Create tests/unit/review.test.js
    - Test review creation and retrieval
    - Test rating calculation
    - Test duplicate review prevention
    - Test review deletion
    - _Requirements: 26, 27, 28, 42_

  - [x] 13.7 Write admin functionality tests
    - Create tests/unit/admin.test.js
    - Test user role changes
    - Test seller approval/rejection
    - Test statistics calculation
    - _Requirements: 29, 30, 31, 32, 33, 34, 35, 42_

  - [x] 13.8 Write integration tests
    - Create tests/integration/api.test.js
    - Test complete user workflows (register → login → browse → order → review)
    - Test seller workflows (register → create product → view orders)
    - Test admin workflows (approve sellers → view stats)
    - _Requirements: 1-50_

- [x] 14. Final Checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Verify code coverage meets minimum threshold (80%)
  - Ask the user if questions arise.

## Notes

- All tasks reference specific requirements for traceability
- Tasks are sequenced to minimize dependencies and enable parallel work
- Checkpoint tasks ensure incremental validation
- Testing tasks are marked optional (*) and can be skipped for faster MVP
- Each controller function should use the response formatting utility for consistent responses
- All endpoints should validate inputs using express-validator
- All protected endpoints should use authenticate and/or requireRole middleware
- Database indexes should be created in model definitions for optimal query performance
- Error handling should use the global error handler middleware
- CORS should be configured before mounting routes
