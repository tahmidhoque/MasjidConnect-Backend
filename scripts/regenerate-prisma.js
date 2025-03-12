#!/usr/bin/env node

/**
 * This script manually regenerates the Prisma client
 * Use when you have schema changes that might not be picked up automatically
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Regenerating Prisma client...');

// Clean generated client files first
const nodeModulesPrismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');
if (fs.existsSync(nodeModulesPrismaDir)) {
  console.log('🧹 Cleaning existing Prisma client artifacts...');
  
  try {
    // Force delete node_modules/.prisma
    execSync(`rm -rf ${nodeModulesPrismaDir}`);
    console.log('  ✅ Removed .prisma directory');
  } catch (error) {
    console.error('  ❌ Failed to clean .prisma directory:', error.message);
  }
}

// Force-regenerate Prisma client
try {
  console.log('🔨 Generating fresh Prisma client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') 
  });
  console.log('✅ Prisma client successfully regenerated');
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
  process.exit(1);
}

console.log('🚀 Done! Restart your development server for changes to take effect.'); 