# How to Find Your Railway App URL

## Quick Answer

Railway automatically generates a URL when you deploy. You'll get it **after** your first deployment.

## Step-by-Step Guide

### Method 1: From Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Click on your project** (or create one if you haven't)
3. **Click on your service** (the web service you created)
4. **Find the URL**:
   - **Option A**: Look at the top of the page - the URL is displayed prominently
   - **Option B**: Go to **"Settings"** tab → **"Networking"** section → **"Public Domain"**
   - The URL will look like: `https://your-app-name-production.up.railway.app`

### Method 2: From Terminal Output

After running `railway up`, Railway will show output like:

```
✓ Deployed successfully
→ https://your-app-name-production.up.railway.app
```

Copy that URL!

### Method 3: Using Railway CLI

```bash
# Get your service URL
railway domain

# Or check service info
railway status
```

## Railway URL Format

Railway URLs typically look like:
- `https://your-app-name-production.up.railway.app` (most common)
- `https://your-app-name.railway.app` (if you set a custom domain)

## Setting a Custom Domain (Optional)

If you want a custom domain instead of the Railway-generated one:

1. Go to Railway Dashboard → Your Service → **Settings** → **Networking**
2. Click **"Generate Domain"** or **"Add Custom Domain"**
3. Follow the DNS configuration instructions
4. Use your custom domain as `SHOPIFY_APP_URL`

## Important Notes

1. **URL is generated AFTER deployment**: You need to deploy first to get the URL
2. **URL might change**: If you delete and recreate the service, you'll get a new URL
3. **Use the full URL**: Include `https://` in your `SHOPIFY_APP_URL`
4. **Update after first deploy**: Set `SHOPIFY_APP_URL` environment variable after you know your URL

## Example Workflow

```bash
# 1. Deploy first (without SHOPIFY_APP_URL)
railway up

# 2. Check the output or dashboard for your URL
# Example output: https://shopify-chatbot-production.up.railway.app

# 3. Set the environment variable with your actual URL
railway variables set SHOPIFY_APP_URL=https://shopify-chatbot-production.up.railway.app

# 4. Redeploy (or Railway will auto-redeploy)
railway up
```

## For Render

If you're using Render instead:

1. Go to https://dashboard.render.com
2. Click on your **Web Service**
3. The URL is shown at the top: `https://your-app-name.onrender.com`
4. Or go to **Settings** → **Environment** to see it

## Troubleshooting

**Q: I don't see a URL after deployment**
- Make sure your service is actually deployed (check the "Deployments" tab)
- Wait a few minutes - sometimes it takes time to generate
- Check the Railway logs for any errors

**Q: My URL changed**
- Railway URLs can change if you recreate the service
- Use a custom domain to avoid this
- Update `SHOPIFY_APP_URL` environment variable if it changes

**Q: How do I know if my URL is correct?**
- Visit the URL in your browser - you should see your app (or an error page if routes aren't set up)
- Test: `curl https://your-app.railway.app/apps/chatbot/chat` should return something (even if 404, it means the URL is correct)
