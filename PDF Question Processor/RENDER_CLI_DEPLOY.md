# 🚀 One-Click Render Deployment

## Deploy EduPapers PDF Processor to Render.com

### Option 1: One-Click Deploy Button

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/mannas006/edupapers)

### Option 2: Manual Setup (3 Minutes)

#### Step 1: Connect Repository
1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `https://github.com/mannas006/edupapers`

#### Step 2: Configure Service
```yaml
Name: edupapers-pdf-processor
Environment: Python 3
Region: Oregon
Branch: main
Root Directory: PDF Question Processor
Build Command: pip install -r config/requirements.txt
Start Command: gunicorn --bind=0.0.0.0:$PORT --workers=2 --timeout=300 wsgi:app
```

#### Step 3: Environment Variables
Add these in the Environment tab:
```
SUPABASE_URL=https://dsfqdmrkryjpglrsffhc.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
GEMINI_API_KEY=AIzaSyD_1l8qu0kEaxK0tNY4cE4zXIFxkH50giw
WEBHOOK_SECRET=render-webhook-secret-123
ALLOWED_ORIGINS=https://edupapers.vercel.app
PYTHONUNBUFFERED=1
```

#### Step 4: Deploy
Click **"Create Web Service"** and wait 5-10 minutes.

Your app will be live at: `https://edupapers-pdf-processor.onrender.com`

### Option 3: Deploy via Git
```bash
# Already done - your repo is ready for Render deployment!
# Just connect it in the Render dashboard
```

## 🔄 Auto-Deploy Setup
- ✅ Enable **Auto-Deploy** in Render dashboard
- ✅ Deploys automatically when you push to GitHub
- ✅ Zero-downtime deployments

## 🧪 Testing After Deployment
```bash
# Health check
curl https://your-app.onrender.com/health

# Test webhook
curl -X POST https://your-app.onrender.com/webhook/process-pdf \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## 📝 Update Vercel Environment
After deployment, update your Vercel environment variable:
```
VITE_WEBHOOK_URL=https://your-app.onrender.com/webhook/process-pdf
```

## 💡 Pro Tips
- Free tier sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan ($7/month) for always-on service
- Monitor logs in Render dashboard for debugging
