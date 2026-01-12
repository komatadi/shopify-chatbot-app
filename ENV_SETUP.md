# Environment Variables Setup Guide

## Current Status

Your `.env` file currently has:
- ✅ `OPENAI_API_KEY`
- ✅ `DATABASE_URL`

Missing (but have fallbacks for development):
- ⚠️ `SHOPIFY_API_KEY` (uses fallback: `dev-api-key`)
- ⚠️ `SHOPIFY_API_SECRET` (uses fallback: `dev-api-secret`)
- ⚠️ `SCOPES` (uses fallback: default scopes)
- ⚠️ `SHOPIFY_APP_URL` (uses fallback: `http://localhost:5173`)

## For Development (Current Setup)

The app **works fine** in development without these because:
- `app/shopify.server.ts` has fallback values
- The API key is already in `shopify.app.styledgenie-chat-bot.toml` as `client_id`
- Scopes are defined in `shopify.app.styledgenie-chat-bot.toml`

**You don't need to add these for local development** - the fallbacks work!

## For Production Deployment

When deploying to Render/Railway/etc., you **must** add these to your environment variables.

### What to Add to `.env` (Optional for Dev, Required for Production)

```bash
# Shopify App Credentials
# Get these from: https://partners.shopify.com → Your App → API Credentials
SHOPIFY_API_KEY=3be4259ba08f2c961a3231a267af1fee
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_APP_URL=https://your-deployed-app.com
SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings

# OpenAI (you already have this)
OPENAI_API_KEY=sk-your-key

# Database (you already have this)
DATABASE_URL=postgresql://user:password@host:port/database
```

## Where to Get These Values

### 1. SHOPIFY_API_KEY
- **Already in your config**: `shopify.app.styledgenie-chat-bot.toml` has `client_id = "3be4259ba08f2c961a3231a267af1fee"`
- This is your API Key/Client ID
- You can use this value: `3be4259ba08f2c961a3231a267af1fee`

### 2. SHOPIFY_API_SECRET
- **Get from Partner Dashboard**:
  1. Go to https://partners.shopify.com
  2. Navigate to **Apps** → **Your App** (styledgenie-chat-bot)
  3. Go to **API Credentials** section
  4. Copy the **Client secret** (not the Client ID)
  5. Add to `.env` as `SHOPIFY_API_SECRET=your_secret_here`

### 3. SCOPES
- **Already in your config**: `shopify.app.styledgenie-chat-bot.toml` has:
  ```toml
  scopes = "customer_read_orders,read_products,unauthenticated_read_product_listings"
  ```
- You can use this exact value: `customer_read_orders,read_products,unauthenticated_read_product_listings`

### 4. SHOPIFY_APP_URL
- **For development**: `http://localhost:5173` (already the fallback)
- **For production**: Your deployed URL (e.g., `https://your-app.onrender.com`)

## Complete `.env` File Example

### For Development (Minimal - Current Setup)
```bash
# Required
OPENAI_API_KEY=sk-your-openai-key-here
DATABASE_URL=postgresql://user:password@host:port/database

# Optional - app works with fallbacks
# SHOPIFY_API_KEY=3be4259ba08f2c961a3231a267af1fee
# SHOPIFY_API_SECRET=your_secret_here
# SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings
# SHOPIFY_APP_URL=http://localhost:5173
```

### For Production (Complete)
```bash
# Shopify App Credentials
SHOPIFY_API_KEY=3be4259ba08f2c961a3231a267af1fee
SHOPIFY_API_SECRET=your_api_secret_from_partner_dashboard
SHOPIFY_APP_URL=https://your-app.onrender.com
SCOPES=customer_read_orders,read_products,unauthenticated_read_product_listings

# OpenAI
OPENAI_API_KEY=sk-your-openai-key-here

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Node Environment
NODE_ENV=production
```

## Summary

- ✅ **Development**: Your current `.env` is fine - fallbacks work
- ⚠️ **Production**: Add all Shopify variables when deploying
- 📝 **API Key**: Already in TOML file (`client_id`)
- 🔑 **API Secret**: Get from Partner Dashboard → API Credentials
- 📋 **Scopes**: Already in TOML file (copy to `.env` for production)

## Quick Reference

| Variable | Development | Production | Where to Get |
|----------|------------|------------|--------------|
| `SHOPIFY_API_KEY` | Optional (fallback) | Required | `shopify.app.toml` → `client_id` |
| `SHOPIFY_API_SECRET` | Optional (fallback) | Required | Partner Dashboard → API Credentials |
| `SCOPES` | Optional (fallback) | Required | `shopify.app.toml` → `scopes` |
| `SHOPIFY_APP_URL` | Optional (fallback) | Required | Your deployed URL |
| `OPENAI_API_KEY` | Required | Required | OpenAI Dashboard |
| `DATABASE_URL` | Required | Required | Your database provider |
