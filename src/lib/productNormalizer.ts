/**
 * Normalize product data to use 'id' consistently instead of MongoDB '_id'
 * and map backend field names to frontend expected names
 */

import type { Product } from './apiTypes';

export function normalizeProduct(product: any): Product {
  return {
    ...product,
    id: product.id || product._id,
    inStock: (product.stockCount || 0) > 0,
    // Map backend field names to frontend expected names
    isFeatured: product.isFeatured || product.featured || false,
    isFlashDeal: product.isFlashDeal || product.flashDeal || false,
    isBestSeller: product.isBestSeller || product.bestSeller || false,
    isNewArrival: product.isNewArrival || product.newArrival || false,
  };
}

export function normalizeProducts(products: any[]): Product[] {
  return products.map(normalizeProduct);
}
