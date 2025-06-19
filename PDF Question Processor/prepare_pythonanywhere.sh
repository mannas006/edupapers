#!/bin/bash

# 🐍 PythonAnywhere Deployment Preparation Script
# This script prepares all files needed for PythonAnywhere deployment

echo "🚀 Preparing EduPapers PDF Processor for PythonAnywhere deployment..."

# Create deployment directory
DEPLOY_DIR="pythonanywhere_deploy"
mkdir -p "$DEPLOY_DIR"

echo "📁 Creating deployment package in $DEPLOY_DIR..."

# Copy all necessary files
cp -r src/ "$DEPLOY_DIR/"
cp -r config/ "$DEPLOY_DIR/"
cp wsgi.py "$DEPLOY_DIR/"
cp wsgi_pythonanywhere.py "$DEPLOY_DIR/"
cp run_webhook.py "$DEPLOY_DIR/"
cp run_processor.py "$DEPLOY_DIR/"
cp *.py "$DEPLOY_DIR/" 2>/dev/null || true

# Create a README for deployment
cat > "$DEPLOY_DIR/DEPLOYMENT_INSTRUCTIONS.txt" << 'EOF'
🐍 PythonAnywhere Deployment Instructions

1. Create a free account at https://www.pythonanywhere.com
2. Upload all files in this folder to your PythonAnywhere account
3. In Files tab, create folder: /home/yourusername/edupapers-pdf-processor
4. Upload all these files to that folder

5. Open a Bash console and run:
   cd ~/edupapers-pdf-processor
   pip3.10 install --user -r config/requirements.txt

6. Create a new Web App:
   - Choose Flask
   - Python 3.10
   - Set WSGI file to: /home/yourusername/edupapers-pdf-processor/wsgi_pythonanywhere.py

7. Set Environment Variables in Web tab:
   SUPABASE_URL=https://dsfqdmrkryjpglrsffhc.supabase.co
   SUPABASE_SERVICE_KEY=your_actual_service_key
   GEMINI_API_KEY=your_actual_gemini_key
   WEBHOOK_SECRET=your_actual_webhook_secret
   ALLOWED_ORIGINS=https://edupapers.vercel.app

8. Click Reload in Web tab

Your app will be at: https://yourusername.pythonanywhere.com
EOF

# Create a requirements.txt specifically for PythonAnywhere
cat > "$DEPLOY_DIR/requirements.txt" << 'EOF'
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
EOF

echo "✅ Deployment package created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://www.pythonanywhere.com and create a free account"
echo "2. Upload the contents of '$DEPLOY_DIR' folder to PythonAnywhere"
echo "3. Follow the instructions in DEPLOYMENT_INSTRUCTIONS.txt"
echo ""
echo "🌐 Your app will be available at: https://yourusername.pythonanywhere.com"
echo ""
echo "Need help? Check the detailed guide in PYTHONANYWHERE_DEPLOYMENT.md"
