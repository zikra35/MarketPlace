const { validationResult } = require('express-validator');
const Product = require('../models/Product');

const escapeRegex = (text) => String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accept both the frontend names (isFeatured) and the schema names (featured)
const pickFlag = (body, frontendKey, schemaKey) =>
  body[frontendKey] !== undefined ? Boolean(body[frontendKey]) : body[schemaKey] !== undefined ? Boolean(body[schemaKey]) : undefined;

// Sellers must be approved and not suspended before they can list or edit products
const sellerCanList = (user) =>
  user.role !== 'seller' || (user.sellerStatus === 'approved' && !user.isSuspended);

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    if (!sellerCanList(req.user)) {
      return res.status(403).json({ success: false, message: 'Your seller account must be approved before you can list products' });
    }

    const { name, category, brand, description, image, stockCount, condition, colors, sizes, specifications } = req.body;
    const price = Number(req.body.price);
    const originalPrice = Number(req.body.originalPrice) || undefined;

    if (!name || !price || !category || !brand || !description || !image) {
      const missing = [];
      if (!name) missing.push('name');
      if (!price) missing.push('price');
      if (!category) missing.push('category');
      if (!brand) missing.push('brand');
      if (!description) missing.push('description');
      if (!image) missing.push('image');
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
    }

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const product = new Product({
      name,
      price,
      category,
      brand,
      description,
      image,
      stockCount: Number(stockCount) || 0,
      condition: condition || 'new',
      colors: colors || [],
      sizes: sizes || [],
      specifications: specifications || undefined,
      originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
      featured: pickFlag(req.body, 'isFeatured', 'featured') || false,
      flashDeal: pickFlag(req.body, 'isFlashDeal', 'flashDeal') || false,
      bestSeller: pickFlag(req.body, 'isBestSeller', 'bestSeller') || false,
      newArrival: pickFlag(req.body, 'isNewArrival', 'newArrival') || false,
      seller: req.user._id,
      rating: 0,
      reviewCount: 0,
    });

    await product.save();

    return res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { q, condition, minPrice, maxPrice, minRating, inStock, featured, flashDeal, bestSeller, newArrival, page = 1, limit = 10, sort } = req.query;
    // axios sends arrays as category[]=A&category[]=B; accept a single value or a list
    const category = req.query.category ?? req.query['category[]'];
    const brand = req.query.brand ?? req.query['brand[]'];
    const oneOrMany = (v) => (Array.isArray(v) ? { $in: v.map(String) } : String(v));

    let filter = {};

    if (q) {
      // escape user input so characters like "(" or "+" don't crash the query
      const searchRegex = new RegExp(escapeRegex(q), 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
      ];
    }

    if (category) {
      filter.category = oneOrMany(category);
    }

    if (brand) {
      filter.brand = oneOrMany(brand);
    }

    const ratingMin = parseFloat(minRating);
    if (Number.isFinite(ratingMin) && ratingMin > 0) {
      filter.rating = { $gte: ratingMin };
    }

    if (condition) {
      filter.condition = condition;
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (Number.isFinite(min) || Number.isFinite(max)) {
      filter.price = {};
      if (Number.isFinite(min)) {
        filter.price.$gte = min;
      }
      if (Number.isFinite(max)) {
        filter.price.$lte = max;
      }
    }

    if (inStock === 'true') {
      filter.stockCount = { $gt: 0 };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (flashDeal === 'true') {
      filter.flashDeal = true;
    }

    if (bestSeller === 'true') {
      filter.bestSeller = true;
    }

    if (newArrival === 'true') {
      filter.newArrival = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 10, 100);
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('seller', 'name email storeName');

    const totalPages = Math.ceil(totalItems / limitNum);

    return res.status(200).json({
      success: true,
      data: products,
      metadata: {
        currentPage: pageNum,
        totalPages,
        totalItems,
        itemsPerPage: limitNum,
      },
    });
  } catch (error) {
    console.error('[Products Error]', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('seller', 'name email storeName');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit your own products' });
    }

    if (!sellerCanList(req.user)) {
      return res.status(403).json({ success: false, message: 'Your seller account must be approved before you can edit products' });
    }

    const { name, price, category, brand, description, stockCount, condition, colors, sizes, specifications, image, originalPrice } = req.body;
    const featured = pickFlag(req.body, 'isFeatured', 'featured');
    const flashDeal = pickFlag(req.body, 'isFlashDeal', 'flashDeal');
    const bestSeller = pickFlag(req.body, 'isBestSeller', 'bestSeller');
    const newArrival = pickFlag(req.body, 'isNewArrival', 'newArrival');

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (originalPrice !== undefined) product.originalPrice = Number(originalPrice) > product.price ? Number(originalPrice) : undefined;
    if (image) product.image = image;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (stockCount !== undefined) product.stockCount = Number(stockCount) || 0;
    if (condition !== undefined) product.condition = condition;
    if (colors !== undefined) product.colors = colors;
    if (sizes !== undefined) product.sizes = sizes;
    if (specifications !== undefined) product.specifications = specifications;
    if (featured !== undefined) product.featured = featured;
    if (flashDeal !== undefined) product.flashDeal = flashDeal;
    if (bestSeller !== undefined) product.bestSeller = bestSeller;
    if (newArrival !== undefined) product.newArrival = newArrival;

    await product.save();

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only delete your own products' });
    }

    await Product.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getSellerProducts,
};
