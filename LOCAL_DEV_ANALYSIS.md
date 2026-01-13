# Local Development Root Cause Analysis

Based on [Shopify's App Configuration Documentation](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration)

## Root Cause Identified

### The Problem

The Shopify CLI proxy server (port 50309) returns "Invalid path /apps/chatbot-chat" because:

1. **No Explicit Dev Server Configuration**: The Shopify CLI documentation does **NOT** provide a `[web]` or `[dev]` section in `shopify.app.toml` to explicitly configure where the dev server is running.

2. **Auto-Detection Limitation**: Shopify CLI relies on **auto-detection** of web servers, but:
   - React Router 7 may not be in the list of auto-detected frameworks
   - The CLI doesn't know your React Router dev server is running on port 5173
   - The proxy server is created independently without knowledge of your dev server

3. **Missing `web_directories` Configuration**: According to the documentation:
   - `web_directories` - "The paths that Shopify CLI will search for the web files of your app. When omitted, defaults to the app root directory."
   - Your app structure might not match what Shopify CLI expects for auto-detection

## What the Documentation Says

### Available Configuration Options

From the [official documentation](https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration):

#### `[build]` Section
- `automatically_update_urls_on_dev` (boolean): Updates URLs automatically during dev
- `dev_store_url` (string): The dev store URL

#### `web_directories` (Global Property)
- **Type**: Array of string paths or glob patterns
- **Default**: App root directory
- **Purpose**: "The paths that Shopify CLI will search for the web files of your app"

#### `[app_proxy]` Section
- `url` (required): URL of your app proxy server
- `subpath` (required): The subpath (e.g., "chatbot-chat")
- `prefix` (required): The prefix (e.g., "apps")

### What's Missing

The documentation does **NOT** provide:
- ❌ A `[web]` section to configure dev server
- ❌ A `[dev]` section to specify dev server port/command
- ❌ Explicit configuration for proxy forwarding
- ❌ Documentation on how to integrate with React Router 7

## Solutions Based on Documentation

### Solution 1: Use `web_directories` (May Help Auto-Detection)

According to the documentation, you can specify where Shopify CLI should look for web files:

```toml
web_directories = ["app/", "build/"]
```

**Why this might help:**
- Tells Shopify CLI where your web application code is
- Might help auto-detection find your React Router setup
- Defaults to app root, but explicitly setting it might trigger better detection

**How to try:**
Add to `shopify.app.styledgenie-chat-bot.toml`:
```toml
web_directories = ["app/"]
```

### Solution 2: Check if React Router is Auto-Detected

Shopify CLI auto-detects common frameworks. To check:

1. **Run `shopify app dev` and check the output** - Look for messages about detecting your web framework
2. **Check Shopify CLI version** - Newer versions might have better React Router support:
   ```bash
   shopify version
   npm update -g @shopify/cli @shopify/theme
   ```

### Solution 3: Use Built-in Tunnel (Recommended by Documentation)

The documentation mentions `automatically_update_urls_on_dev` is "useful when using the built-in tunnel for development."

**What this means:**
- Shopify CLI creates a tunnel to your local server
- The tunnel URL is automatically updated in Shopify
- But this requires the CLI to know where your server is

**Current status:**
- You have `automatically_update_urls_on_dev = true` ✅
- But the tunnel isn't connecting to your React Router server ❌

### Solution 4: Check App Structure

The documentation says `web_directories` defaults to "app root directory". Your structure:

```
Shopify-apps/
  ├── app/          ← Your web files are here
  ├── build/        ← Built files
  └── extensions/   ← Extensions
```

**Potential issue:**
- Shopify CLI might be looking in the root directory
- But your web server runs from `app/` directory
- Try setting `web_directories = ["app/"]`

## Recommended Approach

### Step 1: Try `web_directories` Configuration

Add to `shopify.app.styledgenie-chat-bot.toml`:

```toml
web_directories = ["app/"]
```

This tells Shopify CLI where your web application code is, which might help auto-detection.

### Step 2: Verify React Router Server is Running

Make sure your React Router dev server is running **before** starting `shopify app dev`:

```bash
# Terminal 1
npm run dev:router

# Terminal 2 (after React Router is running)
shopify app dev
```

The CLI might detect it if it's already running.

### Step 3: Check CLI Output for Detection Messages

When you run `shopify app dev`, look for:
- Messages about detecting your web framework
- Messages about finding your dev server
- Any warnings about missing configuration

### Step 4: Use ngrok as Workaround (If Auto-Detection Fails)

If auto-detection doesn't work, use ngrok to create a public tunnel:

1. **Start React Router dev server:**
   ```bash
   npm run dev:router
   ```

2. **In another terminal, expose it:**
   ```bash
   ngrok http 5173
   ```

3. **Update `shopify.app.styledgenie-chat-bot.toml` temporarily:**
   ```toml
   application_url = "https://your-ngrok-url.ngrok.io"
   redirect_urls = ["https://your-ngrok-url.ngrok.io/api/auth"]
   ```

4. **Update Shopify Partner Dashboard** with ngrok URL for app proxy

5. **Test** - This will work exactly like production

## Why This Limitation Exists

Based on the documentation:

1. **Shopify CLI is Framework-Agnostic**: It doesn't have explicit support for every framework
2. **Auto-Detection is Limited**: It works for common setups (Next.js, Remix, etc.) but React Router 7 might be too new
3. **No Explicit Dev Server Config**: The documentation doesn't provide a way to explicitly tell the proxy where your server is

## Conclusion

**Root Cause:**
- Shopify CLI proxy doesn't know where your React Router dev server (port 5173) is running
- No explicit configuration option exists in the documentation to tell it
- Auto-detection isn't working for React Router 7

**Best Solution:**
1. Try `web_directories = ["app/"]` first (might help auto-detection)
2. If that doesn't work, use ngrok for local development (matches production behavior)
3. For quick iterations, test directly on port 5173, then deploy to Render for full testing

**Future:**
- Shopify CLI may add better React Router 7 support in future versions
- Or add explicit dev server configuration options
