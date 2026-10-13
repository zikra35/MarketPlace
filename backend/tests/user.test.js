const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const env = require('../src/config/env');

let app;
let accessToken;
let userId;

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

describe('User Management Endpoints', () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'user@test.com',
        password: 'password123',
        name: 'Test User',
        role: 'customer',
      });

    userId = registerRes.body.data._id;

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'password123',
      });

    accessToken = loginRes.body.data.accessToken;
  });

  describe('GET /users/me', () => {
    it('should get authenticated user profile', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('user@test.com');
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshToken).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/users/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /users/me', () => {
    it('should update customer profile with name and address', async () => {
      const res = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Updated Name',
          address: '123 Main St',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.address).toBe('123 Main St');
    });

    it('should reject storeName update for customer', async () => {
      const res = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          storeName: 'My Store',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only sellers can update storeName');
    });

    it('should allow seller to update storeName', async () => {
      await User.deleteMany({});

      const sellerRes = await request(app)
        .post('/auth/register')
        .send({
          email: 'seller@test.com',
          password: 'password123',
          name: 'Test Seller',
          role: 'seller',
        });

      const sellerLoginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'seller@test.com',
          password: 'password123',
        });

      const sellerToken = sellerLoginRes.body.data.accessToken;

      const res = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          name: 'Updated Seller',
          address: '456 Store Ave',
          storeName: 'My Awesome Store',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Seller');
      expect(res.body.data.address).toBe('456 Store Ave');
      expect(res.body.data.storeName).toBe('My Awesome Store');
    });

    it('should reject empty name', async () => {
      const res = await request(app)
        .put('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .put('/users/me')
        .send({
          name: 'Updated Name',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /users/me/password', () => {
    it('should change password with correct current password', async () => {
      const res = await request(app)
        .put('/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Password changed successfully');

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'newpassword456',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      const res = await request(app)
        .put('/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Current password is incorrect');
    });

    it('should reject new password less than 8 characters', async () => {
      const res = await request(app)
        .put('/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'short',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('New password must be at least 8 characters');
    });

    it('should reject request without token', async () => {
      const res = await request(app)
        .put('/users/me/password')
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword456',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
