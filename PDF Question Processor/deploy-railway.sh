#!/bin/bash

# 🚀 EduPapers PDF Processor - Railway Deployment Script

echo "🚀 Deploying EduPapers PDF Processor to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Create new project or link existing
read -p "Do you want to create a new Railway project? (y/n): " create_new

if [[ $create_new == "y" || $create_new == "Y" ]]; then
    echo "📦 Creating new Railway project..."
    railway init
else
    echo "🔗 Linking to existing Railway project..."
    railway link
fi

# Set environment variables
echo "⚙️ Setting up environment variables..."
echo "Please provide the following environment variables:"

read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Service Key: " SUPABASE_SERVICE_KEY
read -p "Enter your Gemini API Key: " GEMINI_API_KEY
read -p "Enter your Vercel app URL (e.g., https://yourapp.vercel.app): " VERCEL_URL

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

# Set environment variables in Railway
railway variables set SUPABASE_URL="$SUPABASE_URL"
railway variables set SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY"
railway variables set GEMINI_API_KEY="$GEMINI_API_KEY"
railway variables set WEBHOOK_SECRET="$WEBHOOK_SECRET"
railway variables set ALLOWED_ORIGINS="$VERCEL_URL"
railway variables set PYTHONUNBUFFERED=1

echo "✅ Environment variables set successfully!"

# Deploy
echo "🚀 Deploying to Railway..."
railway up --detach

echo "⏳ Waiting for deployment to complete..."
sleep 30

# Get the deployment URL
RAILWAY_URL=$(railway status --json | grep -o '"url":"[^"]*' | grep -o '[^"]*$')

if [ -z "$RAILWAY_URL" ]; then
    echo "⚠️ Could not retrieve Railway URL. Please check Railway dashboard."
    echo "🌐 Railway Dashboard: https://railway.app/dashboard"
else
    echo "✅ Deployment successful!"
    echo "🌐 PDF Processor URL: $RAILWAY_URL"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Test health check: curl $RAILWAY_URL/health"
    echo "2. Add this to your Vercel environment variables:"
    echo "   VITE_WEBHOOK_URL=$RAILWAY_URL/webhook/process-pdf"
    echo "3. Redeploy your Vercel app to use the new PDF processor"
fi

echo ""
echo "🎉 Deployment complete! Your PDF processor is now running on Railway."
