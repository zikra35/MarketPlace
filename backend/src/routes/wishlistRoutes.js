const express = require('express');
const { param } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  getWishlist,
  addProduct,
  removeProduct,
} = require('../controllers/wishlistController');

const router = express.Router();

// Get wishlist (customer only)
router.get(
  '/',
  authenticate,
  requireRole('customer'),
  getWishlist
);

// Add product to wishlist (customer only)
router.post(
  '/:productId',
  authenticate,
  requireRole('customer'),
  [
    param('productId').notEmpty().withMessage('Product ID is required'),
  ],
  addProduct
);

// Remove product from wishlist (customer only)
router.delete(
  '/:productId',
  authenticate,
  requireRole('customer'),
  [
    param('productId').notEmpty().withMessage('Product ID is required'),
  ],
  removeProduct
);

module.exports = router;
