# Update App Configuration via CLI (Without Partner Dashboard)

If you can't access the Partner Dashboard, you can update app configuration using Shopify CLI commands.

## Option 1: Use `shopify app deploy` (Recommended)

The `shopify app deploy` command will update your app configuration from the TOML file:

```bash
shopify app deploy
```

This will:
- ✅ Update `application_url` from your TOML file
- ✅ Update `redirect_urls` from your TOML file
- ✅ Update app proxy configuration
- ✅ Push all changes to Shopify

**Note**: This creates a new app version. For local development, you might prefer Option 2.

## Option 2: Use `shopify app dev` (For Local Development)

Since you have `automatically_update_urls_on_dev = true` in your TOML, running:

```bash
shopify app dev
```

Should automatically update the URLs in Shopify's backend for your development store. This is the easiest for local testing with ngrok.

## Option 3: Find Your App in Partner Dashboard

If the app isn't visible, try:

1. **Check Organization**: Make sure you're logged into the correct Partner account
   - The app might be under a different organization
   - Check the `client_id` in your TOML: `3be4259ba08f2c961a3231a267af1fee`

2. **Direct URL**: Try accessing directly:
   ```
   https://partners.shopify.com/organizations/[org-id]/apps/[app-id]
   ```

3. **Check App Status**: The app might be in draft or unpublished state

4. **Search**: Use the search bar in Partner Dashboard to search for "styledgenie-chat-bot"

## For Local Development with Ngrok

**Best approach for local testing:**

1. **Update TOML** (you've already done this ✅)
   ```toml
   application_url = "https://ernie-unfugal-uninformatively.ngrok-free.dev"
   redirect_urls = ["https://ernie-unfugal-uninformatively.ngrok-free.dev/api/auth"]
   ```

2. **Run `shopify app dev`**:
   ```bash
   shopify app dev
   ```
   
   This should automatically update URLs for your development store.

3. **Verify**: Check if it worked by testing the app proxy from your storefront.

## If App Proxy Still Doesn't Work

The app proxy URL is constructed from `application_url` + the `url` field in `[app_proxy]`:
- Your TOML has: `url = "/apps/chatbot/chat"`
- So the proxy URL should be: `https://ernie-unfugal-uninformatively.ngrok-free.dev/apps/chatbot/chat`

If `shopify app dev` doesn't update the app proxy automatically, you might need to:

1. **Use `shopify app deploy`** to push the configuration
2. **Or manually update via API** (more complex)

## Quick Test

After running `shopify app dev`, test if it worked:

```bash
# Test the app proxy URL directly
curl -X POST "https://ernie-unfugal-uninformatively.ngrok-free.dev/apps/chatbot/chat?shop=styledgenie-webshop.myshopify.com" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message":"test"}'
```

If this works, the configuration was updated successfully!
