# 🚀 Deploy MarketPlace NOW

Your code is ready! Follow these simple steps to deploy in 30 minutes.

---

## Step 1️⃣: Push to GitHub (2 min)

Open PowerShell and run:

```powershell
cd "c:\Users\USER\Downloads\MarketPlace\MarketPlace-master"
git remote add origin https://github.com/YOUR_USERNAME/MarketPlace.git
git branch -M main
git push -u origin main
```

✅ **Done!** Your code is now on GitHub.

---

## Step 2️⃣: Set Up MongoDB (5 min)

1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up → Create cluster → Create user → Get connection string
3. Save your connection string for later

> 📖 Detailed guide: See `MONGODB_SETUP.md`

---

## Step 3️⃣: Deploy Backend to Railway (5 min)

1. Go to: https://railway.app
2. Sign in with GitHub
3. Click **New Project** → **Deploy from GitHub repo**
4. Select **MarketPlace** repository
5. Wait for build ✓
6. Add Environment Variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `JWT_SECRET` = any random string (use generator)
   - `NODE_ENV` = `production`
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app` (update after step 4)

7. **Copy your Railway URL** (you'll need this)

---

## Step 4️⃣: Deploy Frontend to Vercel (2 min)

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click **Add New** → **Project**
4. Select **MarketPlace** repository
5. Click **Deploy** (auto-configures!)
6. Wait for build ✓
7. Add Environment Variable:
   - `VITE_API_URL` = `https://your-railway-url.railway.app/api`

✅ **Done!** Your frontend is live!

---

## Step 5️⃣: Connect Backend & Frontend (2 min)

1. Go back to Railway
2. Update `CORS_ORIGIN` with your Vercel URL (from Step 4)
3. Redeploy Railway
4. Test your app! ✨

---

## You're Live! 🎉

- **Frontend**: Your Vercel URL
- **Backend**: Your Railway URL
- **Database**: MongoDB Atlas

---

## Need Help?

| Document | Purpose |
|----------|---------|
| `QUICK_DEPLOY.md` | Step-by-step with more details |
| `RAILWAY_DEPLOYMENT.md` | In-depth Railway guide |
| `MONGODB_SETUP.md` | Database setup walkthrough |
| `DEPLOYMENT_CHECKLIST.md` | Full verification checklist |

---

## Common Issues & Fixes

### Build fails on Railway
→ Check `Procfile` is in root directory

### Frontend can't reach API
→ Verify `VITE_API_URL` ends with `/api` (not just domain)

### CORS errors
→ Ensure `CORS_ORIGIN` on Railway matches Vercel domain exactly

### MongoDB connection fails
→ Whitelist IP `0.0.0.0/0` in MongoDB Atlas Network Access

---

## What's Next?

After deployment:
- [ ] Test all features work
- [ ] Set up custom domain (optional)
- [ ] Monitor logs
- [ ] Configure payment system (if needed)
- [ ] Set up email notifications

---

## One More Thing

Don't forget to push these files to GitHub after deploying:

```powershell
git add .
git commit -m "chore: Ready for production"
git push
```

**Happy deploying! 🚀**

