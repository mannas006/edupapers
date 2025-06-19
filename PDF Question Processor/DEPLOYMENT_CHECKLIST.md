# 🚀 PythonAnywhere Deployment Checklist

## ✅ Pre-Deployment (COMPLETED)
- [x] Created deployment package: `pythonanywhere_deploy/`
- [x] Created zip file: `pythonanywhere_deployment.zip`
- [x] Prepared all necessary files
- [x] Created PythonAnywhere-specific WSGI file
- [x] Generated requirements.txt

## 🎯 Your Next Steps

### Step 1: Create PythonAnywhere Account
1. Go to **https://www.pythonanywhere.com**
2. Click "Pricing & signup"
3. Choose **"Create a Beginner account"** (Free - No credit card required!)
4. Sign up and verify your email

### Step 2: Upload Your Code
1. **Login to PythonAnywhere**
2. Go to **"Files"** tab
3. **Upload** the `pythonanywhere_deployment.zip` file
4. **Extract** the zip file in the Files interface
5. You should now have a `pythonanywhere_deploy` folder

### Step 3: Install Dependencies
1. Go to **"Consoles"** tab
2. Start a **"Bash console"**
3. Run these commands:
```bash
cd ~/pythonanywhere_deploy
pip3.10 install --user -r requirements.txt
```

### Step 4: Create Web App
1. Go to **"Web"** tab
2. Click **"Add a new web app"**
3. Choose your free domain: `yourusername.pythonanywhere.com`
4. Select **Flask** framework
5. Choose **Python 3.10**

### Step 5: Configure WSGI
1. In the Web tab, find **"Code"** section
2. Click on **WSGI configuration file** link
3. **Replace** the entire content with:

```python
import sys
import os

# Add your project directory to Python path
project_home = '/home/yourusername/pythonanywhere_deploy'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['SUPABASE_URL'] = 'https://dsfqdmrkryjpglrsffhc.supabase.co'
os.environ['SUPABASE_SERVICE_KEY'] = 'YOUR_ACTUAL_SERVICE_KEY_HERE'
os.environ['GEMINI_API_KEY'] = 'YOUR_ACTUAL_GEMINI_KEY_HERE'
os.environ['WEBHOOK_SECRET'] = 'YOUR_ACTUAL_WEBHOOK_SECRET_HERE'
os.environ['ALLOWED_ORIGINS'] = 'https://edupapers.vercel.app'
os.environ['PYTHONUNBUFFERED'] = '1'

from run_webhook import app as application
```

**⚠️ IMPORTANT**: Replace `yourusername` with your actual PythonAnywhere username!

### Step 6: Set Environment Variables
1. In **Web** tab, scroll to **"Environment variables"** section
2. Add these variables:
   - `SUPABASE_URL`: `https://dsfqdmrkryjpglrsffhc.supabase.co`
   - `SUPABASE_SERVICE_KEY`: `[Your actual service key]`
   - `GEMINI_API_KEY`: `[Your actual Gemini API key]`
   - `WEBHOOK_SECRET`: `[Your actual webhook secret]`
   - `ALLOWED_ORIGINS`: `https://edupapers.vercel.app`

### Step 7: Launch Your App
1. In **Web** tab, click **"Reload"** button
2. Wait for reload to complete
3. Visit: `https://yourusername.pythonanywhere.com/health`
4. You should see: `{"status": "healthy"}`

## 🔧 After Deployment: Update Frontend

### Update Vercel Environment Variable
1. Go to **Vercel Dashboard**
2. Select your **EduPapers** project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_WEBHOOK_URL` to: `https://yourusername.pythonanywhere.com`
5. **Redeploy** your frontend

## 🧪 Test Your Deployment

### Test Endpoints
```bash
# Health check
curl https://yourusername.pythonanywhere.com/health

# Test upload (should return error without proper data, but shows it's working)
curl -X POST https://yourusename.pythonanywhere.com/process
```

### Test Full Workflow
1. Go to your frontend: `https://edupapers.vercel.app`
2. Try uploading a PDF
3. Check if processing works end-to-end

## 🆘 Troubleshooting

### Common Issues:
1. **Import Error**: Check WSGI file path and Python imports
2. **Permission Error**: Ensure files are in the right directory
3. **Module Not Found**: Re-run `pip3.10 install --user -r requirements.txt`

### Debug Steps:
1. Check **Error log** in Web tab
2. Test in **Bash console**: `cd ~/pythonanywhere_deploy && python3.10 -c "import run_webhook"`
3. Verify environment variables are set correctly

## 🎉 Success Indicators

✅ **Backend**: `https://yourusername.pythonanywhere.com/health` returns healthy status
✅ **Frontend**: Uploads work without CORS errors
✅ **Processing**: PDFs get processed and results appear
✅ **End-to-End**: Complete workflow from upload to results

## 💡 Tips

- **Free Tier Limits**: 100 CPU seconds/day (resets daily)
- **File Size**: Keep PDFs under 10MB for faster processing
- **Monitoring**: Check usage in PythonAnywhere dashboard
- **Logs**: Use Error log in Web tab for debugging

---

🚀 **Your EduPapers app will be live at**: `https://yourusername.pythonanywhere.com`

Need help with any step? I'm here to assist! 🤝
