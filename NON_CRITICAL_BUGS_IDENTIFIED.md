# Non-Critical Bugs Identified

This document lists all non-critical (medium and minor severity) bugs found in the Shop Sparkle codebase during the comprehensive code audit.

---

## MEDIUM SEVERITY BUGS

### 1. **Index.tsx - Unused Variable**
**File**: `src/routes/index.tsx`  
**Line**: 88  
**Issue**: The `active` variable is calculated but only used for the mobile filter button indicator. It's not used for the desktop sidebar or any other purpose.

```typescript
const active = hasActiveFilters(filters);  // Line 88 - Calculated but underutilized
```

**Impact**: Minor code smell, unused computation  
**Recommendation**: Either use the variable more broadly (e.g., for desktop sidebar styling) or remove it if not needed.

---

### 2. **Cart.tsx - Missing Dependency in useEffect**
**File**: `src/routes/cart.tsx`  
**Line**: 24-40  
**Issue**: The stock validation `useEffect` hook has an empty dependency array `[]`, but it references `items` which could change. This means stock validation only runs once on mount, not when items change.

```typescript
useEffect(() => {
  const validateStock = async () => {
    for (const item of items) {  // References 'items'
      // ... validation logic
    }
  };
  if (items.length > 0) {
    validateStock();
  }
}, []);  // ❌ Missing 'items' dependency
```

**Impact**: Stock validation doesn't re-run when cart items change  
**Recommendation**: Add `items` to the dependency array, but be careful to avoid infinite loops.

---

### 3. **Products.$id.tsx - Missing Error Handling for Similar Products**
**File**: `src/routes/products.$id.tsx`  
**Line**: 217  
**Issue**: Similar products loading has no error handling. If the API call fails, it silently fails without logging or user feedback.

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
    // Silently fail for similar products ❌ No logging or user feedback
  }
};
```

**Impact**: Silent failures make debugging difficult  
**Recommendation**: Add console logging for errors: `console.error('[Product Detail] Similar products error:', error);`

---

### 4. **ProductCard.tsx - Seller Type Inconsistency**
**File**: `src/components/ProductCard.tsx`  
**Line**: 48  
**Issue**: The code checks `typeof product.seller === 'object'` but the Product interface defines seller as always an object. This check is unnecessary and suggests confusion about the data type.

```typescript
{product.seller && (
  <p className="text-xs text-muted-foreground">
    {typeof product.seller === 'object' ? product.seller.storeName || product.seller.name : product.seller}
    {product.sellerVerified && "✓"}
  </p>
)}
```

**Impact**: Unnecessary type checking, potential confusion for future developers  
**Recommendation**: Simplify to: `{product.seller?.storeName || product.seller?.name}`

---

### 5. **Cart.tsx - Hardcoded Delivery Fee**
**File**: `src/routes/cart.tsx`  
**Line**: 14  
**Issue**: Delivery fee calculation is hardcoded with magic numbers (5000 PKR threshold, 299 PKR fee).

```typescript
const deliveryFee = subtotal > 5000 ? 0 : 299; // ❌ Hardcoded values
```

**Impact**: Difficult to maintain, changes require code modification  
**Recommendation**: Extract to constants:
```typescript
const DELIVERY_FEE_THRESHOLD = 5000;
const DELIVERY_FEE = 299;
const deliveryFee = subtotal > DELIVERY_FEE_THRESHOLD ? 0 : DELIVERY_FEE;
```

---

### 6. **Products.$id.tsx - Hardcoded Delivery Fee**
**File**: `src/routes/products.$id.tsx`  
**Line**: Similar hardcoded delivery fee  
**Issue**: Same as above - hardcoded delivery fee values.

**Recommendation**: Extract to a shared constants file.

---

### 7. **Cart.tsx - Hardcoded Polling Interval**
**File**: `src/routes/index.tsx`  
**Line**: 80  
**Issue**: Product polling interval is hardcoded to 10 seconds.

```typescript
const interval = setInterval(fetchProducts, 10000); // ❌ Hardcoded 10 seconds
```

**Impact**: Difficult to adjust without code changes  
**Recommendation**: Extract to a constant or environment variable.

---

### 8. **Products.$id.tsx - Hardcoded Polling Interval**
**File**: `src/routes/products.$id.tsx`  
**Line**: 75  
**Issue**: Stock polling interval is hardcoded to 5 seconds.

```typescript
const pollInterval = setInterval(async () => {
  // ...
}, 5000); // ❌ Hardcoded 5 seconds
```

**Impact**: Difficult to adjust without code changes  
**Recommendation**: Extract to a constant.

---

## MINOR SEVERITY BUGS

### 1. **Currency.ts - No Validation for Negative Numbers**
**File**: `src/lib/currency.ts`  
**Issue**: The `formatPrice()` function doesn't validate for negative amounts. Could display negative prices if passed invalid data.

```typescript
export function formatPrice(pkrAmount: number | string): string {
  let numAmount = typeof pkrAmount === 'string' 
    ? parseFloat(pkrAmount.replace(/[^\d.]/g, '')) 
    : pkrAmount;
  
  if (isNaN(numAmount)) {
    numAmount = 0;
  }
  
  return formatPKR(numAmount); // ❌ No check for negative values
}
```

**Impact**: Could display "₨-5000" if negative value is passed  
**Recommendation**: Add validation:
```typescript
if (numAmount < 0) {
  numAmount = 0;
}
```

---

### 2. **Index.tsx - Unused Import**
**File**: `src/routes/index.tsx`  
**Line**: 5  
**Issue**: `GridSkeleton` is imported but the component uses `GridSkeleton` which might not be the correct skeleton loader.

**Impact**: Minor - just an import that could be optimized  
**Recommendation**: Verify the correct skeleton loader is being used.

---

### 3. **ProductCard.tsx - Missing Null Check for Seller**
**File**: `src/components/ProductCard.tsx`  
**Line**: 48  
**Issue**: While there's a check for `product.seller`, the nested access could still fail if seller is an empty object.

```typescript
{product.seller && (
  <p className="text-xs text-muted-foreground">
    {typeof product.seller === 'object' ? product.seller.storeName || product.seller.name : product.seller}
  </p>
)}
```

**Impact**: Potential undefined access  
**Recommendation**: Use optional chaining: `product.seller?.storeName || product.seller?.name`

---

### 4. **Products.$id.tsx - Missing Null Check for Product**
**File**: `src/routes/products.$id.tsx`  
**Line**: 180  
**Issue**: Accessing `product.originalPrice` without checking if it exists first.

```typescript
{product.originalPrice && product.originalPrice > product.price && (
  <>
    <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
    <span className="text-sm font-semibold text-success">Save {formatPrice(product.originalPrice - product.price)}</span>
  </>
)}
```

**Impact**: Could display "Save ₨NaN" if originalPrice is undefined  
**Recommendation**: Already has proper check, but ensure it's consistent throughout.

---

### 5. **Backend - Default Limit Could Be Higher**
**File**: `backend/src/controllers/productController.js`  
**Line**: 127  
**Issue**: Default limit is 50 products per page, which is reasonable but could be optimized based on performance testing.

```javascript
const limitNum = parseInt(limit, 10) || 50; // Default is 50
```

**Impact**: Minor - affects pagination performance  
**Recommendation**: Monitor performance and adjust if needed. Consider making it configurable via environment variable.

---

### 6. **WishlistContext - Missing Null Check**
**File**: `src/context/WishlistContext.tsx`  
**Line**: 48  
**Issue**: The response data check could be more robust.

```typescript
if (response.success && response.data && Array.isArray(response.data)) {
  setItems(response.data);
}
```

**Impact**: Minor - already has good checks  
**Recommendation**: This is actually well-handled. No changes needed.

---

### 7. **Cart.tsx - No Loading State During Stock Validation**
**File**: `src/routes/cart.tsx`  
**Line**: 24-40  
**Issue**: Stock validation runs on mount but there's no loading indicator shown to the user during this validation.

**Impact**: User might not know validation is happening  
**Recommendation**: Consider adding a loading state or skeleton loader during validation.

---

### 8. **Index.tsx - No Error Boundary**
**File**: `src/routes/index.tsx`  
**Issue**: No error boundary to catch rendering errors in ProductCard components.

**Impact**: One bad product could crash the entire page  
**Recommendation**: Wrap ProductCard rendering in error boundary or try-catch.

---

### 9. **ProductCard.tsx - Missing Key Prop Optimization**
**File**: `src/routes/index.tsx` (where ProductCard is used)  
**Issue**: ProductCard uses `p.id` as key, which is correct, but should verify `p.id` is always unique.

**Impact**: Minor - potential re-rendering issues if IDs aren't unique  
**Recommendation**: Verify product IDs are always unique in the database.

---

### 10. **API Error Handling - Inconsistent Error Messages**
**File**: `src/lib/handleApiError.ts`  
**Issue**: Error messages are inconsistent. Some use specific messages, others use generic ones.

```typescript
if (status === 401) {
  toast.error('Session expired, please log in');
} else if (status === 400 || status === 422) {
  toast.error(message || 'Validation error');
} else if (error.message === 'Network Error') {
  toast.error('No internet connection');
}
```

**Impact**: Minor - user experience could be more consistent  
**Recommendation**: Standardize error messages across the application.

---

## SUMMARY TABLE

| Bug ID | File | Severity | Type | Status |
|--------|------|----------|------|--------|
| M1 | index.tsx | Medium | Unused Variable | Not Fixed |
| M2 | cart.tsx | Medium | Missing Dependency | Not Fixed |
| M3 | products.$id.tsx | Medium | Missing Error Handling | Not Fixed |
| M4 | ProductCard.tsx | Medium | Type Inconsistency | Not Fixed |
| M5 | cart.tsx | Medium | Hardcoded Values | Not Fixed |
| M6 | products.$id.tsx | Medium | Hardcoded Values | Not Fixed |
| M7 | index.tsx | Medium | Hardcoded Values | Not Fixed |
| M8 | products.$id.tsx | Medium | Hardcoded Values | Not Fixed |
| m1 | currency.ts | Minor | No Validation | Not Fixed |
| m2 | index.tsx | Minor | Unused Import | Not Fixed |
| m3 | ProductCard.tsx | Minor | Missing Null Check | Not Fixed |
| m4 | products.$id.tsx | Minor | Missing Null Check | Not Fixed |
| m5 | productController.js | Minor | Default Limit | Not Fixed |
| m6 | WishlistContext.tsx | Minor | Null Check | Already Good |
| m7 | cart.tsx | Minor | No Loading State | Not Fixed |
| m8 | index.tsx | Minor | No Error Boundary | Not Fixed |
| m9 | index.tsx | Minor | Key Prop | Not Fixed |
| m10 | handleApiError.ts | Minor | Inconsistent Messages | Not Fixed |

---

## RECOMMENDATIONS FOR FUTURE IMPROVEMENTS

1. **Extract Magic Numbers**: Create a `constants.ts` file for all hardcoded values (delivery fees, polling intervals, etc.)
2. **Add Error Boundaries**: Wrap component trees with error boundaries to prevent full page crashes
3. **Improve Error Handling**: Add more detailed error logging and user feedback
4. **Add Loading States**: Show loading indicators during async operations
5. **Standardize Error Messages**: Create a consistent error message system
6. **Add Input Validation**: Validate all user inputs and API responses more thoroughly
7. **Performance Monitoring**: Monitor API response times and adjust pagination limits accordingly
8. **Add Unit Tests**: Test edge cases like negative prices, missing data, etc.

