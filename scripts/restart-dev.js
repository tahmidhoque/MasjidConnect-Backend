#!/usr/bin/env node

/**
 * This script kills any running Next.js dev server and restarts it
 * Useful after Prisma schema changes
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Restarting development server...');

// First regenerate Prisma
try {
  console.log('📦 Regenerating Prisma client...');
  execSync('node scripts/regenerate-prisma.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') 
  });
} catch (error) {
  console.error('❌ Failed to regenerate Prisma client:', error.message);
  // Continue anyway
}

// Find and kill any running Next.js processes
try {
  console.log('🛑 Stopping any running Next.js servers...');

  if (process.platform === 'win32') {
    // Windows
    execSync('taskkill /F /IM node.exe /FI "WINDOWTITLE eq next*"', { stdio: 'ignore' });
  } else {
    // Mac/Linux
    execSync('pkill -f "next dev"', { stdio: 'ignore' });
  }
  
  console.log('  ✅ Stopped running servers');
} catch (error) {
  // It's okay if no processes were found to kill
  console.log('  ℹ️ No running servers found');
}

// Start the Next.js dev server
try {
  console.log('🚀 Starting development server...');
  execSync('npm run dev', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..') 
  });
} catch (error) {
  console.error('❌ Failed to start development server:', error.message);
  process.exit(1);
} 