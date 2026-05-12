const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  getUsers,
  changeUserRole,
  deleteUser,
  approveSeller,
  rejectSeller,
  getPendingSellers,
  getStats,
  warnSeller,
  deleteSeller,
  getAllSellers,
  getSellerDetails,
  removeWarning,
  suspendSeller,
  unsuspendSeller,
} = require('../controllers/adminController');
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

const router = express.Router();

// User Management

// Get all users (admin only)
router.get(
  '/users',
  authenticate,
  requireRole('admin'),
  getUsers
);

// Change user role (admin only)
router.patch(
  '/users/:id/role',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('User ID is required'),
    body('newRole').notEmpty().withMessage('New role is required'),
  ],
  changeUserRole
);

// Delete user (admin only)
router.delete(
  '/users/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('User ID is required'),
  ],
  deleteUser
);

// Seller Management

// Get all sellers with filters (admin only) - Monitor
router.get(
  '/sellers',
  authenticate,
  requireRole('admin'),
  getAllSellers
);

// Get specific seller details (admin only)
router.get(
  '/sellers/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
  ],
  getSellerDetails
);

// Approve seller (admin only)
router.patch(
  '/sellers/:id/approve',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
  ],
  approveSeller
);

// Reject seller (admin only)
router.patch(
  '/sellers/:id/reject',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
  ],
  rejectSeller
);

// Warn seller (admin only)
router.patch(
  '/sellers/:id/warn',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
    body('reason').optional().isString(),
  ],
  warnSeller
);

// Remove warning from seller (admin only)
router.patch(
  '/sellers/:id/warning/:warningIndex/remove',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
    param('warningIndex').isNumeric().withMessage('Warning index must be numeric'),
  ],
  removeWarning
);

// Suspend seller (admin only)
router.patch(
  '/sellers/:id/suspend',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
    body('reason').optional().isString(),
  ],
  suspendSeller
);

// Unsuspend seller (admin only)
router.patch(
  '/sellers/:id/unsuspend',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
  ],
  unsuspendSeller
);

// Delete seller (admin only)
router.delete(
  '/sellers/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Seller ID is required'),
  ],
  deleteSeller
);

// Get pending sellers (admin only)
router.get(
  '/sellers/pending',
  authenticate,
  requireRole('admin'),
  getPendingSellers
);

// Statistics

// Get statistics (admin only)
router.get(
  '/stats',
  authenticate,
  requireRole('admin'),
  getStats
);

// Order Management

// Get all orders (admin only)
router.get(
  '/orders',
  authenticate,
  requireRole('admin'),
  getAllOrders
);

// Update order status (admin only)
router.patch(
  '/orders/:id/status',
  authenticate,
  requireRole('admin'),
  [
    body('newStatus').notEmpty().withMessage('New status is required'),
  ],
  updateOrderStatus
);

// Delete order (admin only)
router.delete(
  '/orders/:id',
  authenticate,
  requireRole('admin'),
  [
    param('id').notEmpty().withMessage('Order ID is required'),
  ],
  deleteOrder
);

module.exports = router;
