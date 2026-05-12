const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const env = require('../src/config/env');

let app;
let adminToken;
let adminId;
let customerId;
let sellerId;
let productId;

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
  await Order.deleteMany({});
  await mongoose.connection.close();
});

describe('Admin Dashboard Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Create admin
    const adminUser = new User({
      email: 'admin@test.com',
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    });
    await adminUser.save();

    adminId = adminUser._id;

    const adminLoginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123',
      });

    adminToken = adminLoginRes.body.data.accessToken;

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

  describe('GET /admin/users', () => {
    it('should get all users as admin', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(3);
      expect(res.body.metadata.totalItems).toBeGreaterThanOrEqual(3);
    });

    it('should exclude password and refreshToken', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data[0].password).toBeUndefined();
      expect(res.body.data[0].refreshToken).toBeUndefined();
    });

    it('should filter users by role', async () => {
      const res = await request(app)
        .get('/admin/users?role=customer')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.every(u => u.role === 'customer')).toBe(true);
    });

    it('should paginate users', async () => {
      const res = await request(app)
        .get('/admin/users?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.metadata.currentPage).toBe(1);
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /admin/users/:id/role', () => {
    it('should change user role as admin', async () => {
      const res = await request(app)
        .patch(`/admin/users/${customerId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'seller',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('seller');
    });

    it('should set sellerStatus to pending when changing to seller', async () => {
      const res = await request(app)
        .patch(`/admin/users/${customerId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'seller',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.sellerStatus).toBe('pending');
    });

    it('should reject invalid role', async () => {
      const res = await request(app)
        .patch(`/admin/users/${customerId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'invalid_role',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid role');
    });

    it('should reject non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/admin/users/${fakeId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newRole: 'seller',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .patch(`/admin/users/${customerId}/role`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          newRole: 'seller',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should delete user as admin', async () => {
      const res = await request(app)
        .delete(`/admin/users/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User deleted successfully');

      const user = await User.findById(customerId);
      expect(user).toBeNull();
    });

    it('should reject non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('User not found');
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .delete(`/admin/users/${customerId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /admin/sellers/:id/approve', () => {
    it('should approve pending seller', async () => {
      const res = await request(app)
        .patch(`/admin/sellers/${sellerId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sellerStatus).toBe('approved');
    });

    it('should reject non-existent seller', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/admin/sellers/${fakeId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Seller not found');
    });

    it('should reject approval of non-seller', async () => {
      const res = await request(app)
        .patch(`/admin/sellers/${customerId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Seller not found');
    });

    it('should reject approval of already approved seller', async () => {
      // First approve
      await request(app)
        .patch(`/admin/sellers/${sellerId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to approve again
      const res = await request(app)
        .patch(`/admin/sellers/${sellerId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not pending');
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .patch(`/admin/sellers/${sellerId}/approve`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /admin/sellers/:id/reject', () => {
    it('should reject pending seller', async () => {
      const res = await request(app)
        .patch(`/admin/sellers/${sellerId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sellerStatus).toBe('rejected');
    });

    it('should reject non-existent seller', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/admin/sellers/${fakeId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Seller not found');
    });

    it('should reject rejection of already rejected seller', async () => {
      // First reject
      await request(app)
        .patch(`/admin/sellers/${sellerId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Try to reject again
      const res = await request(app)
        .patch(`/admin/sellers/${sellerId}/reject`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not pending');
    });
  });

  describe('GET /admin/sellers/pending', () => {
    beforeEach(async () => {
      // Create another pending seller
      await request(app)
        .post('/auth/register')
        .send({
          email: 'seller2@test.com',
          password: 'password123',
          name: 'Seller 2',
          role: 'seller',
        });
    });

    it('should get pending sellers', async () => {
      const res = await request(app)
        .get('/admin/sellers/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.every(s => s.sellerStatus === 'pending')).toBe(true);
    });

    it('should paginate pending sellers', async () => {
      const res = await request(app)
        .get('/admin/sellers/pending?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(1);
      expect(res.body.metadata.currentPage).toBe(1);
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .get('/admin/sellers/pending')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /admin/stats', () => {
    beforeEach(async () => {
      // Create an order
      await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 99.99,
            quantity: 1,
            seller: sellerId,
          },
        ],
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
        status: 'delivered',
        subtotal: 99.99,
        deliveryFee: 0,
        total: 99.99,
      });
    });

    it('should get system statistics', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(3);
      expect(res.body.data.totalProducts).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalOrders).toBeGreaterThanOrEqual(1);
      expect(res.body.data.totalRevenue).toBeGreaterThanOrEqual(99.99);
    });

    it('should include users by role', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.usersByRole).toBeDefined();
      expect(res.body.data.usersByRole.customer).toBeGreaterThanOrEqual(1);
      expect(res.body.data.usersByRole.seller).toBeGreaterThanOrEqual(1);
      expect(res.body.data.usersByRole.admin).toBeGreaterThanOrEqual(1);
    });

    it('should include orders by status', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.ordersByStatus).toBeDefined();
      expect(res.body.data.ordersByStatus.delivered).toBeGreaterThanOrEqual(1);
    });

    it('should calculate total revenue from delivered orders only', async () => {
      // Create a pending order
      await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 99.99,
            quantity: 1,
            seller: sellerId,
          },
        ],
        shippingAddress: '456 Oak Ave',
        paymentMethod: 'paypal',
        status: 'pending',
        subtotal: 99.99,
        deliveryFee: 0,
        total: 99.99,
      });

      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      // Revenue should only include delivered order (99.99), not pending
      expect(res.body.data.totalRevenue).toBe(99.99);
    });

    it('should reject non-admin access', async () => {
      const customerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = customerLoginRes.body.data.accessToken;

      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
