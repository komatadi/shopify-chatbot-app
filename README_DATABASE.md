# Database Configuration Guide

This project supports both **SQLite** (for local development) and **PostgreSQL** (for production).

## How It Works

The project uses a script (`scripts/switch-db.js`) that automatically switches the Prisma schema based on your `DATABASE_URL` environment variable:

- **SQLite**: If `DATABASE_URL` starts with `file:`
- **PostgreSQL**: If `DATABASE_URL` starts with `postgresql:`

## Local Development (SQLite)

### Setup

1. **Set your `.env` file**:
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

2. **Switch to SQLite** (if needed):
   ```bash
   npm run db:sqlite
   ```

3. **Run migrations**:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development**:
   ```bash
   npm run dev
   ```

The `dev` script automatically switches to SQLite before starting.

## Production (PostgreSQL)

### Setup

1. **Set your environment variable** (in Render/Railway dashboard):
   ```bash
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

2. **Build automatically uses PostgreSQL**:
   The `build` script automatically switches to PostgreSQL before building.

3. **Run migrations** (after deployment):
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Manual Switching

If you need to manually switch:

```bash
# Switch to SQLite
npm run db:sqlite

# Switch to PostgreSQL
npm run db:postgresql
```

## Automatic Detection

The `postinstall` script automatically detects which database to use based on your `DATABASE_URL`:

- If `DATABASE_URL` contains `postgresql://` → uses PostgreSQL
- Otherwise → uses SQLite

## Important Notes

1. **Always commit `schema.prisma` with PostgreSQL** (for production)
2. **Local development** will automatically switch to SQLite when you run `npm run dev`
3. **Production builds** will automatically use PostgreSQL when you run `npm run build`
4. **Don't commit** the `dev.db` file (it's in `.gitignore`)

## Troubleshooting

### "Error validating datasource: the URL must start with the protocol `file:`"

This means the schema is set to SQLite but you're using a PostgreSQL URL. Run:
```bash
npm run db:postgresql
```

### "Error validating datasource: the URL must start with the protocol `postgresql:`"

This means the schema is set to PostgreSQL but you're using a SQLite URL. Run:
```bash
npm run db:sqlite
```

### Schema changes not applying

After switching providers, always regenerate the Prisma client:
```bash
npx prisma generate
```
