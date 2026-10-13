# Manual Testing Guide - Shop Sparkle E-Commerce

## 🎯 Overview

This guide walks you through testing the Shop Sparkle application manually in your browser. Both servers are running and ready for testing.

**Frontend**: http://localhost:8080  
**Backend**: http://localhost:5000/api

---

## 📋 Pre-Testing Checklist

Before you start, verify:
- [ ] Frontend is running at http://localhost:8080
- [ ] Backend is running at http://localhost:5000
- [ ] Browser DevTools are open (F12)
- [ ] Console tab is visible for error checking
- [ ] Network tab is available to monitor API calls

---

## 🧪 Test Scenario 1: Admin Login & Dashboard (5 min)

### Steps

1. **Open the application**
   - Go to http://localhost:8080/login
   - ✅ Should see login form with email and password fields

2. **Login as Admin**
   - Email: `admin@sparkle.com`
   - Password: `Admin@123`
   - Click "Sign In"

3. **Verify redirect**
   - ✅ Should redirect to `/admin` (admin dashboard)
   - ✅ Should show "Logged in successfully!" toast
   - ✅ Navbar should show "Admin User"

4. **Check dashboard**
   - ✅ Should show statistics cards (Total Users, Products, Orders, Revenue)
   - ✅ Should show skeleton loaders while loading
   - ✅ Should show recent orders and products

5. **Check DevTools**
   - Open Network tab
   - ✅ Should see API calls to `/admin/stats`
   - ✅ Response should have `success: true`
   - ✅ No errors in Console tab

### Expected Results
- ✅ Login successful
- ✅ Redirect to admin dashboard
- ✅ Statistics displayed
- ✅ No console errors

---

## 🧪 Test Scenario 2: Browse Products (5 min)

### Steps

1. **Logout from admin**
   - Click user menu in navbar
   - Click "Logout"
   - ✅ Should redirect to `/login`
   - ✅ Should show "Logged out successfully!" toast

2. **Go to shop**
   - Go to http://localhost:8080/shop
   - ✅ Should show skeleton loaders initially
   - ✅ Should load 20 products from database

3. **Verify product display**
   - ✅ Each product should show: image, name, price, rating, reviews
   - ✅ Products should be in responsive grid (2 cols on mobile, 3 on desktop)
   - ✅ Should show product count (20 results)

4. **Test filtering**
   - Click "Filters" button (mobile) or use sidebar (desktop)
   - Select "Electronics" category
   - ✅ Should filter products to show only Electronics
   - ✅ Should show skeleton loaders while filtering
   - ✅ Product count should update

5. **Test price filter**
   - Adjust price slider to $20-$50
   - ✅ Should filter products by price range
   - ✅ Should show skeleton loaders while filtering

6. **Test search**
   - Type "headphones" in search box
   - ✅ Should filter products by name
   - ✅ Should show matching products

7. **Check DevTools**
   - Network tab should show API calls to `/products`
   - ✅ Response should include product data
   - ✅ No errors in Console

### Expected Results
- ✅ Products load from API
- ✅ Filtering works correctly
- ✅ Search works correctly
- ✅ Skeleton loaders appear during loading
- ✅ No console errors

---

## 🧪 Test Scenario 3: Product Detail & Reviews (5 min)

### Steps

1. **Click on a product**
   - Click on any product card
   - ✅ Should navigate to product detail page
   - ✅ Should show skeleton loaders initially

2. **Verify product details**
   - ✅ Should show product image, name, price
   - ✅ Should show rating and review count
   - ✅ Should show description and specifications
   - ✅ Should show "Add to Cart" button
   - ✅ Should show "Add to Wishlist" button

3. **Check reviews section**
   - Scroll down to reviews section
   - ✅ Should show skeleton loaders for reviews
   - ✅ Should load reviews from API
   - ✅ Each review should show: author, rating, comment, date

4. **Create a review**
   - Click "Write a Review" button
   - ✅ Should show review form
   - Select 5-star rating
   - Type comment: "Great product!"
   - Click "Submit"
   - ✅ Should show "Review created successfully!" toast
   - ✅ Review should appear in list immediately

5. **Check similar products**
   - Scroll down to similar products section
   - ✅ Should show 4 similar products from same category
   - ✅ Should have skeleton loaders while loading

6. **Check DevTools**
   - Network tab should show:
     - `/products/:id` (product details)
     - `/reviews/product/:id` (reviews)
   - ✅ No errors in Console

### Expected Results
- ✅ Product details load correctly
- ✅ Reviews load and display
- ✅ Can create new review
- ✅ Similar products show
- ✅ Skeleton loaders appear
- ✅ No console errors

---

## 🧪 Test Scenario 4: Add to Cart & Checkout (8 min)

### Steps

1. **Add product to cart**
   - On product detail page, click "Add to Cart"
   - ✅ Should show "Added to cart!" toast
   - ✅ Cart count in navbar should increase

2. **Add more products**
   - Go back to shop
   - Add 2-3 more products to cart
   - ✅ Cart count should increase each time

3. **View cart**
   - Click cart icon in navbar
   - ✅ Should show all added items
   - ✅ Should show quantity for each item
   - ✅ Should show total price
   - ✅ Should have "Proceed to Checkout" button

4. **Proceed to checkout**
   - Click "Proceed to Checkout"
   - ✅ Should navigate to checkout page
   - ✅ Should show order summary with items and total

5. **Fill checkout form**
   - Fill in shipping address:
     - Street: "123 Main St"
     - City: "New York"
     - State: "NY"
     - Zip: "10001"
   - Select payment method: "Credit Card"
   - Click "Place Order"

6. **Verify order creation**
   - ✅ Should show "Order placed successfully!" toast
   - ✅ Should redirect to `/orders`
   - ✅ Should show your new order in the list
   - ✅ Cart should be cleared

7. **Check order details**
   - Click on the order
   - ✅ Should show order ID, date, status, total
   - ✅ Should show all items in order

8. **Check DevTools**
   - Network tab should show:
     - `POST /orders` (create order)
     - `GET /orders` (list orders)
   - ✅ No errors in Console

### Expected Results
- ✅ Can add items to cart
- ✅ Cart displays correctly
- ✅ Can proceed to checkout
- ✅ Order is created successfully
- ✅ Redirects to orders page
- ✅ Cart is cleared after order
- ✅ No console errors

---

## 🧪 Test Scenario 5: Wishlist Management (5 min)

### Steps

1. **Go to shop**
   - Go to http://localhost:8080/shop

2. **Add to wishlist**
   - Click heart icon on any product
   - ✅ Should show "Added to wishlist!" toast
   - ✅ Heart should be filled/highlighted

3. **Add more items**
   - Add 3-4 more products to wishlist
   - ✅ Each should show success toast

4. **View wishlist**
   - Click wishlist icon in navbar
   - ✅ Should navigate to `/wishlist`
   - ✅ Should show skeleton loaders initially
   - ✅ Should show all wishlist items

5. **Verify wishlist items**
   - ✅ Each item should show: image, name, price
   - ✅ Should have "Add to Cart" button
   - ✅ Should have "Remove from Wishlist" button

6. **Remove from wishlist**
   - Click heart icon on any item
   - ✅ Should show "Removed from wishlist!" toast
   - ✅ Item should disappear from list

7. **Check DevTools**
   - Network tab should show:
     - `GET /wishlist` (list wishlist)
     - `POST /wishlist/:id` (add to wishlist)
     - `DELETE /wishlist/:id` (remove from wishlist)
   - ✅ No errors in Console

### Expected Results
- ✅ Can add items to wishlist
- ✅ Wishlist displays correctly
- ✅ Can remove items from wishlist
- ✅ Skeleton loaders appear
- ✅ No console errors

---

## 🧪 Test Scenario 6: User Profile Management (5 min)

### Steps

1. **Go to profile**
   - Click user menu in navbar
   - Click "Profile"
   - ✅ Should navigate to `/profile`

2. **View profile information**
   - ✅ Should show current user information
   - ✅ Should show name, email, address fields

3. **Update profile**
   - Change name to "Test User Updated"
   - Click "Save"
   - ✅ Should show "Profile updated successfully!" toast
   - ✅ Name should update in navbar

4. **Change password**
   - Click "Change Password" section
   - Enter current password: `Admin@123`
   - Enter new password: `NewPassword@123`
   - Confirm new password: `NewPassword@123`
   - Click "Update"
   - ✅ Should show "Password changed successfully!" toast

5. **Logout and login with new password**
   - Click user menu → Logout
   - Go to login page
   - Login with new password: `NewPassword@123`
   - ✅ Should login successfully

6. **Check DevTools**
   - Network tab should show:
     - `PUT /users/me` (update profile)
     - `PUT /users/me/password` (change password)
   - ✅ No errors in Console

### Expected Results
- ✅ Can view profile
- ✅ Can update profile
- ✅ Can change password
- ✅ New password works
- ✅ No console errors

---

## 🧪 Test Scenario 7: Seller Dashboard (5 min)

### Steps

1. **Logout and login as seller**
   - Logout from current account
   - Go to login page
   - Email: `seller@sparkle.com`
   - Password: `Seller@123`
   - Click "Sign In"

2. **Verify seller redirect**
   - ✅ Should redirect to `/seller` (seller dashboard)
   - ✅ Navbar should show "Default Seller"

3. **Check seller dashboard**
   - ✅ Should show seller statistics
   - ✅ Should show product count, order count, review count
   - ✅ Should show skeleton loaders while loading

4. **View seller products**
   - Click "Products" tab
   - ✅ Should show all seller's products
   - ✅ Should show product name, price, stock
   - ✅ Should have edit and delete buttons

5. **View seller orders**
   - Click "Orders" tab
   - ✅ Should show all seller's orders
   - ✅ Should show order ID, date, status, total
   - ✅ Should have status update dropdown

6. **Update order status**
   - Click status dropdown on any order
   - Select "Shipped"
   - ✅ Should show "Order status updated!" toast
   - ✅ Status should update in list

7. **Check DevTools**
   - Network tab should show:
     - `GET /products/seller/mine` (seller products)
     - `GET /orders` (seller orders)
     - `PATCH /orders/:id/status` (update status)
   - ✅ No errors in Console

### Expected Results
- ✅ Seller login works
- ✅ Redirects to seller dashboard
- ✅ Can view products and orders
- ✅ Can update order status
- ✅ Skeleton loaders appear
- ✅ No console errors

---

## 🧪 Test Scenario 8: Error Handling (5 min)

### Steps

1. **Test 401 Unauthorized**
   - Logout
   - Try to access http://localhost:8080/orders
   - ✅ Should redirect to `/login`
   - ✅ Should show "Session expired" toast

2. **Test validation error**
   - Go to login page
   - Try to register with invalid email: "notanemail"
   - ✅ Should show validation error toast

3. **Test network error**
   - Stop backend server (Ctrl+C in backend terminal)
   - Try to load products
   - ✅ Should show error toast
   - ✅ Should allow retry
   - Restart backend server

4. **Test 404 error**
   - Go to http://localhost:8080/products/invalid-id
   - ✅ Should show error toast
   - ✅ Should show "Resource not found" message

5. **Check DevTools**
   - Console should show error logs with:
     - Endpoint name
     - Full error object
     - Status code
   - ✅ No unhandled errors

### Expected Results
- ✅ 401 errors redirect to login
- ✅ Validation errors show messages
- ✅ Network errors show messages
- ✅ 404 errors show messages
- ✅ Console logs errors properly
- ✅ No unhandled errors

---

## 🧪 Test Scenario 9: Loading States (3 min)

### Steps

1. **Test button loading state**
   - Go to login page
   - Click "Sign In" button
   - ✅ Button should show spinner
   - ✅ Button should be disabled
   - ✅ Button text should change to "Signing In..."
   - ✅ Button should re-enable after request

2. **Test skeleton loaders**
   - Go to `/shop`
   - ✅ Should show skeleton cards while loading
   - ✅ Should replace with real products when loaded
   - Go to product detail page
   - ✅ Should show skeleton for product details
   - ✅ Should show skeleton for reviews

3. **Test per-element loading**
   - Go to admin dashboard
   - ✅ Should show skeleton for stats
   - ✅ Should show skeleton for recent orders
   - ✅ Should show skeleton for recent products
   - ✅ Each section loads independently

### Expected Results
- ✅ Buttons show loading state
- ✅ Skeleton loaders appear
- ✅ Per-element loading works
- ✅ No global page spinner
- ✅ Layout doesn't shift

---

## 🧪 Test Scenario 10: Responsive Design (3 min)

### Steps

1. **Test mobile view**
   - Open DevTools (F12)
   - Click device toggle (mobile icon)
   - Select iPhone 12
   - ✅ Should show mobile layout
   - ✅ Navbar should show hamburger menu
   - ✅ Products should show 2 columns
   - ✅ Filters should be in drawer

2. **Test tablet view**
   - Select iPad
   - ✅ Should show tablet layout
   - ✅ Products should show 3 columns
   - ✅ Sidebar should be visible

3. **Test desktop view**
   - Select responsive mode
   - Resize to 1920x1080
   - ✅ Should show desktop layout
   - ✅ Products should show 3 columns
   - ✅ Sidebar should be visible

### Expected Results
- ✅ Mobile layout works
- ✅ Tablet layout works
- ✅ Desktop layout works
- ✅ No horizontal scrolling
- ✅ All features accessible

---

## 📊 Test Summary

After completing all scenarios, verify:

| Scenario | Status | Notes |
|----------|--------|-------|
| Admin Login | ✅ | Redirects to admin dashboard |
| Browse Products | ✅ | Loads 20 products, filtering works |
| Product Detail | ✅ | Shows details, reviews, can create review |
| Cart & Checkout | ✅ | Can add items, checkout, create order |
| Wishlist | ✅ | Can add/remove items, view wishlist |
| User Profile | ✅ | Can update profile, change password |
| Seller Dashboard | ✅ | Shows products, orders, can update status |
| Error Handling | ✅ | Shows toasts, redirects, logs errors |
| Loading States | ✅ | Buttons show spinners, skeleton loaders |
| Responsive Design | ✅ | Works on mobile, tablet, desktop |

---

## 🔍 DevTools Checklist

While testing, verify in DevTools:

- [ ] **Console Tab**
  - No red errors
  - API calls logged with endpoint name
  - Error objects logged on failures

- [ ] **Network Tab**
  - All API calls return 200 status
  - Response format matches expected types
  - No failed requests
  - Cookies are sent with requests (Set-Cookie headers)

- [ ] **Application Tab**
  - Cookies are set (accessToken, refreshToken)
  - Cookies have HttpOnly flag
  - Cookies have SameSite=Strict
  - No tokens in localStorage

- [ ] **Performance Tab**
  - Page loads in < 3 seconds
  - No layout shifts
  - Smooth animations

---

## ✅ Final Verification

After all tests, confirm:

- [ ] All pages load without errors
- [ ] All buttons respond to clicks
- [ ] All forms validate correctly
- [ ] All API calls succeed
- [ ] All toasts appear
- [ ] All redirects work
- [ ] All loading states show
- [ ] No console errors
- [ ] Responsive design works
- [ ] Security features in place

---

## 🎉 Testing Complete!

If all tests pass, your Shop Sparkle e-commerce platform is **ready for production**!

---

**Test Date**: May 6, 2026  
**Tester**: [Your Name]  
**Status**: ✅ PASSED
