#!/usr/bin/env node
/**
 * Script to run Prisma migrations and then start the server
 * This is used in production to ensure migrations run before the app starts
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// First, ensure we're using PostgreSQL (in case schema got switched)
console.log('🔧 Ensuring PostgreSQL configuration...');
try {
  execSync('node scripts/switch-db.js postgresql', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env }
  });
  // Regenerate Prisma client to ensure it matches the schema
  console.log('📦 Regenerating Prisma client...');
  execSync('npx prisma generate', {
    stdio: 'inherit',
    cwd: rootDir,
    env: { ...process.env }
  });
} catch (error) {
  console.warn('⚠️  Could not switch to PostgreSQL or regenerate client, continuing anyway...');
  console.warn('   Error:', error.message);
}

console.log('🔄 Running database migrations...');
try {
  // Run migrations (idempotent - safe to run multiple times)
  execSync('npx prisma migrate deploy', { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: { ...process.env }
  });
  console.log('✅ Migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  // Don't exit - let the app start anyway (migrations might already be applied)
  console.warn('⚠️  Continuing with app start (migrations may already be applied)');
}

console.log('🚀 Starting server...');
// Start the actual server
execSync('react-router-serve ./build/server/index.js', {
  stdio: 'inherit',
  cwd: rootDir,
  env: { ...process.env }
});
