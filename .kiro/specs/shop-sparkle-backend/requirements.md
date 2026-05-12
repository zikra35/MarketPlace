# Shop Sparkle Backend - Requirements Document

## Introduction

Shop Sparkle Backend is a comprehensive Node.js + Express + MongoDB REST API that powers the Shop Sparkle e-commerce platform. The system supports three user roles (customer, seller, admin) with role-based access control, complete product catalog management, order processing, wishlist functionality, and review/rating systems. The backend handles authentication via JWT tokens, manages seller approval workflows, processes orders with inventory management, and provides admin dashboards for system oversight.

## Glossary

- **System**: The Shop Sparkle Backend API server
- **User**: Any registered account holder (customer, seller, or admin)
- **Customer**: A user role with permissions to browse products, place orders, and manage wishlists
- **Seller**: A user role with permissions to create and manage products, view orders containing their products, and manage their store
- **Admin**: A user role with permissions to manage all users, products, orders, and view system statistics
- **JWT**: JSON Web Token used for stateless authentication
- **Access_Token**: Short-lived JWT (15 minutes) used for API requests
- **Refresh_Token**: Long-lived JWT (7 days) stored in httpOnly cookie for obtaining new access tokens
- **Seller_Status**: Workflow state for seller accounts (pending, approved, rejected)
- **Order_Status**: Workflow state for orders (pending, confirmed, shipped, delivered, cancelled)
- **Product_Rating**: Auto-calculated average rating derived from all reviews for a product
- **Review_Count**: Auto-calculated count of reviews for a product
- **Stock_Count**: Quantity of a product available for purchase
- **Delivery_Fee**: Calculated shipping cost (free if order subtotal exceeds $50)
- **Wishlist**: A collection of products saved by a customer for future purchase
- **Inventory**: The stock management system tracking product quantities
- **Payload**: The data sent in an HTTP request body
- **HTTP_Status_Code**: Standard HTTP response code (200, 201, 400, 401, 403, 404, 500, etc.)

## Requirements

### Requirement 1: User Registration with Role Selection

**User Story:** As a new user, I want to register an account and select my role (customer or seller), so that I can access the platform with appropriate permissions.

#### Acceptance Criteria

1. WHEN a POST request is sent to /register with email, password, name, and role (customer or seller), THE System SHALL validate all required fields are present and non-empty
2. WHEN the email already exists in the database, THE System SHALL return HTTP 400 with message "Email already registered"
3. WHEN the password is less than 8 characters, THE System SHALL return HTTP 400 with message "Password must be at least 8 characters"
4. WHEN all validations pass, THE System SHALL hash the password using bcrypt, create a new User document with role set to the provided value, and return HTTP 201 with the created user (excluding password and refreshToken)
5. WHERE the role is seller, THE System SHALL set sellerStatus to "pending" and initialize storeName as empty string
6. WHERE the role is customer, THE System SHALL omit sellerStatus and storeName fields

### Requirement 2: User Login with JWT Token Generation

**User Story:** As a registered user, I want to log in with my credentials, so that I can access protected resources.

#### Acceptance Criteria

1. WHEN a POST request is sent to /login with email and password, THE System SHALL validate both fields are present
2. WHEN the email does not exist in the database, THE System SHALL return HTTP 401 with message "Invalid credentials"
3. WHEN the password does not match the stored hash, THE System SHALL return HTTP 401 with message "Invalid credentials"
4. WHEN credentials are valid, THE System SHALL generate an Access_Token (15 minute expiration) and Refresh_Token (7 day expiration)
5. WHEN credentials are valid, THE System SHALL set the Refresh_Token in an httpOnly cookie with secure flag and return HTTP 200 with Access_Token and user data (excluding password and refreshToken)

### Requirement 3: Token Refresh Endpoint

**User Story:** As an authenticated user with an expired access token, I want to refresh my token, so that I can continue using the API without re-logging in.

#### Acceptance Criteria

1. WHEN a POST request is sent to /refresh without a valid Refresh_Token in httpOnly cookie, THE System SHALL return HTTP 401 with message "Refresh token missing or invalid"
2. WHEN the Refresh_Token is expired or invalid, THE System SHALL return HTTP 401 with message "Refresh token expired"
3. WHEN a valid Refresh_Token is provided, THE System SHALL generate a new Access_Token (15 minute expiration) and return HTTP 200 with the new Access_Token

### Requirement 4: User Logout

**User Story:** As an authenticated user, I want to log out, so that my session is terminated.

#### Acceptance Criteria

1. WHEN a POST request is sent to /logout with a valid Access_Token, THE System SHALL clear the Refresh_Token cookie and return HTTP 200 with message "Logged out successfully"

### Requirement 5: Admin User Creation

**User Story:** As an admin, I want to create new admin accounts, so that I can grant administrative privileges to other users.

#### Acceptance Criteria

1. WHEN a POST request is sent to /admin/create with email, password, and name by an authenticated admin user, THE System SHALL validate the requester has admin role
2. IF the requester does not have admin role, THEN THE System SHALL return HTTP 403 with message "Unauthorized"
3. WHEN all validations pass, THE System SHALL create a new User with role set to "admin" and return HTTP 201 with the created user

### Requirement 6: User Profile Retrieval

**User Story:** As an authenticated user, I want to view my profile information, so that I can see my account details.

#### Acceptance Criteria

1. WHEN a GET request is sent to /me with a valid Access_Token, THE System SHALL return HTTP 200 with the authenticated user's profile (excluding password and refreshToken)
2. WHEN the Access_Token is missing or invalid, THE System SHALL return HTTP 401 with message "Unauthorized"

### Requirement 7: User Profile Update

**User Story:** As an authenticated user, I want to update my profile information, so that I can keep my account details current.

#### Acceptance Criteria

1. WHEN a PUT request is sent to /me with name, address, and/or storeName fields by an authenticated user, THE System SHALL validate all provided fields are non-empty strings
2. WHERE the authenticated user has seller role, THE System SHALL allow updates to name, address, and storeName
3. WHERE the authenticated user has customer role, THE System SHALL allow updates to name and address only
4. WHEN all validations pass, THE System SHALL update the User document and return HTTP 200 with the updated user profile

### Requirement 8: Password Change

**User Story:** As an authenticated user, I want to change my password, so that I can maintain account security.

#### Acceptance Criteria

1. WHEN a PUT request is sent to /me/password with currentPassword and newPassword by an authenticated user, THE System SHALL validate both fields are present and non-empty
2. WHEN the currentPassword does not match the stored password hash, THE System SHALL return HTTP 401 with message "Current password is incorrect"
3. WHEN the newPassword is less than 8 characters, THE System SHALL return HTTP 400 with message "New password must be at least 8 characters"
4. WHEN all validations pass, THE System SHALL hash the newPassword using bcrypt, update the User document, and return HTTP 200 with message "Password changed successfully"

### Requirement 9: Product Creation by Seller

**User Story:** As a seller, I want to create new products in my store, so that I can list items for sale.

#### Acceptance Criteria

1. WHEN a POST request is sent to /products with product data by an authenticated seller, THE System SHALL validate the requester has seller role
2. IF the requester does not have seller role, THEN THE System SHALL return HTTP 403 with message "Only sellers can create products"
3. WHEN required fields (name, price, category, brand, description) are missing, THE System SHALL return HTTP 400 with message listing missing fields
4. WHEN price is not a positive number, THE System SHALL return HTTP 400 with message "Price must be a positive number"
5. WHEN all validations pass, THE System SHALL create a Product document with seller reference, initialize rating to 0, reviewCount to 0, and return HTTP 201 with the created product

### Requirement 10: Product Retrieval with Filtering and Pagination

**User Story:** As a customer, I want to browse products with filters and pagination, so that I can find items I'm interested in.

#### Acceptance Criteria

1. WHEN a GET request is sent to /products with optional query parameters, THE System SHALL return HTTP 200 with paginated product list
2. WHERE category query parameter is provided, THE System SHALL filter products by exact category match
3. WHERE brand query parameter is provided, THE System SHALL filter products by exact brand match
4. WHERE condition query parameter is provided, THE System SHALL filter products by condition (new, like-new, good, fair)
5. WHERE priceMin and priceMax query parameters are provided, THE System SHALL filter products with price between these values (inclusive)
6. WHERE inStock query parameter is true, THE System SHALL filter products with stockCount greater than 0
7. WHERE featured, flashDeal, bestSeller, or newArrival query parameters are true, THE System SHALL filter products with matching flags set to true
8. WHERE search query parameter is provided, THE System SHALL filter products where name, brand, or category contains the search term (case-insensitive)
9. WHERE sort query parameter is provided, THE System SHALL sort by price (asc/desc), rating (desc), or newest (desc by createdAt)
10. WHERE page and limit query parameters are provided, THE System SHALL return the specified page with the specified number of items per page (default page=1, limit=10)
11. THE System SHALL return pagination metadata including currentPage, totalPages, totalItems, and itemsPerPage

### Requirement 11: Product Retrieval by ID

**User Story:** As a customer, I want to view detailed information about a specific product, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. WHEN a GET request is sent to /products/:id with a valid product ID, THE System SHALL return HTTP 200 with the product details including seller information
2. WHEN the product ID does not exist, THE System SHALL return HTTP 404 with message "Product not found"

### Requirement 12: Product Update by Seller

**User Story:** As a seller, I want to update my product information, so that I can keep product details current.

#### Acceptance Criteria

1. WHEN a PUT request is sent to /products/:id with product data by an authenticated seller, THE System SHALL validate the requester has seller role
2. WHEN the product does not exist, THE System SHALL return HTTP 404 with message "Product not found"
3. WHEN the product seller does not match the authenticated user, THE System SHALL return HTTP 403 with message "You can only edit your own products"
4. WHEN all validations pass, THE System SHALL update the Product document with provided fields and return HTTP 200 with the updated product

### Requirement 13: Product Deletion by Seller

**User Story:** As a seller, I want to delete my products, so that I can remove items from my store.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to /products/:id by an authenticated seller, THE System SHALL validate the requester has seller role
2. WHEN the product does not exist, THE System SHALL return HTTP 404 with message "Product not found"
3. WHEN the product seller does not match the authenticated user, THE System SHALL return HTTP 403 with message "You can only delete your own products"
4. WHEN all validations pass, THE System SHALL delete the Product document and return HTTP 200 with message "Product deleted successfully"

### Requirement 14: Admin Product Management

**User Story:** As an admin, I want to manage all products in the system, so that I can maintain product quality and compliance.

#### Acceptance Criteria

1. WHEN a PUT request is sent to /products/:id by an authenticated admin, THE System SHALL allow updates to any product regardless of seller
2. WHEN a DELETE request is sent to /products/:id by an authenticated admin, THE System SHALL allow deletion of any product

### Requirement 15: Seller View Own Products

**User Story:** As a seller, I want to view all my products, so that I can manage my inventory.

#### Acceptance Criteria

1. WHEN a GET request is sent to /products/seller/mine by an authenticated seller, THE System SHALL return HTTP 200 with all products where seller matches the authenticated user
2. WHEN the authenticated user is not a seller, THE System SHALL return HTTP 403 with message "Only sellers can access this endpoint"

### Requirement 16: Order Creation with Stock Validation

**User Story:** As a customer, I want to place an order with items from my cart, so that I can purchase products.

#### Acceptance Criteria

1. WHEN a POST request is sent to /orders with items array, shippingAddress, and paymentMethod by an authenticated customer, THE System SHALL validate the requester has customer role
2. WHEN items array is empty, THE System SHALL return HTTP 400 with message "Order must contain at least one item"
3. WHEN any item references a non-existent product, THE System SHALL return HTTP 404 with message "Product not found"
4. WHEN any item quantity exceeds the product's stockCount, THE System SHALL return HTTP 400 with message "Insufficient stock for product: [productName]"
5. WHEN all validations pass, THE System SHALL decrement stockCount for each product by the ordered quantity
6. WHEN all validations pass, THE System SHALL calculate subtotal from item prices and quantities, calculate deliveryFee (free if subtotal > 50, otherwise $5), calculate total, and create Order document with status "pending"
7. WHEN Order is created, THE System SHALL return HTTP 201 with the created order including all details

### Requirement 17: Order Retrieval by Customer

**User Story:** As a customer, I want to view my orders, so that I can track my purchases.

#### Acceptance Criteria

1. WHEN a GET request is sent to /orders by an authenticated customer, THE System SHALL return HTTP 200 with all orders where customer matches the authenticated user
2. WHEN the authenticated user is not a customer, THE System SHALL return HTTP 403 with message "Only customers can access this endpoint"

### Requirement 18: Order Retrieval by Seller

**User Story:** As a seller, I want to view orders containing my products, so that I can manage fulfillment.

#### Acceptance Criteria

1. WHEN a GET request is sent to /orders by an authenticated seller, THE System SHALL return HTTP 200 with all orders containing items where seller matches the authenticated user
2. WHEN the authenticated user is not a seller, THE System SHALL return HTTP 403 with message "Only sellers can access this endpoint"

### Requirement 19: Order Retrieval by ID

**User Story:** As an authenticated user, I want to view details of a specific order, so that I can see order information.

#### Acceptance Criteria

1. WHEN a GET request is sent to /orders/:id by an authenticated user, THE System SHALL validate the user is either the order customer, a seller with products in the order, or an admin
2. IF the user is not authorized to view the order, THEN THE System SHALL return HTTP 403 with message "Unauthorized to view this order"
3. WHEN the order does not exist, THE System SHALL return HTTP 404 with message "Order not found"
4. WHEN authorized, THE System SHALL return HTTP 200 with the order details

### Requirement 20: Order Cancellation

**User Story:** As a customer, I want to cancel my pending orders, so that I can change my mind about a purchase.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to /orders/:id/cancel by an authenticated customer, THE System SHALL validate the requester is the order customer
2. WHEN the order does not exist, THE System SHALL return HTTP 404 with message "Order not found"
3. WHEN the order status is not "pending", THE System SHALL return HTTP 400 with message "Only pending orders can be cancelled"
4. WHEN all validations pass, THE System SHALL restore stockCount for each product by the ordered quantity, set order status to "cancelled", and return HTTP 200 with the updated order

### Requirement 21: Admin Order Status Update

**User Story:** As an admin, I want to update order statuses, so that I can manage the order workflow.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to /orders/:id/status with newStatus by an authenticated admin, THE System SHALL validate the requester has admin role
2. WHEN the order does not exist, THE System SHALL return HTTP 404 with message "Order not found"
3. WHEN newStatus is not one of (pending, confirmed, shipped, delivered, cancelled), THE System SHALL return HTTP 400 with message "Invalid order status"
4. WHEN all validations pass, THE System SHALL update the order status and return HTTP 200 with the updated order

### Requirement 22: Admin View All Orders

**User Story:** As an admin, I want to view all orders in the system, so that I can monitor order activity.

#### Acceptance Criteria

1. WHEN a GET request is sent to /orders/admin/all by an authenticated admin, THE System SHALL return HTTP 200 with all orders in the system
2. WHERE status query parameter is provided, THE System SHALL filter orders by status
3. WHERE customerId query parameter is provided, THE System SHALL filter orders by customer ID
4. WHERE page and limit query parameters are provided, THE System SHALL return paginated results

### Requirement 23: Wishlist Creation and Retrieval

**User Story:** As a customer, I want to manage my wishlist, so that I can save products for future purchase.

#### Acceptance Criteria

1. WHEN a GET request is sent to /wishlist by an authenticated customer, THE System SHALL return HTTP 200 with the customer's wishlist including populated product details
2. WHEN the customer has no wishlist, THE System SHALL create a new Wishlist document with empty products array and return it
3. WHEN the authenticated user is not a customer, THE System SHALL return HTTP 403 with message "Only customers can access wishlist"

### Requirement 24: Add Product to Wishlist

**User Story:** As a customer, I want to add products to my wishlist, so that I can save items I'm interested in.

#### Acceptance Criteria

1. WHEN a POST request is sent to /wishlist/:productId by an authenticated customer, THE System SHALL validate the product exists
2. WHEN the product does not exist, THE System SHALL return HTTP 404 with message "Product not found"
3. WHEN the product is already in the customer's wishlist, THE System SHALL return HTTP 400 with message "Product already in wishlist"
4. WHEN all validations pass, THE System SHALL add the product ID to the customer's wishlist products array and return HTTP 201 with the updated wishlist

### Requirement 25: Remove Product from Wishlist

**User Story:** As a customer, I want to remove products from my wishlist, so that I can manage my saved items.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to /wishlist/:productId by an authenticated customer, THE System SHALL validate the product exists in the customer's wishlist
2. WHEN the product is not in the customer's wishlist, THE System SHALL return HTTP 404 with message "Product not in wishlist"
3. WHEN all validations pass, THE System SHALL remove the product ID from the customer's wishlist products array and return HTTP 200 with the updated wishlist

### Requirement 26: Create Product Review

**User Story:** As a customer, I want to review products I've purchased, so that I can share my experience with other customers.

#### Acceptance Criteria

1. WHEN a POST request is sent to /reviews/product/:productId with rating and optional comment by an authenticated customer, THE System SHALL validate the product exists
2. WHEN the product does not exist, THE System SHALL return HTTP 404 with message "Product not found"
3. WHEN the customer already has a review for this product, THE System SHALL return HTTP 400 with message "You have already reviewed this product"
4. WHEN rating is not between 1 and 5 (inclusive), THE System SHALL return HTTP 400 with message "Rating must be between 1 and 5"
5. WHEN all validations pass, THE System SHALL create a Review document with product reference, user reference, rating, and comment
6. WHEN Review is created, THE System SHALL recalculate the product's rating (average of all reviews) and reviewCount, update the Product document, and return HTTP 201 with the created review

### Requirement 27: Retrieve Product Reviews

**User Story:** As a customer, I want to view reviews for a product, so that I can read other customers' experiences.

#### Acceptance Criteria

1. WHEN a GET request is sent to /reviews/product/:productId, THE System SHALL return HTTP 200 with all reviews for the product including user information
2. WHEN the product does not exist, THE System SHALL return HTTP 404 with message "Product not found"
3. WHERE page and limit query parameters are provided, THE System SHALL return paginated results

### Requirement 28: Delete Review

**User Story:** As a customer or admin, I want to delete reviews, so that I can remove inappropriate content.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to /reviews/:reviewId by an authenticated user, THE System SHALL validate the user is either the review author or an admin
2. IF the user is not authorized to delete the review, THEN THE System SHALL return HTTP 403 with message "Unauthorized to delete this review"
3. WHEN the review does not exist, THE System SHALL return HTTP 404 with message "Review not found"
4. WHEN all validations pass, THE System SHALL delete the Review document, recalculate the product's rating and reviewCount, update the Product document, and return HTTP 200 with message "Review deleted successfully"

### Requirement 29: Admin View All Users

**User Story:** As an admin, I want to view all users in the system, so that I can manage user accounts.

#### Acceptance Criteria

1. WHEN a GET request is sent to /admin/users by an authenticated admin, THE System SHALL return HTTP 200 with all users in the system
2. WHERE role query parameter is provided, THE System SHALL filter users by role (customer, seller, admin)
3. WHERE page and limit query parameters are provided, THE System SHALL return paginated results
4. THE System SHALL exclude password and refreshToken fields from returned users

### Requirement 30: Admin Change User Role

**User Story:** As an admin, I want to change user roles, so that I can grant or revoke permissions.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to /admin/users/:id/role with newRole by an authenticated admin, THE System SHALL validate the user exists
2. WHEN the user does not exist, THE System SHALL return HTTP 404 with message "User not found"
3. WHEN newRole is not one of (customer, seller, admin), THE System SHALL return HTTP 400 with message "Invalid role"
4. WHEN all validations pass, THE System SHALL update the user's role and return HTTP 200 with the updated user

### Requirement 31: Admin Approve Seller Application

**User Story:** As an admin, I want to approve seller applications, so that I can onboard new sellers.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to /admin/sellers/:id/approve by an authenticated admin, THE System SHALL validate the user exists and has seller role
2. WHEN the user does not exist or is not a seller, THE System SHALL return HTTP 404 with message "Seller not found"
3. WHEN the seller's sellerStatus is not "pending", THE System SHALL return HTTP 400 with message "Seller is not pending approval"
4. WHEN all validations pass, THE System SHALL set sellerStatus to "approved" and return HTTP 200 with the updated user

### Requirement 32: Admin Reject Seller Application

**User Story:** As an admin, I want to reject seller applications, so that I can maintain platform quality.

#### Acceptance Criteria

1. WHEN a PATCH request is sent to /admin/sellers/:id/reject by an authenticated admin, THE System SHALL validate the user exists and has seller role
2. WHEN the user does not exist or is not a seller, THE System SHALL return HTTP 404 with message "Seller not found"
3. WHEN the seller's sellerStatus is not "pending", THE System SHALL return HTTP 400 with message "Seller is not pending approval"
4. WHEN all validations pass, THE System SHALL set sellerStatus to "rejected" and return HTTP 200 with the updated user

### Requirement 33: Admin View Pending Sellers

**User Story:** As an admin, I want to view pending seller applications, so that I can review and approve/reject them.

#### Acceptance Criteria

1. WHEN a GET request is sent to /admin/sellers/pending by an authenticated admin, THE System SHALL return HTTP 200 with all users where role is "seller" and sellerStatus is "pending"
2. WHERE page and limit query parameters are provided, THE System SHALL return paginated results

### Requirement 34: Admin Delete User

**User Story:** As an admin, I want to delete user accounts, so that I can remove inactive or problematic users.

#### Acceptance Criteria

1. WHEN a DELETE request is sent to /admin/users/:id by an authenticated admin, THE System SHALL validate the user exists
2. WHEN the user does not exist, THE System SHALL return HTTP 404 with message "User not found"
3. WHEN all validations pass, THE System SHALL delete the User document and return HTTP 200 with message "User deleted successfully"

### Requirement 35: Admin View System Statistics

**User Story:** As an admin, I want to view system statistics, so that I can monitor platform activity.

#### Acceptance Criteria

1. WHEN a GET request is sent to /admin/stats by an authenticated admin, THE System SHALL return HTTP 200 with statistics including:
   - Total number of users
   - Total number of products
   - Total number of orders
   - Total revenue (sum of all delivered order totals)
   - Number of users by role (customers, sellers, admins)
   - Number of orders by status

### Requirement 36: Global Error Handler

**User Story:** As a developer, I want consistent error responses, so that I can handle errors predictably.

#### Acceptance Criteria

1. WHEN any endpoint encounters an error, THE System SHALL return a response with format { success: false, message: "error message" }
2. WHEN a validation error occurs, THE System SHALL return HTTP 400 with the error message
3. WHEN an authentication error occurs, THE System SHALL return HTTP 401 with message "Unauthorized"
4. WHEN an authorization error occurs, THE System SHALL return HTTP 403 with message "Forbidden"
5. WHEN a resource is not found, THE System SHALL return HTTP 404 with message "Not found"
6. WHEN a server error occurs, THE System SHALL return HTTP 500 with message "Internal server error" and log the error

### Requirement 37: Undefined Route Handler

**User Story:** As a developer, I want undefined routes to be handled gracefully, so that users receive helpful error messages.

#### Acceptance Criteria

1. WHEN a request is sent to an undefined route, THE System SHALL return HTTP 404 with message "Route not found"

### Requirement 38: CORS Configuration

**User Story:** As a frontend developer, I want the backend to accept requests from the frontend, so that I can communicate with the API.

#### Acceptance Criteria

1. THE System SHALL configure CORS to allow requests from http://localhost:5173 (Vite development server)
2. THE System SHALL allow credentials (cookies) in cross-origin requests
3. THE System SHALL allow standard HTTP methods (GET, POST, PUT, DELETE, PATCH)

### Requirement 39: Environment Configuration

**User Story:** As a developer, I want to configure the application via environment variables, so that I can manage different environments.

#### Acceptance Criteria

1. THE System SHALL read configuration from a .env file including:
   - MONGODB_URI: Connection string for MongoDB database
   - JWT_SECRET: Secret key for signing JWT tokens
   - JWT_REFRESH_SECRET: Secret key for signing refresh tokens
   - PORT: Server port (default 5000)
   - NODE_ENV: Environment (development, production)
2. THE System SHALL use default values if environment variables are not set

### Requirement 40: Database Seeding

**User Story:** As a developer, I want to populate the database with sample data, so that I can test the application.

#### Acceptance Criteria

1. THE System SHALL provide a seed script that populates the database with 20 sample products
2. THE System SHALL use product data from the frontend mock-data file
3. THE System SHALL assign products to a default seller account
4. WHEN the seed script is executed, THE System SHALL clear existing products and create new ones from the mock data

### Requirement 41: Product Image Upload

**User Story:** As a seller, I want to upload product images, so that I can display product photos.

#### Acceptance Criteria

1. WHEN a POST request is sent to /products with a file upload, THE System SHALL use Multer to handle file uploads
2. WHEN a file is uploaded, THE System SHALL store the image file and save the file path in the Product document
3. WHEN no file is uploaded, THE System SHALL use a default image path or URL

### Requirement 42: Input Validation

**User Story:** As a developer, I want input validation on all endpoints, so that I can prevent invalid data from entering the system.

#### Acceptance Criteria

1. THE System SHALL use express-validator to validate all user inputs
2. WHEN validation fails, THE System SHALL return HTTP 400 with detailed error messages
3. THE System SHALL validate email format, password strength, required fields, and data types

### Requirement 43: Authentication Middleware

**User Story:** As a developer, I want to protect endpoints with authentication, so that only authorized users can access them.

#### Acceptance Criteria

1. THE System SHALL provide authentication middleware that verifies Access_Token in Authorization header
2. WHEN Access_Token is missing or invalid, THE System SHALL return HTTP 401 with message "Unauthorized"
3. WHEN Access_Token is valid, THE System SHALL attach user information to the request object

### Requirement 44: Authorization Middleware

**User Story:** As a developer, I want to protect endpoints with role-based authorization, so that only users with appropriate roles can access them.

#### Acceptance Criteria

1. THE System SHALL provide authorization middleware that checks user role
2. WHEN user role does not match required role(s), THE System SHALL return HTTP 403 with message "Forbidden"
3. WHEN user role matches, THE System SHALL allow the request to proceed

### Requirement 45: Unique Wishlist per User

**User Story:** As a system, I want to ensure each user has only one wishlist, so that wishlist data remains consistent.

#### Acceptance Criteria

1. THE System SHALL enforce a unique constraint on the Wishlist collection for the user field
2. WHEN attempting to create a second wishlist for a user, THE System SHALL return HTTP 400 with message "User already has a wishlist"

### Requirement 46: Unique Review per User per Product

**User Story:** As a system, I want to ensure each user can only review a product once, so that review data remains consistent.

#### Acceptance Criteria

1. THE System SHALL enforce a unique compound index on the Review collection for product and user fields
2. WHEN attempting to create a second review for the same user and product combination, THE System SHALL return HTTP 400 with message "You have already reviewed this product"

### Requirement 47: Seller Verification in Product Response

**User Story:** As a customer, I want to see seller verification status on products, so that I can trust the seller.

#### Acceptance Criteria

1. WHEN retrieving product details, THE System SHALL include seller information including name and verification status (approved/pending/rejected)
2. THE System SHALL populate seller reference with seller name and sellerStatus from the User document

### Requirement 48: Order Item Details Preservation

**User Story:** As a customer, I want order items to preserve product details at purchase time, so that I can see what I ordered even if product details change.

#### Acceptance Criteria

1. WHEN creating an order, THE System SHALL store product name, image, price, and seller information in each order item
2. WHEN retrieving an order, THE System SHALL return the preserved product details from the order item, not current product details

### Requirement 49: Successful Response Format

**User Story:** As a developer, I want consistent successful responses, so that I can parse responses predictably.

#### Acceptance Criteria

1. WHEN an endpoint succeeds, THE System SHALL return a response with format { success: true, data: {...} } for data responses
2. WHEN an endpoint succeeds with a message, THE System SHALL return { success: true, message: "..." }
3. WHEN an endpoint succeeds with both data and message, THE System SHALL return { success: true, data: {...}, message: "..." }

### Requirement 50: Product Stock Decrement on Order

**User Story:** As a system, I want to automatically reduce product stock when orders are placed, so that inventory remains accurate.

#### Acceptance Criteria

1. WHEN an order is successfully created, THE System SHALL decrement the stockCount for each product by the ordered quantity
2. WHEN order cancellation occurs, THE System SHALL increment the stockCount for each product by the cancelled quantity
3. THE System SHALL prevent orders that would result in negative stock

