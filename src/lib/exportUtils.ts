/**
 * Export utilities for converting data to CSV format
 */

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle nested objects
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function prepareProductsForExport(products: any[]) {
  return products.map((p) => ({
    'Product ID': p._id,
    'Product Name': p.name,
    'Category': p.category,
    'Brand': p.brand,
    'Price': p.price,
    'Stock': p.stockCount,
    'Rating': p.rating || 'N/A',
    'Reviews': p.reviewCount || 0,
    'Seller': typeof p.seller === 'object' ? p.seller.storeName || p.seller.name : p.seller,
    'Created': new Date(p.createdAt).toLocaleDateString(),
  }));
}

export function prepareUsersForExport(users: any[]) {
  return users.map((u) => ({
    'User ID': u._id,
    'Name': u.name,
    'Email': u.email,
    'Role': u.role,
    'Address': u.address || 'N/A',
    'Store Name': u.storeName || 'N/A',
    'Seller Status': u.sellerStatus || 'N/A',
    'Joined': new Date(u.createdAt).toLocaleDateString(),
  }));
}

export function prepareOrdersForExport(orders: any[]) {
  return orders.map((o) => ({
    'Order ID': o._id,
    'Customer': o.customer?.name || 'N/A',
    'Email': o.customer?.email || 'N/A',
    'Items': o.items?.length || 0,
    'Subtotal': o.subtotal || 0,
    'Delivery Fee': o.deliveryFee || 0,
    'Total': o.total || 0,
    'Status': o.status,
    'Payment Method': o.paymentMethod || 'N/A',
    'Shipping Address': o.shippingAddress || 'N/A',
    'Created': new Date(o.createdAt).toLocaleDateString(),
  }));
}
