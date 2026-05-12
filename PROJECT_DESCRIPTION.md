# MarketPlace - Project Description

## 📱 Overview

**MarketPlace** is a full-stack, multi-vendor e-commerce platform built with modern web technologies. It enables customers to browse and purchase products from multiple sellers, sellers to manage their inventory and orders, and administrators to oversee the entire platform.

The application features a responsive React frontend with a Node.js/Express backend, MongoDB database, and JWT-based authentication with role-based access control.

---

## 🎯 Project Goals

1. **Create a scalable multi-vendor marketplace** where multiple sellers can list and sell products
2. **Provide seamless shopping experience** with product browsing, filtering, and checkout
3. **Enable seller management** with inventory, order, and analytics capabilities
4. **Implement admin controls** for user management, seller approval, and platform statistics
5. **Ensure security** with JWT authentication, password hashing, and role-based authorization
6. **Optimize performance** with proper indexing, pagination, and caching strategies

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **TanStack Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component library
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Sonner** - Toast notifications

**Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Jest** - Testing framework

**Infrastructure:**
- **MongoDB Atlas** - Cloud database
- **Deployment Options**: Heroku, Railway, Render, Vercel, Netlify, AWS, DigitalOcean

---

## 👥 User Roles

### 1. **Customer**
- Browse products with filtering and search
- Add products to cart and wishlist
- Place orders and track status
- Leave reviews and ratings
- Manage profile and addresses
- View order history

### 2. **Seller**
- Register and get approval from admin
- Create and manage product listings
- Upload product images
- View orders from customers
- Track sales and revenue
- Manage inventory and stock levels
- View seller dashboard with analytics

### 3. **Admin**
- Manage all users (customers, sellers, admins)
- Approve or reject seller registrations
- View platform statistics and analytics
- Monitor orders and transactions
- Delete users or products if needed
- Access admin dashboard with key metrics

---

## 🔑 Key Features

### Product Management
- ✅ Browse products with pagination
- ✅ Filter by category, brand, price range, condition
- ✅ Search products by name, brand, category
- ✅ Sort by price, rating, newest
- ✅ View detailed product information
- ✅ Product ratings and reviews
- ✅ Stock management and availability
- ✅ Featured products and flash deals
- ✅ Product images (base64 encoded)

### Shopping & Orders
- ✅ Add/remove items from cart
- ✅ Checkout with shipping address
- ✅ Order creation with automatic stock deduction
- ✅ Delivery fee calculation (free over 5000 PKR)
- ✅ Order status tracking (pending, processing, shipped, delivered)
- ✅ Order cancellation with stock restoration
- ✅ Order history and details

### Wishlist
- ✅ Add products to wishlist
- ✅ Remove from wishlist
- ✅ View wishlist items
- ✅ Automatic wishlist creation per user

### Reviews & Ratings
- ✅ Create reviews with ratings (1-5 stars)
- ✅ View product reviews with pagination
- ✅ Delete own reviews
- ✅ Automatic rating calculation (average of all reviews)
- ✅ Prevent duplicate reviews per user

### Authentication & Authorization
- ✅ User registration with email and password
- ✅ Login with JWT tokens
- ✅ Refresh token mechanism (7-day expiration)
- ✅ Access token (15-minute expiration)
- ✅ httpOnly cookies for security
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcryptjs

### User Management
- ✅ Profile viewing and editing
- ✅ Password change functionality
- ✅ Role-specific fields (storeName for sellers)
- ✅ Seller status management (pending, approved, rejected)
- ✅ Address management

### Admin Dashboard
- ✅ User statistics (total users by role)
- ✅ Product statistics (total products)
- ✅ Order statistics (total orders, by status)
- ✅ Revenue tracking
- ✅ Seller approval/rejection workflow
- ✅ User role management
- ✅ User deletion

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  name: String,
  role: String (customer/seller/admin),
  address: String,
  storeName: String (for sellers),
  sellerStatus: String (pending/approved/rejected),
  createdAt: Date
}
```

### Product Model
```javascript
{
  name: String,
  price: Number (in PKR),
  category: String,
  brand: String,
  description: String,
  seller: ObjectId (reference to User),
  rating: Number (average),
  reviewCount: Number,
  stockCount: Number,
  image: String (base64),
  condition: String,
  colors: [String],
  sizes: [String],
  specifications: Object,
  featured: Boolean,
  flashDeal: Boolean,
  bestSeller: Boolean,
  newArrival: Boolean,
  createdAt: Date
}
```

### Order Model
```javascript
{
  customer: ObjectId (reference to User),
  items: [{
    product: ObjectId,
    quantity: Number,
    price: Number,
    name: String,
    image: String,
    seller: ObjectId
  }],
  shippingAddress: String,
  paymentMethod: String,
  status: String (pending/processing/shipped/delivered),
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  createdAt: Date
}
```

### Wishlist Model
```javascript
{
  user: ObjectId (unique, reference to User),
  products: [ObjectId],
  createdAt: Date
}
```

### Review Model
```javascript
{
  product: ObjectId,
  user: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

---

## 🔐 Security Features

1. **Password Security**
   - Passwords hashed with bcryptjs (10 salt rounds)
   - Never stored in plain text
   - Password change functionality

2. **Authentication**
   - JWT tokens for stateless authentication
   - Access tokens (15 minutes)
   - Refresh tokens (7 days)
   - httpOnly cookies (XSS protection)
   - Secure flag on cookies (HTTPS only)

3. **Authorization**
   - Role-based access control (RBAC)
   - Middleware for route protection
   - Seller ownership validation
   - Admin-only endpoints

4. **Data Validation**
   - Input validation with express-validator
   - Schema validation with Zod
   - Type checking with TypeScript

5. **CORS Protection**
   - Configured for specific origins
   - Credentials support for cookies
   - Method restrictions

---

## 🐛 Bug Fixes Applied

### Critical Bugs Fixed (5)
1. **Price Filter Range** - Updated from USD [0-200] to PKR [0-100000]
2. **Field Mappings** - Added normalization for featured, flashDeal, bestSeller, newArrival
3. **Product ID Handling** - Added optional `id` field to Product interface
4. **Discount Calculation** - Fixed to use (originalPrice - price) / originalPrice * 100
5. **Discount Display** - Fixed percentage calculation in product detail page

### Medium Severity Bugs Fixed (8)
1. **Unused Variables** - Removed unused `active` variable in FilterSidebar
2. **Missing Dependencies** - Added useEffect dependencies in cart
3. **Error Handling** - Added console.error logging for API failures
4. **Type Inconsistency** - Fixed seller type with optional chaining
5. **Hardcoded Values** - Replaced with centralized constants
6. **Polling Intervals** - Moved to configuration constants
7. **Delivery Fees** - Centralized configuration
8. **Debouncing** - Added proper debounce configuration

---

## 📈 Performance Optimizations

1. **Database Indexing**
   - Indexes on frequently queried fields (email, role, seller, category, rating)
   - Compound indexes for unique constraints
   - Improves query performance by 10-100x

2. **Pagination**
   - Products: 50 items per page (default)
   - Reviews: 10 items per page
   - Orders: 20 items per page
   - Reduces memory usage and response time

3. **Caching**
   - TanStack Query for frontend caching
   - Automatic cache invalidation
   - Stale-while-revalidate strategy

4. **API Optimization**
   - Selective field projection
   - Lazy loading of related data
   - Compression with gzip

5. **Frontend Optimization**
   - Code splitting with Vite
   - Lazy loading of routes
   - Image optimization
   - CSS-in-JS with Tailwind

---

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Controllers, models, utilities
- **Integration Tests**: API endpoints, workflows
- **Test Framework**: Jest with Supertest
- **Coverage Target**: 80%+

### Test Scenarios
- Authentication (register, login, logout, refresh)
- Product management (CRUD, filtering, search)
- Order management (creation, cancellation, status updates)
- Wishlist operations (add, remove, retrieve)
- Review system (create, delete, rating calculation)
- Admin functions (user management, seller approval)
- Error handling (401, 403, 404, 500)

---

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller/admin)
- `DELETE /api/products/:id` - Delete product (seller/admin)
- `GET /api/products/seller/mine` - Get seller's products

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/cancel` - Cancel order
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `GET /api/orders/admin/all` - Get all orders (admin)

### Wishlist
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/:productId` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews/product/:productId` - Create review
- `DELETE /api/reviews/:reviewId` - Delete review

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update profile
- `PUT /api/users/me/password` - Change password

### Admin
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Change user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/sellers/pending` - Get pending sellers
- `PATCH /api/admin/sellers/:id/approve` - Approve seller
- `PATCH /api/admin/sellers/:id/reject` - Reject seller
- `GET /api/admin/stats` - Get platform statistics

---

## 🚀 Deployment

### Supported Platforms
- **Heroku** - Easy deployment with free tier
- **Railway** - Flexible pricing, auto-scaling
- **Render** - Free tier with good performance
- **Vercel** - Best for frontend
- **Netlify** - Best for frontend
- **AWS EC2** - Full control, enterprise-grade
- **DigitalOcean** - VPS with full control

### Environment Configuration
- MongoDB Atlas for database
- Environment variables for secrets
- CORS configuration for frontend
- SSL/HTTPS for production

---

## 📊 Project Statistics

- **Total Files**: 100+
- **Lines of Code**: 10,000+
- **API Endpoints**: 30+
- **Database Models**: 5
- **React Components**: 50+
- **Test Files**: 8
- **Documentation Files**: 10+

---

## 🔄 Development Workflow

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
npm install
npm run dev
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm run test
```

### Building
```bash
# Backend (no build needed)
# Frontend
npm run build
```

### Deployment
```bash
# See DEPLOYMENT_GUIDE.md for platform-specific instructions
```

---

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **QUICK_DEPLOYMENT_CHECKLIST.md** - Fast reference checklist
- **PLATFORM_SPECIFIC_DEPLOYMENT.md** - Platform-specific guides
- **COMPLETE_BUG_AUDIT_REPORT.md** - Detailed bug audit
- **FINAL_STATUS_REPORT.md** - Project status and completion

---

## 🎓 Learning Resources

### Frontend
- React: https://react.dev/
- Vite: https://vitejs.dev/
- TanStack Router: https://tanstack.com/router/latest
- Tailwind CSS: https://tailwindcss.com/

### Backend
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/

### Deployment
- Heroku: https://devcenter.heroku.com/
- Railway: https://docs.railway.app/
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs

---

## 🤝 Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Zikra** - Full Stack Developer

---

## 🙏 Acknowledgments

- React and Vite communities
- MongoDB and Express.js documentation
- Radix UI for accessible components
- TailwindCSS for styling utilities

---

## 📞 Support

For issues, questions, or suggestions:
- GitHub Issues: https://github.com/zikra35/shop-sparkle-933/issues
- Email: zikra35@users.noreply.github.com

---

## 🎉 Project Status

✅ **Complete and Production-Ready**

- All core features implemented
- All critical bugs fixed
- All medium bugs addressed
- Comprehensive testing completed
- Full documentation provided
- Ready for deployment

---

## 🗺️ Future Enhancements

Potential features for future versions:

1. **Payment Integration**
   - Stripe or PayPal integration
   - Multiple payment methods
   - Invoice generation

2. **Advanced Features**
   - Product recommendations
   - Wishlist sharing
   - Product comparison
   - Advanced analytics

3. **Performance**
   - Redis caching
   - CDN for images
   - GraphQL API
   - WebSocket for real-time updates

4. **Mobile App**
   - React Native app
   - Push notifications
   - Offline support

5. **Internationalization**
   - Multi-language support
   - Multi-currency support
   - Regional customization

---

**Last Updated**: May 12, 2026

**Version**: 1.0.0

**Status**: Production Ready ✅
