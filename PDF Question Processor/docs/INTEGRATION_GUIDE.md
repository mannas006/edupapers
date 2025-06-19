# EduPapers.site Integration Guide

This guide shows how to integrate the PDF Question Processor with your EduPapers.site website.

## 🎯 Overview

The integration allows your website to automatically process PDF question papers when they're uploaded to Supabase storage. Here's how it works:

1. **User uploads PDF** → Website stores in Supabase bucket
2. **Website triggers webhook** → Sends notification to our processor
3. **Processor downloads PDF** → Extracts questions using OCR
4. **AI generates answers** → Uses Gemini AI for explanations
5. **Data stored in database** → Questions saved to Supabase table

## 🔧 Setup

### 1. Environment Configuration

Create a `.env` file with your credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here
SUPABASE_ANON_KEY=your-anon-key-here

# AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Webhook Security
WEBHOOK_SECRET=your-webhook-secret-here
ALLOWED_ORIGINS=https://edupapers.site,http://localhost:3000

# Processing Configuration
MAX_PDF_SIZE_MB=50
PROCESSING_TIMEOUT_SECONDS=300
```

### 2. Database Schema

Your Supabase `questions` table should have these columns:

```sql
CREATE TABLE questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    semester TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    subject_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    university TEXT,
    paper_type TEXT DEFAULT 'Regular',
    group_name TEXT,
    question_number INTEGER,
    question_type TEXT, -- 'MCQ', 'Short Answer', 'Long Answer'
    question_text TEXT NOT NULL,
    options JSONB, -- For MCQ options
    correct_answer TEXT,
    explanation TEXT,
    difficulty_level TEXT DEFAULT 'Medium',
    marks INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_questions_semester ON questions(semester);
CREATE INDEX idx_questions_subject ON questions(subject_code);
CREATE INDEX idx_questions_year ON questions(year);
```

### 3. Installation

```bash
# Clone and setup
git clone <your-repo>
cd "PDF Question Processor"

# Run setup script
chmod +x deploy.sh
./deploy.sh
```

## 🚀 Deployment Options

### Option 1: Development Server

```bash
# For testing
python3 production_webhook.py --debug --port 8000
```

### Option 2: Production with Gunicorn

```bash
# Start production server
gunicorn -w 4 -b 0.0.0.0:8000 production_webhook:create_app

# Or with better configuration
gunicorn -w 4 -b 0.0.0.0:8000 \
  --timeout 300 \
  --keep-alive 2 \
  --max-requests 1000 \
  --max-requests-jitter 50 \
  production_webhook:create_app
```

### Option 3: System Service

```bash
# Copy service file
sudo cp edupapers-webhook.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable edupapers-webhook
sudo systemctl start edupapers-webhook
```

### Option 4: Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "production_webhook:create_app"]
```

## 🌐 Website Integration

### Frontend: Triggering the Webhook

When a PDF is uploaded to your Supabase bucket, trigger the webhook:

```javascript
// After successful PDF upload to Supabase
async function triggerPDFProcessing(fileUrl, filename, metadata = {}) {
  const webhookUrl = 'https://your-webhook-server.com/webhook/process-pdf';
  
  const payload = {
    file_url: fileUrl,        // Full URL to PDF in Supabase bucket
    filename: filename,       // Original filename
    metadata: {
      semester: metadata.semester,
      subject_code: metadata.subject_code,
      subject_name: metadata.subject_name,
      year: metadata.year,
      university: metadata.university || 'Unknown',
      paper_type: metadata.paper_type || 'Regular'
    }
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature-256': generateSignature(payload), // Optional security
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Processing started:', result.processing_id);
      // Optionally track processing status
      trackProcessingStatus(result.processing_id);
    } else {
      console.error('Processing failed:', result.message);
    }
  } catch (error) {
    console.error('Webhook error:', error);
  }
}

// Optional: Track processing status
async function trackProcessingStatus(processingId) {
  const statusUrl = `https://your-webhook-server.com/status/${processingId}`;
  
  const checkStatus = async () => {
    try {
      const response = await fetch(statusUrl);
      const status = await response.json();
      
      console.log('Processing status:', status.status);
      
      if (status.status === 'completed') {
        console.log('Processing completed!', status.questions_count, 'questions extracted');
        // Update UI or notify user
      } else if (status.status === 'failed') {
        console.error('Processing failed:', status.message);
      } else if (status.status === 'processing' || status.status === 'queued') {
        // Check again in 5 seconds
        setTimeout(checkStatus, 5000);
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  checkStatus();
}
```

### Backend: Supabase Integration

```javascript
// In your Supabase edge function or backend
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// After PDF upload
async function onPDFUpload(file, metadata) {
  try {
    // Upload to storage
    const { data, error } = await supabase.storage
      .from('question-papers')
      .upload(file.name, file)
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('question-papers')
      .getPublicUrl(file.name)
    
    // Trigger processing
    await triggerPDFProcessing(publicUrl, file.name, metadata)
    
  } catch (error) {
    console.error('Upload error:', error)
  }
}
```

## 📊 API Endpoints

### POST /webhook/process-pdf

Process a PDF from Supabase storage.

**Request:**
```json
{
  "file_url": "https://your-bucket.supabase.co/storage/v1/object/public/pdfs/exam.pdf",
  "filename": "2024_CS_SEM5_MidTerm.pdf",
  "metadata": {
    "semester": "SEM-5",
    "subject_code": "CS501",
    "subject_name": "Computer Networks",
    "year": 2024,
    "university": "Your University",
    "paper_type": "Mid Term"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "PDF processing started",
  "processing_id": "abc123def456",
  "status": "queued",
  "status_url": "/status/abc123def456"
}
```

### GET /status/{processing_id}

Check processing status.

**Response:**
```json
{
  "success": true,
  "processing_id": "abc123def456",
  "status": "completed",
  "message": "Successfully processed 15 questions",
  "questions_count": 15,
  "started_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:00Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "EduPapers PDF Processor",
  "timestamp": "2024-01-15T10:30:00Z",
  "processor_ready": true
}
```

## 🔐 Security

### Webhook Signature Verification

```javascript
// Generate signature on frontend
function generateSignature(payload) {
  const crypto = require('crypto');
  const secret = 'your-webhook-secret';
  const body = JSON.stringify(payload);
  
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}
```

### CORS Configuration

The webhook server accepts requests from:
- `https://edupapers.site`
- `http://localhost:3000` (for development)

Add more origins in the `ALLOWED_ORIGINS` environment variable:
```
ALLOWED_ORIGINS=https://edupapers.site,https://admin.edupapers.site,http://localhost:3000
```

## 🐛 Troubleshooting

### Common Issues

1. **Import Errors**
   ```bash
   pip install -r requirements.txt
   ```

2. **Supabase Connection Failed**
   - Check `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
   - Verify service key has proper permissions

3. **PDF Processing Timeout**
   - Increase `PROCESSING_TIMEOUT_SECONDS`
   - Check PDF file size (max 50MB by default)

4. **OCR Not Working**
   ```bash
   # Install Tesseract
   sudo apt-get install tesseract-ocr  # Ubuntu/Debian
   brew install tesseract              # macOS
   ```

### Logs

Check logs for debugging:
```bash
# Application logs
tail -f webhook.log

# System service logs
sudo journalctl -u edupapers-webhook -f

# Nginx logs
sudo tail -f /var/log/nginx/edupapers-webhook.error.log
```

## 📈 Monitoring

### Basic Monitoring

```bash
# Check service status
systemctl status edupapers-webhook

# Monitor resource usage
htop

# Check webhook responses
curl http://localhost:8000/health
```

### Production Monitoring

Consider adding:
- **Prometheus metrics** for detailed monitoring
- **Grafana dashboards** for visualization
- **Sentry** for error tracking
- **Uptime monitoring** for webhook availability

## 🔄 Updates and Maintenance

### Updating the Service

```bash
# Pull latest changes
git pull origin main

# Update dependencies
pip install -r requirements.txt

# Restart service
sudo systemctl restart edupapers-webhook
```

### Database Maintenance

```sql
-- Clean up old processing records
DELETE FROM processing_status WHERE created_at < NOW() - INTERVAL '30 days';

-- Monitor question counts
SELECT semester, subject_code, COUNT(*) as question_count
FROM questions
GROUP BY semester, subject_code
ORDER BY semester, subject_code;
```

## 🤝 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs for error messages
3. Verify your environment configuration
4. Test with the `/health` endpoint

For custom modifications or additional features, refer to the source code in:
- `production_webhook.py` - Main webhook server
- `supabase_integration.py` - Database operations
- `pdf_extractor.py` - PDF processing logic
- `gemini_client.py` - AI answer generation
