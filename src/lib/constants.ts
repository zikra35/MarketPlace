/**
 * Application-wide constants
 * Centralized configuration for hardcoded values
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

// Debounce Configuration
export const DEBOUNCE_CONFIG = {
  STOCK_VALIDATION: 500,  // Wait 500ms after cart changes before validating stock
} as const;
