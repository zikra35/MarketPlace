# Railway & Vercel Deployment Guide

## Prerequisites
- GitHub account with the MarketPlace repo pushed
- Railway account (railway.app)
- Vercel account (vercel.com)
- MongoDB Atlas cluster (for database)

---

## Part 1: Backend Deployment on Railway

### Step 1: Push to GitHub
```bash
cd "c:\Users\USER\Downloads\MarketPlace\MarketPlace-master"
git remote add origin https://github.com/YOUR_USERNAME/MarketPlace.git
git branch -M main
git push -u origin main
```

### Step 2: Create Railway Project
1. Go to **https://railway.app**
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select the **MarketPlace** repository
5. Railway will auto-detect the backend and start building

### Step 3: Configure Environment Variables on Railway
In Railway Dashboard → Project Settings → Variables, add:

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/marketplace
JWT_SECRET=your_jwt_secret_key_here
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Step 4: Get Your Backend URL
After deployment:
1. Go to Railway Dashboard → Your Service
2. Copy the **Railway URL** (e.g., `https://marketplace-backend-prod.railway.app`)
3. This is your `VITE_API_URL` for the frontend

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Connect Vercel to GitHub
1. Go to **https://vercel.com**
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select the **MarketPlace** repository

### Step 2: Configure Build Settings
Vercel will auto-detect your settings. Verify:
- **Framework Preset**: Vite (or None)
- **Build Command**: `npm run build`
- **Output Directory**: `.output/public`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables on Vercel
In Vercel Project Settings → Environment Variables, add:

```
VITE_API_URL=https://your-railway-backend-url.railway.app/api
```

Replace with your actual Railway backend URL from Part 1, Step 4.

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy automatically.

After deployment, you'll get your frontend URL (e.g., `https://marketplace-frontend.vercel.app`)

---

## Part 3: Connect Backend & Frontend

### Update Railway CORS
Update the `CORS_ORIGIN` environment variable on Railway with your Vercel URL:

```
CORS_ORIGIN=https://marketplace-frontend.vercel.app
```

### Update Vercel API URL
If needed, update `VITE_API_URL` in Vercel environment variables with your Railway backend URL.

---

## Database Setup

### Using MongoDB Atlas
1. Create a free cluster at **https://www.mongodb.com/cloud/atlas**
2. Create a database user
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/marketplace`
4. Add to Railway environment variables as `MONGODB_URI`

### Seed Data (Optional)
Connect to your deployed backend:
```bash
curl -X POST https://your-railway-url/api/seed
```

Or run locally:
```bash
cd backend
npm run seed
```

---

## Monitoring & Logs

### Railway Logs
```bash
railway login
railway link [project-id]
railway logs
```

### Vercel Logs
Dashboard → Project → Deployments → Select deployment → View logs

---

## Troubleshooting

### Backend won't start
- Check `Procfile` path is correct
- Verify `NODE_ENV=production` is set
- Check MongoDB connection string is valid

### CORS errors on frontend
- Verify `CORS_ORIGIN` matches your Vercel domain exactly
- Restart Railway service after updating env vars

### Build fails on Vercel
- Clear build cache: Settings → Git → Clear build cache
- Check Node version: `engines.node` in package.json

---

## Quick Links
- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repo: https://github.com/YOUR_USERNAME/MarketPlace
