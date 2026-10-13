const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const env = require('../src/config/env');

let app;
let sellerToken;
let sellerId;
let customerToken;
let adminToken;

beforeAll(async () => {
  await mongoose.connect(env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app = require('../src/index');
});

afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe('Product Management Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});

    const sellerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'seller@test.com',
        password: 'password123',
        name: 'Test Seller',
        role: 'seller',
      });

    sellerId = sellerRes.body.data._id;

    const sellerLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'seller@test.com',
        password: 'password123',
      });

    sellerToken = sellerLoginRes.body.data.accessToken;

    const customerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'customer@test.com',
        password: 'password123',
        name: 'Test Customer',
        role: 'customer',
      });

    const customerLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123',
      });

    customerToken = customerLoginRes.body.data.accessToken;

    const adminUser = new User({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    });
    await adminUser.save();

    const adminLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    adminToken = adminLoginRes.body.data.accessToken;
  });

  describe('POST /products', () => {
    it('should create product as seller', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'A test product',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Product');
      expect(res.body.data.price).toBe(99.99);
      expect(res.body.data.seller).toBe(sellerId);
      expect(res.body.data.rating).toBe(0);
      expect(res.body.data.reviewCount).toBe(0);
    });

    it('should reject product creation by customer', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'A test product',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject product with missing required fields', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test Product',
          price: 99.99,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject product with negative price', async () => {
      const res = await request(app)
        .post('/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Test Product',
          price: -10,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'A test product',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .post('/products')
        .send({
          name: 'Test Product',
          price: 99.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'A test product',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /products', () => {
    beforeEach(async () => {
      await Product.create([
        {
          name: 'Laptop',
          price: 999.99,
          category: 'Electronics',
          brand: 'Dell',
          description: 'High-end laptop',
          seller: sellerId,
          stockCount: 10,
          featured: true,
        },
        {
          name: 'Mouse',
          price: 29.99,
          category: 'Electronics',
          brand: 'Logitech',
          description: 'Wireless mouse',
          seller: sellerId,
          stockCount: 50,
          bestSeller: true,
        },
        {
          name: 'Keyboard',
          price: 79.99,
          category: 'Electronics',
          brand: 'Corsair',
          description: 'Mechanical keyboard',
          seller: sellerId,
          stockCount: 0,
          newArrival: true,
        },
      ]);
    });

    it('should get all products with pagination', async () => {
      const res = await request(app).get('/products');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
      expect(res.body.metadata.currentPage).toBe(1);
      expect(res.body.metadata.totalItems).toBe(3);
      expect(res.body.metadata.itemsPerPage).toBe(10);
    });

    it('should filter products by category', async () => {
      const res = await request(app).get('/products?category=Electronics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('should filter products by brand', async () => {
      const res = await request(app).get('/products?brand=Dell');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('should search products by name', async () => {
      const res = await request(app).get('/products?q=laptop');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('should filter products by price range', async () => {
      const res = await request(app).get('/products?minPrice=50&maxPrice=100');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Keyboard');
    });

    it('should filter products in stock', async () => {
      const res = await request(app).get('/products?inStock=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    it('should filter featured products', async () => {
      const res = await request(app).get('/products?featured=true');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('should sort products by price ascending', async () => {
      const res = await request(app).get('/products?sort=price_asc');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].price).toBe(29.99);
      expect(res.body.data[2].price).toBe(999.99);
    });

    it('should sort products by price descending', async () => {
      const res = await request(app).get('/products?sort=price_desc');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].price).toBe(999.99);
      expect(res.body.data[2].price).toBe(29.99);
    });

    it('should paginate products', async () => {
      const res = await request(app).get('/products?page=1&limit=2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.metadata.currentPage).toBe(1);
      expect(res.body.metadata.totalPages).toBe(2);
    });
  });

  describe('GET /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        brand: 'TestBrand',
        description: 'A test product',
        seller: sellerId,
      });

      productId = product._id;
    });

    it('should get product by id with seller info', async () => {
      const res = await request(app).get(`/products/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Product');
      expect(res.body.data.seller).toBeDefined();
      expect(res.body.data.seller.name).toBe('Test Seller');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/products/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('PUT /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        brand: 'TestBrand',
        description: 'A test product',
        seller: sellerId,
      });

      productId = product._id;
    });

    it('should update product as seller', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Updated Product',
          price: 149.99,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Product');
      expect(res.body.data.price).toBe(149.99);
    });

    it('should reject update by different seller', async () => {
      const otherSellerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'otherseller@test.com',
          password: 'password123',
          name: 'Other Seller',
          role: 'seller',
        });

      const otherSellerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'otherseller@test.com',
          password: 'password123',
        });

      const otherToken = otherSellerLoginRes.body.data.accessToken;

      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          name: 'Hacked Product',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('You can only edit your own products');
    });

    it('should allow admin to update any product', async () => {
      const res = await request(app)
        .put(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Updated Product',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Admin Updated Product');
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/products/${fakeId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Updated Product',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 99.99,
        category: 'Electronics',
        brand: 'TestBrand',
        description: 'A test product',
        seller: sellerId,
      });

      productId = product._id;
    });

    it('should delete product as seller', async () => {
      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product deleted successfully');

      const product = await Product.findById(productId);
      expect(product).toBeNull();
    });

    it('should reject delete by different seller', async () => {
      const otherSellerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'otherseller@test.com',
          password: 'password123',
          name: 'Other Seller',
          role: 'seller',
        });

      const otherSellerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'otherseller@test.com',
          password: 'password123',
        });

      const otherToken = otherSellerLoginRes.body.data.accessToken;

      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('You can only delete your own products');
    });

    it('should allow admin to delete any product', async () => {
      const res = await request(app)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/products/${fakeId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('GET /products/seller/mine', () => {
    beforeEach(async () => {
      const otherSellerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'otherseller@test.com',
          password: 'password123',
          name: 'Other Seller',
          role: 'seller',
        });

      const otherSellerId = otherSellerRes.body.data._id;

      await Product.create([
        {
          name: 'Seller Product 1',
          price: 99.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'Product 1',
          seller: sellerId,
        },
        {
          name: 'Seller Product 2',
          price: 199.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'Product 2',
          seller: sellerId,
        },
        {
          name: 'Other Seller Product',
          price: 299.99,
          category: 'Electronics',
          brand: 'TestBrand',
          description: 'Other product',
          seller: otherSellerId,
        },
      ]);
    });

    it('should get seller products', async () => {
      const res = await request(app)
        .get('/products/seller/mine')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data[0].seller).toBe(sellerId);
      expect(res.body.data[1].seller).toBe(sellerId);
    });

    it('should reject non-seller access', async () => {
      const res = await request(app)
        .get('/products/seller/mine')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/products/seller/mine');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
