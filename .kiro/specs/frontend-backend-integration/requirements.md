# Frontend-Backend Integration - Requirements Document

## Introduction

Frontend-Backend Integration for Shop Sparkle connects the React frontend to the Node.js/Express backend API. The integration uses httpOnly cookies for JWT storage (zero XSS risk), a centralized axios instance for all API calls, per-element loading states with skeleton loaders, and comprehensive error handling with toast notifications and console logging.

## Glossary

- **httpOnly Cookie**: Secure cookie that cannot be accessed by JavaScript, preventing XSS attacks
- **VITE_API_URL**: Environment variable pointing to backend API base URL
- **Axios Instance**: Centralized HTTP client with pre-configured baseURL and credentials
- **Toast Notification**: Non-blocking user notification for errors, success, and info messages
- **Skeleton Loader**: Placeholder UI that mimics content shape while loading
- **Loading State**: Boolean flag indicating if an API call is in progress
- **Credentials**: Include flag in fetch/axios to send cookies with cross-origin requests
- **Session Expiration**: HTTP 401 response indicating access token has expired

## Requirements

### Requirement 1: JWT Storage via httpOnly Cookies

**User Story:** As a developer, I want JWT tokens stored securely in httpOnly cookies, so that tokens cannot be accessed by JavaScript and are protected from XSS attacks.

#### Acceptance Criteria

1. WHEN the backend sets the refresh token in a response, THE System SHALL store it in an httpOnly cookie with sameSite='lax' and secure=true (production)
2. WHEN the backend sets the access token in a response, THE System SHALL store it in an httpOnly cookie
3. WHEN the frontend makes API calls, THE System SHALL automatically include cookies in the request (credentials: 'include')
4. WHEN the frontend receives a 401 response, THE System SHALL clear the httpOnly cookies and redirect to /login
5. THE System SHALL never store tokens in localStorage or sessionStorage
6. THE System SHALL never access tokens from JavaScript (they are httpOnly)

### Requirement 2: Centralized API Configuration

**User Story:** As a developer, I want a single centralized axios instance, so that all API calls use consistent configuration and authentication.

#### Acceptance Criteria

1. WHEN the frontend starts, THE System SHALL create an axios instance with baseURL from VITE_API_URL environment variable
2. WHEN the axios instance is created, THE System SHALL set withCredentials: true to include cookies in all requests
3. WHEN any component makes an API call, THE System SHALL use the centralized axios instance (no raw fetch)
4. WHEN the axios instance is configured, THE System SHALL set default headers for Content-Type: application/json
5. THE System SHALL export the axios instance from src/lib/api.ts for use across the application

### Requirement 3: Environment Configuration

**User Story:** As a developer, I want to configure the API URL via environment variables, so that I can easily switch between development and production backends.

#### Acceptance Criteria

1. WHEN the frontend starts, THE System SHALL read VITE_API_URL from environment variables
2. WHEN VITE_API_URL is not set, THE System SHALL default to http://localhost:5000/api
3. WHEN the frontend is built for production, THE System SHALL use the production API URL from environment
4. THE System SHALL provide a .env.example file with VITE_API_URL=http://localhost:5000/api

### Requirement 4: Centralized Error Handling

**User Story:** As a developer, I want centralized error handling, so that all API errors are handled consistently with toast notifications and console logging.

#### Acceptance Criteria

1. WHEN an API call fails, THE System SHALL call a handleApiError(error) utility function
2. WHEN handleApiError is called, THE System SHALL show a toast notification with the error message
3. WHEN handleApiError is called, THE System SHALL log the error to console.error with endpoint name and full error object
4. WHEN the error is HTTP 401 (Unauthorized), THE System SHALL show toast "Session expired, please log in" and redirect to /login
5. WHEN the error is HTTP 403 (Forbidden), THE System SHALL show toast "You don't have permission to do this"
6. WHEN the error is HTTP 400 or 422 (Validation), THE System SHALL show the specific validation message from backend response
7. WHEN the error is network offline, THE System SHALL show toast "No internet connection"
8. WHEN the error is HTTP 500 (Server Error), THE System SHALL show toast "Server error, please try again later"

### Requirement 5: Per-Element Loading States

**User Story:** As a user, I want to see loading indicators on individual buttons and sections, so that I know when an action is in progress without blocking the entire page.

#### Acceptance Criteria

1. WHEN a button triggers an API call, THE System SHALL set isLoading state to true
2. WHILE isLoading is true, THE System SHALL disable the button and show a spinner inside it
3. WHEN the API call completes, THE System SHALL set isLoading to false and re-enable the button
4. WHEN a section fetches data on mount (product grid, order list, wishlist), THE System SHALL show skeleton loaders
5. WHEN skeleton loaders are shown, THE System SHALL NOT show a global page spinner
6. WHEN the data finishes loading, THE System SHALL replace skeleton loaders with actual content
7. THE System SHALL only use a global spinner for initial auth check on app load

### Requirement 6: Authentication Flow Integration

**User Story:** As a user, I want seamless authentication with the backend, so that I can register, login, and maintain my session.

#### Acceptance Criteria

1. WHEN the user submits the register form, THE System SHALL POST to /auth/register with email, password, name, role
2. WHEN registration succeeds, THE System SHALL store the user data and redirect to /login
3. WHEN the user submits the login form, THE System SHALL POST to /auth/login with email, password
4. WHEN login succeeds, THE System SHALL store the user data in context and redirect to /shop
5. WHEN login fails, THE System SHALL show toast with error message
6. WHEN the user clicks logout, THE System SHALL POST to /auth/logout and clear user context
7. WHEN the access token expires, THE System SHALL automatically refresh using the refresh token
8. WHEN the refresh token is invalid, THE System SHALL redirect to /login

### Requirement 7: Product Data Integration

**User Story:** As a user, I want to browse products from the backend, so that I see real product data instead of mock data.

#### Acceptance Criteria

1. WHEN the shop page loads, THE System SHALL GET /products with query parameters for filters
2. WHEN products are fetched, THE System SHALL show skeleton loaders while loading
3. WHEN products finish loading, THE System SHALL display them in the product grid
4. WHEN the user filters by category, THE System SHALL GET /products?category=X
5. WHEN the user searches, THE System SHALL GET /products?q=searchTerm
6. WHEN the user sorts, THE System SHALL GET /products?sort=price_asc|price_desc|rating|newest
7. WHEN the user paginates, THE System SHALL GET /products?page=X&limit=Y
8. WHEN a product detail page loads, THE System SHALL GET /products/:id
9. WHEN product data fails to load, THE System SHALL show error toast and allow retry

### Requirement 8: Cart and Checkout Integration

**User Story:** As a user, I want to place orders through the backend, so that my purchases are recorded in the system.

#### Acceptance Criteria

1. WHEN the user clicks checkout, THE System SHALL POST to /orders with items, shippingAddress, paymentMethod
2. WHEN order creation succeeds, THE System SHALL show success toast and redirect to /orders
3. WHEN order creation fails (insufficient stock), THE System SHALL show error toast with product name
4. WHEN the order is placed, THE System SHALL clear the cart from context
5. WHEN the user views their orders, THE System SHALL GET /orders
6. WHEN the user views order details, THE System SHALL GET /orders/:id
7. WHEN the user cancels an order, THE System SHALL PATCH /orders/:id/cancel

### Requirement 9: Wishlist Integration

**User Story:** As a user, I want to manage my wishlist through the backend, so that my saved items persist across sessions.

#### Acceptance Criteria

1. WHEN the wishlist page loads, THE System SHALL GET /wishlist
2. WHEN the user adds a product to wishlist, THE System SHALL POST /wishlist/:productId
3. WHEN the user removes a product from wishlist, THE System SHALL DELETE /wishlist/:productId
4. WHEN wishlist operations succeed, THE System SHALL update the wishlist context
5. WHEN wishlist operations fail, THE System SHALL show error toast

### Requirement 10: Review Integration

**User Story:** As a user, I want to create and view reviews through the backend, so that my feedback is recorded and visible to others.

#### Acceptance Criteria

1. WHEN the product detail page loads, THE System SHALL GET /reviews/product/:productId
2. WHEN the user submits a review, THE System SHALL POST /reviews/product/:productId with rating, comment
3. WHEN review creation succeeds, THE System SHALL show success toast and refresh reviews
4. WHEN review creation fails (duplicate review), THE System SHALL show error toast
5. WHEN the user deletes their review, THE System SHALL DELETE /reviews/:reviewId
6. WHEN reviews are fetched, THE System SHALL show skeleton loaders while loading

### Requirement 11: User Profile Integration

**User Story:** As a user, I want to manage my profile through the backend, so that my information is persisted.

#### Acceptance Criteria

1. WHEN the profile page loads, THE System SHALL GET /users/me
2. WHEN the user updates their profile, THE System SHALL PUT /users/me with name, address, storeName
3. WHEN the user changes their password, THE System SHALL PUT /users/me/password with currentPassword, newPassword
4. WHEN profile updates succeed, THE System SHALL show success toast and update context
5. WHEN profile updates fail, THE System SHALL show error toast with validation message

### Requirement 12: Admin Dashboard Integration

**User Story:** As an admin, I want to manage the system through the backend, so that I can approve sellers and view statistics.

#### Acceptance Criteria

1. WHEN the admin dashboard loads, THE System SHALL GET /admin/stats
2. WHEN the admin views users, THE System SHALL GET /admin/users with pagination
3. WHEN the admin approves a seller, THE System SHALL PATCH /admin/sellers/:id/approve
4. WHEN the admin rejects a seller, THE System SHALL PATCH /admin/sellers/:id/reject
5. WHEN the admin views pending sellers, THE System SHALL GET /admin/sellers/pending
6. WHEN admin operations succeed, THE System SHALL show success toast and refresh data

### Requirement 13: API Error Response Handling

**User Story:** As a developer, I want to handle all backend error response formats, so that users see meaningful error messages.

#### Acceptance Criteria

1. WHEN the backend returns { success: false, message: "..." }, THE System SHALL extract the message
2. WHEN the backend returns validation errors, THE System SHALL show the first error message
3. WHEN the backend returns a 404, THE System SHALL show "Resource not found"
4. WHEN the backend returns a 500, THE System SHALL show "Server error, please try again later"
5. WHEN the backend returns a network error, THE System SHALL show "No internet connection"

### Requirement 14: Loading State Management

**User Story:** As a developer, I want consistent loading state management, so that the UI responds appropriately during API calls.

#### Acceptance Criteria

1. WHEN an API call starts, THE System SHALL set isLoading to true for that specific action
2. WHEN an API call completes (success or error), THE System SHALL set isLoading to false
3. WHEN isLoading is true, THE System SHALL disable related buttons and show spinners
4. WHEN multiple API calls are in progress, THE System SHALL manage each loading state independently
5. THE System SHALL never show a global page spinner except for initial auth check

### Requirement 15: Skeleton Loaders

**User Story:** As a user, I want to see skeleton loaders while content is loading, so that the page feels responsive and I know content is coming.

#### Acceptance Criteria

1. WHEN product grid is loading, THE System SHALL show skeleton cards matching product card layout
2. WHEN order list is loading, THE System SHALL show skeleton rows matching order row layout
3. WHEN wishlist is loading, THE System SHALL show skeleton items matching wishlist item layout
4. WHEN reviews are loading, THE System SHALL show skeleton reviews matching review layout
5. WHEN skeleton loaders are shown, THE System SHALL NOT show a global spinner

### Requirement 16: Axios Interceptors

**User Story:** As a developer, I want axios interceptors to handle common tasks, so that I don't repeat code in every API call.

#### Acceptance Criteria

1. WHEN an API request is made, THE System SHALL automatically include credentials: 'include'
2. WHEN an API response is 401, THE System SHALL automatically redirect to /login
3. WHEN an API response is an error, THE System SHALL call handleApiError automatically
4. WHEN an API request fails due to network, THE System SHALL handle it gracefully

### Requirement 17: No Mock Data in Production

**User Story:** As a developer, I want to remove all mock data from the frontend, so that the application only uses real backend data.

#### Acceptance Criteria

1. WHEN the frontend loads, THE System SHALL NOT use mock data from src/lib/mock-data.ts
2. WHEN the frontend loads, THE System SHALL fetch all data from the backend API
3. WHEN the backend is unavailable, THE System SHALL show error messages, not fallback to mock data
4. THE System SHALL remove all imports of mock-data.ts from components

### Requirement 18: Environment Variables

**User Story:** As a developer, I want environment variables for API configuration, so that I can easily switch between environments.

#### Acceptance Criteria

1. THE System SHALL read VITE_API_URL from .env file
2. THE System SHALL provide .env.example with VITE_API_URL=http://localhost:5000/api
3. WHEN VITE_API_URL is not set, THE System SHALL default to http://localhost:5000/api
4. WHEN the frontend is built, THE System SHALL use the environment-specific API URL

### Requirement 19: Toast Notifications

**User Story:** As a user, I want to see toast notifications for all API operations, so that I know the result of my actions.

#### Acceptance Criteria

1. WHEN an API call succeeds, THE System SHALL show a success toast (if applicable)
2. WHEN an API call fails, THE System SHALL show an error toast with the error message
3. WHEN a session expires, THE System SHALL show a warning toast "Session expired, please log in"
4. WHEN there's no internet connection, THE System SHALL show an error toast "No internet connection"
5. WHEN validation fails, THE System SHALL show an error toast with the validation message

### Requirement 20: Console Logging

**User Story:** As a developer, I want detailed console logging for API calls, so that I can debug issues easily.

#### Acceptance Criteria

1. WHEN an API call fails, THE System SHALL log to console.error with endpoint name and full error object
2. WHEN an API call succeeds, THE System SHALL optionally log to console.log for debugging
3. WHEN a session expires, THE System SHALL log to console.warn with session expiration message
4. WHEN there's a network error, THE System SHALL log to console.error with network error details
