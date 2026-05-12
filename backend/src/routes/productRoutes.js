const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const requireRole = require('../middleware/requireRole');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
} = require('../controllers/productController');

const router = express.Router();

router.post(
  '/',
  authenticate,
  requireRole(['seller', 'admin']),
  [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('brand').notEmpty().withMessage('Brand is required'),
    body('description').notEmpty().withMessage('Description is required'),
  ],
  createProduct
);

router.get('/', getAllProducts);

router.get('/seller/mine', authenticate, requireRole('seller'), getSellerProducts);

router.get('/:id', getProductById);

router.put(
  '/:id',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
    body('price').optional().isNumeric().withMessage('Price must be a number'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('brand').optional().notEmpty().withMessage('Brand cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  ],
  updateProduct
);

router.delete('/:id', authenticate, deleteProduct);

module.exports = router;
