#!/usr/bin/env python3
"""
WSGI configuration for PythonAnywhere deployment
This file configures the Flask app for PythonAnywhere hosting
"""

import os
import sys
from pathlib import Path

# Add the project directory to Python path
project_home = Path(__file__).parent.absolute()
if str(project_home) not in sys.path:
    sys.path.insert(0, str(project_home))

# Set environment variables (replace with your actual values)
os.environ.setdefault('SUPABASE_URL', 'https://dsfqdmrkryjpglrsffhc.supabase.co')
os.environ.setdefault('SUPABASE_SERVICE_KEY', 'your_service_key_here')
os.environ.setdefault('GEMINI_API_KEY', 'your_gemini_api_key_here')
os.environ.setdefault('WEBHOOK_SECRET', 'your_webhook_secret_here')
os.environ.setdefault('ALLOWED_ORIGINS', 'https://edupapers.vercel.app')
os.environ.setdefault('PYTHONUNBUFFERED', '1')

# Import the Flask application
try:
    from run_webhook import app as application
    print("✅ Successfully imported Flask app")
except ImportError as e:
    print(f"❌ Failed to import Flask app: {e}")
    # Create a minimal Flask app as fallback
    from flask import Flask
    application = Flask(__name__)
    
    @application.route('/')
    def hello():
        return "EduPapers PDF Processor - Import Error. Check logs."
    
    @application.route('/health')
    def health():
        return {"status": "error", "message": "Import failed"}

# For debugging
if __name__ == "__main__":
    print(f"Project home: {project_home}")
    print(f"Python path: {sys.path}")
    print(f"Environment variables set: {list(os.environ.keys())}")
    application.run(debug=False)
