const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');

const FREE_DELIVERY_THRESHOLD = 5000;
const STANDARD_DELIVERY_FEE = 299;

const POPULATE_CUSTOMER = ['customer', 'name email'];
const POPULATE_SELLER = ['items.seller', 'name email storeName'];

// A seller should only see (and be paid for) their own items in a multi-vendor order
const toSellerView = (order, sellerId) => {
  const obj = order.toObject();
  obj.items = obj.items.filter(item => {
    const id = item.seller && (item.seller._id || item.seller);
    return id && id.toString() === sellerId.toString();
  });
  obj.subtotal = obj.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  obj.deliveryFee = 0;
  obj.total = obj.subtotal;
  return obj;
};

const restoreStock = async (order) => {
  for (const item of order.items) {
    await Product.updateOne({ _id: item.product }, { $inc: { stockCount: item.quantity } });
  }
};

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

    // Decrement stock atomically. The stockCount condition stops two concurrent
    // orders from overselling; if any update fails, roll back the ones already applied.
    const decremented = [];
    for (const { product, quantity } of productsToUpdate) {
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, stockCount: { $gte: quantity } },
        { $inc: { stockCount: -quantity } },
        { new: true }
      );
      if (!updated) {
        for (const done of decremented) {
          await Product.updateOne({ _id: done.id }, { $inc: { stockCount: done.quantity } });
        }
        return res.status(400).json({ success: false, message: `Insufficient stock for product: ${product.name}` });
      }
      decremented.push({ id: product._id, quantity });
    }

    // Calculate delivery fee (PKR) - keep in sync with DELIVERY_CONFIG in src/lib/constants.ts
    const deliveryFee = subtotal > FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
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
        .sort({ createdAt: -1 })
        .populate(...POPULATE_CUSTOMER)
        .populate(...POPULATE_SELLER);
    } else if (req.user.role === 'seller') {
      // Get orders containing items where seller matches, trimmed to this seller's items
      const sellerOrders = await Order.find({ 'items.seller': req.user._id })
        .sort({ createdAt: -1 })
        .populate(...POPULATE_CUSTOMER)
        .populate(...POPULATE_SELLER);
      orders = sellerOrders.map(order => toSellerView(order, req.user._id));
    } else if (req.user.role === 'admin') {
      // Admin can see all orders
      orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate(...POPULATE_CUSTOMER)
        .populate(...POPULATE_SELLER);
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
    // populated refs can be null if the customer/seller account was deleted
    const userId = req.user._id.toString();
    const isCustomer = !!order.customer && order.customer._id.toString() === userId;
    const isSellerWithProducts = order.items.some(item => item.seller && item.seller._id.toString() === userId);
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isSellerWithProducts && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order' });
    }

    const data = !isCustomer && !isAdmin ? toSellerView(order, req.user._id) : order;
    return res.status(200).json({ success: true, data });
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
    await restoreStock(order);

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

    if (order.status === 'cancelled' && newStatus !== 'cancelled') {
      return res.status(400).json({ success: false, message: 'Cancelled orders cannot be reopened' });
    }

    // Admin cancelling an order puts the stock back, same as a customer cancellation
    if (newStatus === 'cancelled' && order.status !== 'cancelled' && order.status !== 'delivered') {
      await restoreStock(order);
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
      .sort({ createdAt: -1 })
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

    // Restore stock unless it was delivered, or already restored when the order was cancelled
    if (order.status !== 'delivered' && order.status !== 'cancelled') {
      await restoreStock(order);
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
