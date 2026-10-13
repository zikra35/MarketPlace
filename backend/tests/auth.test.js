const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const env = require('../src/config/env');

let app;

beforeAll(async () => {
  await mongoose.connect(env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app = require('../src/index');
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Authentication Endpoints', () => {
  describe('POST /register', () => {
    it('should register a new customer', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'customer@test.com',
          password: 'password123',
          name: 'Test Customer',
          role: 'customer',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('customer@test.com');
      expect(res.body.data.role).toBe('customer');
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it('should register a new seller with pending status', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          name: 'Test Seller',
          role: 'seller',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('seller');
      expect(res.body.data.sellerStatus).toBe('pending');
      expect(res.body.data.storeName).toBe('');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          name: 'First User',
          role: 'customer',
        });

      const res = await request(app)
        .post('/register')
        .send({
          email: 'duplicate@test.com',
          password: 'password123',
          name: 'Second User',
          role: 'customer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already registered');
    });

    it('should reject password less than 8 characters', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'short@test.com',
          password: 'short',
          name: 'Test User',
          role: 'customer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Password must be at least 8 characters');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          role: 'customer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await request(app)
        .post('/register')
        .send({
          email: 'login@test.com',
          password: 'password123',
          name: 'Login Test',
          role: 'customer',
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('login@test.com');
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.refreshToken).toBeUndefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /logout', () => {
    let accessToken;

    beforeEach(async () => {
      await User.deleteMany({});
      const registerRes = await request(app)
        .post('/register')
        .send({
          email: 'logout@test.com',
          password: 'password123',
          name: 'Logout Test',
          role: 'customer',
        });

      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'logout@test.com',
          password: 'password123',
        });

      accessToken = loginRes.body.data.accessToken;
    });

    it('should logout authenticated user', async () => {
      const res = await request(app)
        .post('/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');
    });

    it('should reject logout without token', async () => {
      const res = await request(app).post('/logout');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Unauthorized');
    });
  });

  describe('POST /refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      await User.deleteMany({});
      await request(app)
        .post('/register')
        .send({
          email: 'refresh@test.com',
          password: 'password123',
          name: 'Refresh Test',
          role: 'customer',
        });

      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'refresh@test.com',
          password: 'password123',
        });

      refreshToken = loginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    });

    it('should refresh access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/refresh')
        .set('Cookie', `refreshToken=${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject refresh without token', async () => {
      const res = await request(app).post('/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Refresh token missing or invalid');
    });
  });

  describe('POST /admin/create', () => {
    let adminAccessToken;

    beforeEach(async () => {
      await User.deleteMany({});
      const adminUser = new User({
        email: 'admin@test.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin',
      });
      await adminUser.save();

      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      adminAccessToken = loginRes.body.data.accessToken;
    });

    it('should create admin user as admin', async () => {
      const res = await request(app)
        .post('/admin/create')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          email: 'newadmin@test.com',
          password: 'password123',
          name: 'New Admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('admin');
      expect(res.body.data.email).toBe('newadmin@test.com');
    });

    it('should reject non-admin creating admin', async () => {
      const customerRes = await request(app)
        .post('/register')
        .send({
          email: 'customer@test.com',
          password: 'password123',
          name: 'Customer',
          role: 'customer',
        });

      const loginRes = await request(app)
        .post('/login')
        .send({
          email: 'customer@test.com',
          password: 'password123',
        });

      const customerToken = loginRes.body.data.accessToken;

      const res = await request(app)
        .post('/admin/create')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          email: 'another@test.com',
          password: 'password123',
          name: 'Another Admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Forbidden');
    });
  });
});
