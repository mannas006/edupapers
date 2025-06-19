# Project Structure

```
PDF Question Processor/
├── README.md                           # Main project documentation
├── run_processor.py                    # Entry point for direct PDF processing
├── run_webhook.py                      # Entry point for webhook server
├── wsgi.py                            # WSGI entry point for production
├── .gitignore                         # Git ignore file
├── LICENSE                            # Project license
│
├── src/                               # Main source code
│   ├── __init__.py                    # Package initialization
│   ├── main.py                        # Core PDF processing logic
│   ├── pdf_extractor.py               # PDF extraction and OCR
│   ├── gemini_client.py               # AI answer generation
│   ├── supabase_integration.py        # Database integration
│   └── production_webhook.py          # Webhook server implementation
│
├── config/                            # Configuration files
│   ├── .env                          # Environment variables
│   └── requirements.txt              # Python dependencies
│
├── scripts/                          # Deployment and utility scripts
│   ├── deploy.sh                     # Setup and deployment script
│   ├── nginx-config.conf             # Nginx configuration
│   └── edupapers-webhook.service     # SystemD service file
│
├── tests/                            # Test files
│   └── test_webhook.py               # Webhook integration tests
│
├── docs/                             # Documentation
│   ├── INTEGRATION_GUIDE.md          # Detailed integration guide
│   └── DEPLOYMENT_READY.md           # Quick deployment guide
│
└── samples/                          # Sample files for testing
    ├── 1750076423461_ESC501_SoftwareEngineering_2024.pdf
    └── output/
        └── 1750076423461_ESC501_SoftwareEngineering_2024_answers.json
```

## File Descriptions

### Root Level
- **run_processor.py**: Command-line entry point for processing PDFs directly
- **run_webhook.py**: Entry point for starting the webhook server
- **wsgi.py**: WSGI application for production deployment with Gunicorn

### Source Code (`src/`)
- **main.py**: Core PDF processing pipeline
- **pdf_extractor.py**: PDF text extraction and question parsing using OCR
- **gemini_client.py**: Google Gemini AI integration for answer generation
- **supabase_integration.py**: Database operations and metadata handling
- **production_webhook.py**: Flask-based webhook server with authentication

### Configuration (`config/`)
- **.env**: Environment variables (API keys, database credentials)
- **requirements.txt**: Python package dependencies

### Scripts (`scripts/`)
- **deploy.sh**: Automated setup and deployment script
- **nginx-config.conf**: Nginx reverse proxy configuration
- **edupapers-webhook.service**: SystemD service configuration

### Tests (`tests/`)
- **test_webhook.py**: Integration tests for webhook functionality

### Documentation (`docs/`)
- **INTEGRATION_GUIDE.md**: Complete integration guide with code examples
- **DEPLOYMENT_READY.md**: Quick start guide for deployment

### Samples (`samples/`)
- Sample PDF files and output for testing and demonstration

## Usage Examples

### Direct Processing
```bash
python run_processor.py samples/sample_paper.pdf
```

### Webhook Server
```bash
python run_webhook.py --port 8000
```

### Production Deployment
```bash
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:application
```
