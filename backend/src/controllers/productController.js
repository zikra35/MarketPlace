const { validationResult } = require('express-validator');
const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { name, price, category, brand, description, image, stockCount, condition, colors, sizes, originalPrice, isFeatured, isFlashDeal, isBestSeller, isNewArrival } = req.body;

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

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be a positive number' });
    }

    const product = new Product({
      name,
      price,
      category,
      brand,
      description,
      image,
      stockCount: stockCount || 0,
      condition: condition || 'new',
      colors: colors || [],
      sizes: sizes || [],
      originalPrice: originalPrice || price,
      featured: isFeatured || false,
      flashDeal: isFlashDeal || false,
      bestSeller: isBestSeller || false,
      newArrival: isNewArrival || false,
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
    const { q, category, brand, condition, minPrice, maxPrice, inStock, featured, flashDeal, bestSeller, newArrival, page = 1, limit = 10, sort } = req.query;

    let filter = {};

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { name: searchRegex },
        { brand: searchRegex },
        { category: searchRegex },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (condition) {
      filter.condition = condition;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) {
        filter.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice !== undefined) {
        filter.price.$lte = parseFloat(maxPrice);
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

    let sortOption = {};
    if (sort) {
      if (sort === 'price_asc') {
        sortOption.price = 1;
      } else if (sort === 'price_desc') {
        sortOption.price = -1;
      } else if (sort === 'rating') {
        sortOption.rating = -1;
      } else if (sort === 'newest') {
        sortOption.createdAt = -1;
      }
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('seller', 'name email storeName');

    const totalPages = Math.ceil(totalItems / limitNum);

    console.log(`[Products] Found ${products.length} products, total: ${totalItems}`);

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

    const { name, price, category, brand, description, stockCount, condition, colors, sizes, specifications, featured, flashDeal, bestSeller, newArrival } = req.body;

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = price;
    if (category !== undefined) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (description !== undefined) product.description = description;
    if (stockCount !== undefined) product.stockCount = stockCount;
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
    const products = await Product.find({ seller: req.user._id });

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
