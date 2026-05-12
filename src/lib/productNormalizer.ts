/**
 * Normalize product data to use 'id' consistently instead of MongoDB '_id'
 */

import type { Product } from './apiTypes';

export function normalizeProduct(product: any): Product {
  return {
    ...product,
    id: product.id || product._id,
    inStock: (product.stockCount || 0) > 0,
  };
}

export function normalizeProducts(products: any[]): Product[] {
  return products.map(normalizeProduct);
}
