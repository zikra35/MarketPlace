# Medium Severity Bugs - Fix Guide

This document provides detailed fix recommendations for all 8 medium severity bugs identified in the audit.

---

## M1: Unused Variable `active` in index.tsx

**File**: `src/routes/index.tsx`  
**Line**: 88  
**Severity**: Medium  
**Effort**: Low (5 minutes)

### Current Code
```typescript
const active = hasActiveFilters(filters);

// Only used here:
{active && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
```

### Issue
The `active` variable is calculated but only used for a small indicator on the mobile filter button. It's not used for desktop sidebar styling or other UI elements.

### Fix Option 1: Remove Unused Variable
```typescript
// Remove the line:
// const active = hasActiveFilters(filters);

// Update the button to calculate inline:
{hasActiveFilters(filters) && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
```

### Fix Option 2: Use Variable More Broadly
```typescript
const active = hasActiveFilters(filters);

// Use in desktop sidebar:
<div className={`bg-card rounded-xl p-5 shadow-card ${active ? 'ring-2 ring-primary' : ''}`}>
  <h2 className="font-bold text-foreground mb-4">
    Filters {active && <span className="text-primary text-sm">(Active)</span>}
  </h2>
  <FilterSidebar filters={filters} onChange={setFilters} />
</div>
```

**Recommendation**: Use Option 2 to provide better visual feedback to users.

---

## M2: Missing Dependency in cart.tsx useEffect

**File**: `src/routes/cart.tsx`  
**Line**: 24-40  
**Severity**: Medium  
**Effort**: Medium (15 minutes)

### Current Code
```typescript
useEffect(() => {
  const validateStock = async () => {
    for (const item of items) {  // ❌ References 'items'
      try {
        const response = await productApi.getOne(item.product._id || item.product.id);
        if (response.success && response.data) {
          const product = response.data;
          const availableStock = product.stockCount || 0;
          
          if (item.quantity > availableStock) {
            if (availableStock === 0) {
              removeFromCart(item.product.id);
              toast.error(`${item.product.name} is out of stock and has been removed from cart`);
            } else {
              updateQuantity(item.product.id, availableStock);
              toast.warning(`${item.product.name} quantity adjusted to ${availableStock} (available stock)`);
            }
          }
        }
      } catch (error) {
        console.error('Stock validation error:', error);
      }
    }
  };

  if (items.length > 0) {
    validateStock();
  }
}, []);  // ❌ Missing 'items' dependency
```

### Issue
The effect references `items` but doesn't include it in the dependency array. This means stock validation only runs once on mount, not when items change.

### Fix
```typescript
useEffect(() => {
  const validateStock = async () => {
    for (const item of items) {
      try {
        const response = await productApi.getOne(item.product._id || item.product.id);
        if (response.success && response.data) {
          const product = response.data;
          const availableStock = product.stockCount || 0;
          
          if (item.quantity > availableStock) {
            if (availableStock === 0) {
              removeFromCart(item.product.id);
              toast.error(`${item.product.name} is out of stock and has been removed from cart`);
            } else {
              updateQuantity(item.product.id, availableStock);
              toast.warning(`${item.product.name} quantity adjusted to ${availableStock} (available stock)`);
            }
          }
        }
      } catch (error) {
        console.error('Stock validation error:', error);
      }
    }
  };

  if (items.length > 0) {
    validateStock();
  }
}, [items, removeFromCart, updateQuantity]);  // ✅ Added dependencies
```

**Note**: This will cause validation to run every time items change. To prevent excessive API calls, consider debouncing:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const validateStock = async () => {
      // ... validation logic
    };
    if (items.length > 0) {
      validateStock();
    }
  }, 500); // Wait 500ms after items change before validating

  return () => clearTimeout(timer);
}, [items, removeFromCart, updateQuantity]);
```

---

## M3: Missing Error Handling for Similar Products

**File**: `src/routes/products.$id.tsx`  
**Line**: 217  
**Severity**: Medium  
**Effort**: Low (10 minutes)

### Current Code
```typescript
const loadSimilar = async () => {
  try {
    const response = await productApi.getAll({
      category: product.category,
      limit: 4,
    });
    if (response.success && response.data) {
      setSimilarProducts(response.data.filter((p: any) => p.id !== product.id).slice(0, 4));
    }
  } catch (error) {
    // Silently fail for similar products ❌
  }
};
```

### Issue
Silent failure makes debugging difficult. If the API fails, users won't know and developers won't see the error.

### Fix
```typescript
const loadSimilar = async () => {
  try {
    const response = await productApi.getAll({
      category: product.category,
      limit: 4,
    });
    if (response.success && response.data) {
      setSimilarProducts(response.data.filter((p: any) => p.id !== product.id).slice(0, 4));
    }
  } catch (error) {
    // ✅ Add logging for debugging
    console.error('[Product Detail] Failed to load similar products:', {
      category: product.category,
      error: error instanceof Error ? error.message : String(error),
    });
    // Optionally show a subtle message to user
    // toast.info('Could not load similar products');
  }
};
```

---

## M4: Seller Type Inconsistency in ProductCard.tsx

**File**: `src/components/ProductCard.tsx`  
**Line**: 48  
**Severity**: Medium  
**Effort**: Low (5 minutes)

### Current Code
```typescript
{product.seller && (
  <p className="text-xs text-muted-foreground">
    {typeof product.seller === 'object' ? product.seller.storeName || product.seller.name : product.seller}
    {product.sellerVerified && "✓"}
  </p>
)}
```

### Issue
The Product interface defines seller as always an object, so the type check is unnecessary and confusing.

### Fix
```typescript
{product.seller && (
  <p className="text-xs text-muted-foreground">
    {product.seller?.storeName || product.seller?.name || 'Unknown Seller'}
    {product.sellerVerified && "✓"}
  </p>
)}
```

Or even simpler:
```typescript
{product.seller?.storeName && (
  <p className="text-xs text-muted-foreground">
    {product.seller.storeName}
    {product.sellerVerified && "✓"}
  </p>
)}
```

---

## M5 & M6: Hardcoded Delivery Fee Values

**Files**: 
- `src/routes/cart.tsx` (Line 14)
- `src/routes/products.$id.tsx` (Similar location)

**Severity**: Medium  
**Effort**: Low (15 minutes)

### Current Code
```typescript
const deliveryFee = subtotal > 5000 ? 0 : 299;
```

### Issue
Magic numbers are hardcoded, making it difficult to maintain and change.

### Fix: Create Constants File

**File**: `src/lib/constants.ts` (NEW)
```typescript
/**
 * Application-wide constants
 */

// Delivery Configuration
export const DELIVERY_CONFIG = {
  FREE_THRESHOLD: 5000,  // Free delivery if subtotal > 5000 PKR
  STANDARD_FEE: 299,     // Standard delivery fee in PKR
} as const;

// Polling Intervals (in milliseconds)
export const POLLING_INTERVALS = {
  PRODUCT_REFRESH: 10000,  // Refresh products every 10 seconds
  STOCK_UPDATE: 5000,      // Check stock updates every 5 seconds
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_LIMIT: 50,
  PRODUCT_GRID_LIMIT: 100,
} as const;
```

**Update cart.tsx**:
```typescript
import { DELIVERY_CONFIG } from '@/lib/constants';

// In CartPage component:
const deliveryFee = subtotal > DELIVERY_CONFIG.FREE_THRESHOLD 
  ? 0 
  : DELIVERY_CONFIG.STANDARD_FEE;
```

**Update products.$id.tsx**:
```typescript
import { DELIVERY_CONFIG } from '@/lib/constants';

// Same usage as above
```

---

## M7 & M8: Hardcoded Polling Intervals

**Files**:
- `src/routes/index.tsx` (Line 80) - 10 seconds
- `src/routes/products.$id.tsx` (Line 75) - 5 seconds

**Severity**: Medium  
**Effort**: Low (10 minutes)

### Current Code
```typescript
// index.tsx
const interval = setInterval(fetchProducts, 10000);

// products.$id.tsx
const pollInterval = setInterval(async () => {
  // ...
}, 5000);
```

### Fix
Use the constants file created above:

**Update index.tsx**:
```typescript
import { POLLING_INTERVALS } from '@/lib/constants';

// In HomePage component:
const interval = setInterval(fetchProducts, POLLING_INTERVALS.PRODUCT_REFRESH);
return () => clearInterval(interval);
```

**Update products.$id.tsx**:
```typescript
import { POLLING_INTERVALS } from '@/lib/constants';

// In ProductDetailPage component:
const pollInterval = setInterval(async () => {
  try {
    const response = await productApi.getOne(id);
    if (response.success && response.data) {
      const updatedProduct = response.data;
      updatedProduct.inStock = (updatedProduct.stockCount || 0) > 0;
      setProduct(prev => {
        if (prev && prev.stockCount !== updatedProduct.stockCount) {
          console.log('[Product Detail] Stock updated:', updatedProduct.stockCount);
        }
        return updatedProduct;
      });
    }
  } catch (error) {
    // Silently fail on polling errors
  }
}, POLLING_INTERVALS.STOCK_UPDATE);

return () => clearInterval(pollInterval);
```

---

## Summary of Fixes

| Bug | File | Fix Type | Time | Priority |
|-----|------|----------|------|----------|
| M1 | index.tsx | Code cleanup | 5 min | Low |
| M2 | cart.tsx | Add dependency | 15 min | High |
| M3 | products.$id.tsx | Add logging | 10 min | Medium |
| M4 | ProductCard.tsx | Simplify code | 5 min | Low |
| M5 | cart.tsx | Extract constants | 15 min | Medium |
| M6 | products.$id.tsx | Extract constants | 5 min | Medium |
| M7 | index.tsx | Use constants | 5 min | Low |
| M8 | products.$id.tsx | Use constants | 5 min | Low |

**Total Time to Fix All Medium Bugs**: ~75 minutes

---

## Implementation Order

1. **First**: Create `src/lib/constants.ts` (5 min)
2. **Second**: Fix M2 (missing dependency) - High priority (15 min)
3. **Third**: Update M5, M6, M7, M8 to use constants (20 min)
4. **Fourth**: Fix M3 (add error logging) (10 min)
5. **Fifth**: Fix M1 and M4 (code cleanup) (10 min)

**Total**: ~75 minutes for all fixes

