"""
Production Webhook API for EduPapers.site Integration
Handles PDF processing requests with authentication and robust error handling
"""

import os
import json
import logging
import hashlib
import hmac
import tempfile
import requests
from typing import Dict, Any, Optional
from datetime import datetime
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading
import time
from urllib.parse import urlparse

# Flask for better HTTP handling
try:
    from flask import Flask, request, jsonify, abort
    from flask_cors import CORS
except ImportError:
    print("Installing Flask and Flask-CORS...")
    os.system("pip install flask flask-cors")
    from flask import Flask, request, jsonify, abort
    from flask_cors import CORS

from supabase_integration import EduPapersProcessor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('webhook.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EduPapersWebhookAPI:
    """
    Production-ready webhook API for EduPapers.site
    """
    
    def __init__(self):
        self.app = Flask(__name__)
        
        # Configure CORS
        allowed_origins = os.getenv('ALLOWED_ORIGINS', 'https://edupapers.site').split(',')
        CORS(self.app, origins=allowed_origins)
        
        # Initialize processor
        self.processor = None
        self.executor = ThreadPoolExecutor(max_workers=5)
        self.webhook_secret = os.getenv('WEBHOOK_SECRET')
        self.max_file_size_mb = int(os.getenv('MAX_PDF_SIZE_MB', '50'))
        self.processing_timeout = int(os.getenv('PROCESSING_TIMEOUT_SECONDS', '300'))
        
        # Processing status tracking
        self.processing_status = {}
        self.status_lock = threading.Lock()
        
        self._init_processor()
        self._setup_routes()
    
    def _init_processor(self):
        """Initialize the PDF processor"""
        try:
            self.processor = EduPapersProcessor()
            logger.info("EduPapers processor initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize processor: {e}")
            self.processor = None
    
    def _setup_routes(self):
        """Setup Flask routes"""
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            """Health check endpoint"""
            return jsonify({
                'status': 'healthy',
                'service': 'EduPapers PDF Processor',
                'timestamp': datetime.now().isoformat(),
                'processor_ready': self.processor is not None
            })
        
        @self.app.route('/webhook/process-pdf', methods=['POST'])
        def process_pdf_webhook():
            """Main webhook endpoint for PDF processing"""
            try:
                # Verify webhook signature if secret is configured
                if self.webhook_secret and not self._verify_signature():
                    logger.warning("Invalid webhook signature")
                    abort(401)
                
                # Parse request data
                data = request.get_json()
                if not data:
                    return jsonify({
                        'success': False,
                        'message': 'Invalid JSON payload'
                    }), 400
                
                # Validate required fields
                validation_result = self._validate_webhook_data(data)
                if not validation_result['valid']:
                    return jsonify({
                        'success': False,
                        'message': validation_result['message']
                    }), 400
                
                # Check if processor is ready
                if not self.processor:
                    return jsonify({
                        'success': False,
                        'message': 'PDF processor not available'
                    }), 503
                
                # Generate processing ID
                processing_id = self._generate_processing_id(data)
                
                # Check if already processing
                with self.status_lock:
                    if processing_id in self.processing_status:
                        status = self.processing_status[processing_id]
                        return jsonify({
                            'success': True,
                            'message': 'Already processing',
                            'processing_id': processing_id,
                            'status': status['status']
                        })
                    
                    # Set initial status
                    self.processing_status[processing_id] = {
                        'status': 'queued',
                        'started_at': datetime.now().isoformat(),
                        'filename': data.get('filename', ''),
                        'message': 'Processing queued'
                    }
                
                # Submit for background processing
                future = self.executor.submit(
                    self._process_pdf_background, 
                    processing_id, 
                    data
                )
                
                return jsonify({
                    'success': True,
                    'message': 'PDF processing started',
                    'processing_id': processing_id,
                    'status': 'queued',
                    'status_url': f'/status/{processing_id}'
                })
                
            except Exception as e:
                logger.error(f"Webhook processing error: {e}")
                return jsonify({
                    'success': False,
                    'message': 'Internal server error'
                }), 500
        
        @self.app.route('/status/<processing_id>', methods=['GET'])
        def get_processing_status(processing_id):
            """Get processing status"""
            with self.status_lock:
                if processing_id not in self.processing_status:
                    return jsonify({
                        'success': False,
                        'message': 'Processing ID not found'
                    }), 404
                
                status = self.processing_status[processing_id].copy()
            
            return jsonify({
                'success': True,
                'processing_id': processing_id,
                **status
            })
        
        @self.app.route('/webhook/test', methods=['POST'])
        def test_webhook():
            """Test endpoint for development"""
            if os.getenv('FLASK_ENV') != 'development':
                abort(404)
            
            return jsonify({
                'success': True,
                'message': 'Test webhook received',
                'data': request.get_json(),
                'timestamp': datetime.now().isoformat()
            })
    
    def _verify_signature(self) -> bool:
        """Verify webhook signature"""
        try:
            signature = request.headers.get('X-Signature-256', '')
            if not signature:
                return False
            
            expected_signature = hmac.new(
                self.webhook_secret.encode(),
                request.get_data(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(signature, f"sha256={expected_signature}")
            
        except Exception as e:
            logger.error(f"Signature verification error: {e}")
            return False
    
    def _validate_webhook_data(self, data: Dict) -> Dict:
        """Validate webhook data"""
        required_fields = ['file_url', 'filename']
        
        for field in required_fields:
            if field not in data or not data[field]:
                return {
                    'valid': False,
                    'message': f'Missing required field: {field}'
                }
        
        # Validate file extension
        filename = data['filename']
        if not filename.lower().endswith('.pdf'):
            return {
                'valid': False,
                'message': 'Only PDF files are supported'
            }
        
        # Validate URL format
        file_url = data['file_url']
        try:
            parsed_url = urlparse(file_url)
            if not parsed_url.scheme or not parsed_url.netloc:
                raise ValueError("Invalid URL format")
        except Exception:
            return {
                'valid': False,
                'message': 'Invalid file URL format'
            }
        
        return {'valid': True}
    
    def _generate_processing_id(self, data: Dict) -> str:
        """Generate unique processing ID"""
        content = f"{data['filename']}_{data['file_url']}_{datetime.now().timestamp()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    def _update_status(self, processing_id: str, status: str, message: str = '', **kwargs):
        """Update processing status"""
        with self.status_lock:
            if processing_id in self.processing_status:
                self.processing_status[processing_id].update({
                    'status': status,
                    'message': message,
                    'updated_at': datetime.now().isoformat(),
                    **kwargs
                })
    
    def _process_pdf_background(self, processing_id: str, data: Dict):
        """Background PDF processing"""
        try:
            self._update_status(processing_id, 'downloading', 'Downloading PDF file')
            
            # Download PDF
            temp_pdf_path = self._download_pdf(data['file_url'])
            if not temp_pdf_path:
                self._update_status(processing_id, 'failed', 'Failed to download PDF')
                return
            
            # Check file size
            file_size_mb = os.path.getsize(temp_pdf_path) / (1024 * 1024)
            if file_size_mb > self.max_file_size_mb:
                self._update_status(
                    processing_id, 
                    'failed', 
                    f'File too large: {file_size_mb:.1f}MB (max: {self.max_file_size_mb}MB)'
                )
                os.unlink(temp_pdf_path)
                return
            
            self._update_status(processing_id, 'processing', 'Extracting questions from PDF')
            
            # Process PDF
            result = self.processor.process_uploaded_pdf(
                temp_pdf_path, 
                data['filename'],
                metadata=data.get('metadata', {})
            )
            
            # Cleanup
            try:
                os.unlink(temp_pdf_path)
            except:
                pass
            
            if result.get('success'):
                self._update_status(
                    processing_id, 
                    'completed', 
                    f"Successfully processed {result.get('questions_count', 0)} questions",
                    questions_count=result.get('questions_count', 0),
                    result=result
                )
            else:
                self._update_status(
                    processing_id, 
                    'failed', 
                    result.get('message', 'Processing failed')
                )
            
        except Exception as e:
            logger.error(f"Background processing error for {processing_id}: {e}")
            self._update_status(processing_id, 'failed', f'Processing error: {str(e)}')
    
    def _download_pdf(self, file_url: str) -> Optional[str]:
        """Download PDF from URL"""
        try:
            response = requests.get(file_url, timeout=30, stream=True)
            response.raise_for_status()
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                return temp_file.name
            
        except Exception as e:
            logger.error(f"Error downloading PDF from {file_url}: {e}")
            return None
    
    def run(self, host='0.0.0.0', port=8000, debug=False):
        """Run the Flask application"""
        logger.info(f"Starting EduPapers Webhook API on {host}:{port}")
        self.app.run(host=host, port=port, debug=debug, threaded=True)


def create_app():
    """Factory function to create Flask app"""
    webhook_api = EduPapersWebhookAPI()
    return webhook_api.app


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='EduPapers Webhook API')
    parser.add_argument('--host', default='0.0.0.0', help='Host to bind to')
    parser.add_argument('--port', type=int, default=8000, help='Port to bind to')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    
    args = parser.parse_args()
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Create and run the API
    webhook_api = EduPapersWebhookAPI()
    webhook_api.run(host=args.host, port=args.port, debug=args.debug)
