# Quick Deploy Instructions (5 Minutes)

## Step 1: Push to GitHub (2 minutes)

```powershell
cd "c:\Users\USER\Downloads\MarketPlace\MarketPlace-master"

# Configure git (if not done already)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/MarketPlace.git

# Rename branch and push
git branch -M main
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username

---

## Step 2: Deploy Backend to Railway (2 minutes)

1. **Sign in to Railway**: https://railway.app
2. **Click** → New Project → Deploy from GitHub repo
3. **Select** → MarketPlace repository
4. **Wait** for build to complete (2-3 minutes)
5. **After deployment**, go to Settings and add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Generate a random secret |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |

6. **Copy** your Railway URL (looks like `https://marketplace-xxx.railway.app`)

---

## Step 3: Deploy Frontend to Vercel (1 minute)

1. **Sign in to Vercel**: https://vercel.com
2. **Click** → Add New → Project
3. **Select** → MarketPlace repository
4. **Vercel auto-configures** - just click Deploy
5. **Add Environment Variable**:
   - Name: `VITE_API_URL`
   - Value: `https://your-railway-url.railway.app/api` (from Step 2)

6. **Done!** Your frontend is live

---

## Getting Your URLs

After deployment:
- **Backend URL**: Check Railway dashboard
- **Frontend URL**: Check Vercel dashboard (auto-generated)

Update Railway's `CORS_ORIGIN` with your final Vercel URL

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Railway | Check Procfile path, verify backend/package.json exists |
| CORS errors | Ensure CORS_ORIGIN on Railway matches your Vercel domain exactly |
| Frontend can't reach API | Verify VITE_API_URL ends with `/api` |

---

## Next Steps

- Set up MongoDB Atlas for your database
- Configure payment processing (if needed)
- Set up email service for notifications
- Monitor logs in Railway and Vercel dashboards

