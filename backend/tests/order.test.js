const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const env = require('../src/config/env');

let app;
let customerToken;
let customerId;
let sellerToken;
let sellerId;
let adminToken;
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

describe('Order Management Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

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
      price: 30,
      category: 'Electronics',
      brand: 'TestBrand',
      description: 'A test product',
      seller: sellerId,
      stockCount: 10,
    });

    productId = product._id;
  });

  describe('POST /orders', () => {
    it('should create order as customer', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: productId.toString(),
              quantity: 2,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customer).toBe(customerId);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].quantity).toBe(2);
      expect(res.body.data.items[0].productName).toBe('Test Product');
      expect(res.body.data.subtotal).toBe(60);
      expect(res.body.data.deliveryFee).toBe(5);
      expect(res.body.data.total).toBe(65);
      expect(res.body.data.status).toBe('pending');
    });

    it('should calculate free delivery for orders over $50', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: productId.toString(),
              quantity: 2,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.subtotal).toBe(60);
      expect(res.body.data.deliveryFee).toBe(0);
      expect(res.body.data.total).toBe(60);
    });

    it('should decrement product stock', async () => {
      await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: productId.toString(),
              quantity: 3,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      const product = await Product.findById(productId);
      expect(product.stockCount).toBe(7);
    });

    it('should reject order with empty items', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('at least one item');
    });

    it('should reject order with insufficient stock', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: productId.toString(),
              quantity: 20,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('should reject order with non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          items: [
            {
              productId: fakeId.toString(),
              quantity: 1,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should reject order by non-customer', async () => {
      const res = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          items: [
            {
              productId: productId.toString(),
              quantity: 1,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /orders', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 30,
            quantity: 2,
            seller: sellerId,
          },
        ],
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
        status: 'pending',
        subtotal: 60,
        deliveryFee: 0,
        total: 60,
      });

      orderId = order._id;
    });

    it('should get customer orders', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._id).toBe(orderId.toString());
    });

    it('should get seller orders', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 30,
            quantity: 2,
            seller: sellerId,
          },
        ],
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
        status: 'pending',
        subtotal: 60,
        deliveryFee: 0,
        total: 60,
      });

      orderId = order._id;
    });

    it('should get order by id as customer', async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(orderId.toString());
    });

    it('should get order by id as seller with products', async () => {
      const res = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should reject unauthorized access', async () => {
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
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for non-existent order', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/orders/${fakeId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 30,
            quantity: 2,
            seller: sellerId,
          },
        ],
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
        status: 'pending',
        subtotal: 60,
        deliveryFee: 0,
        total: 60,
      });

      orderId = order._id;
    });

    it('should cancel pending order', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('cancelled');
    });

    it('should restore stock on cancellation', async () => {
      const productBefore = await Product.findById(productId);
      const stockBefore = productBefore.stockCount;

      await request(app)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      const productAfter = await Product.findById(productId);
      expect(productAfter.stockCount).toBe(stockBefore + 2);
    });

    it('should reject cancellation of non-pending order', async () => {
      await Order.findByIdAndUpdate(orderId, { status: 'shipped' });

      const res = await request(app)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('pending');
    });
  });

  describe('PATCH /orders/:id/status', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        customer: customerId,
        items: [
          {
            product: productId,
            productName: 'Test Product',
            price: 30,
            quantity: 2,
            seller: sellerId,
          },
        ],
        shippingAddress: '123 Main St',
        paymentMethod: 'credit_card',
        status: 'pending',
        subtotal: 60,
        deliveryFee: 0,
        total: 60,
      });

      orderId = order._id;
    });

    it('should update order status as admin', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newStatus: 'confirmed',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('confirmed');
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newStatus: 'invalid_status',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-admin status update', async () => {
      const res = await request(app)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          newStatus: 'confirmed',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /orders/admin/all', () => {
    beforeEach(async () => {
      await Order.create([
        {
          customer: customerId,
          items: [
            {
              product: productId,
              productName: 'Test Product',
              price: 30,
              quantity: 2,
              seller: sellerId,
            },
          ],
          shippingAddress: '123 Main St',
          paymentMethod: 'credit_card',
          status: 'pending',
          subtotal: 60,
          deliveryFee: 0,
          total: 60,
        },
        {
          customer: customerId,
          items: [
            {
              product: productId,
              productName: 'Test Product',
              price: 30,
              quantity: 1,
              seller: sellerId,
            },
          ],
          shippingAddress: '456 Oak Ave',
          paymentMethod: 'paypal',
          status: 'delivered',
          subtotal: 30,
          deliveryFee: 5,
          total: 35,
        },
      ]);
    });

    it('should get all orders as admin', async () => {
      const res = await request(app)
        .get('/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.metadata.totalItems).toBe(2);
    });

    it('should filter orders by status', async () => {
      const res = await request(app)
        .get('/orders/admin/all?status=pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe('pending');
    });

    it('should reject non-admin access', async () => {
      const res = await request(app)
        .get('/orders/admin/all')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
