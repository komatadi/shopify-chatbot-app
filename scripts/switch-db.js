#!/usr/bin/env node
/**
 * Script to switch Prisma schema between SQLite (dev) and PostgreSQL (production)
 * Usage:
 *   node scripts/switch-db.js sqlite   # For local development
 *   node scripts/switch-db.js postgresql # For production
 *   node scripts/switch-db.js            # Auto-detect from DATABASE_URL
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const schemaPath = join(rootDir, 'prisma', 'schema.prisma');
const migrationLockPath = join(rootDir, 'prisma', 'migrations', 'migration_lock.toml');

// Determine provider: from argument, or auto-detect from DATABASE_URL
let provider = process.argv[2];
if (!provider) {
  // Auto-detect from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || '';
  // Check for PostgreSQL URLs (including Render's internal database URLs)
  if (dbUrl.startsWith('postgresql://') || 
      dbUrl.startsWith('postgres://') ||
      dbUrl.includes('postgres') ||
      // Render's internal database URLs might not have protocol
      (dbUrl.includes('render.com') && !dbUrl.startsWith('file:'))) {
    provider = 'postgresql';
  } else if (dbUrl.startsWith('file:')) {
    provider = 'sqlite';
  } else {
    // Default: if DATABASE_URL is set but doesn't match above, assume PostgreSQL for production
    // This handles cases where DATABASE_URL might be set but format is different
    provider = dbUrl ? 'postgresql' : 'sqlite';
  }
}

if (!['sqlite', 'postgresql'].includes(provider)) {
  console.error('Error: Provider must be "sqlite" or "postgresql"');
  process.exit(1);
}

try {
  let schema = readFileSync(schemaPath, 'utf-8');
  const currentProvider = schema.match(/provider\s*=\s*["']?(sqlite|postgresql)["']?/)?.[1];
  
  // Only update if provider is different
  if (currentProvider !== provider) {
    schema = schema.replace(
      /provider\s*=\s*["']?(sqlite|postgresql)["']?/,
      `provider = "${provider}"`
    );
    
    writeFileSync(schemaPath, schema, 'utf-8');
    console.log(`✅ Switched Prisma schema from ${currentProvider} to ${provider}`);
    
    // Also update migration_lock.toml if it exists
    try {
      let migrationLock = readFileSync(migrationLockPath, 'utf-8');
      migrationLock = migrationLock.replace(
        /provider\s*=\s*["']?(sqlite|postgresql)["']?/,
        `provider = "${provider}"`
      );
      writeFileSync(migrationLockPath, migrationLock, 'utf-8');
      console.log(`✅ Updated migration_lock.toml to ${provider}`);
    } catch (error) {
      // migration_lock.toml might not exist yet, that's okay
      console.log(`ℹ️  migration_lock.toml not found or couldn't be updated (this is okay)`);
    }
    
    // Regenerate Prisma client (optional - user can run manually if needed)
    try {
      console.log('📦 Regenerating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
      console.log('✅ Prisma client regenerated');
    } catch (error) {
      console.warn('⚠️  Could not auto-regenerate Prisma client. Run "npx prisma generate" manually.');
    }
  } else {
    console.log(`ℹ️  Schema already set to ${provider}, skipping switch`);
  }
} catch (error) {
  console.error('Error switching database provider:', error);
  process.exit(1);
}
