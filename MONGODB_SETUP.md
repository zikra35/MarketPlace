# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Click **Try Free** or Sign Up
3. Create your account
4. Complete email verification

---

## Step 2: Create a Cluster

1. **Click** → **Create** (on the Deployments page)
2. **Select** → **Free** tier (M0)
3. **Choose** → Your preferred region (closest to your users)
4. **Name** your cluster (e.g., "marketplace-prod")
5. **Wait** 5-10 minutes for cluster to be created

---

## Step 3: Create Database User

1. In your cluster, go to **Security** → **Database Access**
2. **Click** → **Add New User**
3. **Username**: Choose a username (e.g., `marketplace_user`)
4. **Password**: Create a strong password OR use auto-generated
5. **Database User Privileges**: Select **Read and write to any database**
6. **Click** → **Add User**

> **Save your username and password somewhere safe!**

---

## Step 4: Whitelist IP Address

1. Go to **Security** → **Network Access**
2. **Click** → **Add IP Address**
3. **Add Entry**: `0.0.0.0/0` (allows connections from anywhere)
4. **Confirm** → **Add IP Address**

> ⚠️ For production, use specific IP addresses instead of `0.0.0.0/0`

---

## Step 5: Get Connection String

1. Go to **Databases** page
2. **Click** → **Connect** (on your cluster)
3. **Select** → **Drivers**
4. **Choose** → **Node.js** version
5. **Copy** the connection string (looks like):
   ```
   mongodb+srv://marketplace_user:password@cluster.mongodb.net/marketplace?retryWrites=true&w=majority
   ```

---

## Step 6: Add to Railway

1. **Go to Railway Dashboard** → Your Project
2. **Click** → **Variables**
3. **Add New Variable**:
   - Name: `MONGODB_URI`
   - Value: Paste your connection string from Step 5
4. **Save** and redeploy

---

## Step 7: Verify Connection (Optional)

Test your connection by running:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✓ Connected to MongoDB'))
  .catch(err => console.error('✗ Connection failed:', err.message));
"
```

---

## Seed Initial Data (Optional)

To populate your database with test data:

```bash
# Local
cd backend
npm run seed

# Or via Railway CLI
railway run npm run seed
```

---

## MongoDB Collections

The project automatically creates these collections:
- `users` - Customer and seller accounts
- `products` - Product listings
- `orders` - Order history
- `reviews` - Product reviews
- `wishlists` - Wishlist items

---

## Important Notes

- **Connection String Limit**: Each user can have max 10 connection strings
- **Database Size**: Free tier has 512 MB storage
- **Monthly**: Data is NOT deleted, stays until you delete it
- **Backups**: MongoDB Atlas auto-backs up (point-in-time restore available)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Authentication failed" | Double-check username/password in connection string |
| "IP address not whitelisted" | Add `0.0.0.0/0` in Network Access |
| "Connection timeout" | Check database is active (green status in Atlas) |
| "Insufficient permissions" | Ensure user has "Read and write" privileges |

---

## Upgrading from Free Tier

When you outgrow the free tier:
1. Go to **Billing** → **Change Tier**
2. Upgrade to **M2** or higher ($9-57/month)
3. Your data automatically migrates
4. Connection string remains the same

