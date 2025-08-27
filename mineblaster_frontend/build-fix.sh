#!/bin/bash

# Vercel Build Fix Script
# This script ensures proper build for Vercel deployment

echo "🔧 Starting Vercel build fix..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite

# Build with proper environment
echo "🏗️ Building for production..."
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Build the application
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    
    # List build output for verification
    echo "📁 Build contents:"
    ls -la dist/
    
    # Check for proper file types
    echo "🔍 Checking JavaScript files:"
    find dist -name "*.js" -o -name "*.mjs" | head -5
    
    echo "✅ Build fix complete! Ready for Vercel deployment."
else
    echo "❌ Build failed!"
    exit 1
fi
