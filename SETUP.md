# Setup Instructions

## Prerequisites

1. Node.js v20.10 or higher
2. Shopify Partner account
3. Development store
4. OpenAI API key

## Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example file if you need a fresh start:
   cp .env.example .env
   
   # Then edit .env and add your OPENAI_API_KEY:
   # OPENAI_API_KEY=sk-your-actual-key-here
   ```
   
   The `.env` file is already created but empty. You just need to add your OpenAI API key.

3. **Set up the database:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Link your app to Shopify:**
   ```bash
   shopify app config link
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Configuration Steps

### 1. Create Storefront Access Token

To enable product search and cart operations, you need to create a Storefront API access token:

1. Go to your Shopify Admin
2. Navigate to Settings > Apps and sales channels > Develop apps
3. Create a new custom app or use an existing one
4. Configure Admin API scopes: `read_products`, `read_product_listings`
5. Install the app and copy the Storefront API access token
6. Store this token in your database per shop (via admin UI or directly)

### 2. Configure App Proxy

The app proxy is configured in `shopify.app.toml`. After deploying, make sure:
- The proxy URL matches your app's domain
- The subpath is set to `chat`
- The prefix is set to `apps`

### 3. Enable Theme Extension

1. In Shopify Admin, go to Online Store > Themes
2. Click "Customize" on your active theme
3. Click "App embeds" in the sidebar
4. Enable the "AI Chat Assistant" extension
5. Configure the chat bubble color and welcome message
6. Save and publish

## Testing

1. Visit your storefront
2. Look for the chat bubble in the bottom-right corner
3. Click to open the chat
4. Test various queries:
   - Product search: "Show me products"
   - FAQ: "What is your return policy?"
   - Order status: "Check my order #1001"

## Deployment

1. **Deploy your backend:**
   - Choose a hosting service (Render, Fly.io, Railway, etc.)
   - Set environment variables
   - Deploy the app

2. **Update app URLs:**
   - Update `application_url` in `shopify.app.toml`
   - Update `redirect_urls` in `shopify.app.toml`

3. **Deploy the app:**
   ```bash
   shopify app deploy
   ```

4. **Install on your store:**
   - Follow the installation prompts
   - Grant required permissions

## Troubleshooting

### Chat not appearing
- Check that the theme extension is enabled in Theme Editor
- Verify the theme supports app embed blocks (Online Store 2.0)

### API errors
- Verify OpenAI API key is set correctly
- Check that Storefront API access token is configured
- Review server logs for detailed error messages

### Product search not working
- Ensure Storefront API access token is valid
- Check that products are published to the Online Store channel
- Verify access scopes include `unauthenticated_read_product_listings`

## Next Steps

- Implement order status checking with Customer Account API
- Add conversation analytics dashboard
- Configure FAQ content management
- Add multi-language support

