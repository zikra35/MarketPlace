const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Review = require('../src/models/Review');
const env = require('../src/config/env');

let app;
let customerToken;
let customerId;
let sellerToken;
let sellerId;
let adminToken;
let productId;
let reviewId;

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
  await Review.deleteMany({});
  await mongoose.connection.close();
});

describe('Review & Rating System Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});

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

    // Create admin
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

    // Create product
    const product = await Product.create({
      name: 'Test Product',
      price: 99.99,
      category: 'Electronics',
      brand: 'TestBrand',
      description: 'A test product',
      seller: sellerId,
      stockCount: 10,
    });

    productId = product._id;
  });

  describe('POST /reviews/product/:productId', () => {
    it('should create review as customer', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Great product!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(5);
      expect(res.body.data.comment).toBe('Great product!');
      expect(res.body.data.product).toBe(productId.toString());
      expect(res.body.data.user).toBeDefined();

      reviewId = res.body.data._id;
    });

    it('should update product rating on review creation', async () => {
      await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 4,
          comment: 'Good product',
        });

      const product = await Product.findById(productId);
      expect(product.rating).toBe(4);
      expect(product.reviewCount).toBe(1);
    });

    it('should calculate average rating with multiple reviews', async () => {
      // Create first review
      await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Excellent',
        });

      // Create second customer and review
      const customer2Res = await request(app)
        .post('/auth/register')
        .send({
          email: 'customer2@test.com',
          password: 'password123',
          name: 'Customer 2',
          role: 'customer',
        });

      const customer2LoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer2@test.com',
          password: 'password123',
        });

      const customer2Token = customer2LoginRes.body.data.accessToken;

      await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customer2Token}`)
        .send({
          rating: 3,
          comment: 'Average',
        });

      const product = await Product.findById(productId);
      expect(product.rating).toBe(4);
      expect(product.reviewCount).toBe(2);
    });

    it('should reject review with invalid rating', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 10,
          comment: 'Invalid rating',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('between 1 and 5');
    });

    it('should reject duplicate review from same customer', async () => {
      await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Great!',
        });

      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 4,
          comment: 'Changed my mind',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already reviewed');
    });

    it('should reject review for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/reviews/product/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          rating: 5,
          comment: 'Great!',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should reject review by non-customer', async () => {
      const res = await request(app)
        .post(`/reviews/product/${productId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          rating: 5,
          comment: 'Great!',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /reviews/product/:productId', () => {
    beforeEach(async () => {
      const review = await Review.create({
        product: productId,
        user: customerId,
        rating: 5,
        comment: 'Excellent product!',
      });

      reviewId = review._id;

      // Update product rating
      const product = await Product.findById(productId);
      product.rating = 5;
      product.reviewCount = 1;
      await product.save();
    });

    it('should get reviews for product', async () => {
      const res = await request(app).get(`/reviews/product/${productId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].rating).toBe(5);
      expect(res.body.data[0].user).toBeDefined();
    });

    it('should paginate reviews', async () => {
      const res = await request(app).get(`/reviews/product/${productId}?page=1&limit=10`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metadata.currentPage).toBe(1);
      expect(res.body.metadata.totalItems).toBe(1);
    });

    it('should reject non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/reviews/product/${fakeId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('DELETE /reviews/:reviewId', () => {
    let reviewId;

    beforeEach(async () => {
      const review = await Review.create({
        product: productId,
        user: customerId,
        rating: 5,
        comment: 'Excellent product!',
      });

      reviewId = review._id;

      // Update product rating
      const product = await Product.findById(productId);
      product.rating = 5;
      product.reviewCount = 1;
      await product.save();
    });

    it('should delete review as author', async () => {
      const res = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Review deleted successfully');

      const review = await Review.findById(reviewId);
      expect(review).toBeNull();
    });

    it('should update product rating on review deletion', async () => {
      await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      const product = await Product.findById(productId);
      expect(product.rating).toBe(0);
      expect(product.reviewCount).toBe(0);
    });

    it('should delete review as admin', async () => {
      const res = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject deletion by non-author', async () => {
      const otherCustomerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'other@test.com',
          password: 'password123',
          name: 'Other Customer',
          role: 'customer',
        });

      const otherLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'other@test.com',
          password: 'password123',
        });

      const otherToken = otherLoginRes.body.data.accessToken;

      const res = await request(app)
        .delete(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unauthorized');
    });

    it('should reject deletion of non-existent review', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/reviews/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Review not found');
    });
  });
});
