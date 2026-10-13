# MarketPlace Deployment Guide

Complete step-by-step guide to deploy the MarketPlace application (Frontend + Backend).

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Deployment Platforms](#deployment-platforms)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)

### Verify Installation
```bash
node --version
npm --version
git --version
```

---

## Backend Deployment

### Step 1: Clone the Repository
```bash
git clone https://github.com/zikra35/shop-sparkle-933.git
cd shop-sparkle-933
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketplace?retryWrites=true&w=majority

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration (Update for production domain)
CORS_ORIGIN=https://yourdomain.com
```

**Important Security Notes:**
- Generate strong JWT secrets (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Never commit `.env` file to GitHub
- Use environment variables from your hosting platform

### Step 4: Seed Database (Optional - First Time Only)
```bash
npm run seed
```

This creates:
- Default admin user: `admin@sparkle.com` / `Admin@123`
- Default seller: `seller@sparkle.com` / `Seller@123`
- 40 sample products

### Step 5: Test Backend Locally
```bash
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB connected successfully
```

### Step 6: Deploy Backend

#### Option A: Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create your-app-name-backend

# Set environment variables
heroku config:set MONGODB_URI="your-mongodb-uri"
heroku config:set JWT_SECRET="your-jwt-secret"
heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### Option B: Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add MongoDB plugin
5. Set environment variables in Railway dashboard
6. Deploy

#### Option C: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables
7. Deploy

#### Option D: Deploy to AWS EC2
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Clone repository
git clone https://github.com/zikra35/shop-sparkle-933.git
cd shop-sparkle-933/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add your environment variables

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start src/index.js --name "marketplace-backend"
pm2 startup
pm2 save
```

---

## Frontend Deployment

### Step 1: Install Frontend Dependencies
```bash
cd ../  # Go back to root
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=https://your-backend-domain.com/api
```

For local development:
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Build Frontend
```bash
npm run build
```

This creates a `dist` folder with optimized production build.

### Step 4: Test Build Locally
```bash
npm run preview
```

### Step 5: Deploy Frontend

#### Option A: Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# VITE_API_URL=https://your-backend-domain.com/api
```

#### Option B: Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub for automatic deployments
```

#### Option C: Deploy to GitHub Pages
```bash
# Update vite.config.ts base path if needed
# base: '/shop-sparkle-933/'

npm run build

# Deploy dist folder to GitHub Pages
```

#### Option D: Deploy to AWS S3 + CloudFront
```bash
# Build the project
npm run build

# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option E: Deploy to Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init hosting

# Deploy
firebase deploy
```

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your-refresh-secret-min-32-chars` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `production` or `development` |
| `CORS_ORIGIN` | Frontend URL for CORS | `https://yourdomain.com` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.yourdomain.com/api` |

---

## Database Setup

### MongoDB Atlas Setup (Recommended)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for free account

2. **Create a Cluster**
   - Click "Create a Deployment"
   - Choose "M0 Sandbox" (free tier)
   - Select region closest to you
   - Click "Create Deployment"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Set username and password
   - Click "Add User"

4. **Get Connection String**
   - Go to "Databases"
   - Click "Connect"
   - Choose "Drivers"
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials

5. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - For development: Add your IP
   - For production: Add `0.0.0.0/0` (allow all) or specific server IP

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/marketplace?retryWrites=true&w=majority
```

---

## Deployment Platforms Comparison

| Platform | Cost | Ease | Scalability | Best For |
|----------|------|------|-------------|----------|
| **Heroku** | $7-50/month | Easy | Medium | Quick deployment |
| **Railway** | Pay-as-you-go | Easy | High | Flexible pricing |
| **Render** | Free-$20/month | Easy | Medium | Free tier available |
| **Vercel** | Free-$20/month | Very Easy | High | Frontend (Next.js) |
| **Netlify** | Free-$19/month | Very Easy | High | Frontend (Static) |
| **AWS** | Variable | Hard | Very High | Enterprise |
| **DigitalOcean** | $5-40/month | Medium | High | VPS control |

---

## Post-Deployment Verification

### Backend Verification

1. **Check API Health**
   ```bash
   curl https://your-backend-domain.com/api/health
   ```

2. **Test Authentication**
   ```bash
   curl -X POST https://your-backend-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sparkle.com","password":"Admin@123"}'
   ```

3. **Test Product Endpoint**
   ```bash
   curl https://your-backend-domain.com/api/products
   ```

### Frontend Verification

1. **Check if site loads** - Visit your frontend URL
2. **Test login** - Try logging in with test credentials
3. **Test product browsing** - Browse products
4. **Check console** - Open DevTools → Console for errors
5. **Test API calls** - Open DevTools → Network tab and verify API calls

### Monitoring

Set up monitoring for production:
- **Backend**: Use PM2 Plus, New Relic, or DataDog
- **Frontend**: Use Sentry for error tracking
- **Database**: Use MongoDB Atlas monitoring

---

## Troubleshooting

### Backend Issues

#### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

#### MongoDB Connection Failed
- Check connection string in `.env`
- Verify IP whitelist in MongoDB Atlas
- Ensure credentials are correct
- Check network connectivity

#### CORS Errors
- Update `CORS_ORIGIN` in backend `.env`
- Ensure frontend URL matches exactly
- Check browser console for specific error

### Frontend Issues

#### API Calls Failing
- Check `VITE_API_URL` in `.env`
- Verify backend is running
- Check browser console for error details
- Ensure `withCredentials: true` in axios config

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Blank Page After Deploy
- Check browser console for errors
- Verify environment variables are set
- Check network tab for failed requests
- Clear browser cache

### Common Error Messages

| Error | Solution |
|-------|----------|
| `Cannot GET /api/products` | Backend not running or route not found |
| `CORS error` | Update CORS_ORIGIN in backend .env |
| `401 Unauthorized` | JWT token expired or invalid |
| `MongoDB connection timeout` | Check MongoDB Atlas IP whitelist |
| `Cannot find module` | Run `npm install` |

---

## Production Checklist

Before going live, ensure:

- [ ] Environment variables are set correctly
- [ ] MongoDB is configured and accessible
- [ ] JWT secrets are strong and unique
- [ ] CORS is configured for your domain
- [ ] SSL/HTTPS is enabled
- [ ] Database backups are configured
- [ ] Error logging is set up
- [ ] Monitoring is enabled
- [ ] Rate limiting is configured
- [ ] Security headers are set
- [ ] API documentation is available
- [ ] Test accounts are created
- [ ] Payment gateway is configured (if applicable)
- [ ] Email service is configured (if applicable)

---

## Support & Resources

- **GitHub Repository**: https://github.com/zikra35/shop-sparkle-933
- **MongoDB Docs**: https://docs.mongodb.com/
- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/

---

## Next Steps

1. Choose your deployment platform
2. Follow the specific deployment steps
3. Configure environment variables
4. Set up MongoDB Atlas
5. Deploy backend first
6. Deploy frontend
7. Verify both are working
8. Monitor for issues

Good luck with your deployment! 🚀
