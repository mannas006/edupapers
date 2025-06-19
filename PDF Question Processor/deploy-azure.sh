#!/bin/bash

# 🚀 EduPapers PDF Processor - Azure Deployment Script

echo "🚀 Deploying EduPapers PDF Processor to Azure App Service..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Please install it first:"
    echo "   brew install azure-cli"
    echo "   or visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Login to Azure
echo "🔐 Logging into Azure..."
az login

# Set variables
RESOURCE_GROUP="edupapers-rg"
APP_NAME="edupapers-pdf-processor-$(date +%s)"  # Add timestamp for uniqueness
LOCATION="East US"
PLAN_NAME="edupapers-plan"

echo "📦 Creating Azure resources..."
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Location: $LOCATION"

# Create resource group
echo "🏗️ Creating resource group..."
az group create --name $RESOURCE_GROUP --location "$LOCATION"

# Create app service plan (Free tier)
echo "📋 Creating app service plan (Free tier)..."
az appservice plan create \
  --name $PLAN_NAME \
  --resource-group $RESOURCE_GROUP \
  --sku F1 \
  --is-linux

# Create web app
echo "🌐 Creating web app..."
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan $PLAN_NAME \
  --name $APP_NAME \
  --runtime "PYTHON|3.9" \
  --deployment-local-git

# Get deployment credentials
echo "🔑 Setting up deployment..."
az webapp deployment user set --user-name edupapersuser --password "EduPapers@2024!"

# Set environment variables
echo "⚙️ Configuring environment variables..."

read -p "Enter your Supabase URL: " SUPABASE_URL
read -p "Enter your Supabase Service Key (paste it here): " SUPABASE_SERVICE_KEY
read -p "Enter your Gemini API Key: " GEMINI_API_KEY
read -p "Enter your Vercel app URL: " VERCEL_URL

# Generate webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

# Set application settings
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    SUPABASE_URL="$SUPABASE_URL" \
    SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
    GEMINI_API_KEY="$GEMINI_API_KEY" \
    WEBHOOK_SECRET="$WEBHOOK_SECRET" \
    ALLOWED_ORIGINS="$VERCEL_URL" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    PYTHONUNBUFFERED="1" \
    WEBSITES_PORT="8000"

# Configure startup command
az webapp config set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --startup-file "startup.sh"

# Get git deployment URL
GIT_URL=$(az webapp deployment source config-local-git --name $APP_NAME --resource-group $RESOURCE_GROUP --query url --output tsv)

echo "🔗 Git deployment URL: $GIT_URL"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial commit for Azure deployment"
fi

# Add Azure remote
git remote remove azure 2>/dev/null || true  # Remove if exists
git remote add azure $GIT_URL

# Deploy
echo "🚀 Deploying code to Azure..."
git push azure main

# Get app URL
APP_URL="https://$APP_NAME.azurewebsites.net"

echo ""
echo "✅ Deployment complete!"
echo "🌐 App URL: $APP_URL"
echo "🔍 Health Check: $APP_URL/health"
echo ""
echo "📋 Next Steps:"
echo "1. Test health check: curl $APP_URL/health"
echo "2. Add this to your Vercel environment variables:"
echo "   VITE_WEBHOOK_URL=$APP_URL/webhook/process-pdf"
echo "3. Redeploy your Vercel app"
echo ""
echo "🎉 Your PDF processor is now running on Azure!"
