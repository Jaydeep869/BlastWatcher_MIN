# MineBlast Frontend - Production Deployment Guide

## 🚀 **Optimized for GitHub + Vercel**

This frontend is now **production-ready** and optimized for seamless Vercel deployment with automatic framework detection.

## ✅ **What's Fixed & Optimized**

### **Build Configuration**
- ✅ Fixed Vite configuration for production builds
- ✅ Optimized chunk splitting for better performance
- ✅ Proper asset naming and caching
- ✅ ESLint configuration compatible with Vercel

### **Vercel Integration**
- ✅ Simplified `vercel.json` for automatic Vite detection
- ✅ Proper SPA routing configuration
- ✅ Optimized caching headers
- ✅ Environment variable support

### **Dependencies**
- ✅ Updated package.json with proper build scripts
- ✅ Added Node.js engine requirements
- ✅ Optimized dependency management

## 🚀 **Deployment Steps**

### **Step 1: Prepare for Deployment**
```bash
cd mineblaster_frontend
./deploy-prepare.sh
```

### **Step 2: Push to GitHub**
```bash
git add .
git commit -m "feat: optimize frontend for Vercel deployment"
git push origin main
```

### **Step 3: Deploy to Vercel**

1. **Import Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configuration** (Auto-detected)
   - Framework: **Vite** ✅ (auto-detected)
   - Build Command: `npm run build` ✅
   - Output Directory: `dist` ✅
   - Install Command: `npm ci` ✅

3. **Environment Variables** (Add in Vercel Dashboard)
   ```bash
   VITE_API_BASE_URL=https://blastwatcher869.onrender.com
   VITE_ML_SERVICE_URL=https://blastwatcher-min-ml-prediction.onrender.com
   VITE_FIREBASE_API_KEY=AIzaSyD4Uk9ha5ac7KSAv4U0KMMANy0l-5zLC7g
   VITE_FIREBASE_AUTH_DOMAIN=mineblast869.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=mineblast869
   VITE_FIREBASE_STORAGE_BUCKET=mineblast869.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=440491259847
   VITE_FIREBASE_APP_ID=1:440491259847:web:f28e3d4c8f7a9b1c2d3e4f
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically detect Vite and build your project

## 🎯 **Key Optimizations Made**

### **Performance**
- Chunk splitting for faster loading
- Optimized asset caching
- Tree shaking for smaller bundles

### **Build Process**
- ESBuild minification (faster than Terser)
- Proper source maps handling
- Clean build process

### **Vercel Compatibility**
- Framework auto-detection
- Proper routing for SPA
- Environment variable handling

## 🔧 **Local Development**

```bash
# Install dependencies
npm ci

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## ✅ **Production Checklist**

- [ ] All dependencies installed (`npm ci`)
- [ ] Build process successful (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Environment variables configured
- [ ] Repository pushed to GitHub
- [ ] Vercel project configured

Your frontend is now **production-ready** for GitHub + Vercel deployment! 🚀
