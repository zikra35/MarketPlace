# Frontend-Backend Integration - Quick Start Guide

## Setup

### Backend
```bash
cd backend
npm install
npm run seed
npm run dev
```
Backend runs on: `http://localhost:5000`

### Frontend
```bash
npm install
# Create .env file with:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## Using the API

### Import API Methods
```typescript
import { authAPI, productAPI, orderAPI, wishlistAPI, reviewAPI, userAPI, adminAPI } from '@/lib/apiClient';
```

### Example: Fetch Products
```typescript
const response = await productAPI.getProducts({
  category: 'Electronics',
  minPrice: 10,
  maxPrice: 1000,
  search: 'laptop'
});

if (response.success) {
  console.log(response.data); // Array of products
}
```

### Example: Create Order
```typescript
const response = await orderAPI.createOrder({
  items: [
    { productId: '123', quantity: 2, selectedColor: 'red' }
  ],
  shippingAddress: '123 Main St, City, State 12345',
  paymentMethod: 'cod'
});

if (response.success) {
  console.log('Order created:', response.data);
}
```

---

## Using Contexts

### Authentication
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user?.name}</div>;
}
```

### Cart
```typescript
import { useCart } from '@/context/CartContext';

function MyComponent() {
  const { items, addToCart, removeFromCart, createOrder } = useCart();
  
  const handleCheckout = async () => {
    await createOrder('123 Main St', 'cod');
  };
  
  return (
    <div>
      <p>Items in cart: {items.length}</p>
      <button onClick={handleCheckout}>Checkout</button>
    </div>
  );
}
```

### Wishlist
```typescript
import { useWishlist } from '@/context/WishlistContext';

function MyComponent() {
  const { items, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const handleWishlist = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };
  
  return (
    <div>
      <p>Wishlist items: {items.length}</p>
    </div>
  );
}
```

---

## Error Handling

Errors are automatically handled by `handleApiError()`:
- Shows toast notifications
- Logs to console
- Redirects on 401 (session expired)

No need to manually handle errors in most cases!

---

## Loading States

### Using LoadingButton
```typescript
import { LoadingButton } from '@/components/LoadingButton';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // API call
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <LoadingButton isLoading={isLoading} onClick={handleSubmit}>
      Submit
    </LoadingButton>
  );
}
```

### Using Skeleton Loaders
```typescript
import { GridSkeleton, ListSkeleton } from '@/components/SkeletonLoaders';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  
  if (isLoading) {
    return <GridSkeleton count={12} />;
  }
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

---

## Testing Accounts

**Admin**
- Email: admin@sparkle.com
- Password: Admin@123

**Seller**
- Email: seller@sparkle.com
- Password: Seller@123

---

## Common Tasks

### Fetch and Display Products
```typescript
import { useEffect, useState } from 'react';
import { productAPI } from '@/lib/apiClient';
import { handleApiError } from '@/lib/handleApiError';
import { GridSkeleton } from '@/components/SkeletonLoaders';
import { useNavigate } from '@tanstack/react-router';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productAPI.getProducts();
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        handleApiError(error, navigate);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [navigate]);
  
  if (isLoading) return <GridSkeleton />;
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### Create Order
```typescript
import { useCart } from '@/context/CartContext';
import { LoadingButton } from '@/components/LoadingButton';

function Checkout() {
  const { items, createOrder, isCreatingOrder } = useCart();
  const [address, setAddress] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await createOrder(address, 'cod');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Shipping address"
      />
      <LoadingButton isLoading={isCreatingOrder} type="submit">
        Place Order
      </LoadingButton>
    </form>
  );
}
```

### Add to Wishlist
```typescript
import { useWishlist } from '@/context/WishlistContext';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

function ProductCard({ product }) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  
  const handleWishlist = async () => {
    if (wishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };
  
  return (
    <button onClick={handleWishlist}>
      {wishlisted ? (
        <FaHeart className="text-red-500" />
      ) : (
        <FiHeart />
      )}
    </button>
  );
}
```

---

## API Response Format

All API responses follow this format:

**Success**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error message"
}
```

---

## Environment Variables

Create `.env` file in project root:

```
VITE_API_URL=http://localhost:5000/api
```

For production:
```
VITE_API_URL=https://api.shopsparkle.com/api
```

---

## Troubleshooting

### "Session expired" on every request
- Check if backend is running on `http://localhost:5000`
- Verify `VITE_API_URL` in `.env` is correct
- Check browser cookies are enabled

### Products not loading
- Verify backend is running: `npm run dev` in backend folder
- Check network tab in browser DevTools
- Verify API URL in `.env`

### Wishlist not persisting
- Make sure you're logged in
- Check browser console for errors
- Verify backend is running

### Cart not clearing after order
- Check if order was created successfully (check backend logs)
- Verify `createOrder` response has `success: true`

---

## File Structure

```
src/
├── lib/
│   ├── api.ts                    # Axios instance
│   ├── handleApiError.ts         # Error handling
│   ├── apiClient.ts              # API methods
│   └── mock-data.ts              # DEPRECATED - do not use
├── context/
│   ├── AuthContext.tsx           # Auth state
│   ├── CartContext.tsx           # Cart state
│   └── WishlistContext.tsx       # Wishlist state
├── components/
│   ├── LoadingButton.tsx         # Loading button
│   ├── SkeletonLoaders.tsx       # Skeleton components
│   └── ...
└── routes/
    ├── login.tsx                 # Auth routes
    ├── shop.tsx                  # Product browsing
    ├── products.$id.tsx          # Product detail
    ├── checkout.tsx              # Checkout
    ├── orders.tsx                # Orders list
    └── ...
```

---

## Resources

- **Spec**: `.kiro/specs/frontend-backend-integration/`
- **Backend API**: `http://localhost:5000/api`
- **Frontend**: `http://localhost:5173`
- **Axios Docs**: https://axios-http.com/
- **React Router**: https://tanstack.com/router/latest
- **Sonner Toasts**: https://sonner.emilkowal.ski/

---

## Support

For issues or questions:
1. Check the error message in browser console
2. Check backend logs: `npm run dev` in backend folder
3. Verify API URL and environment variables
4. Check network tab in DevTools
5. Review spec documentation in `.kiro/specs/frontend-backend-integration/`
