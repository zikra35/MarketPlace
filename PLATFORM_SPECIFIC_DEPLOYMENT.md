# Platform-Specific Deployment Guide

Detailed deployment instructions for each platform.

---

## Table of Contents
1. [Heroku](#heroku)
2. [Railway](#railway)
3. [Render](#render)
4. [Vercel](#vercel)
5. [Netlify](#netlify)
6. [AWS EC2](#aws-ec2)
7. [DigitalOcean](#digitalocean)

---

## Heroku

### Backend Deployment

**Prerequisites:**
- Heroku account (free tier available)
- Heroku CLI installed

**Steps:**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   heroku create marketplace-backend
   ```

4. **Add MongoDB Add-on (Optional)**
   ```bash
   heroku addons:create mongolab:sandbox
   ```
   Or use MongoDB Atlas (recommended)

5. **Set Environment Variables**
   ```bash
   heroku config:set MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/marketplace"
   heroku config:set JWT_SECRET="your-secret-key"
   heroku config:set JWT_REFRESH_SECRET="your-refresh-secret"
   heroku config:set NODE_ENV=production
   heroku config:set CORS_ORIGIN="https://your-frontend.com"
   ```

6. **Create Procfile** (in root directory)
   ```
   web: cd backend && npm start
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

8. **View Logs**
   ```bash
   heroku logs --tail
   ```

9. **Get Backend URL**
   ```bash
   heroku apps:info
   # URL will be: https://marketplace-backend.herokuapp.com
   ```

### Frontend Deployment

1. **Create Heroku App**
   ```bash
   heroku create marketplace-frontend
   ```

2. **Create Procfile** (in root)
   ```
   web: npm run preview
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set VITE_API_URL="https://marketplace-backend.herokuapp.com/api"
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

---

## Railway

### Backend Deployment

**Prerequisites:**
- Railway account (free tier available)
- GitHub account

**Steps:**

1. **Go to Railway.app**
   - Click "New Project"
   - Select "Deploy from GitHub"

2. **Connect GitHub**
   - Authorize Railway
   - Select your repository

3. **Configure Service**
   - Select "Node.js" environment
   - Set start command: `cd backend && npm start`
   - Set build command: `cd backend && npm install`

4. **Add MongoDB**
   - Click "Add Service"
   - Select "MongoDB"
   - Railway will create database automatically

5. **Set Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     MONGODB_URI=<from MongoDB service>
     JWT_SECRET=your-secret
     JWT_REFRESH_SECRET=your-refresh-secret
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend.com
     ```

6. **Deploy**
   - Railway auto-deploys on push
   - Check deployment status in dashboard

7. **Get Backend URL**
   - Go to Deployments
   - Copy the generated URL

### Frontend Deployment

1. **Create New Project**
   - Click "New Project"
   - Deploy from GitHub

2. **Configure**
   - Set start command: `npm run preview`
   - Set build command: `npm run build`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://your-backend-railway-url/api
   ```

4. **Deploy**
   - Auto-deploys on push

---

## Render

### Backend Deployment

**Prerequisites:**
- Render account (free tier available)
- GitHub account

**Steps:**

1. **Go to Render.com**
   - Click "New +"
   - Select "Web Service"

2. **Connect GitHub**
   - Authorize Render
   - Select repository

3. **Configure Service**
   - Name: `marketplace-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Instance Type: Free

4. **Add Environment Variables**
   - Click "Environment"
   - Add:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/marketplace
     JWT_SECRET=your-secret
     JWT_REFRESH_SECRET=your-refresh-secret
     NODE_ENV=production
     CORS_ORIGIN=https://your-frontend.com
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Render auto-deploys

6. **Get Backend URL**
   - Copy from dashboard
   - Format: `https://marketplace-backend.onrender.com`

### Frontend Deployment

1. **Create New Web Service**
   - Click "New +"
   - Select "Web Service"

2. **Configure**
   - Build Command: `npm run build`
   - Start Command: `npm run preview`

3. **Set Environment Variables**
   ```
   VITE_API_URL=https://marketplace-backend.onrender.com/api
   ```

4. **Deploy**
   - Click "Create Web Service"

---

## Vercel

### Frontend Deployment (Recommended for Frontend)

**Prerequisites:**
- Vercel account (free tier available)
- GitHub account

**Steps:**

1. **Go to Vercel.com**
   - Click "Add New..."
   - Select "Project"

2. **Import Repository**
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework: `Vite`
   - Root Directory: `./` (root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Set Environment Variables**
   - Click "Environment Variables"
   - Add:
     ```
     VITE_API_URL=https://your-backend-url/api
     ```

5. **Deploy**
   - Click "Deploy"
   - Vercel auto-deploys on push

6. **Get Frontend URL**
   - Copy from dashboard
   - Format: `https://marketplace.vercel.app`

### Backend Deployment (Not Recommended - Use Render/Railway instead)

Vercel is optimized for frontend. Use Render or Railway for backend.

---

## Netlify

### Frontend Deployment

**Prerequisites:**
- Netlify account (free tier available)
- GitHub account

**Steps:**

1. **Go to Netlify.com**
   - Click "Add new site"
   - Select "Import an existing project"

2. **Connect GitHub**
   - Authorize Netlify
   - Select repository

3. **Configure Build**
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**
   - Go to "Site settings"
   - Click "Build & deploy"
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-url/api
     ```

5. **Deploy**
   - Click "Deploy site"
   - Netlify auto-deploys on push

6. **Get Frontend URL**
   - Copy from dashboard
   - Format: `https://marketplace.netlify.app`

---

## AWS EC2

### Backend Deployment

**Prerequisites:**
- AWS account
- EC2 instance (t2.micro free tier)
- Security group configured

**Steps:**

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2
   - Instance type: t2.micro (free)
   - Security group: Allow ports 22, 80, 443, 5000

2. **SSH into Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-instance-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

4. **Install Git**
   ```bash
   sudo yum install -y git
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/zikra35/shop-sparkle-933.git
   cd shop-sparkle-933/backend
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create .env File**
   ```bash
   nano .env
   ```
   Add:
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/marketplace
   JWT_SECRET=your-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   PORT=5000
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.com
   ```

8. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

9. **Start Application**
   ```bash
   pm2 start src/index.js --name "marketplace-backend"
   pm2 startup
   pm2 save
   ```

10. **Install Nginx (Reverse Proxy)**
    ```bash
    sudo yum install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    ```

11. **Configure Nginx**
    ```bash
    sudo nano /etc/nginx/conf.d/marketplace.conf
    ```
    Add:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        location / {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

12. **Restart Nginx**
    ```bash
    sudo systemctl restart nginx
    ```

13. **Setup SSL (Let's Encrypt)**
    ```bash
    sudo yum install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### Frontend Deployment on AWS S3 + CloudFront

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://marketplace-frontend
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://marketplace-frontend --delete
   ```

4. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Default root object: `index.html`
   - Enable HTTPS

5. **Update DNS**
   - Point domain to CloudFront URL

---

## DigitalOcean

### Backend Deployment

**Prerequisites:**
- DigitalOcean account
- Droplet created (Ubuntu 20.04, $5/month)

**Steps:**

1. **SSH into Droplet**
   ```bash
   ssh root@your-droplet-ip
   ```

2. **Update System**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install Git**
   ```bash
   apt install -y git
   ```

5. **Clone Repository**
   ```bash
   git clone https://github.com/zikra35/shop-sparkle-933.git
   cd shop-sparkle-933/backend
   ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Create .env File**
   ```bash
   nano .env
   ```

8. **Install PM2**
   ```bash
   npm install -g pm2
   ```

9. **Start Application**
   ```bash
   pm2 start src/index.js --name "marketplace"
   pm2 startup
   pm2 save
   ```

10. **Install Nginx**
    ```bash
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
    ```

11. **Configure Nginx** (same as AWS)

12. **Setup SSL**
    ```bash
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d your-domain.com
    ```

---

## Comparison Table

| Platform | Backend | Frontend | Cost | Ease | Scalability |
|----------|---------|----------|------|------|-------------|
| Heroku | ✅ | ✅ | $7-50 | Easy | Medium |
| Railway | ✅ | ✅ | Pay-as-you-go | Easy | High |
| Render | ✅ | ✅ | Free-$20 | Easy | Medium |
| Vercel | ❌ | ✅ | Free-$20 | Very Easy | High |
| Netlify | ❌ | ✅ | Free-$19 | Very Easy | High |
| AWS | ✅ | ✅ | Variable | Hard | Very High |
| DigitalOcean | ✅ | ✅ | $5-40 | Medium | High |

---

## Recommended Setup

**For Beginners:**
- Backend: Railway or Render
- Frontend: Vercel or Netlify
- Database: MongoDB Atlas (free tier)

**For Production:**
- Backend: AWS EC2 or DigitalOcean
- Frontend: Vercel or AWS S3 + CloudFront
- Database: MongoDB Atlas (paid tier)

---

## Monitoring & Maintenance

### Set Up Monitoring
- **Backend**: PM2 Plus, New Relic, or DataDog
- **Frontend**: Sentry for error tracking
- **Database**: MongoDB Atlas monitoring

### Regular Tasks
- Monitor error logs
- Check database performance
- Update dependencies monthly
- Backup database regularly
- Review security logs

---

## Support

For platform-specific issues:
- Heroku: https://devcenter.heroku.com/
- Railway: https://docs.railway.app/
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com/
- AWS: https://docs.aws.amazon.com/
- DigitalOcean: https://docs.digitalocean.com/

Good luck! 🚀
