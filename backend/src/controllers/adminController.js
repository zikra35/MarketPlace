const { validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');

// User Management

const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (role) {
      filter.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: users,
      metadata: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { newRole } = req.body;

    const validRoles = ['customer', 'seller', 'admin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.role = newRole;

    // If changing to seller, set sellerStatus to pending
    if (newRole === 'seller' && !user.sellerStatus) {
      user.sellerStatus = 'pending';
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Seller Management

const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (user.sellerStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Seller is not pending approval' });
    }

    user.sellerStatus = 'approved';
    await user.save();

    const updatedUser = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (user.sellerStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Seller is not pending approval' });
    }

    user.sellerStatus = 'rejected';
    await user.save();

    const updatedUser = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPendingSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await User.countDocuments({
      role: 'seller',
      sellerStatus: 'pending',
    });

    const sellers = await User.find({
      role: 'seller',
      sellerStatus: 'pending',
    })
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: sellers,
      metadata: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getStats = async (req, res) => {
  try {
    // Calculate total users
    const totalUsers = await User.countDocuments();

    // Calculate total products
    const totalProducts = await Product.countDocuments();

    // Calculate total orders
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue (sum of all order totals except cancelled)
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Calculate users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const usersByRoleObj = {};
    usersByRole.forEach(item => {
      usersByRoleObj[item._id] = item.count;
    });

    // Calculate orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const ordersByStatusObj = {};
    ordersByStatus.forEach(item => {
      ordersByStatusObj[item._id] = item.count;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        usersByRole: usersByRoleObj,
        ordersByStatus: ordersByStatusObj,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Warn Seller
const warnSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;

    const seller = await User.findById(id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (!seller.warnings) {
      seller.warnings = [];
    }

    seller.warnings.push({
      reason: reason || 'Violation of terms and conditions',
      issuedAt: new Date(),
      issuedBy: adminId,
    });

    seller.warningsCount = seller.warnings.length;

    // Suspend seller if 3 or more warnings
    if (seller.warningsCount >= 3 && !seller.isSuspended) {
      seller.isSuspended = true;
      seller.sellerStatus = 'suspended';
      seller.suspensionReason = 'Suspended due to multiple warnings';
      seller.suspendedAt = new Date();
    }

    await seller.save();

    const updatedSeller = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({
      success: true,
      message: `Seller warned. Total warnings: ${updatedSeller.warningsCount}`,
      data: updatedSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete Seller
const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Delete all products by this seller
    await Product.deleteMany({ sellerId: id });

    // Delete the seller
    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Seller and their products deleted successfully',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get All Sellers (Monitor)
const getAllSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, isSuspended } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    let filter = { role: 'seller' };

    // Filter by seller status
    if (status && status !== 'all') {
      filter.sellerStatus = status;
    }

    // Filter by suspension status
    if (isSuspended === 'true') {
      filter.isSuspended = true;
    } else if (isSuspended === 'false') {
      filter.isSuspended = false;
    }

    const totalItems = await User.countDocuments(filter);

    const sellers = await User.find(filter)
      .select('-password -refreshToken')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: sellers,
      metadata: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get Seller Details (Monitor Individual Seller)
const getSellerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id).select('-password -refreshToken');

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    // Get seller's products count
    const productsCount = await Product.countDocuments({ sellerId: id });

    // Get seller's orders count
    const ordersCount = await Order.countDocuments({ sellerId: id });

    // Get seller's reviews
    const reviews = await Review.find({ sellerId: id });

    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        seller,
        stats: {
          productsCount,
          ordersCount,
          reviewsCount: reviews.length,
          avgRating,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Remove Warning
const removeWarning = async (req, res) => {
  try {
    const { id, warningIndex } = req.params;
    const index = parseInt(warningIndex, 10);

    const seller = await User.findById(id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (!seller.warnings || index < 0 || index >= seller.warnings.length) {
      return res.status(400).json({ success: false, message: 'Invalid warning index' });
    }

    seller.warnings.splice(index, 1);
    seller.warningsCount = seller.warnings.length;

    // Check if we should unsuspend
    if (seller.warningsCount < 3 && seller.isSuspended) {
      seller.isSuspended = false;
      seller.sellerStatus = 'approved';
      seller.suspensionReason = '';
      seller.suspendedAt = null;
    }

    await seller.save();

    const updatedSeller = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Warning removed successfully',
      data: updatedSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Suspend Seller
const suspendSeller = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { reason } = req.body;

    const seller = await User.findById(id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    seller.isSuspended = true;
    seller.sellerStatus = 'suspended';
    seller.suspensionReason = reason || 'Suspended by admin';
    seller.suspendedAt = new Date();

    await seller.save();

    const updatedSeller = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Seller suspended successfully',
      data: updatedSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Unsuspend Seller
const unsuspendSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await User.findById(id);

    if (!seller || seller.role !== 'seller') {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    if (!seller.isSuspended) {
      return res.status(400).json({ success: false, message: 'Seller is not suspended' });
    }

    seller.isSuspended = false;
    seller.sellerStatus = 'approved';
    seller.suspensionReason = '';
    seller.suspendedAt = null;

    await seller.save();

    const updatedSeller = await User.findById(id).select('-password -refreshToken');

    return res.status(200).json({
      success: true,
      message: 'Seller unsuspended successfully',
      data: updatedSeller,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
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
};
