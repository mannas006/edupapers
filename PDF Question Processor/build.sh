#!/bin/bash
# Build script for Render

# Install system dependencies
apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    tesseract-ocr-eng

# Install Python dependencies
pip install --upgrade pip
pip install -r config/requirements.txt
