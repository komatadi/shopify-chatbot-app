# Ngrok Quick Start Guide

## Installation

### macOS (Recommended)
```bash
brew install ngrok
```

### Alternative: Direct Download
1. Visit https://ngrok.com/download
2. Download for macOS
3. Extract and add to PATH:
   ```bash
   unzip ngrok.zip
   sudo mv ngrok /usr/local/bin/
   ```

### Verify Installation
```bash
ngrok version
```

## Quick Setup Steps

### 1. Start React Router Dev Server
```bash
npm run dev:router
```
Keep this terminal running. Server should be on `http://localhost:5173`

### 2. Start Ngrok (New Terminal)
```bash
ngrok http 5173
```

You'll see output like:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:5173
```

**Copy the HTTPS URL** (the `https://abc123.ngrok.io` part)

### 3. Update TOML File

Edit `shopify.app.styledgenie-chat-bot.toml`:

```toml
# Replace with your ngrok URL
application_url = "https://abc123.ngrok.io"
redirect_urls = ["https://abc123.ngrok.io/api/auth"]
```

**Replace `abc123.ngrok.io` with your actual ngrok URL!**

### 4. Update Shopify Partner Dashboard

1. Go to https://partners.shopify.com
2. Apps → Your App → "App setup"
3. Update:
   - **App URL**: `https://your-ngrok-url.ngrok.io`
   - **Redirect URLs**: `https://your-ngrok-url.ngrok.io/api/auth`
   - **App Proxy URL**: `https://your-ngrok-url.ngrok.io/apps/chatbot/chat`
4. Save

### 5. Test!

Visit your storefront and test the chat - it should work!

## Do You Need to Redeploy?

**NO** - TOML file changes don't require redeployment:
- ✅ `shopify app dev` reads TOML locally - changes take effect immediately
- ✅ No need to push to GitHub or deploy to Render
- ⚠️ **BUT** you DO need to update Partner Dashboard manually (step 4 above)

## Important Notes

### Ngrok URL Changes
- **Free tier**: URL changes every time you restart ngrok
- **Solution**: Update TOML and Partner Dashboard with new URL each time
- **Paid tier**: Get a static domain (e.g., `your-app.ngrok.io`)

### Workflow
```bash
# Terminal 1: Always running
npm run dev:router

# Terminal 2: Start when needed
ngrok http 5173
# Copy URL, update TOML, update Partner Dashboard

# Terminal 3: Optional (for theme extensions)
shopify app dev
```

### Switching Back to Production

When done testing locally:
1. Update TOML back to Render URL
2. Update Partner Dashboard back to Render URL
3. Deploy to Render for production

## Troubleshooting

**"Tunnel not found"**
- Make sure ngrok is running
- Check React Router is on port 5173
- Verify URL in TOML matches ngrok output

**"Connection refused"**
- Make sure React Router dev server is running
- Check ngrok is forwarding to port 5173

**URL changed**
- Normal with free ngrok
- Just update TOML and Partner Dashboard with new URL
