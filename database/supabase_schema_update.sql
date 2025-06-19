-- SQL script to add question processing columns to papers table
-- Run this in your Supabase SQL editor

-- Add columns for storing extracted questions and processing status
ALTER TABLE papers 
ADD COLUMN IF NOT EXISTS questions_data JSONB,
ADD COLUMN IF NOT EXISTS questions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Create index on processing_status for better query performance
CREATE INDEX IF NOT EXISTS idx_papers_processing_status ON papers(processing_status);

-- Create index on processed_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_papers_processed_at ON papers(processed_at);

-- Add comments to document the new columns
COMMENT ON COLUMN papers.questions_data IS 'JSON array containing extracted questions and answers from PDF processing';
COMMENT ON COLUMN papers.questions_count IS 'Number of questions extracted from the PDF';
COMMENT ON COLUMN papers.processing_status IS 'Status of PDF processing: pending, processing, completed, failed';
COMMENT ON COLUMN papers.processed_at IS 'Timestamp when PDF processing was completed';

-- Sample query to check papers with extracted questions
-- SELECT id, file_name, questions_count, processing_status, processed_at 
-- FROM papers 
-- WHERE processing_status = 'completed' AND questions_count > 0;
