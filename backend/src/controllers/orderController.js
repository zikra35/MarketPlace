const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items array is not empty
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }

    // Validate each product exists and has sufficient stock
    const orderItems = [];
    let subtotal = 0;
    const productsToUpdate = [];

    // Atomic validation: check all products exist and have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      if (item.quantity > product.stockCount) {
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }

      // Store product details at order time
      orderItems.push({
        product: product._id,
        productName: product.name,
        productImage: product.image,
        price: product.price,
        quantity: item.quantity,
        seller: product.seller,
      });

      subtotal += product.price * item.quantity;
      
      // Track products to update
      productsToUpdate.push({
        product,
        quantity: item.quantity,
      });
    }

    // Now decrement stock atomically after validation passes
    for (const { product, quantity } of productsToUpdate) {
      // Use atomic update to prevent race conditions
      await Product.findByIdAndUpdate(
        product._id,
        {
          $inc: { stockCount: -quantity },
          $set: { inStock: product.stockCount - quantity > 0 },
        }
      );
    }

    // Calculate delivery fee
    const deliveryFee = subtotal > 50 ? 0 : 5;
    const total = subtotal + deliveryFee;

    // Create order
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      subtotal,
      deliveryFee,
      total,
    });

    await order.save();

    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrders = async (req, res) => {
  try {
    let orders;

    if (req.user.role === 'customer') {
      orders = await Order.find({ customer: req.user._id })
        .populate('customer', 'name email')
        .populate('items.seller', 'name email storeName');
    } else if (req.user.role === 'seller') {
      // Get orders containing items where seller matches
      orders = await Order.find({ 'items.seller': req.user._id })
        .populate('customer', 'name email')
        .populate('items.seller', 'name email storeName');
    } else if (req.user.role === 'admin') {
      // Admin can see all orders
      orders = await Order.find()
        .populate('customer', 'name email')
        .populate('items.seller', 'name email storeName');
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('customer', 'name email')
      .populate('items.seller', 'name email storeName');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isSellerWithProducts = order.items.some(item => item.seller._id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isSellerWithProducts && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate user is order customer
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Validate order status is pending
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }

    // Restore stock for each product
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stockCount += item.quantity;
        product.inStock = true;
        await product.save();
      }
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { newStatus } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = newStatus;
    await order.save();

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { status, customerId, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (customerId) {
      filter.customer = customerId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limitNum)
      .populate('customer', 'name email')
      .populate('items.seller', 'name email storeName');

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: orders,
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

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Restore stock for each product if not already delivered
    if (order.status !== 'delivered') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stockCount += item.quantity;
          product.inStock = true;
          await product.save();
        }
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  getAllOrders,
  deleteOrder,
};
