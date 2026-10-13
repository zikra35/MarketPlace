# Testing Guide - Shop Sparkle Dashboard Pages

## Quick Start

### Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:8080`
- Database seeded with test data

### Test Credentials

**Admin Account:**
- Email: `admin@sparkle.com`
- Password: `Admin@123`

**Seller Account:**
- Email: `seller@sparkle.com`
- Password: `Seller@123`

**Customer Account:**
- Email: `customer@sparkle.com`
- Password: `Customer@123`

---

## Seller Dashboard Testing

### 1. Add Product Page (`/seller/add-product`)
**Test Steps:**
1. Login as seller
2. Navigate to Dashboard → Add Product
3. **Test Form Validation:**
   - Try submitting empty form → Should show "Please fill in all required fields"
   - Enter negative price → Should show "Price must be greater than 0"
   - Enter negative stock → Should show "Stock count cannot be negative"
4. **Test Successful Submission:**
   - Fill all required fields (name, price, category, brand, description, stock)
   - Add optional fields (colors, sizes)
   - Click "Add Product" → Should show success toast and redirect to products page
5. **Test Cancel:**
   - Click "Cancel" → Should redirect to seller dashboard

**Expected Behavior:**
- ✅ Form validation works correctly
- ✅ Success toast appears on submission
- ✅ Redirects to products page after successful creation
- ✅ Loading state shows while submitting

---

### 2. Products Page (`/seller/products`)
**Test Steps:**
1. Navigate to Seller Dashboard → My Products
2. **Test Product List:**
   - Should display all seller's products in a table
   - Each row shows: Product Name, Price, Stock, Rating, Actions
3. **Test Search:**
   - Type product name in search box → List filters in real-time
   - Clear search → Shows all products again
4. **Test Filter by Category:**
   - Select category from dropdown → List filters by category
   - Select "All Categories" → Shows all products
5. **Test Pagination:**
   - If more than 10 products, pagination controls appear
   - Click next/previous buttons → Page changes
   - Shows "Page X of Y" indicator
6. **Test Edit:**
   - Click edit icon on a product → Row becomes editable
   - Modify name, price, or stock
   - Click "Save" → Shows success toast and updates list
   - Click "Cancel" → Reverts changes
7. **Test Delete:**
   - Click delete icon → Confirmation dialog appears
   - Click "OK" → Product deleted, success toast shown
   - Product removed from list
8. **Test Export:**
   - Click "Export CSV" → Downloads CSV file
   - Click "Export JSON" → Downloads JSON file
   - Files contain filtered product data

**Expected Behavior:**
- ✅ All products display correctly
- ✅ Search and filter work in real-time
- ✅ Pagination works with correct page count
- ✅ Edit/Save/Cancel work correctly
- ✅ Delete requires confirmation
- ✅ Export buttons download files
- ✅ Loading state shows initially

---

### 3. Orders Page (`/seller/orders`)
**Test Steps:**
1. Navigate to Seller Dashboard → Orders
2. **Test Order List:**
   - Should display all seller's orders
   - Each row shows: Order ID, Customer, Total, Status, Date, Actions
3. **Test Search:**
   - Type order ID or customer name → List filters
   - Clear search → Shows all orders
4. **Test Filter by Status:**
   - Select status from dropdown → List filters by status
   - Options: pending, processing, shipped, delivered, cancelled
5. **Test Status Update:**
   - Click status dropdown on an order
   - Select new status → Updates immediately
   - Shows success toast
   - Status badge color changes
6. **Test Order Details Modal:**
   - Click "View" (eye icon) on an order
   - Modal opens showing:
     - Order ID, Status, Date, Total
     - Customer name and email
     - Shipping address
     - Order items with quantities and prices
     - Order summary (subtotal, delivery fee, total)
   - Click "Close" → Modal closes
7. **Test Pagination:**
   - If more than 10 orders, pagination controls appear
   - Navigate between pages
8. **Test Export:**
   - Click "Export CSV" → Downloads CSV file
   - Click "Export JSON" → Downloads JSON file

**Expected Behavior:**
- ✅ All orders display correctly
- ✅ Search and filter work
- ✅ Status dropdown updates order status
- ✅ Order details modal shows complete information
- ✅ Pagination works correctly
- ✅ Export buttons work
- ✅ Color-coded status badges display correctly

---

### 4. Reviews Page (`/seller/reviews`)
**Test Steps:**
1. Navigate to Seller Dashboard → Reviews
2. **Test Statistics:**
   - Should show: Total Reviews, Average Rating, Positive Reviews count
   - Average rating displays with star visualization
3. **Test Review List:**
   - Should display all reviews for seller's products
   - Each review shows: Product name, Reviewer name, Stars, Comment, Date
4. **Test Search:**
   - Type product name or reviewer name → List filters
5. **Test Filter by Rating:**
   - Select rating (1-5 stars) → List filters by rating
   - Select "All Ratings" → Shows all reviews
6. **Test Delete Review:**
   - Click delete icon on a review
   - Confirmation dialog appears
   - Click "OK" → Review deleted, success toast shown
7. **Test Pagination:**
   - If more than 10 reviews, pagination controls appear
8. **Test Export:**
   - Click "Export CSV" → Downloads CSV file
   - Click "Export JSON" → Downloads JSON file

**Expected Behavior:**
- ✅ Statistics display correctly
- ✅ Reviews display with star ratings
- ✅ Search and filter work
- ✅ Delete requires confirmation
- ✅ Pagination works
- ✅ Export buttons work

---

### 5. Settings Page (`/seller/settings`)
**Test Steps:**
1. Navigate to Seller Dashboard → Settings
2. **Test Profile Update:**
   - Modify Full Name, Store Name, Phone, Address, Description
   - Click "Save Profile"
   - Should show success toast
   - Profile data persists on page reload
3. **Test Password Change:**
   - Enter current password (incorrect) → Should fail with error
   - Enter current password (correct)
   - Enter new password (less than 6 chars) → Should show error
   - Enter new password and confirm (mismatch) → Should show error
   - Enter matching new passwords → Should succeed with success toast
   - Try logging in with old password → Should fail
   - Try logging in with new password → Should succeed
4. **Test Form Validation:**
   - Try saving profile without Full Name → Should show error
   - Try saving profile without Store Name → Should show error
5. **Test Account Information:**
   - Should display: Account Type (Seller), Member Since, Account Status (Active)

**Expected Behavior:**
- ✅ Profile updates persist
- ✅ Password validation works correctly
- ✅ Form validation prevents invalid submissions
- ✅ Success/error toasts display appropriately
- ✅ Account information displays correctly

---

## Admin Dashboard Testing

### 1. Users Page (`/admin/users`)
**Test Steps:**
1. Login as admin
2. Navigate to Dashboard → Manage Users
3. **Test User List:**
   - Should display all users with: Name, Email, Role, Actions
4. **Test Search:**
   - Type user name or email → List filters
5. **Test Filter by Role:**
   - Select role (customer, seller, admin) → List filters
6. **Test Edit Role:**
   - Click edit icon on a user
   - Change role in dropdown
   - Click "Save" → Role updates, success toast shown
7. **Test Delete User:**
   - Click delete icon
   - Confirmation dialog appears
   - Click "OK" → User deleted, success toast shown
8. **Test Pagination:**
   - If more than 10 users, pagination controls appear
9. **Test Export:**
   - Click "Export CSV" → Downloads CSV file
   - Click "Export JSON" → Downloads JSON file

**Expected Behavior:**
- ✅ All users display correctly
- ✅ Search and filter work
- ✅ Role changes update correctly
- ✅ Delete requires confirmation
- ✅ Pagination works
- ✅ Export buttons work

---

### 2. Sellers Page (`/admin/sellers`)
**Test Steps:**
1. Navigate to Admin Dashboard → Approve Sellers
2. **Test Pending Sellers List:**
   - Should display pending seller applications
   - Each row shows: Name, Email, Store Name, Applied Date, Actions
3. **Test Statistics:**
   - Should show: Pending Applications count
4. **Test Search:**
   - Type seller name, email, or store name → List filters
5. **Test View Seller Details:**
   - Click "View" button on a seller
   - Modal opens showing:
     - Personal info (name, email, phone, applied date)
     - Store info (store name, description, address)
     - Action buttons (Approve, Reject, Close)
6. **Test Approve Seller:**
   - Click "Approve Seller" button in modal
   - Confirmation dialog appears
   - Click "OK" → Seller approved, success toast shown
   - Seller removed from pending list
7. **Test Reject Seller:**
   - Click "Reject Seller" button in modal
   - Confirmation dialog appears
   - Click "OK" → Seller rejected, success toast shown
   - Seller removed from pending list
8. **Test Pagination:**
   - If more than 10 sellers, pagination controls appear
9. **Test Export:**
   - Click "Export CSV" → Downloads CSV file
   - Click "Export JSON" → Downloads JSON file

**Expected Behavior:**
- ✅ Pending sellers display correctly
- ✅ Search works
- ✅ Seller details modal shows complete information
- ✅ Approve/Reject require confirmation
- ✅ Sellers removed from list after approval/rejection
- ✅ Success toasts display
- ✅ Pagination works
- ✅ Export buttons work

---

### 3. Settings Page (`/admin/settings`)
**Test Steps:**
1. Navigate to Admin Dashboard → Settings
2. **Test Profile Update:**
   - Modify Full Name
   - Click "Save Profile"
   - Should show success toast
3. **Test Password Change:**
   - Follow same steps as seller settings
4. **Test System Settings:**
   - Toggle Email Notifications, 2FA, Activity Logging
   - Settings should persist (if backend supports)
5. **Test Account Information:**
   - Should display: Account Type (Administrator), Member Since, Status (Active), Last Login

**Expected Behavior:**
- ✅ Profile updates work
- ✅ Password change works
- ✅ System settings toggles work
- ✅ Account information displays correctly

---

## Common Testing Scenarios

### Authentication & Authorization
1. **Test Unauthorized Access:**
   - Try accessing `/seller/products` as customer → Should redirect to login
   - Try accessing `/admin/users` as seller → Should redirect to shop
   - Try accessing `/admin/users` as customer → Should redirect to shop

2. **Test Session Expiration:**
   - Login as seller
   - Wait for token to expire (or manually expire in dev tools)
   - Try any action → Should show "Session expired, please log in" and redirect to login

### Error Handling
1. **Test Network Error:**
   - Stop backend server
   - Try any action → Should show "No internet connection" or appropriate error
   - Restart backend → Should work again

2. **Test API Errors:**
   - Try invalid operations → Should show appropriate error messages
   - Check console for error logs

### Performance
1. **Test Loading States:**
   - All pages should show loading indicators while fetching data
   - No flash of empty content

2. **Test Pagination:**
   - Large datasets should paginate correctly
   - Navigation should be smooth

3. **Test Export:**
   - Large datasets should export without issues
   - Files should be properly formatted

---

## Checklist

### Seller Pages
- [ ] Add Product - Form validation and submission
- [ ] Products - List, search, filter, edit, delete, export, pagination
- [ ] Orders - List, search, filter, status update, details modal, export, pagination
- [ ] Reviews - List, search, filter, delete, export, pagination, statistics
- [ ] Settings - Profile update, password change, form validation

### Admin Pages
- [ ] Users - List, search, filter, edit, delete, export, pagination
- [ ] Sellers - List, search, details modal, approve, reject, export, pagination
- [ ] Settings - Profile update, password change, system settings

### General
- [ ] Authentication and authorization
- [ ] Error handling and error messages
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Form validation
- [ ] API integration
- [ ] Export functionality
- [ ] Pagination
- [ ] Search and filter

---

## Notes
- All pages use centralized API client (`src/lib/apiClient.ts`)
- All errors are handled with toast notifications
- All forms have client-side validation
- All pages check user authentication and role
- All pages are responsive and mobile-friendly
- All pages use Framer Motion for smooth animations
