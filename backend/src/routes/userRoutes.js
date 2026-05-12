const express = require('express');
const { body } = require('express-validator');
const authenticate = require('../middleware/authenticate');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticate, getProfile);

router.put(
  '/me',
  authenticate,
  [
    body('name').optional().isString().trim().notEmpty().withMessage('Name must be a non-empty string'),
    body('address').optional().isString().trim().notEmpty().withMessage('Address must be a non-empty string'),
    body('phone').optional().isString().trim().withMessage('Phone must be a valid string'),
    body('dateOfBirth').optional().isString().withMessage('Date of birth must be a valid date'),
    body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Gender must be male, female, or other'),
    body('storeName').optional().isString().trim().notEmpty().withMessage('Store name must be a non-empty string'),
  ],
  updateProfile
);

router.put(
  '/me/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').notEmpty().withMessage('New password is required'),
  ],
  changePassword
);

module.exports = router;
