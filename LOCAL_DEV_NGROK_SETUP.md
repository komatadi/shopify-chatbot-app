# Local Development with Ngrok Setup Guide

## How Ngrok Works

Ngrok creates a **public HTTPS URL** that tunnels to your local React Router dev server. This allows Shopify to reach your local server just like it would reach your production server.

## Installation

### Option 1: Homebrew (macOS - Recommended)
```bash
brew install ngrok
```

### Option 2: Direct Download
1. Go to https://ngrok.com/download
2. Download for macOS
3. Extract and move to `/usr/local/bin`:
   ```bash
   # After downloading
   unzip ngrok.zip
   sudo mv ngrok /usr/local/bin/
   ```

### Option 3: npm (Global)
```bash
npm install -g ngrok
```

### Verify Installation
```bash
ngrok version
# Should show: ngrok version X.X.X
```

## Setup Workflow

### Step 1: Start Your React Router Dev Server

```bash
npm run dev:router
```

Keep this terminal running. Your server should be on `http://localhost:5173`

### Step 2: Start Ngrok (in a new terminal)

```bash
ngrok http 5173
```

You'll see output like:
```
Session Status                online
Account                       Your Account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok.io -> http://localhost:5173
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`) - you'll need this!

### Step 3: Update TOML File with Ngrok URL

Update `shopify.app.styledgenie-chat-bot.toml`:

```toml
# Temporary: Ngrok URL for local development
# Replace abc123.ngrok.io with your actual ngrok URL
application_url = "https://abc123.ngrok.io"
redirect_urls = ["https://abc123.ngrok.io/api/auth"]
```

**Important**: The ngrok URL changes every time you restart ngrok (unless you have a paid plan). You'll need to update this each time.

### Step 4: Update Shopify Partner Dashboard

1. Go to https://partners.shopify.com
2. Click "Apps" → Your App → "App setup"
3. Update:
   - **App URL**: `https://your-ngrok-url.ngrok.io`
   - **Allowed redirection URL(s)**: `https://your-ngrok-url.ngrok.io/api/auth`
   - **App Proxy URL**: `https://your-ngrok-url.ngrok.io/apps/chatbot/chat`
4. Click "Save"

### Step 5: Start Shopify CLI (Optional)

You can still run `shopify app dev` for theme extension development, but the app proxy will use the ngrok URL directly.

```bash
shopify app dev
```

## Testing

1. **Visit your storefront**: `https://styledgenie-webshop.myshopify.com`
2. **Open the chat bubble**
3. **Send a message** - it should reach your local React Router server via ngrok!

## Important Notes

### Do You Need to Redeploy?

**NO** - TOML file changes don't require redeployment:
- `shopify app dev` reads the TOML file locally
- Changes take effect immediately when you restart `shopify app dev`
- **BUT** you DO need to update Partner Dashboard manually for app proxy to work

### Ngrok URL Changes

- **Free tier**: URL changes every time you restart ngrok
- **Paid tier**: You can get a static domain (e.g., `your-app.ngrok.io`)

### Workflow Summary

```bash
# Terminal 1: React Router dev server
npm run dev:router

# Terminal 2: Ngrok tunnel
ngrok http 5173
# Copy the HTTPS URL

# Terminal 3: Update TOML with ngrok URL, then:
shopify app dev  # Optional, for theme extensions
```

### When to Use This

- ✅ **Local development** - Test app proxy locally
- ✅ **Debugging** - See requests in ngrok web interface (http://127.0.0.1:4040)
- ✅ **Testing before deploy** - Verify everything works before pushing to Render

### When to Switch Back

After testing, switch back to Render URL:
1. Update `shopify.app.styledgenie-chat-bot.toml` with Render URL
2. Update Partner Dashboard with Render URL
3. Deploy to Render for production

## Troubleshooting

### "Tunnel not found"
- Make sure ngrok is running
- Check that React Router server is on port 5173
- Verify the ngrok URL in TOML matches the one ngrok shows

### "Connection refused"
- Make sure React Router dev server is running
- Check ngrok is forwarding to the correct port (5173)

### URL Changed After Restart
- This is normal with free ngrok
- Update TOML and Partner Dashboard with new URL
- Or get a paid ngrok plan for static domain
