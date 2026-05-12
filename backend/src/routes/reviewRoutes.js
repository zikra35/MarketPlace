const express = require('express');
const { body, param } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  createReview,
  getReviews,
  deleteReview,
} = require('../controllers/reviewController');

const router = express.Router();

// Create review (customer only)
router.post(
  '/product/:productId',
  authenticate,
  requireRole('customer'),
  [
    param('productId').notEmpty().withMessage('Product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString().withMessage('Comment must be a string'),
  ],
  createReview
);

// Get reviews for product (public)
router.get(
  '/product/:productId',
  [
    param('productId').notEmpty().withMessage('Product ID is required'),
  ],
  getReviews
);

// Delete review (author or admin)
router.delete(
  '/:reviewId',
  authenticate,
  [
    param('reviewId').notEmpty().withMessage('Review ID is required'),
  ],
  deleteReview
);

module.exports = router;
