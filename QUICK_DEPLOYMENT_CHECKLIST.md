# Quick Deployment Checklist

Fast reference for deploying MarketPlace.

---

## Pre-Deployment (5 minutes)

- [ ] Clone repository: `git clone https://github.com/zikra35/shop-sparkle-933.git`
- [ ] Create MongoDB Atlas account and cluster
- [ ] Get MongoDB connection string
- [ ] Generate JWT secrets: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Choose deployment platform (Heroku/Railway/Render/Vercel/Netlify)

---

## Backend Deployment (10 minutes)

### Local Setup
```bash
cd backend
npm install
```

### Environment Setup
Create `backend/.env`:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/marketplace
JWT_SECRET=your-generated-secret
JWT_REFRESH_SECRET=your-generated-refresh-secret
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Test Locally
```bash
npm run dev
# Should see: "Server running on port 5000"
```

### Deploy to Platform

**Heroku:**
```bash
heroku create your-app-backend
heroku config:set MONGODB_URI="your-uri"
heroku config:set JWT_SECRET="your-secret"
heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
git push heroku main
```

**Railway/Render:** Use dashboard to set env vars and deploy

**AWS EC2:**
```bash
ssh into instance
git clone repo
cd backend
npm install
npm start
```

### Verify Backend
```bash
curl https://your-backend-url/api/products
# Should return JSON array of products
```

---

## Frontend Deployment (10 minutes)

### Local Setup
```bash
npm install
```

### Environment Setup
Create `.env` in root:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Build
```bash
npm run build
# Creates dist/ folder
```

### Deploy to Platform

**Vercel:**
```bash
vercel
# Set VITE_API_URL in dashboard
```

**Netlify:**
```bash
netlify deploy --prod --dir=dist
```

**GitHub Pages:**
```bash
npm run build
# Push dist/ to gh-pages branch
```

### Verify Frontend
- Visit your frontend URL
- Should load without errors
- Check DevTools Console for errors

---

## Post-Deployment (5 minutes)

### Test Backend
```bash
# Test login
curl -X POST https://your-backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sparkle.com","password":"Admin@123"}'

# Should return: { success: true, data: { token, user } }
```

### Test Frontend
1. Visit frontend URL
2. Try logging in with `admin@sparkle.com` / `Admin@123`
3. Browse products
4. Check DevTools Network tab - all API calls should succeed

### Monitor
- Set up error tracking (Sentry)
- Enable database backups
- Configure alerts

---

## Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| CORS error | Update `CORS_ORIGIN` in backend .env |
| API 404 | Check `VITE_API_URL` in frontend .env |
| MongoDB timeout | Whitelist IP in MongoDB Atlas |
| Blank page | Check browser console for errors |
| 401 errors | Verify JWT secrets match |

---

## Environment Variables Summary

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<32-char-random-string>
JWT_REFRESH_SECRET=<32-char-random-string>
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.com/api
```

---

## Test Credentials

After deployment, use these to test:

**Admin Account:**
- Email: `admin@sparkle.com`
- Password: `Admin@123`

**Seller Account:**
- Email: `seller@sparkle.com`
- Password: `Seller@123`

---

## Deployment Platform Links

- Heroku: https://www.heroku.com
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com
- Netlify: https://netlify.com
- AWS: https://aws.amazon.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

## Success Indicators

✅ Backend deployed and responding to API calls
✅ Frontend deployed and loading without errors
✅ Login works with test credentials
✅ Products display correctly
✅ API calls show in Network tab
✅ No CORS errors in console
✅ Database is accessible

---

## Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed steps
2. Review error messages in browser console
3. Check backend logs: `heroku logs --tail` (Heroku)
4. Verify environment variables are set correctly
5. Ensure MongoDB IP whitelist includes your server

Good luck! 🚀
