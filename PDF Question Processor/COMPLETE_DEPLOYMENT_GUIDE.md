# 🐍 Complete PythonAnywhere Deployment Guide
## Step-by-Step Visual Guide with Screenshots

---

## 🎯 **STEP 1: Create Your Free PythonAnywhere Account**

### 1.1 Go to PythonAnywhere
- Open your browser and go to: **https://www.pythonanywhere.com**
- Click the **"Pricing & signup"** button in the top right

### 1.2 Choose Free Plan
- Scroll down and find the **"Beginner"** plan
- Click **"Create a Beginner account"** button
- ✅ **FREE** - No credit card required!

### 1.3 Sign Up
- Fill in your details:
  - **Username**: Choose something like `manasedupapers` or `yourname-edupapers`
  - **Email**: Your email address
  - **Password**: A strong password
- Click **"Create account"**
- Check your email and verify your account

---

## 📁 **STEP 2: Upload Your Code Files**

### 2.1 Login to Dashboard
- Go to **https://www.pythonanywhere.com** and login
- You'll see your **Dashboard** with different tabs

### 2.2 Go to Files Tab
- Click on the **"Files"** tab at the top
- You'll see your home directory: `/home/yourusername/`

### 2.3 Upload the Deployment Package
**Option A: Upload Zip File (Recommended)**
1. In the Files interface, click **"Upload a file"** button
2. Select the **`pythonanywhere_deployment.zip`** file from your computer
   - Location: `PDF Question Processor/pythonanywhere_deployment.zip`
3. Wait for upload to complete
4. Click on the zip file name to **extract** it
5. You should now see a **`pythonanywhere_deploy`** folder

**Option B: Manual File Upload**
1. Create a new folder: Click **"New directory"** → Name it **`edupapers-backend`**
2. Open the folder
3. Upload each file individually from the `pythonanywhere_deploy` folder:
   - `run_webhook.py`
   - `wsgi_pythonanywhere.py`
   - `requirements.txt`
   - All Python files from the package

### 2.4 Verify Files
- Navigate to your uploaded folder
- You should see all the Python files including:
  - ✅ `run_webhook.py`
  - ✅ `wsgi_pythonanywhere.py`
  - ✅ `requirements.txt`
  - ✅ All other Python files

---

## 🔧 **STEP 3: Install Python Dependencies**

### 3.1 Open Bash Console
- Click on the **"Consoles"** tab
- Click **"Start a new console"**
- Choose **"Bash"** (not Python)

### 3.2 Navigate to Your Project
```bash
# Type this command (replace 'yourusername' with your actual username)
cd ~/pythonanywhere_deploy
```
Or if you created a custom folder:
```bash
cd ~/edupapers-backend
```

### 3.3 Install Requirements
```bash
# Install all Python packages
pip3.10 install --user -r requirements.txt
```

**Wait for installation to complete** (may take 2-3 minutes)

### 3.4 Verify Installation
```bash
# Test if main modules can be imported
python3.10 -c "import flask; print('Flask OK')"
python3.10 -c "import run_webhook; print('App OK')"
```

If you see "Flask OK" and "App OK", you're good to go!

---

## 🌐 **STEP 4: Create Your Web App**

### 4.1 Go to Web Tab
- Click on the **"Web"** tab in the dashboard
- You'll see "You don't have any web apps yet"

### 4.2 Create New Web App
- Click **"Add a new web app"** button
- Choose your domain: **`yourusername.pythonanywhere.com`** (free subdomain)
- Click **"Next"**

### 4.3 Choose Framework
- Select **"Flask"** from the list
- Click **"Next"**

### 4.4 Choose Python Version
- Select **"Python 3.10"**
- Click **"Next"**

### 4.5 Set Project Path
- For **"Path to your Flask app"**, enter:
  ```
  /home/yourusername/pythonanywhere_deploy/run_webhook.py
  ```
- Replace `yourusername` with your actual PythonAnywhere username
- Click **"Next"**

### 4.6 Finish Setup
- Review the settings
- Click **"Create"** or **"Finish"**

---

## ⚙️ **STEP 5: Configure Your Web App**

### 5.1 Configure WSGI File
1. In the **Web tab**, scroll down to the **"Code"** section
2. Click on the **WSGI configuration file** link (it will open an editor)
3. **Delete all existing content** in the file
4. **Copy and paste** this code:

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
os.environ['WEBHOOK_SECRET'] = 'my-secret-webhook-key-123'
os.environ['ALLOWED_ORIGINS'] = 'https://edupapers.vercel.app'
os.environ['PYTHONUNBUFFERED'] = '1'

from run_webhook import app as application
```

5. **Replace** `yourusername` with your actual PythonAnywhere username
6. **Replace** the environment variables with your actual values:
   - `YOUR_ACTUAL_SERVICE_KEY_HERE` → Your Supabase service key
   - `YOUR_ACTUAL_GEMINI_KEY_HERE` → Your Gemini API key
7. Click **"Save"** at the top of the editor

### 5.2 Set Source Code Directory
1. In the **Web tab**, find the **"Code"** section
2. Set **"Source code"** to: `/home/yourusername/pythonanywhere_deploy`
3. Set **"Working directory"** to: `/home/yourusername/pythonanywhere_deploy`

---

## 🚀 **STEP 6: Add Environment Variables (Optional but Recommended)**

### 6.1 Set Environment Variables
1. In the **Web tab**, scroll down to **"Environment variables"** section
2. Click **"Add new variable"** for each:

| Variable Name | Value |
|---------------|-------|
| `SUPABASE_URL` | `https://dsfqdmrkryjpglrsffhc.supabase.co` |
| `SUPABASE_SERVICE_KEY` | `[Your actual service key]` |
| `GEMINI_API_KEY` | `[Your actual Gemini API key]` |
| `WEBHOOK_SECRET` | `my-secret-webhook-key-123` |
| `ALLOWED_ORIGINS` | `https://edupapers.vercel.app` |

---

## 🎉 **STEP 7: Launch Your App**

### 7.1 Reload Your Web App
1. In the **Web tab**, scroll to the top
2. Click the big green **"Reload yourusername.pythonanywhere.com"** button
3. Wait for the reload to complete (you'll see a success message)

### 7.2 Test Your App
1. Click on the link: **`https://yourusername.pythonanywhere.com`**
2. You should see your app running!
3. Test the health endpoint: **`https://yourusername.pythonanywhere.com/health`**
4. You should see: `{"status": "healthy"}`

---

## 🔗 **STEP 8: Update Your Frontend**

### 8.1 Update Vercel Environment Variable
1. Go to **https://vercel.com** and login
2. Select your **EduPapers** project
3. Go to **Settings** tab
4. Click **"Environment Variables"** in the left sidebar
5. Find `VITE_WEBHOOK_URL` and click **"Edit"**
6. Update the value to: `https://yourusername.pythonanywhere.com`
7. Click **"Save"**

### 8.2 Redeploy Frontend
1. Go to the **"Deployments"** tab in Vercel
2. Click **"Redeploy"** on the latest deployment
3. Wait for deployment to complete

---

## 🧪 **STEP 9: Test Everything**

### 9.1 Test Backend Endpoints
Open these URLs in your browser:
- **Health Check**: `https://yourusername.pythonanywhere.com/health`
- **Should return**: `{"status": "healthy"}`

### 9.2 Test Frontend Integration
1. Go to your frontend: **`https://edupapers.vercel.app`**
2. Try uploading a PDF file
3. Check if the processing works
4. Verify no CORS errors in browser console

---

## 🆘 **Troubleshooting**

### Common Issues and Solutions:

#### **Issue 1: "Internal Server Error"**
**Solution:**
1. Go to **Web tab** → Click **"Error log"**
2. Check the latest errors
3. Usually it's an import error or missing environment variable

#### **Issue 2: "ModuleNotFoundError"**
**Solution:**
1. Go to **Consoles** → Start **Bash console**
2. Run: `cd ~/pythonanywhere_deploy && pip3.10 install --user -r requirements.txt`
3. Reload your web app

#### **Issue 3: "CORS Error"**
**Solution:**
1. Check that `ALLOWED_ORIGINS` is set to your frontend URL
2. Make sure environment variables are properly set

#### **Issue 4: "File Not Found"**
**Solution:**
1. Verify all files are uploaded correctly
2. Check the paths in WSGI configuration
3. Ensure `yourusername` is replaced with your actual username

### Debug Commands:
```bash
# Test if your app can be imported
cd ~/pythonanywhere_deploy
python3.10 -c "from run_webhook import app; print('App imported successfully')"

# Check if requirements are installed
pip3.10 list --user
```

---

## ✅ **Success Checklist**

- [ ] PythonAnywhere account created
- [ ] Files uploaded to `/home/yourusername/pythonanywhere_deploy/`
- [ ] Dependencies installed with `pip3.10 install --user -r requirements.txt`
- [ ] Web app created with Flask + Python 3.10
- [ ] WSGI file configured with correct paths and environment variables
- [ ] App reloaded successfully
- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Frontend environment variable updated to PythonAnywhere URL
- [ ] End-to-end upload and processing works

---

## 🎉 **Congratulations!**

Your EduPapers PDF processor is now live at:
**`https://yourusername.pythonanywhere.com`**

Your complete system:
- **Frontend**: `https://edupapers.vercel.app`
- **Backend**: `https://yourusername.pythonanywhere.com`
- **Database**: Supabase (already configured)

---

## 💡 **Tips for Success**

1. **Keep your credentials safe** - Don't share your API keys
2. **Monitor usage** - Check PythonAnywhere dashboard for CPU usage
3. **Free tier limits** - 100 CPU seconds per day (resets daily)
4. **File size limits** - Keep PDFs under 10MB for best performance
5. **Error monitoring** - Check error logs if something goes wrong

---

**Need help with any specific step? Let me know which step you're on and I'll provide more detailed guidance!** 🤝
