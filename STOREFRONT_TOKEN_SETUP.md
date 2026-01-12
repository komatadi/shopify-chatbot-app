# Setting Up Storefront API Access Token

The Storefront API access token is required for product search and other storefront operations. Follow these steps to set it up.

## Step 1: Create Storefront API Access Token in Shopify

1. **Go to Shopify Admin**: `https://your-store.myshopify.com/admin`
2. **Navigate to**: Settings → Apps and sales channels → Develop apps
3. **Select your app** (or create a new custom app if needed)
4. **Go to "API credentials"** tab
5. **Scroll to "Storefront API"** section
6. **Click "Configure"** or **"Create token"**
7. **Set permissions**:
   - `unauthenticated_read_product_listings` (required for product search)
   - `unauthenticated_read_product_inventory` (optional, for inventory info)
   - `unauthenticated_read_checkouts` (optional, for cart operations)
8. **Click "Save"** or **"Create token"**
9. **Copy the access token** (you'll only see it once!)

## Step 2: Add Token to Your App

You have two options:

### Option A: Add to Environment Variables (Quick Setup)

1. **Go to Render Dashboard** → Your Web Service → Environment
2. **Add new variable**:
   - Key: `STOREFRONT_ACCESS_TOKEN`
   - Value: `your-token-here`
3. **Save** (this will trigger a redeploy)

**Note**: This uses the same token for all shops. For multi-shop apps, use Option B.

### Option B: Store in Database (Per-Shop Configuration)

1. **After deployment, the migration will add the field automatically**
2. **Update the token via your app's admin interface** (you'll need to build this) OR
3. **Update directly in the database**:

```sql
-- Connect to your Render PostgreSQL database
UPDATE "StoreSettings" 
SET "storefrontAccessToken" = 'your-token-here'
WHERE "shopId" = 'styledgenie-webshop.myshopify.com';
```

## Step 3: Verify It's Working

1. **Test the chat** with a product search query like "snowboards"
2. **Check Render logs** - you should see:
   - ✅ No "ACCESS_DENIED" errors
   - ✅ Product search results returned

## Troubleshooting

### "ACCESS_DENIED" Error

- **Check token is correct**: Make sure you copied the full token
- **Check permissions**: Token must have `unauthenticated_read_product_listings` scope
- **Check token is active**: Go back to Shopify Admin and verify the token exists

### Token Not Found

- **Check environment variable**: Make sure `STOREFRONT_ACCESS_TOKEN` is set in Render
- **Check database**: If using per-shop tokens, verify the token is in `StoreSettings.storefrontAccessToken`
- **Check logs**: Look for the warning message about missing token

### Product Search Returns Empty Results

- **Check store has products**: Make sure your store has products published
- **Check product visibility**: Products must be available on the storefront
- **Check search query**: Try a simple query like "shirt" or "product"

## Security Notes

- **Storefront API tokens are public**: They can be used by anyone who has them
- **Use minimal scopes**: Only grant the permissions you need
- **Rotate tokens**: If a token is compromised, revoke it and create a new one
- **Per-shop tokens**: For production, store tokens per shop in the database for better security

## Next Steps

Once the token is configured:
- ✅ Product search will work
- ✅ Cart operations can be implemented (requires additional scopes)
- ✅ Policy search will work (doesn't require token)
