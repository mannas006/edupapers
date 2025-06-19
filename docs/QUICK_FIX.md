# 🚨 QUICK FIX: Deploy PDF Processor for Vercel

## The Problem
Your Vercel app shows "PDF processor not found" because Vercel can't run Python apps. You need to deploy the PDF processor separately.

## 🚀 FASTEST SOLUTION (5 minutes)

### Step 1: Deploy to Railway (Free)

```bash
# Navigate to PDF processor directory
cd "PDF Question Processor"

# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Step 2: Set Environment Variables in Railway
In the Railway dashboard, add these variables:

```
SUPABASE_URL=https://ipmzxaxyffamuvbpglzq.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-from-supabase
GEMINI_API_KEY=AIzaSyD_1l8qu0kEaxK0tNY4cE4zXIFxkH50giw
WEBHOOK_SECRET=your-random-secret
ALLOWED_ORIGINS=https://edupapers-12ixy0e89-mannas006s-projects.vercel.app
```

### Step 3: Update Vercel Environment Variable
In your Vercel dashboard, add:

```
VITE_WEBHOOK_URL=https://your-railway-app.railway.app/webhook/process-pdf
```

### Step 4: Redeploy Vercel
```bash
# In your main project directory
vercel --prod
```

## 🔗 Alternative: One-Click Deploy

### Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✅ Test Your Setup

1. **Health Check**: Visit `https://your-railway-app.railway.app/health`
2. **Upload Test**: Try uploading a PDF in your Vercel app
3. **Check Status**: The processing should work without errors

## 🆘 Need Help?

If you get stuck:
1. Check Railway logs for errors
2. Verify all environment variables are set
3. Make sure CORS origins match your Vercel URL
4. Test the health endpoint manually

Your app will be fully functional once this is deployed! 🎯
