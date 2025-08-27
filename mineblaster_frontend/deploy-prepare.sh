#!/bin/bash

# GitHub Deployment Script for MineBlast Frontend
# This script prepares the frontend for GitHub and Vercel deployment

echo "🚀 Preparing MineBlast Frontend for GitHub + Vercel Deployment"
echo "============================================================="

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in frontend directory. Please run from mineblaster_frontend/"
    exit 1
fi

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
npm run clean

echo -e "${BLUE}✅ Linting code...${NC}"
npm run lint

echo -e "${BLUE}🏗️ Testing build process...${NC}"
npm run build

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build successful! Frontend is ready for deployment.${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Commit and push to GitHub:"
    echo "   git add ."
    echo "   git commit -m 'feat: optimize frontend for Vercel deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. Deploy to Vercel:"
    echo "   - Import repository from GitHub"
    echo "   - Framework: Vite"
    echo "   - Build Command: npm run build"
    echo "   - Output Directory: dist"
    echo "   - Install Command: npm ci"
    echo ""
    echo "3. Set Environment Variables in Vercel Dashboard:"
    echo "   - Copy from .env.production.example"
    echo ""
    echo -e "${GREEN}🎉 Your frontend is production-ready!${NC}"
else
    echo -e "❌ Build failed! Please check the errors above."
    exit 1
fi
