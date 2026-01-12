# Deployment Guide

## How App Proxy Works in Production

When you deploy your app to a hosting service:

1. **Storefront Request**: `https://store.myshopify.com/apps/chatbot-chat`
2. **Shopify Platform**: Recognizes it as an app proxy request
3. **Forwards to**: `https://your-deployed-app.com/apps/chatbot/chat`
4. **Your Server**: Handles the request ✅

## Recommended Hosting Services

### Option 1: Railway (Recommended)
- **Pros**: Easy setup, automatic deployments, PostgreSQL included
- **URL**: https://railway.app
- **Pricing**: Free tier available, then pay-as-you-go

### Option 2: Render
- **Pros**: Good free tier, easy setup
- **URL**: https://render.com
- **Pricing**: Free tier available

### Option 3: Fly.io
- **Pros**: Global edge deployment, good performance
- **URL**: https://fly.io
- **Pricing**: Free tier available

### Option 4: Vercel (for serverless)
- **Pros**: Excellent for React apps, edge functions
- **URL**: https://vercel.com
- **Note**: May need special configuration for React Router 7

## Deployment Steps

### 1. Prepare Your App

#### Environment Variables Needed:
```bash
# Shopify App Credentials (get from Partner Dashboard)
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SHOPIFY_APP_URL=https://your-deployed-app.com
SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings

# OpenAI
OPENAI_API_KEY=sk-your-key

# Database (if using Railway/Render PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Update `shopify.app.styledgenie-chat-bot.toml`:
```toml
application_url = "https://your-deployed-app.com"
redirect_urls = ["https://your-deployed-app.com/api/auth"]
```

### 2. Deploy to Railway (Example)

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL Database**:
   ```bash
   railway add postgresql
   ```

5. **Deploy First** (to get your app URL):
   ```bash
   railway up
   ```
   
   **After deployment, Railway will show you your app URL** in the terminal output or dashboard.
   It will look like: `https://your-app-name-production.up.railway.app` or `https://your-app-name.railway.app`

6. **Get Your App URL**:
   - **Option A**: Check the terminal output after `railway up` - it will show the URL
   - **Option B**: Go to https://railway.app/dashboard
   - Click on your project → Click on your service
   - The URL is shown at the top, or go to **"Settings"** → **"Networking"** → **"Public Domain"**
   - Copy the URL (e.g., `https://your-app-name-production.up.railway.app`)

7. **Set Environment Variables** (use the URL from step 6):
   ```bash
   railway variables set SHOPIFY_API_KEY=your_key
   railway variables set SHOPIFY_API_SECRET=your_secret
   railway variables set SHOPIFY_APP_URL=https://your-actual-railway-url.railway.app
   railway variables set OPENAI_API_KEY=sk-your-key
   railway variables set SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings
   ```
   
   **Important**: Replace `https://your-actual-railway-url.railway.app` with the actual URL from step 6!

7. **Run Database Migrations**:
   ```bash
   railway run npx prisma migrate deploy
   railway run npx prisma generate
   ```

### 2b. Deploy to Render (Step-by-Step)

#### Prerequisites
- GitHub account (Render connects to GitHub for deployments)
- Your code pushed to a GitHub repository

#### Step 1: Create PostgreSQL Database

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"PostgreSQL"**
3. **Configure Database**:
   - **Name**: `shopify-chatbot-db` (or your preferred name)
   - **Database**: `shopify_chatbot` (or your preferred name)
   - **User**: Auto-generated (or custom)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 16 (recommended)
   - **Plan**: Free tier available (or choose Starter for production)
4. **Click "Create Database"**
5. **Copy the Internal Database URL** (you'll need this later)
   - Format: `postgresql://user:password@host:port/database`

#### Step 2: Create Web Service

1. **In Render Dashboard**, click **"New +"** → **"Web Service"**
2. **Connect Your Repository**:
   - Click **"Connect account"** if not already connected
   - Select your GitHub repository
   - Click **"Connect"**
3. **Configure Service**:
   - **Name**: `shopify-chatbot-app` (or your preferred name)
   - **Region**: Same as database (for lower latency)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or specify if app is in subdirectory)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free tier available (or choose Starter for production)
4. **Click "Advanced"** to configure environment variables

#### Step 3: Set Environment Variables

In the Web Service settings, go to **"Environment"** tab and add:

```bash
# Shopify App Credentials
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-app-name.onrender.com
SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Database (use the Internal Database URL from Step 1)
DATABASE_URL=postgresql://user:password@host:port/database

# Node Environment
NODE_ENV=production
```

**Important Notes**:
- Replace `your-app-name.onrender.com` with your actual Render service URL (you'll get this after creating the service)
- Use the **Internal Database URL** for `DATABASE_URL` (not the external one) for better security
- You can update `SHOPIFY_APP_URL` after the first deployment when you know your actual URL

#### Step 4: Configure Build Settings

In the Web Service settings, under **"Build & Deploy"**:

1. **Build Command**: `npm install && npm run build`
2. **Start Command**: `npm start`
3. **Auto-Deploy**: `Yes` (deploys automatically on git push)

#### Step 5: Deploy

1. **Click "Create Web Service"**
2. **Wait for Build**: Render will:
   - Install dependencies
   - Run the build command
   - Start your service
3. **Get Your URL**: Once deployed, you'll get a URL like:
   - `https://your-app-name.onrender.com`

#### Step 6: Database Migrations (Automatic!)

**Good news**: Migrations now run automatically! The `start` script has been updated to run migrations before starting the server.

**No shell access needed** - migrations run automatically on every deployment/restart.

**How it works**:
- The `start` command runs `scripts/migrate-and-start.js`
- This script runs `npx prisma migrate deploy` before starting the server
- Migrations are idempotent (safe to run multiple times)
- If migrations fail, the app still starts (in case migrations are already applied)

**Manual migration (if needed)**:
If you need to run migrations manually without shell access, you can:

1. **Temporarily change Start Command** in Render Dashboard:
   - Go to your Web Service → Settings
   - Change Start Command to: `npx prisma migrate deploy && npm start`
   - Save (this will trigger a redeploy)
   - After it runs, change it back to: `npm start`

2. **Or use Render's "Run Command" feature** (if available):
   - Go to your Web Service → Manual Deploy
   - Look for "Run Command" option
   - Run: `npx prisma migrate deploy`

#### Step 7: Update Environment Variables with Actual URL

1. **Go to Web Service** → **"Environment"** tab
2. **Update `SHOPIFY_APP_URL`** with your actual Render URL:
   ```
   SHOPIFY_APP_URL=https://your-app-name.onrender.com
   ```
3. **Save Changes** (this will trigger a redeploy)

#### Step 8: Configure Custom Domain (Optional)

If you want a custom domain:

1. **Go to Web Service** → **"Settings"** tab
2. **Scroll to "Custom Domains"**
3. **Add your domain** and follow DNS configuration instructions
4. **Update `SHOPIFY_APP_URL`** to use your custom domain

#### Render-Specific Notes

- **Free Tier Limitations**:
  - Services spin down after 15 minutes of inactivity
  - First request after spin-down takes ~30 seconds (cold start)
  - For production, consider the Starter plan ($7/month)
  
- **Database Connection**:
  - Use **Internal Database URL** for better performance and security
  - External Database URL is available but slower
  
- **Auto-Deploy**:
  - Render automatically deploys on git push to your main branch
  - You can disable this in service settings
  
- **Logs**:
  - View real-time logs in the Render Dashboard
  - Useful for debugging deployment issues

### 3. Update Shopify App Configuration

After deployment, update your app URLs:

1. **Update `shopify.app.styledgenie-chat-bot.toml`**:
   ```toml
   # For Railway:
   application_url = "https://your-app.railway.app"
   redirect_urls = ["https://your-app.railway.app/api/auth"]
   
   # OR for Render:
   application_url = "https://your-app-name.onrender.com"
   redirect_urls = ["https://your-app-name.onrender.com/api/auth"]
   ```

2. **Deploy App Configuration**:
   ```bash
   shopify app deploy
   ```

3. **Verify App Proxy**:
   - Go to Partner Dashboard → Your App → App Proxy
   - Verify the URL is correct:
     - Railway: `https://your-app.railway.app/apps/chatbot/chat`
     - Render: `https://your-app-name.onrender.com/apps/chatbot/chat`
   - The subpath should be: `chatbot-chat`

### 4. Test the Deployment

1. **Test the API directly**:
   ```bash
   # For Railway:
   curl -X POST https://your-app.railway.app/apps/chatbot/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"hello","shopDomain":"your-store.myshopify.com"}'
   
   # For Render:
   curl -X POST https://your-app-name.onrender.com/apps/chatbot/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"hello","shopDomain":"your-store.myshopify.com"}'
   ```

2. **Test from Storefront**:
   - Visit your storefront
   - Open the chat widget
   - Send a message
   - It should work! ✅

## Production Checklist

- [ ] App deployed to hosting service
- [ ] Database migrated and running
- [ ] Environment variables set
- [ ] `application_url` updated in `shopify.app.toml`
- [ ] `redirect_urls` updated in `shopify.app.toml`
- [ ] App configuration deployed (`shopify app deploy`)
- [ ] App proxy URL verified in Partner Dashboard
- [ ] Test API endpoint directly
- [ ] Test from storefront

## Troubleshooting

### App Proxy Returns 404
- Verify `application_url` is correct in Partner Dashboard
- Check that the route `/apps/chatbot/chat` exists in your deployed app
- Verify app proxy configuration in `shopify.app.toml`

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible from your hosting service

### Environment Variables
- Double-check all required variables are set
- Restart the app after setting new variables

## Next Steps

Once deployed, your app proxy will work correctly because:
1. Shopify knows your app's real URL
2. Shopify forwards requests to that URL
3. Your deployed server handles the requests

The app proxy configuration in `shopify.app.toml` tells Shopify:
- **Storefront URL**: `/apps/chatbot-chat` (what customers see)
- **App Route**: `/apps/chatbot/chat` (where requests go)
- Shopify automatically maps: `store.myshopify.com/apps/chatbot-chat` → `your-app.com/apps/chatbot/chat`
