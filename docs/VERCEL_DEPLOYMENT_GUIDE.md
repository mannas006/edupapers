# 🚀 EduPapers PDF Processor Deployment Guide

## Problem
Vercel (where your frontend is hosted) cannot run the Python PDF processor because it's a serverless platform. The PDF processor needs to run as a separate backend service.

## Solution
Deploy the PDF processor to Railway (free tier) and connect it to your Vercel frontend.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Free Tier)

1. **Create Railway Account**: Go to [railway.app](https://railway.app) and sign up
2. **Deploy with One Click**: 
   ```bash
   # Clone the PDF processor
   cd "PDF Question Processor"
   
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Connect to Railway
   railway login
   railway link
   railway up
   ```

3. **Set Environment Variables** in Railway dashboard:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-key
   GEMINI_API_KEY=your-gemini-key
   WEBHOOK_SECRET=your-secret-key
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```

### Option 2: Render (Alternative)

1. **Fork/Upload to GitHub**: Upload PDF processor to GitHub repo
2. **Connect to Render**: Go to [render.com](https://render.com) → New Web Service
3. **Configure**:
   - Build Command: `pip install -r config/requirements.txt`
   - Start Command: `gunicorn --bind=0.0.0.0:$PORT --workers=2 --timeout=300 wsgi:app`

### Option 3: Heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## 🔧 Update Frontend Configuration

Once deployed, update your Vercel app's environment variables:

### In Vercel Dashboard:
1. Go to your project settings
2. Add environment variable:
   ```
   VITE_PDF_PROCESSOR_URL=https://your-railway-app.railway.app
   ```

### Update the Upload Component:

```typescript
// In src/pages/UploadMUI.tsx
const PDF_PROCESSOR_URL = import.meta.env.VITE_PDF_PROCESSOR_URL || 'http://localhost:8000';

// Update the health check function
const checkPDFProcessorHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PDF_PROCESSOR_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('PDF processor health check failed:', error);
    return false;
  }
};

// Update the process PDF function
const processPDF = async (fileUrl: string, filename: string, metadata: any) => {
  const response = await fetch(`${PDF_PROCESSOR_URL}/webhook/process-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file_url: fileUrl,
      filename: filename,
      metadata: metadata
    })
  });

  if (!response.ok) {
    throw new Error(`Processing failed: ${response.statusText}`);
  }

  return response.json();
};
```

## 🧪 Testing

After deployment, test your setup:

1. **Health Check**: Visit `https://your-railway-app.railway.app/health`
2. **Upload Test**: Try uploading a PDF through your Vercel app
3. **Check Logs**: Monitor Railway logs for any issues

## 📋 Environment Variables Needed

### For Railway/Render Deployment:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GEMINI_API_KEY=AIzaSyD_1l8qu0kEaxK0tNY4cE4zXIFxkH50giw
WEBHOOK_SECRET=your-random-secret-here
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
PORT=8000
```

### For Vercel Frontend:
```env
VITE_PDF_PROCESSOR_URL=https://your-railway-app.railway.app
```

## 🔗 Architecture After Deployment

```
User Upload → Vercel Frontend → Railway PDF Processor → Supabase Database
```

## 💡 Benefits of This Setup

- ✅ **Scalable**: PDF processor can handle heavy AI processing
- ✅ **Free**: Railway/Render free tiers are sufficient for moderate usage
- ✅ **Reliable**: Separate services mean frontend stays fast
- ✅ **Maintainable**: Easy to update and monitor each service independently

## 🚨 Important Notes

1. **CORS**: Make sure to update `ALLOWED_ORIGINS` with your actual Vercel URL
2. **API Keys**: Keep your Gemini API key secure in Railway environment variables
3. **Webhook Secret**: Use a strong random secret for security
4. **Monitoring**: Check Railway logs if PDF processing fails

## 🆘 Troubleshooting

### "PDF processor not found" Error:
- Check if Railway app is running: visit `/health` endpoint
- Verify `VITE_PDF_PROCESSOR_URL` in Vercel environment variables
- Check CORS settings in Railway app

### Processing Takes Too Long:
- Railway free tier has some limitations
- Consider upgrading to Railway Pro for better performance
- Add timeout handling in frontend

### Memory Issues:
- Large PDFs might cause memory issues on free tier
- Add file size limits in frontend
- Consider using Railway Pro for more memory

Ready to deploy? Let's get your PDF processor running! 🚀
