const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

// Create order (customer only)
router.post(
  '/',
  authenticate,
  requireRole('customer'),
  [
    body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  createOrder
);

// Get orders (customer/seller/admin)
router.get('/', authenticate, getOrders);

// Get single order
router.get('/:id', authenticate, getOrderById);

// Cancel order (customer only)
router.patch(
  '/:id/cancel',
  authenticate,
  requireRole('customer'),
  cancelOrder
);

// Update order status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  [
    body('newStatus').notEmpty().withMessage('New status is required'),
  ],
  updateOrderStatus
);

// Delete order (admin only)
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Order ID is required'),
  ],
  deleteOrder
);

// Get all orders (admin only)
router.get(
  '/admin/all',
  authenticate,
  requireRole('admin'),
  getAllOrders
);

module.exports = router;
