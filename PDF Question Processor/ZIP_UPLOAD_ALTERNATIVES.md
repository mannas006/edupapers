# 🔧 Fix: Can't Unzip Files on PythonAnywhere

## 🚨 Problem: Unable to unzip `pythonanywhere_deployment.zip`

This is a common issue on PythonAnywhere's free tier. Here are **3 alternative solutions**:

---

## ✅ **SOLUTION 1: Upload Individual Files (Recommended)**

### Step 1: Create Project Folder
1. In PythonAnywhere **Files** tab
2. Click **"New directory"**
3. Name it: **`edupapers-backend`**
4. Open the folder

### Step 2: Upload Files One by One
Upload these files from your local `PDF Question Processor/pythonanywhere_deploy/` folder:

**Required Files (upload these):**
1. `run_webhook.py`
2. `wsgi_pythonanywhere.py`
3. `requirements.txt`
4. `gemini_client.py`
5. `main.py`
6. `pdf_extractor.py`
7. `production_webhook.py`
8. `supabase_integration.py`
9. `run_processor.py`

**How to upload each file:**
1. Click **"Upload a file"** in PythonAnywhere Files tab
2. Select the file from your computer
3. Wait for upload to complete
4. Repeat for all files

---

## ✅ **SOLUTION 2: Use Git Clone (Easy)**

### Step 1: Open Bash Console
1. Go to **Consoles** tab in PythonAnywhere
2. Start a **Bash** console

### Step 2: Clone from GitHub
```bash
# Clone your repository
git clone https://github.com/mannas006/edupapers.git

# Navigate to the PDF processor
cd edupapers/PDF\ Question\ Processor/

# Copy files to your home directory
cp -r pythonanywhere_deploy ~/edupapers-backend
cd ~/edupapers-backend
```

### Step 3: Verify Files
```bash
ls -la
# You should see all your Python files
```

---

## ✅ **SOLUTION 3: Create Files Manually**

If other methods don't work, I can help you create the files directly in PythonAnywhere:

### Step 1: Create Main Files
1. In **Files** tab, create **`edupapers-backend`** folder
2. Create new file: **`requirements.txt`**
3. Paste this content:
```txt
Flask==2.3.3
Flask-CORS==4.0.0
gunicorn==21.2.0
requests==2.31.0
google-generativeai==0.3.2
supabase==1.2.0
python-multipart==0.0.6
PyPDF2==3.0.1
Werkzeug==2.3.7
python-dotenv==1.0.0
storage3==0.7.0
postgrest==0.12.0
gotrue==1.3.0
realtime==1.0.0
supafunc==0.3.0
```

### Step 2: I'll provide other file contents
Tell me if you choose this option and I'll give you the content for each file.

---

## 🎯 **Which Solution Do You Prefer?**

**Most users find Solution 1 (individual file upload) or Solution 2 (git clone) easiest.**

### For Solution 1 - File Locations:
Your files are ready in:
```
PDF Question Processor/pythonanywhere_deploy/
├── run_webhook.py ← Upload this
├── requirements.txt ← Upload this
├── wsgi_pythonanywhere.py ← Upload this
├── gemini_client.py ← Upload this
├── main.py ← Upload this
├── pdf_extractor.py ← Upload this
├── production_webhook.py ← Upload this
├── supabase_integration.py ← Upload this
└── run_processor.py ← Upload this
```

### For Solution 2 - Git Clone:
Just run the git commands in a Bash console and everything will be ready.

---

## 📋 **After Files Are Uploaded (Any Method):**

### Continue with Web App Setup:
1. **Web tab** → **"Add new web app"**
2. Choose **Flask** + **Python 3.10**
3. Set WSGI path to: `/home/yourusername/edupapers-backend/wsgi_pythonanywhere.py`
4. Install requirements: `pip3.10 install --user -r requirements.txt`
5. Set environment variables
6. Reload app

---

## 🤔 **Which solution would you like to try?**

- **Option 1**: Individual file upload (manual but reliable)
- **Option 2**: Git clone (automatic, uses your GitHub repo)
- **Option 3**: Manual file creation (I'll help you create each file)

Let me know which you prefer and I'll guide you through it step by step! 🚀
