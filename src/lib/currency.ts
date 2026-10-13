/**
 * Currency formatting utilities
 * Prices are stored in PKR directly
 */

export function formatPKR(amount: number): string {
  return `₨${amount.toLocaleString('en-PK')}`;
}

export function formatPrice(pkrAmount: number | string): string {
  // Handle string input
  let numAmount = typeof pkrAmount === 'string' 
    ? parseFloat(pkrAmount.replace(/[^\d.]/g, '')) 
    : pkrAmount;
  
  // Handle NaN
  if (isNaN(numAmount)) {
    numAmount = 0;
  }
  
  return formatPKR(numAmount);
}
