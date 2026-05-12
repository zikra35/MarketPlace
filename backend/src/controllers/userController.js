const { validationResult } = require('express-validator');
const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, address, phone, dateOfBirth, gender, storeName, description } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Name must be a non-empty string' });
      }
      user.name = name;
    }

    if (address !== undefined) {
      if (typeof address !== 'string' || address.trim() === '') {
        return res.status(400).json({ success: false, message: 'Address must be a non-empty string' });
      }
      user.address = address;
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string') {
        return res.status(400).json({ success: false, message: 'Phone must be a string' });
      }
      user.phone = phone;
    }

    if (dateOfBirth !== undefined) {
      if (typeof dateOfBirth !== 'string') {
        return res.status(400).json({ success: false, message: 'Date of birth must be a string' });
      }
      user.dateOfBirth = dateOfBirth;
    }

    if (gender !== undefined) {
      if (typeof gender !== 'string' || !['male', 'female', 'other', ''].includes(gender)) {
        return res.status(400).json({ success: false, message: 'Invalid gender value' });
      }
      user.gender = gender;
    }

    if (storeName !== undefined) {
      if (user.role !== 'seller') {
        return res.status(403).json({ success: false, message: 'Only sellers can update storeName' });
      }
      if (typeof storeName !== 'string' || storeName.trim() === '') {
        return res.status(400).json({ success: false, message: 'Store name must be a non-empty string' });
      }
      user.storeName = storeName;
    }

    if (description !== undefined) {
      if (user.role !== 'seller') {
        return res.status(403).json({ success: false, message: 'Only sellers can update description' });
      }
      if (typeof description !== 'string') {
        return res.status(400).json({ success: false, message: 'Description must be a string' });
      }
      user.description = description;
    }

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.refreshToken;

    return res.status(200).json({ success: true, data: userResponse });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
