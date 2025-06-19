# 📊 PDF Processing with Supabase Papers Table Integration

## Overview
The PDF processing system is now fully integrated with your existing Supabase `papers` table. When users upload PDF files, the system automatically extracts questions and stores them directly in the database.

## 🗄️ Database Schema
Your existing `papers` table has been enhanced to store extracted questions:

```sql
-- Existing columns
id uuid PRIMARY KEY DEFAULT uuid_generate_v4()
user_id uuid REFERENCES auth.users ON DELETE SET NULL
university text
course text  
semester text
file_url text
file_name text
uploader_name text
created_at timestamptz DEFAULT now()

-- New columns for PDF processing
questions_data JSONB              -- Stores extracted questions and answers
questions_count INTEGER DEFAULT 0  -- Number of questions extracted
processing_status TEXT DEFAULT 'pending'  -- Status: pending, processing, completed, failed
processed_at TIMESTAMP WITH TIME ZONE     -- When processing completed
```

## 🔄 Processing Workflow

### 1. File Upload
```javascript
// User uploads PDF → Store in Supabase Storage → Insert record in papers table
const { data: paperData } = await supabase.from('papers').insert({
  user_id: user.id,
  university,
  course, 
  semester,
  file_url: fileData.publicUrl,
  file_name: file.name,
  uploader_name: uploaderName,
  processing_status: 'pending'  // Initial status
}).select('id').single();
```

### 2. Trigger Processing
```javascript
// Pass paper_id to processing endpoint
await triggerPDFProcessing(fileUrl, filename, paperData.id);
```

### 3. Processing States
The `processing_status` column tracks the current state:
- **`pending`**: Just uploaded, not processed yet
- **`processing`**: Currently being processed by AI
- **`completed`**: Successfully extracted questions
- **`failed`**: Processing encountered an error

### 4. Store Results
When processing completes successfully:
```javascript
// Update papers table with extracted questions
await supabase.from('papers').update({
  questions_data: results,           // Array of question objects
  questions_count: questionsCount,   // Number of questions found
  processing_status: 'completed',    // Mark as completed
  processed_at: new Date().toISOString()  // Timestamp
}).eq('id', paperId);
```

## 📋 Questions Data Structure
The `questions_data` JSONB column stores an array of question objects:

```json
[
  {
    "id": 1,
    "question": "What is the capital of France?",
    "answer": "Paris",
    "type": "short-answer",
    "marks": 2,
    "difficulty": "easy"
  },
  {
    "id": 2, 
    "question": "Explain the process of photosynthesis.",
    "answer": "Photosynthesis is the process by which...",
    "type": "descriptive",
    "marks": 10,
    "difficulty": "medium"
  }
]
```

## 🔍 Querying Processed Papers

### Get all papers with extracted questions:
```sql
SELECT id, file_name, questions_count, processing_status, processed_at
FROM papers 
WHERE processing_status = 'completed' AND questions_count > 0;
```

### Get questions from a specific paper:
```sql
SELECT file_name, questions_data
FROM papers 
WHERE id = 'paper-uuid-here' AND processing_status = 'completed';
```

### Count total questions across all papers:
```sql
SELECT SUM(questions_count) as total_questions
FROM papers 
WHERE processing_status = 'completed';
```

### Get papers by university with questions:
```sql
SELECT university, COUNT(*) as papers_count, SUM(questions_count) as total_questions
FROM papers 
WHERE processing_status = 'completed'
GROUP BY university;
```

## 🚀 Real-time Processing Status

The frontend polls the processing status and updates the UI:

```javascript
// Processing status is tracked both in-memory and in database
const checkStatus = async (processingId) => {
  const response = await fetch(`/status/${processingId}`);
  const statusData = await response.json();
  
  // Update UI based on status
  if (statusData.status === 'completed') {
    toast.success(`${statusData.questions_count} questions extracted!`);
  }
};
```

## 📊 Admin Queries

### Monitor processing performance:
```sql
SELECT 
  processing_status,
  COUNT(*) as count,
  AVG(questions_count) as avg_questions,
  AVG(EXTRACT(EPOCH FROM (processed_at - created_at))/60) as avg_processing_minutes
FROM papers 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY processing_status;
```

### Find papers that failed processing:
```sql
SELECT id, file_name, created_at, processing_status
FROM papers 
WHERE processing_status = 'failed'
ORDER BY created_at DESC;
```

## 🔧 Environment Variables Required

Make sure these are set in your `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# For server-side operations (PDF processor)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PDF Processing
VITE_WEBHOOK_URL=http://localhost:8000/webhook/process-pdf

# AI Processing
GEMINI_API_KEY=your-gemini-api-key
```

## 🎯 Benefits of This Integration

1. **Centralized Data**: All paper metadata and questions in one table
2. **Real-time Status**: Users see processing progress
3. **Searchable Questions**: JSONB allows complex question queries
4. **Audit Trail**: Complete processing history
5. **Scalable**: Can handle thousands of papers
6. **Efficient**: Direct database storage, no file management

## 🛠️ Maintenance

### Clean up old processing status (optional):
```javascript
// In production, you might want to clean up old in-memory status
setInterval(() => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  for (let [key, value] of processingStatus.entries()) {
    if (value.timestamp < oneHourAgo) {
      processingStatus.delete(key);
    }
  }
}, 60 * 60 * 1000); // Run every hour
```

## ✅ Current Status
- ✅ Papers table schema updated
- ✅ PDF processor integrated with Supabase
- ✅ Upload component passes paper_id
- ✅ Questions stored in database
- ✅ Processing status tracked
- ✅ Real-time UI updates

Your PDF processing system is now fully integrated with the Supabase papers table! 🎉
