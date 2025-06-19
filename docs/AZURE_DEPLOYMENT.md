# 🚀 Deploy PDF Processor to Azure App Service (Free Tier)

## Why Azure?
- ✅ **Free Tier**: 1GB storage, 1GB RAM, shared compute
- ✅ **Easy Python Support**: Native Python runtime
- ✅ **Reliable**: Enterprise-grade infrastructure
- ✅ **No Credit Card Required**: True free tier

## 🎯 Quick Azure Deployment

### Prerequisites
- Azure account (free at https://azure.microsoft.com/free/)
- Azure CLI installed

### Step 1: Install Azure CLI
```bash
# macOS
brew install azure-cli

# Or download from: https://aka.ms/installazureclimacos
```

### Step 2: Login to Azure
```bash
az login
```

### Step 3: Create Resource Group
```bash
az group create --name edupapers-rg --location "East US"
```

### Step 4: Create App Service Plan (Free Tier)
```bash
az appservice plan create \
  --name edupapers-plan \
  --resource-group edupapers-rg \
  --sku F1 \
  --is-linux
```

### Step 5: Create Web App
```bash
az webapp create \
  --resource-group edupapers-rg \
  --plan edupapers-plan \
  --name edupapers-pdf-processor \
  --runtime "PYTHON|3.9" \
  --deployment-local-git
```

### Step 6: Configure Environment Variables
```bash
# Set all required environment variables
az webapp config appsettings set \
  --resource-group edupapers-rg \
  --name edupapers-pdf-processor \
  --settings \
    SUPABASE_URL="https://ipmzxaxyffamuvbpglzq.supabase.co" \
    SUPABASE_SERVICE_KEY="your-service-key" \
    GEMINI_API_KEY="AIzaSyD_1l8qu0kEaxK0tNY4cE4zXIFxkH50giw" \
    WEBHOOK_SECRET="your-random-secret" \
    ALLOWED_ORIGINS="https://edupapers-12ixy0e89-mannas006s-projects.vercel.app" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    PYTHONUNBUFFERED="1" \
    WEBSITES_PORT="8000"
```

### Step 7: Deploy Code
```bash
# Add Azure remote
git remote add azure https://edupapers-pdf-processor.scm.azurewebsites.net:443/edupapers-pdf-processor.git

# Deploy
git add .
git commit -m "Deploy to Azure"
git push azure main
```

## 🔧 Alternative: Azure Container Instances (Even Easier)

If you prefer containerized deployment:

```bash
# Build and push to Azure Container Registry
az acr create --resource-group edupapers-rg --name edupapersacr --sku Basic
az acr build --registry edupapersacr --image edupapers-pdf:latest .

# Deploy to Container Instances
az container create \
  --resource-group edupapers-rg \
  --name edupapers-pdf-processor \
  --image edupapersacr.azurecr.io/edupapers-pdf:latest \
  --dns-name-label edupapers-pdf \
  --ports 8000 \
  --environment-variables \
    SUPABASE_URL="https://ipmzxaxyffamuvbpglzq.supabase.co" \
    SUPABASE_SERVICE_KEY="your-service-key" \
    GEMINI_API_KEY="AIzaSyD_1l8qu0kEaxK0tNY4cE4zXIFxkH50giw" \
    WEBHOOK_SECRET="your-random-secret" \
    ALLOWED_ORIGINS="https://edupapers-12ixy0e89-mannas006s-projects.vercel.app"
```

## 📱 Using Azure Portal (GUI Method)

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create App Service**:
   - Click "Create a resource"
   - Search "Web App"
   - Choose Python 3.9 runtime
   - Select F1 (Free) pricing tier
3. **Configure Deployment**:
   - Go to Deployment Center
   - Choose Local Git or GitHub
   - Follow the setup wizard
4. **Set Environment Variables**:
   - Go to Configuration
   - Add all the environment variables listed above

## 🌐 Your App URLs
After deployment, your app will be available at:
- **App Service**: `https://edupapers-pdf-processor.azurewebsites.net`
- **Container Instance**: `https://edupapers-pdf.eastus.azurecontainer.io:8000`

## ✅ Test Your Deployment
```bash
# Health check
curl https://edupapers-pdf-processor.azurewebsites.net/health

# Or use our test script
python test_deployment.py https://edupapers-pdf-processor.azurewebsites.net
```

## 📋 Update Vercel Environment Variable
In your Vercel dashboard, set:
```
VITE_WEBHOOK_URL=https://edupapers-pdf-processor.azurewebsites.net/webhook/process-pdf
```

## 💡 Azure Free Tier Limits
- **Compute**: 60 minutes/day
- **Storage**: 1GB
- **Bandwidth**: 165MB/day outbound
- **Custom domains**: Not available on free tier

Perfect for development and moderate usage! 🎯

## 🆘 Troubleshooting
- **Deployment failed**: Check deployment logs in Azure Portal
- **App not starting**: Verify Python version and startup command
- **Environment variables**: Double-check all variables are set correctly
- **CORS issues**: Ensure ALLOWED_ORIGINS matches your Vercel URL
