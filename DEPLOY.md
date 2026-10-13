# Deploying: GitHub → Railway (backend) → Vercel (frontend)

## 1. GitHub
Before the first push, run `npm install` in the project root. This adds `nitro` to `package-lock.json`.

If this repo already has `.env` files committed, stop tracking them (the files stay on your computer):

    git rm --cached .env backend/.env
    git add .
    git commit -m "Fix bugs, prepare for Railway + Vercel"
    git push

## 2. Railway (backend)
- New Project → Deploy from GitHub repo → choose this repo
- Settings → **Root Directory** = `backend`
- Start command: `npm start` (Railway usually detects this)
- Variables:
  - `MONGODB_URI` = your Atlas connection string
  - `JWT_SECRET` = a long random string
  - `JWT_REFRESH_SECRET` = a different long random string
  - `NODE_ENV` = `production`
  - `FRONTEND_URL` = your Vercel URL (add this after step 3, then redeploy)
- Settings → Networking → **Generate Domain**. Check `https://<domain>/api/health`.
- In Atlas → Network Access, allow `0.0.0.0/0` (Railway's IPs change).

## 3. Vercel (frontend)
- Add New Project → import the same repo. Leave the Root Directory as the repo root.
- Environment Variables:
  - `VITE_API_URL` = `/api`
  - `BACKEND_URL` = `https://<your-railway-domain>` (no trailing slash, no /api)
- Deploy. Then set `FRONTEND_URL` on Railway to the Vercel URL.

With this setup the browser calls `https://your-app.vercel.app/api/...` and Vercel forwards those calls to Railway. The login cookies stay on one domain, so login also works in Safari and on iPhone.

## Seeding the live database (optional)
Run this on your computer with `backend/.env` pointing at the same Atlas database:

    cd backend && npm run seed
