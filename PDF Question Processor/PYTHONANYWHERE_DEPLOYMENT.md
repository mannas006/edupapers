# 🐍 PythonAnywhere Deployment Guide

## 🎯 Overview
Deploy your EduPapers PDF processor to PythonAnywhere's free tier - no credit card required!

## 📋 Prerequisites
- PythonAnywhere free account
- Your source code ready
- Environment variables noted down

## 🚀 Step-by-Step Deployment

### Step 1: Create PythonAnywhere Account
1. Go to [PythonAnywhere.com](https://www.pythonanywhere.com)
2. Click "Pricing & signup"
3. Choose "Create a Beginner account" (Free)
4. Sign up with your email - **No credit card required!**
5. Verify your email and login

### Step 2: Upload Your Code

#### Option A: Direct Upload (Recommended)
1. In PythonAnywhere dashboard, go to **Files** tab
2. Create a new folder: `edupapers-pdf-processor`
3. Upload all files from your `PDF Question Processor` folder:
   - `src/` folder (all Python files)
   - `config/requirements.txt`
   - `wsgi.py`
   - `run_webhook.py`
   - All other Python files

#### Option B: Git Clone (Alternative)
1. In PythonAnywhere dashboard, go to **Consoles** tab
2. Start a new **Bash console**
3. Run these commands:
```bash
git clone https://github.com/mannas006/edupapers.git
cd edupapers/PDF\ Question\ Processor/
```

### Step 3: Install Dependencies
1. Go to **Consoles** tab
2. Start a new **Bash console**
3. Navigate to your project folder:
```bash
cd ~/edupapers-pdf-processor  # or wherever you uploaded files
```
4. Install requirements:
```bash
pip3.10 install --user -r config/requirements.txt
```

### Step 4: Create Web App
1. Go to **Web** tab in dashboard
2. Click "Add a new web app"
3. Choose your domain: `yourusername.pythonanywhere.com`
4. Select **Flask** framework
5. Choose **Python 3.10**
6. Set the path to: `/home/yourusername/edupapers-pdf-processor/wsgi.py`

### Step 5: Configure Web App
1. In the **Web** tab, find your app configuration
2. In the **Code** section:
   - **Source code**: `/home/yourusername/edupapers-pdf-processor`
   - **Working directory**: `/home/yourusername/edupapers-pdf-processor`
   - **WSGI configuration file**: Click to edit

3. Replace the WSGI file content with:
```python
import sys
import os

# Add your project directory to Python path
project_home = '/home/yourusername/edupapers-pdf-processor'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://dsfqdmrkryjpglrsffhc.supabase.co'
os.environ['SUPABASE_SERVICE_KEY'] = 'your_service_key_here'
os.environ['GEMINI_API_KEY'] = 'your_gemini_api_key_here'
os.environ['WEBHOOK_SECRET'] = 'your_webhook_secret_here'
os.environ['ALLOWED_ORIGINS'] = 'https://edupapers.vercel.app'
os.environ['PYTHONUNBUFFERED'] = '1'

from wsgi import app as application
```

### Step 6: Set Environment Variables
In the **Web** tab, scroll down to **Environment variables** section and add:
- `SUPABASE_URL`: `https://dsfqdmrkryjpglrsffhc.supabase.co`
- `SUPABASE_SERVICE_KEY`: `your_service_key_here`
- `GEMINI_API_KEY`: `your_gemini_api_key_here`
- `WEBHOOK_SECRET`: `your_webhook_secret_here`
- `ALLOWED_ORIGINS`: `https://edupapers.vercel.app`

### Step 7: Enable HTTPS and Launch
1. In **Web** tab, click **Reload** your web app
2. Your app will be available at: `https://yourusername.pythonanywhere.com`
3. Test the health endpoint: `https://yourusername.pythonanywhere.com/health`

## 🔧 Configuration Files

### Updated wsgi.py for PythonAnywhere
```python
import os
import sys
from flask import Flask
from flask_cors import CORS

# Add the project directory to Python path
project_home = os.path.dirname(os.path.abspath(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import your main application
from run_webhook import app

# Configure CORS for PythonAnywhere
CORS(app, origins=os.getenv('ALLOWED_ORIGINS', '').split(','))

if __name__ == "__main__":
    app.run(debug=False)
```

## 🌐 Update Frontend Configuration

Once deployed, update your Vercel environment variable:
1. Go to Vercel dashboard
2. Select your EduPapers project
3. Go to Settings > Environment Variables
4. Update `VITE_WEBHOOK_URL` to: `https://yourusername.pythonanywhere.com`

## 🧪 Testing Your Deployment

### Test Health Endpoint
```bash
curl https://yourusername.pythonanywhere.com/health
```

### Test Process Endpoint
```bash
curl -X POST https://yourusername.pythonanywhere.com/process \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## 📊 Free Tier Limits
- **CPU seconds**: 100/day (resets daily)
- **Disk space**: 512MB
- **Bandwidth**: 100MB/day
- **Always-on**: Not available (app sleeps after inactivity)

## 🔍 Troubleshooting

### Common Issues:
1. **Import errors**: Check Python path in WSGI file
2. **Permission errors**: Ensure files are in correct directory
3. **Module not found**: Re-install requirements with `--user` flag
4. **CORS errors**: Check ALLOWED_ORIGINS environment variable

### Debug Steps:
1. Check **Error log** in Web tab
2. Use **Bash console** to test imports
3. Verify file permissions and paths
4. Test endpoints manually

## 🎉 Success!
Your PDF processor is now live at: `https://yourusername.pythonanywhere.com`

The complete workflow:
1. **Frontend**: `https://edupapers.vercel.app` (Already deployed)
2. **Backend**: `https://yourusername.pythonanywhere.com` (Just deployed)
3. **Database**: Supabase (Already configured)

## 🔄 Next Steps
1. Test the complete upload → process → results workflow
2. Monitor usage in PythonAnywhere dashboard
3. Consider upgrading if you need more CPU time

Need help with any step? I'm here to assist! 🚀
