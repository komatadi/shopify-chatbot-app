# Connecting Your Development Store to Render

Your app is now live at: **https://shopify-chatbot-app-ok2j.onrender.com**

Follow these steps to connect your development store:

## Step 1: Update Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your Web Service** (`shopify-chatbot-app-ok2j`)
3. **Go to "Environment" tab**
4. **Update `SHOPIFY_APP_URL`**:
   ```
   SHOPIFY_APP_URL=https://shopify-chatbot-app-ok2j.onrender.com
   ```
5. **Save Changes** (this will trigger a redeploy)

## Step 2: Update Shopify App Configuration File

Update `shopify.app.styledgenie-chat-bot.toml`:

```toml
application_url = "https://shopify-chatbot-app-ok2j.onrender.com"
redirect_urls = ["https://shopify-chatbot-app-ok2j.onrender.com/api/auth"]
```

## Step 3: Deploy App Configuration to Shopify

Run this command locally (in your project directory):

```bash
shopify app deploy
```

This updates Shopify with your new app URLs.

## Step 4: Update Shopify Partner Dashboard

1. **Go to Shopify Partner Dashboard**: https://partners.shopify.com
2. **Click on "Apps"** → **Your App** (`styledgenie-chat-bot`)
3. **Go to "App setup"** tab
4. **Update these URLs**:
   - **App URL**: `https://shopify-chatbot-app-ok2j.onrender.com`
   - **Allowed redirection URL(s)**: `https://shopify-chatbot-app-ok2j.onrender.com/api/auth`
5. **Scroll down to "App proxy"** section
6. **Verify the proxy URL**:
   - **Subpath prefix**: `apps`
   - **Subpath**: `chatbot-chat`
   - **Proxy URL**: `https://shopify-chatbot-app-ok2j.onrender.com/apps/chatbot/chat`
7. **Click "Save"**

## Step 5: Fix App Not Showing in Development Store

If the app doesn't appear in your development store's Apps section:

### Option 1: Reinstall via Partner Dashboard (Recommended)
1. **Go to Shopify Partner Dashboard**: https://partners.shopify.com
2. **Click on "Apps"** → **Your App** (`styledgenie-chat-bot`)
3. **Click "Test on development store"**
4. **Select your development store** (`styledgenie-webshop.myshopify.com`)
5. **Click "Install"** or **"Reinstall"**

### Option 2: Install via Direct URL
1. **Go directly to**: `https://your-store.myshopify.com/admin/oauth/authorize?client_id=YOUR_CLIENT_ID&scope=YOUR_SCOPES&redirect_uri=https://shopify-chatbot-app-ok2j.onrender.com/api/auth`
2. Replace `YOUR_CLIENT_ID` with your actual client ID from Partner Dashboard
3. Replace `YOUR_SCOPES` with: `customer_read_orders,read_products,unauthenticated_read_product_listings`

### Option 3: Check App Visibility Settings
1. **Go to Partner Dashboard** → **Your App** → **"App setup"**
2. **Scroll to "App visibility"**
3. **Make sure "Visible in Shopify admin"** is enabled
4. **Save changes**

### If App Still Doesn't Show
- **Clear browser cache** and try again
- **Try a different browser** or incognito mode
- **Wait a few minutes** - sometimes there's a delay
- **Check if the app is actually installed** by going to: `https://your-store.myshopify.com/admin/settings/apps`

## Step 6: Test the Chat Interface

1. **Go to your storefront**: `https://your-store.myshopify.com`
2. **Open the chat bubble** (if you've added it to your theme)
3. **Send a test message**
4. **Check Render logs** to see if requests are coming through

## Troubleshooting

### App Proxy Not Working?

1. **Verify the proxy URL in Partner Dashboard**:
   - Should be: `https://shopify-chatbot-app-ok2j.onrender.com/apps/chatbot/chat`
   - Subpath: `chatbot-chat`

2. **Test the proxy URL directly**:
   ```bash
   curl -X POST https://shopify-chatbot-app-ok2j.onrender.com/apps/chatbot/chat \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

3. **Check Render logs** for any errors

### Authentication Issues?

1. **Make sure `SHOPIFY_APP_URL` in Render matches exactly**: `https://shopify-chatbot-app-ok2j.onrender.com`
2. **Verify redirect URL in Partner Dashboard** matches: `https://shopify-chatbot-app-ok2j.onrender.com/api/auth`
3. **Reinstall the app** in your development store after updating URLs

### 410 "Gone" Errors?

This is normal for the root path (`/`). The app proxy route (`/apps/chatbot/chat`) should work fine.

## Important Notes

- **Free Tier Limitation**: Render free tier services spin down after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds (cold start).
- **For Production**: Consider upgrading to Render's Starter plan ($7/month) to avoid cold starts.
- **HTTPS Required**: Shopify requires HTTPS for production apps, which Render provides automatically.
