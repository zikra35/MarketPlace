# 🚀 MarketPlace Deployment Checklist

## Pre-Deployment Setup

- [ ] GitHub account created
- [ ] Railway account created (railway.app)
- [ ] Vercel account created (vercel.com)
- [ ] MongoDB Atlas account created (mongodb.com/cloud/atlas)

---

## Phase 1: GitHub Setup (10 minutes)

- [ ] Create new GitHub repository named "MarketPlace"
- [ ] Run git commands to push code:
  ```bash
  cd "c:\Users\USER\Downloads\MarketPlace\MarketPlace-master"
  git remote add origin https://github.com/YOUR_USERNAME/MarketPlace.git
  git branch -M main
  git push -u origin main
  ```
- [ ] Verify code is on GitHub (check repository)
- [ ] Record GitHub URL: `https://github.com/YOUR_USERNAME/MarketPlace`

---

## Phase 2: MongoDB Setup (5 minutes)

- [ ] Create MongoDB Atlas cluster
- [ ] Create database user (username + password)
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Get connection string from Atlas
- [ ] Copy connection string: `mongodb+srv://...`
- [ ] Record MongoDB URI: ________________

---

## Phase 3: Backend Deployment to Railway (15 minutes)

### Create Railway Project

- [ ] Sign in to Railway (railway.app)
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize Railway with GitHub
- [ ] Select "MarketPlace" repository
- [ ] Select "backend" as the root directory OR confirm Procfile detection
- [ ] Wait for initial build to complete

### Configure Environment Variables

- [ ] Go to Variables section
- [ ] Add `NODE_ENV` = `production`
- [ ] Add `PORT` = `3000`
- [ ] Add `MONGODB_URI` = (paste from MongoDB Atlas)
- [ ] Add `JWT_SECRET` = (generate random: use `openssl rand -base64 32`)
- [ ] Add `CORS_ORIGIN` = `https://your-frontend-domain.vercel.app` (update after Vercel deployment)
- [ ] Save variables and redeploy

### Verify Backend Deployment

- [ ] Go to Deployments tab
- [ ] Check build status = "Success" ✓
- [ ] Check service is running (green status)
- [ ] Copy Railway URL: `https://marketplace-xxx.railway.app`
- [ ] Test health endpoint: `https://your-railway-url/api/health`
- [ ] Record Railway Backend URL: ________________

---

## Phase 4: Frontend Deployment to Vercel (10 minutes)

### Create Vercel Project

- [ ] Sign in to Vercel (vercel.com)
- [ ] Click "Add New" → "Project"
- [ ] Select "MarketPlace" from GitHub repositories
- [ ] Vercel auto-detects settings (Vite build)
- [ ] Confirm:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `.output/public`
  - Install Command: `npm install`

### Configure Environment Variables

- [ ] Go to Settings → Environment Variables
- [ ] Add `VITE_API_URL` = `https://your-railway-url.railway.app/api`
- [ ] Save and redeploy

### Verify Frontend Deployment

- [ ] Go to Deployments
- [ ] Check build status = "Success" ✓
- [ ] Click domain link to visit your site
- [ ] Frontend loads without errors
- [ ] Record Vercel Frontend URL: ________________

---

## Phase 5: Connect Backend & Frontend (5 minutes)

### Update Railway CORS

- [ ] Go back to Railway Dashboard
- [ ] Update `CORS_ORIGIN` variable with your Vercel URL
- [ ] Redeploy Railway backend
- [ ] Wait for deployment to complete

### Verify API Connectivity

- [ ] On your Vercel frontend, test API calls
- [ ] Check browser console for CORS errors
- [ ] Test login/signup if implemented
- [ ] Verify data loads from backend

---

## Phase 6: Database Seeding (Optional)

- [ ] Run seed script on Railway:
  ```bash
  railway run npm run seed
  ```
- [ ] Or run locally and test
- [ ] Verify data appears in MongoDB Atlas

---

## Post-Deployment Verification

### Frontend Checks

- [ ] Homepage loads
- [ ] Navigation works
- [ ] Forms are functional
- [ ] No console errors
- [ ] API calls successful
- [ ] Page load time acceptable

### Backend Checks

- [ ] Health endpoint responds
- [ ] Database connection works
- [ ] Authentication working
- [ ] API responses formatted correctly
- [ ] Error handling proper
- [ ] Logs visible in Railway dashboard

### Database Checks

- [ ] Collections created automatically
- [ ] Data persists after restart
- [ ] Backup enabled in MongoDB Atlas
- [ ] Connection string secure

---

## Production Optimization

- [ ] Set up custom domain (optional):
  - Add domain in Vercel settings
  - Add domain in Railway settings
- [ ] Enable SSL/TLS (automatic on Vercel & Railway)
- [ ] Set up monitoring alerts
- [ ] Configure GitHub Actions for CI/CD (optional)
- [ ] Set up error tracking (Sentry, LogRocket, etc.)

---

## Security Checklist

- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB IP whitelist is restricted for production
- [ ] Environment variables are NOT committed to GitHub
- [ ] CORS_ORIGIN is set to specific domain, not `*`
- [ ] API endpoints validate all inputs
- [ ] Sensitive data is not logged
- [ ] HTTPS enabled (automatic)

---

## Monitoring Setup

- [ ] Enable Railway logs: `railway logs`
- [ ] Enable Vercel analytics
- [ ] Set up MongoDB alerts
- [ ] Monitor error rates
- [ ] Monitor response times
- [ ] Set up uptime monitoring

---

## Troubleshooting

### If Backend won't start
- [ ] Check Railway logs for errors
- [ ] Verify MongoDB connection string
- [ ] Ensure PORT env var is set
- [ ] Confirm Procfile syntax is correct

### If Frontend won't load
- [ ] Check Vercel build logs
- [ ] Verify VITE_API_URL is set correctly
- [ ] Clear browser cache
- [ ] Check network tab for failed requests

### If CORS errors occur
- [ ] Update CORS_ORIGIN on Railway
- [ ] Redeploy Railway backend
- [ ] Verify exact domain match (https://xyz.vercel.app not http://xyz.vercel.app)

---

## Completed! 🎉

- ✅ Backend running on Railway
- ✅ Frontend running on Vercel
- ✅ Database on MongoDB Atlas
- ✅ Connected and working

---

## Useful Commands

```bash
# View Railway logs
railway login
railway logs

# Restart backend
railway redeploy

# Run seed on Railway
railway run npm run seed

# Connect to MongoDB locally (testing)
mongosh "mongodb+srv://..."

# Check Railway status
railway status
```

---

## Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Docs**: https://docs.mongodb.com
- **Node.js Docs**: https://nodejs.org/docs

