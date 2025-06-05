#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for Netlify deployment...');

try {
  // Build frontend
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });

  // Build serverless function
  console.log('⚡ Building serverless functions...');
  execSync('esbuild netlify/functions/server.js --platform=node --packages=external --bundle --format=esm --outdir=netlify/functions --external:firebase --external:firebase/app --external:firebase/firestore --external:express --external:serverless-http', { stdio: 'inherit' });

  // Copy static files to function directory
  console.log('📁 Copying required files...');
  
  // Create uploads directory in functions
  const uploadsDir = 'netlify/functions/uploads';
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Copy uploads if they exist
  if (fs.existsSync('uploads')) {
    execSync(`cp -r uploads/* netlify/functions/uploads/`, { stdio: 'inherit' });
  }

  console.log('✅ Build completed successfully!');
  console.log('📋 Ready for Netlify deployment');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}