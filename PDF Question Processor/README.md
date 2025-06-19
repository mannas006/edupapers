# 📚 PDF Question Processor

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Code style: black](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)

> **Automatically extract and process questions from PDF exam papers with AI-powered answer generation and database integration.**

## 🚀 Quick Start

```bash
# Clone and setup
git clone <your-repo-url>
cd "PDF Question Processor"

# Install dependencies
pip install -r config/requirements.txt

# Configure environment
cp config/.env.example config/.env
# Edit config/.env with your API keys

# Process a PDF directly
python run_processor.py samples/sample_paper.pdf

# Start webhook server for website integration
python run_webhook.py --port 8000
```

## ✨ Features

- 📄 **Smart PDF Processing**: Extracts questions from both text and scanned PDFs using OCR
- 🤖 **AI Enhancement**: Generates answers and explanations using Google Gemini AI
- 🗄️ **Database Integration**: Automatic storage in Supabase with structured schema
- 🌐 **Webhook API**: RESTful endpoints for seamless website integration
- 🔍 **Question Parsing**: Intelligently categorizes questions by type (MCQ, Short, Long Answer)
- 🔒 **Production Ready**: Security features, error handling, and scalable architecture
- 📊 **Real-time Status**: Track processing progress with status endpoints
- 🎯 **Metadata Extraction**: Automatically extracts semester, subject, and year information

## 🏗️ Architecture

```
Website Upload → Supabase Storage → Webhook Trigger → PDF Processing → AI Generation → Database Storage
```

## 📋 Prerequisites

- **Python 3.8+**
- **Google Gemini API Key** - [Get it here](https://makersuite.google.com/app/apikey)
- **Supabase Account** - [Sign up here](https://supabase.com)
- **Tesseract OCR** - For scanned PDF processing

## 📦 Installation

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable
chmod +x scripts/deploy.sh

# Run automated setup
./scripts/deploy.sh
```

### Option 2: Manual Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r config/requirements.txt

# Install Tesseract OCR
# macOS: brew install tesseract
# Ubuntu: sudo apt-get install tesseract-ocr
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki

# Configure environment
cp config/.env config/.env.local
# Edit config/.env.local with your credentials
```

## ⚙️ Configuration

Create your environment configuration in `config/.env`:

```env
# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret_here
ALLOWED_ORIGINS=https://edupapers.site,http://localhost:3000

# Processing Configuration
MAX_PDF_SIZE_MB=50
PROCESSING_TIMEOUT_SECONDS=300
BATCH_SIZE=50
```

## 🖥️ Usage

### Direct PDF Processing

Process a single PDF file directly:

```bash
# Basic usage
python run_processor.py path/to/exam_paper.pdf

# With custom output directory
python run_processor.py input.pdf --output ./results/

# Process with specific metadata
python run_processor.py paper.pdf --semester "SEM-5" --subject "CS501"
```

### Webhook Server for Website Integration

Start the webhook server to handle automated processing:

```bash
# Development server
python run_webhook.py --debug --port 8000

# Production server with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:application
```

### API Endpoints

- **POST** `/webhook/process-pdf` - Process uploaded PDF
- **GET** `/status/{processing_id}` - Check processing status
- **GET** `/health` - Health check endpoint

Example webhook request:
```bash
curl -X POST http://localhost:8000/webhook/process-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "file_url": "https://your-bucket.supabase.co/storage/v1/object/public/pdfs/exam.pdf",
    "filename": "2024_CS_SEM5_MidTerm.pdf",
    "metadata": {
      "semester": "SEM-5",
      "subject_code": "CS501",
      "subject_name": "Computer Networks",
      "year": 2024
    }
  }'
```

## 🌐 Website Integration

### Frontend Integration (JavaScript)

```javascript
// After PDF upload to Supabase storage
async function processPDF(fileUrl, filename, metadata) {
  const response = await fetch('https://your-webhook-server.com/webhook/process-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: fileUrl,
      filename: filename,
      metadata: {
        semester: metadata.semester,
        subject_code: metadata.subject_code,
        subject_name: metadata.subject_name,
        year: metadata.year,
        university: metadata.university || 'Unknown'
      }
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log('Processing started:', result.processing_id);
    // Track status using result.status_url
  }
}
```

### Database Schema

Your Supabase `questions` table should include:

```sql
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    semester TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    university TEXT,
    question_type TEXT, -- 'MCQ', 'Short Answer', 'Long Answer'
    question_text TEXT NOT NULL,
    options JSONB,      -- For MCQ options
    correct_answer TEXT,
    explanation TEXT,
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Development

```bash
python run_webhook.py --debug --port 8000
```

### Production with Gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:8000 wsgi:application
```

### System Service

```bash
# Copy and edit service file
sudo cp scripts/edupapers-webhook.service /etc/systemd/system/
sudo systemctl enable edupapers-webhook
sudo systemctl start edupapers-webhook
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY config/requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "wsgi:application"]
```

## 📁 Project Structure

```
PDF Question Processor/
├── README.md                     # This file
├── run_processor.py              # Direct processing entry point
├── run_webhook.py                # Webhook server entry point
├── wsgi.py                       # WSGI application
│
├── src/                          # Source code
│   ├── main.py                   # Core processing logic
│   ├── pdf_extractor.py          # PDF extraction and OCR
│   ├── gemini_client.py          # AI answer generation
│   ├── supabase_integration.py   # Database integration
│   └── production_webhook.py     # Webhook server
│
├── config/                       # Configuration
│   ├── .env                      # Environment variables
│   └── requirements.txt          # Dependencies
│
├── scripts/                      # Deployment scripts
│   ├── deploy.sh                 # Setup script
│   ├── nginx-config.conf         # Nginx configuration
│   └── edupapers-webhook.service # SystemD service
│
├── tests/                        # Tests
│   └── test_webhook.py           # Integration tests
│
├── docs/                         # Documentation
│   ├── INTEGRATION_GUIDE.md      # Detailed guide
│   └── DEPLOYMENT_READY.md       # Quick deployment
│
└── samples/                      # Sample files
    └── *.pdf                     # Test PDFs
```

## 🧪 Testing

```bash
# Run webhook integration tests
python tests/test_webhook.py

# Quick health check
python tests/test_webhook.py --quick --url http://localhost:8000

# Test direct processing
python run_processor.py samples/sample_paper.pdf
```

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8000/health
```

### Processing Status

```bash
curl http://localhost:8000/status/{processing_id}
```

### Logs

```bash
# Application logs
tail -f webhook.log

# System service logs
sudo journalctl -u edupapers-webhook -f
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**: Run `pip install -r config/requirements.txt`
2. **Supabase Connection**: Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
3. **OCR Not Working**: Install Tesseract (`brew install tesseract`)
4. **Processing Timeout**: Increase `PROCESSING_TIMEOUT_SECONDS`

### Debug Mode

```bash
python run_webhook.py --debug
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: See `docs/` directory
- **Issues**: Report bugs and feature requests
- **Website**: [EduPapers.site](https://edupapers.site)

## 📧 Support

For questions or support:
- Check the documentation in `docs/`
- Run the test suite: `python tests/test_webhook.py`
- Review the logs for error messages

---

**Ready to integrate with your website?** 🚀 Check out the [Integration Guide](docs/INTEGRATION_GUIDE.md) for detailed setup instructions!
