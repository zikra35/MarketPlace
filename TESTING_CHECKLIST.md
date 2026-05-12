# Frontend-Backend Integration - Testing Checklist

## Overview
This document provides a comprehensive testing checklist for the Shop Sparkle frontend-backend integration. All code inconsistencies have been fixed, and the implementation is ready for testing.

## Pre-Testing Setup

### Backend Requirements
- [ ] MongoDB is running and accessible
- [ ] Backend server is running on `http://localhost:5000`
- [ ] Backend has been seeded with test data (admin, seller, products)
- [ ] Environment variables are set in `backend/.env`

### Frontend Requirements
- [ ] Frontend is running on `http://localhost:5173` (or configured port)
- [ ] `VITE_API_URL=http://localhost:5000/api` is set in `.env`
- [ ] All dependencies are installed (`npm install`)
- [ ] No TypeScript errors or warnings

## Test Execution

### 1. Authentication Flow

#### 1.1 User Registration
- [ ] Navigate to `/login`
- [ ] Click "Register" tab
- [ ] Fill in: Name, Email, Password
- [ ] Select role: "Customer"
- [ ] Click "Create Account"
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected to `/login`
- [ ] Verify: Can now login with new credentials

#### 1.2 Seller Registration
- [ ] Navigate to `/login`
- [ ] Click "Register" tab
- [ ] Fill in: Name, Email, Password
- [ ] Select role: "Seller"
- [ ] Fill in: Store Name
- [ ] Click "Create Account"
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected to `/login`
- [ ] Verify: Can login with new credentials

#### 1.3 User Login
- [ ] Navigate to `/login`
- [ ] Enter valid email and password
- [ ] Click "Sign In"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected based on role:
  - [ ] Admin → `/admin`
  - [ ] Seller (approved) → `/seller`
  - [ ] Seller (pending) → `/seller/pending`
  - [ ] Customer → `/shop`

#### 1.4 Session Restoration
- [ ] Login successfully
- [ ] Refresh the page
- [ ] Verify: User remains logged in (no redirect to login)
- [ ] Verify: User data is restored in context

#### 1.5 Logout
- [ ] Login successfully
- [ ] Click logout button (in navbar)
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected to `/login`
- [ ] Verify: User context is cleared

#### 1.6 Session Expiration
- [ ] Login successfully
- [ ] Wait for access token to expire (or manually expire in dev tools)
- [ ] Make an API call (e.g., navigate to a protected page)
- [ ] Verify: 401 error is caught
- [ ] Verify: "Session expired" toast appears
- [ ] Verify: Redirected to `/login`

### 2. Product Browsing

#### 2.1 Product List Loading
- [ ] Navigate to `/shop`
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Products load from API (not mock data)
- [ ] Verify: Product cards display: image, name, price, rating, seller

#### 2.2 Product Filtering
- [ ] On `/shop`, use filter sidebar
- [ ] Filter by category
- [ ] Verify: Products list updates
- [ ] Verify: API call includes category filter
- [ ] Filter by price range
- [ ] Verify: Products list updates
- [ ] Filter by condition (New/Used/Refurbished)
- [ ] Verify: Products list updates

#### 2.3 Product Search
- [ ] On `/shop`, enter search term in search box
- [ ] Verify: Products list updates with matching results
- [ ] Verify: API call includes search query

#### 2.4 Product Sorting
- [ ] On `/shop`, use sort dropdown
- [ ] Sort by: Price (Low to High)
- [ ] Verify: Products are sorted correctly
- [ ] Sort by: Price (High to Low)
- [ ] Verify: Products are sorted correctly
- [ ] Sort by: Newest
- [ ] Verify: Products are sorted by creation date

#### 2.5 Product Pagination
- [ ] On `/shop`, scroll to bottom
- [ ] Verify: Pagination controls appear
- [ ] Click next page
- [ ] Verify: New products load
- [ ] Verify: API call includes page parameter

#### 2.6 Product Detail Page
- [ ] Click on a product card
- [ ] Verify: Product detail page loads
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Product info displays: name, price, description, seller, rating
- [ ] Verify: Product images load correctly
- [ ] Verify: Stock status displays correctly

### 3. Reviews

#### 3.1 View Reviews
- [ ] On product detail page, scroll to "Reviews" tab
- [ ] Verify: Reviews load from API
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Each review shows: author, rating, comment, date

#### 3.2 Create Review (Customer)
- [ ] Login as customer
- [ ] Navigate to product detail page
- [ ] Scroll to "Reviews" tab
- [ ] If no review exists: verify review form appears
- [ ] Fill in: Star rating, Comment
- [ ] Click "Submit Review"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Review appears in list
- [ ] Verify: Product rating updates

#### 3.3 Delete Review (Customer)
- [ ] On product detail page, find own review
- [ ] Click "Delete" button
- [ ] Verify: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Review is removed from list

### 4. Wishlist

#### 4.1 Add to Wishlist
- [ ] Login as customer
- [ ] Navigate to `/shop`
- [ ] Click heart icon on a product
- [ ] Verify: Heart icon fills (indicates added)
- [ ] Verify: Success toast appears
- [ ] Verify: API call to add product

#### 4.2 View Wishlist
- [ ] Navigate to `/account/wishlist`
- [ ] Verify: Wishlist items load from API
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Each item shows: image, name, price, stock status

#### 4.3 Remove from Wishlist
- [ ] On wishlist page, click remove button
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Item is removed from list
- [ ] Verify: Heart icon on product card is unfilled

### 5. Cart & Checkout

#### 5.1 Add to Cart
- [ ] Login as customer
- [ ] Navigate to product detail page
- [ ] Select color/size (if available)
- [ ] Set quantity
- [ ] Click "Add to Cart"
- [ ] Verify: Success toast appears
- [ ] Verify: Cart count increases in navbar

#### 5.2 View Cart
- [ ] Click cart icon in navbar
- [ ] Verify: Cart items display correctly
- [ ] Verify: Subtotal, delivery fee, total calculate correctly

#### 5.3 Checkout
- [ ] On cart page, click "Checkout"
- [ ] Fill in shipping address
- [ ] Select payment method
- [ ] Click "Place Order"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected to `/account/orders`
- [ ] Verify: New order appears in list

#### 5.4 View Orders
- [ ] Navigate to `/account/orders`
- [ ] Verify: Orders load from API
- [ ] Verify: Each order shows: ID, date, items, total, status
- [ ] Click on order to expand details
- [ ] Verify: Full item list and shipping address display

#### 5.5 Cancel Order
- [ ] On orders page, find pending order
- [ ] Click "Cancel Order"
- [ ] Verify: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Order status changes to "cancelled"

### 6. Seller Dashboard

#### 6.1 Seller Pending Approval
- [ ] Login as newly registered seller
- [ ] Verify: Redirected to `/seller/pending`
- [ ] Verify: Message displays: "Your seller account is under review"
- [ ] Verify: Seller name and store name display
- [ ] Verify: Logout button works

#### 6.2 Seller Dashboard (After Approval)
- [ ] Admin approves seller (see Admin section)
- [ ] Seller logs in
- [ ] Verify: Redirected to `/seller`
- [ ] Verify: Dashboard displays:
  - [ ] Store name and seller info
  - [ ] Stats: Total Products, Orders, Earnings, Avg Rating
  - [ ] Action cards: Add Product, My Products, Orders, Reviews, Earnings, Settings

#### 6.3 Add Product
- [ ] On seller dashboard, click "Add New Product"
- [ ] Fill in all fields: name, category, brand, price, description, etc.
- [ ] Upload product image
- [ ] Set flags: Featured, Flash Deal, Best Seller, New Arrival
- [ ] Click "Add Product"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Redirected to `/seller/products`
- [ ] Verify: New product appears in list

#### 6.4 View My Products
- [ ] On seller dashboard, click "My Products"
- [ ] Verify: Products load from API
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Each product shows: image, name, category, price, stock, status

#### 6.5 Edit Product
- [ ] On products page, click "Edit" on a product
- [ ] Verify: Edit modal opens with pre-filled data
- [ ] Change a field (e.g., price)
- [ ] Click "Save"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Product list updates with new data

#### 6.6 Delete Product
- [ ] On products page, click "Delete" on a product
- [ ] Verify: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Product is removed from list

#### 6.7 View Orders
- [ ] On seller dashboard, click "Orders"
- [ ] Verify: Orders load from API
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Each order shows: ID, customer, items, total, status
- [ ] Click on order to expand
- [ ] Verify: Full item list and shipping address display

#### 6.8 View Reviews
- [ ] On seller dashboard, click "Reviews"
- [ ] Verify: Reviews load from API
- [ ] Verify: Reviews show: product name, customer, rating, comment, date
- [ ] Filter by product
- [ ] Verify: Reviews list updates

#### 6.9 View Earnings
- [ ] On seller dashboard, click "Earnings"
- [ ] Verify: Stats cards display: Total Earnings, This Month, This Week, Pending Payout
- [ ] Verify: Revenue chart displays (last 6 months)
- [ ] Verify: Recent orders table displays with earnings

#### 6.10 Update Settings
- [ ] On seller dashboard, click "Store Settings"
- [ ] Update: Store Name, Description, Phone, Address
- [ ] Click "Save"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Settings are saved

### 7. Admin Dashboard

#### 7.1 Admin Dashboard Overview
- [ ] Login as admin
- [ ] Verify: Redirected to `/admin`
- [ ] Verify: Dashboard displays:
  - [ ] Stats: Total Users, Products, Orders, Revenue
  - [ ] Pending Seller Approvals section
  - [ ] Revenue chart (last 6 months)
  - [ ] Recent orders table

#### 7.2 Approve Seller
- [ ] On admin dashboard, find pending seller
- [ ] Click "Approve" button
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Seller is removed from pending list
- [ ] Verify: Seller can now access `/seller` dashboard

#### 7.3 Reject Seller
- [ ] On admin dashboard, find pending seller
- [ ] Click "Reject" button
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: Seller is removed from pending list
- [ ] Verify: Seller sees rejection message on login

#### 7.4 View Users
- [ ] On admin dashboard, click "Users" (or navigate to `/admin/users`)
- [ ] Verify: Users load from API
- [ ] Verify: Skeleton loaders appear while loading
- [ ] Verify: Each user shows: name, email, role, status, joined date
- [ ] Filter by role
- [ ] Verify: Users list updates

#### 7.5 Change User Role
- [ ] On users page, find a user
- [ ] Click role dropdown
- [ ] Select new role
- [ ] Verify: Loading state
- [ ] Verify: Success toast appears
- [ ] Verify: User role updates

#### 7.6 Delete User
- [ ] On users page, click delete button
- [ ] Verify: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify: Loading state on button
- [ ] Verify: Success toast appears
- [ ] Verify: User is removed from list

#### 7.7 View All Products
- [ ] On admin dashboard, click "Products" (or navigate to `/admin/products`)
- [ ] Verify: All products load from API
- [ ] Verify: Each product shows: image, name, seller, category, price, stock
- [ ] Search for product
- [ ] Verify: Products list updates

#### 7.8 Edit Product (Admin)
- [ ] On products page, click "Edit" on a product
- [ ] Verify: Edit modal opens
- [ ] Change a field
- [ ] Click "Save"
- [ ] Verify: Success toast appears
- [ ] Verify: Product updates

#### 7.9 Delete Product (Admin)
- [ ] On products page, click "Delete" on a product
- [ ] Verify: Confirmation dialog appears
- [ ] Click "Confirm"
- [ ] Verify: Success toast appears
- [ ] Verify: Product is removed

#### 7.10 View All Orders
- [ ] On admin dashboard, click "Orders" (or navigate to `/admin/orders`)
- [ ] Verify: All orders load from API
- [ ] Verify: Each order shows: ID, customer, total, status, date
- [ ] Filter by status
- [ ] Verify: Orders list updates
- [ ] Click on order to expand
- [ ] Verify: Full details display

#### 7.11 Update Order Status
- [ ] On orders page, find an order
- [ ] Click status dropdown
- [ ] Select new status
- [ ] Verify: Loading state
- [ ] Verify: Success toast appears
- [ ] Verify: Order status updates

### 8. Error Handling

#### 8.1 Network Error
- [ ] Disconnect internet
- [ ] Try to load a page or make an API call
- [ ] Verify: "No internet connection" toast appears
- [ ] Verify: Error is logged to console
- [ ] Reconnect internet
- [ ] Verify: Page can be reloaded successfully

#### 8.2 Validation Error (400)
- [ ] Try to create a product with invalid data (e.g., negative price)
- [ ] Verify: Validation error toast appears
- [ ] Verify: Error message is specific (not generic)
- [ ] Verify: Error is logged to console

#### 8.3 Permission Error (403)
- [ ] Login as customer
- [ ] Try to access `/admin` directly
- [ ] Verify: "Access denied" toast appears
- [ ] Verify: Redirected to `/shop`

#### 8.4 Not Found Error (404)
- [ ] Navigate to `/products/invalid-id`
- [ ] Verify: "Resource not found" toast appears
- [ ] Verify: Error is logged to console

#### 8.5 Server Error (500)
- [ ] Stop backend server
- [ ] Try to make an API call
- [ ] Verify: "Server error" toast appears
- [ ] Verify: Error is logged to console
- [ ] Start backend server
- [ ] Verify: API calls work again

### 9. Loading States & Skeleton Loaders

#### 9.1 Product Grid Skeleton
- [ ] Navigate to `/shop`
- [ ] Verify: Skeleton cards appear while loading
- [ ] Verify: Skeleton cards match product card layout
- [ ] Verify: Skeleton cards are replaced with actual products

#### 9.2 Order List Skeleton
- [ ] Navigate to `/account/orders`
- [ ] Verify: Skeleton rows appear while loading
- [ ] Verify: Skeleton rows are replaced with actual orders

#### 9.3 Wishlist Skeleton
- [ ] Navigate to `/account/wishlist`
- [ ] Verify: Skeleton items appear while loading
- [ ] Verify: Skeleton items are replaced with actual items

#### 9.4 Button Loading States
- [ ] On any form, click submit button
- [ ] Verify: Button shows loading spinner
- [ ] Verify: Button is disabled while loading
- [ ] Verify: Button text changes (e.g., "Saving...")
- [ ] Verify: Button returns to normal state after completion

#### 9.5 Per-Element Loading
- [ ] On admin dashboard, approve a seller
- [ ] Verify: Only the approve button shows loading
- [ ] Verify: Rest of page remains interactive
- [ ] Verify: Other buttons are not disabled

### 10. Toast Notifications

#### 10.1 Success Toast
- [ ] Perform a successful action (e.g., add product)
- [ ] Verify: Green success toast appears
- [ ] Verify: Toast message is clear and helpful
- [ ] Verify: Toast auto-dismisses after 3-5 seconds

#### 10.2 Error Toast
- [ ] Perform an action that fails (e.g., invalid form)
- [ ] Verify: Red error toast appears
- [ ] Verify: Toast message describes the error
- [ ] Verify: Toast auto-dismisses after 3-5 seconds

#### 10.3 Info Toast
- [ ] Perform an action that shows info (e.g., session expired)
- [ ] Verify: Blue info toast appears
- [ ] Verify: Toast message is informative

### 11. Responsive Design

#### 11.1 Mobile View
- [ ] Open DevTools and set to mobile view (375px width)
- [ ] Navigate to `/shop`
- [ ] Verify: Products display in 1-2 columns
- [ ] Verify: Filter sidebar is accessible (drawer/modal)
- [ ] Verify: All buttons and inputs are touch-friendly

#### 11.2 Tablet View
- [ ] Set DevTools to tablet view (768px width)
- [ ] Navigate to `/shop`
- [ ] Verify: Products display in 2-3 columns
- [ ] Verify: Layout is readable and usable

#### 11.3 Desktop View
- [ ] Set DevTools to desktop view (1920px width)
- [ ] Navigate to `/shop`
- [ ] Verify: Products display in 4+ columns
- [ ] Verify: Layout is optimal

### 12. Performance

#### 12.1 Page Load Time
- [ ] Open DevTools Network tab
- [ ] Navigate to `/shop`
- [ ] Verify: Page loads in < 3 seconds
- [ ] Verify: API calls complete in < 1 second

#### 12.2 Image Loading
- [ ] Navigate to product detail page
- [ ] Verify: Product images load quickly
- [ ] Verify: Images are properly cached

#### 12.3 Pagination Performance
- [ ] On `/shop`, navigate to page 5
- [ ] Verify: Page loads quickly
- [ ] Verify: No lag or stuttering

## Test Results Summary

### Passed Tests
- [ ] All authentication flows work correctly
- [ ] All product browsing features work
- [ ] All review features work
- [ ] All wishlist features work
- [ ] All cart and checkout features work
- [ ] All seller features work
- [ ] All admin features work
- [ ] All error handling works
- [ ] All loading states work
- [ ] All toast notifications work
- [ ] Responsive design works on all devices
- [ ] Performance is acceptable

### Failed Tests
(Document any failures here)

### Notes
(Add any additional notes or observations)

## Sign-Off

- **Tested By**: _______________
- **Date**: _______________
- **Status**: ☐ PASS ☐ FAIL ☐ PARTIAL

---

## Quick Start Commands

```bash
# Start backend
cd backend
npm install
npm run seed  # Seed database with test data
npm run dev   # Start backend server

# Start frontend (in new terminal)
cd ..
npm install
npm run dev   # Start frontend server

# Run tests
npm run test
```

## Test Credentials

### Admin Account
- Email: `admin@sparkle.com`
- Password: `Admin@123`

### Seller Account
- Email: `seller@sparkle.com`
- Password: `Seller@123`

### Customer Account
- Create during testing or use:
- Email: `customer@example.com`
- Password: `Customer@123`

