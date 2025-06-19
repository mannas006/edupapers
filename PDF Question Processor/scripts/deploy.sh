#!/bin/bash

# EduPapers Webhook Server Deployment Script

set -e

echo "🚀 Setting up EduPapers PDF Processor Webhook Server..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r config/requirements.txt

# Check if .env file exists
if [ ! -f "config/.env" ]; then
    echo "⚠️  config/.env file not found. Please create one with the following variables:"
    echo "SUPABASE_URL=your_supabase_url"
    echo "SUPABASE_SERVICE_KEY=your_service_key"
    echo "GEMINI_API_KEY=your_gemini_api_key"
    echo "WEBHOOK_SECRET=your_webhook_secret"
    echo "ALLOWED_ORIGINS=https://edupapers.site"
    exit 1
fi

# Run tests
echo "🧪 Running basic tests..."
PYTHONPATH="$(pwd)/src:$PYTHONPATH" python3 -c "
import os
import sys
sys.path.insert(0, 'config')
sys.path.insert(0, 'src')

from dotenv import load_dotenv
load_dotenv('config/.env')

# Check required environment variables
required_vars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GEMINI_API_KEY']
missing_vars = [var for var in required_vars if not os.getenv(var)]

if missing_vars:
    print(f'❌ Missing environment variables: {missing_vars}')
    exit(1)

print('✅ Environment variables configured')

# Test imports
try:
    from supabase_integration import EduPapersProcessor
    from production_webhook import EduPapersWebhookAPI
    print('✅ All modules imported successfully')
except ImportError as e:
    print(f'❌ Import error: {e}')
    exit(1)
"

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please check your configuration."
    exit 1
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the webhook server:"
echo "  Development: python run_webhook.py --debug"
echo "  Production:  gunicorn -w 4 -b 0.0.0.0:8000 wsgi:application"
echo ""
echo "📊 Webhook endpoints:"
echo "  Health check: http://localhost:8000/health"
echo "  Process PDF:  http://localhost:8000/webhook/process-pdf"
echo "  Status check: http://localhost:8000/status/{processing_id}"
echo ""
echo "🔗 Integration with EduPapers.site:"
echo "  Set webhook URL in your website to: http://your-server:8000/webhook/process-pdf"
echo "  Include 'X-Signature-256' header if webhook secret is configured"
echo ""
echo "💡 For production deployment, consider using a reverse proxy like nginx"
echo "   and a process manager like systemd or supervisor."
