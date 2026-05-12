const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Wishlist = require('../src/models/Wishlist');
const env = require('../src/config/env');

let app;
let customerToken;
let customerId;
let sellerToken;
let sellerId;
let productId1;
let productId2;

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
  await Wishlist.deleteMany({});
  await mongoose.connection.close();
});

describe('Wishlist Management Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Wishlist.deleteMany({});

    // Create customer
    const customerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'customer@test.com',
        password: 'password123',
        name: 'Test Customer',
        role: 'customer',
      });

    customerId = customerRes.body.data._id;

    const customerLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'password123',
      });

    customerToken = customerLoginRes.body.data.accessToken;

    // Create seller
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

    // Create products
    const product1 = await Product.create({
      name: 'Product 1',
      price: 29.99,
      category: 'Electronics',
      brand: 'Brand1',
      description: 'First product',
      seller: sellerId,
      stockCount: 10,
    });

    productId1 = product1._id;

    const product2 = await Product.create({
      name: 'Product 2',
      price: 49.99,
      category: 'Electronics',
      brand: 'Brand2',
      description: 'Second product',
      seller: sellerId,
      stockCount: 5,
    });

    productId2 = product2._id;
  });

  describe('GET /wishlist', () => {
    it('should get empty wishlist for new customer', async () => {
      const res = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBe(customerId);
      expect(res.body.data.products).toEqual([]);
    });

    it('should create wishlist if not exists', async () => {
      const res = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const wishlist = await Wishlist.findOne({ user: customerId });
      expect(wishlist).toBeDefined();
    });

    it('should get wishlist with products', async () => {
      // Add product to wishlist
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0]._id).toBe(productId1.toString());
    });

    it('should reject non-customer access', async () => {
      const res = await request(app)
        .get('/wishlist')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/wishlist');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /wishlist/:productId', () => {
    it('should add product to wishlist', async () => {
      const res = await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0]._id).toBe(productId1.toString());
    });

    it('should add multiple products to wishlist', async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .post(`/wishlist/${productId2}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(2);
    });

    it('should reject duplicate product in wishlist', async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const res = await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already in wishlist');
    });

    it('should reject non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/wishlist/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should reject non-customer access', async () => {
      const res = await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app).post(`/wishlist/${productId1}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /wishlist/:productId', () => {
    beforeEach(async () => {
      await request(app)
        .post(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      await request(app)
        .post(`/wishlist/${productId2}`)
        .set('Authorization', `Bearer ${customerToken}`);
    });

    it('should remove product from wishlist', async () => {
      const res = await request(app)
        .delete(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBe(1);
      expect(res.body.data.products[0]._id).toBe(productId2.toString());
    });

    it('should reject removing non-existent product from wishlist', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/wishlist/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not in wishlist');
    });

    it('should reject non-customer access', async () => {
      const res = await request(app)
        .delete(`/wishlist/${productId1}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app).delete(`/wishlist/${productId1}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
