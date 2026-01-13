# Local Database Setup (SQLite)

For local development, your app uses SQLite. Here's how to ensure it's configured correctly.

## Quick Setup

### 1. Set DATABASE_URL in .env

Add this to your `.env` file (create it if it doesn't exist):

```bash
DATABASE_URL="file:./prisma/dev.db"
```

### 2. Switch to SQLite (if needed)

The `dev:router` script now automatically switches to SQLite, but you can also run manually:

```bash
npm run db:sqlite
```

This will:
- Switch `schema.prisma` to SQLite
- Update `migration_lock.toml` to SQLite
- Regenerate Prisma client

### 3. Sync Database Schema

If the database doesn't exist or is out of sync:

```bash
npx prisma db push
```

This creates/updates the SQLite database to match your schema.

## What Changed

1. ✅ **Updated `dev:router` script** - Now automatically switches to SQLite before starting
2. ✅ **Updated `switch-db.js`** - Now also updates `migration_lock.toml` when switching
3. ✅ **Database created** - SQLite database at `prisma/dev.db`

## Workflow

### For Local Development:
```bash
# Terminal 1: React Router (auto-switches to SQLite)
npm run dev:router

# Terminal 2: Ngrok
ngrok http 5173

# Terminal 3: Shopify CLI (optional)
shopify app dev
```

### For Production (Render):
```bash
# Build automatically switches to PostgreSQL
npm run build
```

## Troubleshooting

### "Error validating datasource db: the URL must start with the protocol postgresql://"

**Solution**: Make sure you've run:
```bash
npm run db:sqlite
```

This switches the schema from PostgreSQL to SQLite.

### "Migration provider mismatch"

**Solution**: The `switch-db.js` script now automatically updates `migration_lock.toml`. If you still see this:
```bash
npm run db:sqlite
npx prisma db push
```

### Database not found

**Solution**: Run:
```bash
export DATABASE_URL="file:./prisma/dev.db"
npx prisma db push
```

Or add `DATABASE_URL="file:./prisma/dev.db"` to your `.env` file.

## Important Notes

- **Local**: Uses SQLite (`file:./prisma/dev.db`)
- **Production**: Uses PostgreSQL (from Render DATABASE_URL)
- **Automatic switching**: `dev:router` and `dev` scripts automatically switch to SQLite
- **Build**: Automatically switches to PostgreSQL for production builds
