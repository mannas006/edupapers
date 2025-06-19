#!/bin/bash

# Startup command for Azure App Service
echo "Starting EduPapers PDF Processor on Azure..."

# Install additional dependencies if needed
pip install --upgrade pip

# Start the application with gunicorn
exec gunicorn --bind=0.0.0.0:$PORT --workers=1 --timeout=300 --preload wsgi:app
