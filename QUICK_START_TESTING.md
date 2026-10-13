# Quick Start Testing Guide

## 🚀 Getting Started

Both servers are already running:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:5000

## 📋 Test Scenarios

### Scenario 1: Admin Login & Dashboard (2 min)
1. Go to http://localhost:8080/login
2. Enter credentials:
   - Email: `admin@sparkle.com`
   - Password: `Admin@123`
3. Click "Sign In"
4. ✅ Should redirect to `/admin` dashboard
5. ✅ Should show admin statistics and charts

### Scenario 2: Browse Products (3 min)
1. Go to http://localhost:8080/shop
2. ✅ Should show 20 products with skeleton loaders
3. Try filtering:
   - Select "Electronics" category
   - ✅ Should filter products
   - Adjust price slider
   - ✅ Should filter by price
4. Try searching:
   - Type "headphones" in search
   - ✅ Should show matching products

### Scenario 3: Add to Cart & Checkout (5 min)
1. Click on any product
2. ✅ Should show product details
3. Click "Add to Cart"
4. ✅ Should show success toast
5. Click cart icon in navbar
6. ✅ Should show cart items
7. Click "Proceed to Checkout"
8. Fill in shipping address and payment method
9. Click "Place Order"
10. ✅ Should redirect to `/orders`
11. ✅ Should show your order

### Scenario 4: Wishlist (2 min)
1. Go to `/shop`
2. Click heart icon on any product
3. ✅ Should show success toast
4. Click wishlist icon in navbar
5. ✅ Should show wishlist items
6. Click heart again to remove
7. ✅ Should remove from wishlist

### Scenario 5: Reviews (3 min)
1. Go to any product detail page
2. Scroll to reviews section
3. Click "Write a Review"
4. Select rating (1-5 stars)
5. Enter comment
6. Click "Submit"
7. ✅ Should show success toast
8. ✅ Review should appear in list

### Scenario 6: Register New Customer (3 min)
1. Go to http://localhost:8080/login
2. Click "Register"
3. Fill in:
   - Name: Your name
   - Email: your-email@example.com
   - Password: YourPassword123
   - Role: Customer
4. Click "Create Account"
5. ✅ Should redirect to login
6. ✅ Should show success toast
7. Login with your new account
8. ✅ Should redirect to `/shop`

### Scenario 7: Seller Dashboard (3 min)
1. Go to http://localhost:8080/login
2. Enter credentials:
   - Email: `seller@sparkle.com`
   - Password: `Seller@123`
3. Click "Sign In"
4. ✅ Should redirect to `/seller` dashboard
5. ✅ Should show seller statistics
6. Click "Products" tab
7. ✅ Should show seller's products
8. Click "Orders" tab
9. ✅ Should show seller's orders

### Scenario 8: Error Handling (2 min)
1. Logout
2. Try to access http://localhost:8080/orders
3. ✅ Should redirect to `/login`
4. ✅ Should show "Session expired" toast
5. Try to register with invalid email
6. ✅ Should show validation error toast

### Scenario 9: Loading States (1 min)
1. Go to `/shop`
2. ✅ Should show skeleton loaders while loading
3. Click any button
4. ✅ Button should show spinner
5. ✅ Button should be disabled while loading

### Scenario 10: Profile Management (2 min)
1. Login as customer
2. Go to `/profile`
3. Update your name
4. Click "Save"
5. ✅ Should show success toast
6. Click "Change Password"
7. Enter current and new password
8. Click "Update"
9. ✅ Should show success toast

---

## 🔍 What to Look For

### ✅ Success Indicators
- Toast notifications appear for all actions
- Buttons show spinners while loading
- Skeleton loaders appear while fetching data
- Pages redirect correctly based on user role
- Forms validate input and show errors
- Cart updates correctly
- Wishlist updates correctly
- Reviews appear immediately after creation

### ❌ Error Indicators
- Page doesn't load (check browser console)
- Buttons don't respond to clicks
- No toast notifications appear
- Skeleton loaders don't appear
- API calls fail (check Network tab in DevTools)
- Redirects don't work

---

## 🛠️ Troubleshooting

### Frontend not loading?
1. Check http://localhost:8080 in browser
2. Open DevTools (F12)
3. Check Console tab for errors
4. Check Network tab to see if API calls are working

### API calls failing?
1. Check if backend is running: http://localhost:5000/api/products
2. Check backend console for errors
3. Verify CORS is configured correctly
4. Check if MongoDB is connected

### Buttons not working?
1. Check browser console for JavaScript errors
2. Check Network tab to see if API calls are being made
3. Verify API response format matches expected types

### Redirects not working?
1. Check if user role is set correctly
2. Check if ProtectedRoute component is working
3. Verify AuthContext is providing user data

---

## 📊 Test Coverage

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ | Login, register, logout working |
| Products | ✅ | Browse, filter, search working |
| Cart | ✅ | Add, remove, checkout working |
| Wishlist | ✅ | Add, remove, view working |
| Reviews | ✅ | Create, view, delete working |
| Profile | ✅ | Update, change password working |
| Admin | ✅ | Dashboard, users, sellers working |
| Seller | ✅ | Dashboard, products, orders working |
| Error Handling | ✅ | Toasts, redirects working |
| Loading States | ✅ | Spinners, skeleton loaders working |

---

## 🎯 Next Steps

After testing:
1. ✅ Verify all features work as expected
2. ✅ Check browser console for any errors
3. ✅ Test on different browsers (Chrome, Firefox, Safari)
4. ✅ Test on mobile devices
5. ✅ Test with slow network (DevTools throttling)
6. ✅ Test with backend offline
7. ✅ Test with invalid credentials
8. ✅ Test with expired session

---

## 📞 Support

If you encounter any issues:
1. Check the test report: `FRONTEND_BACKEND_INTEGRATION_TEST_REPORT.md`
2. Check browser console for errors
3. Check backend logs for API errors
4. Verify both servers are running
5. Verify MongoDB is connected

---

**Happy Testing! 🎉**
