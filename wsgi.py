#!/usr/bin/env python3
"""
WSGI entry point for production deployment
"""

import sys
import os

# Add current directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import the Flask app factory
from production_webhook import create_app

# Create the Flask app for Gunicorn
app = create_app()

# For Gunicorn compatibility (both 'app' and 'application' work)
application = app

if __name__ == "__main__":
    app.run(debug=False)
