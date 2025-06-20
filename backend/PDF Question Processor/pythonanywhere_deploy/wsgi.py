#!/usr/bin/env python3
"""
WSGI entry point for production deployment
"""

import sys
import os

# Add src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from production_webhook import create_app

# Create the WSGI application
application = create_app()

if __name__ == "__main__":
    application.run(debug=False)
