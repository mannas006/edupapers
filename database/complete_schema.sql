-- Complete database schema for EduPapers
-- This creates the papers table with all required columns

-- Create papers table with all required columns
CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users ON DELETE SET NULL,
  university text NOT NULL,
  course text NOT NULL,
  semester text NOT NULL,
  year integer NOT NULL,
  subject text,
  uploader_name text NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL,
  questions_data JSONB,
  questions_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on papers table
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

-- Create policies for papers table
CREATE POLICY "Users can insert their own papers"
  ON papers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own papers"
  ON papers FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to view all papers (for browsing)
CREATE POLICY "Authenticated users can view all papers"
  ON papers FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_papers_user_id ON papers(user_id);
CREATE INDEX IF NOT EXISTS idx_papers_university ON papers(university);
CREATE INDEX IF NOT EXISTS idx_papers_course ON papers(course);
CREATE INDEX IF NOT EXISTS idx_papers_semester ON papers(semester);
CREATE INDEX IF NOT EXISTS idx_papers_year ON papers(year);
CREATE INDEX IF NOT EXISTS idx_papers_subject ON papers(subject);
CREATE INDEX IF NOT EXISTS idx_papers_processing_status ON papers(processing_status);
CREATE INDEX IF NOT EXISTS idx_papers_processed_at ON papers(processed_at);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at);

-- Add constraints for data validation
ALTER TABLE papers 
ADD CONSTRAINT check_year_range CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM CURRENT_DATE) + 10);

ALTER TABLE papers 
ADD CONSTRAINT check_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));

-- Add comments for documentation
COMMENT ON TABLE papers IS 'Stores uploaded question papers with metadata and processing status';
COMMENT ON COLUMN papers.id IS 'Unique identifier for each paper';
COMMENT ON COLUMN papers.user_id IS 'Reference to the user who uploaded the paper';
COMMENT ON COLUMN papers.university IS 'University name';
COMMENT ON COLUMN papers.course IS 'Course name (e.g., MCA, BCA, BTech)';
COMMENT ON COLUMN papers.semester IS 'Semester (e.g., Semester 1, Semester 2)';
COMMENT ON COLUMN papers.year IS 'Year of the question paper';
COMMENT ON COLUMN papers.subject IS 'Subject name';
COMMENT ON COLUMN papers.uploader_name IS 'Name of the person who uploaded the paper';
COMMENT ON COLUMN papers.file_url IS 'Public URL of the uploaded file';
COMMENT ON COLUMN papers.file_name IS 'Original filename of the uploaded file';
COMMENT ON COLUMN papers.questions_data IS 'JSON data containing extracted questions from AI processing';
COMMENT ON COLUMN papers.questions_count IS 'Number of questions extracted from the paper';
COMMENT ON COLUMN papers.processing_status IS 'AI processing status: pending, processing, completed, failed';
COMMENT ON COLUMN papers.processed_at IS 'Timestamp when AI processing was completed';
COMMENT ON COLUMN papers.created_at IS 'Timestamp when the record was created';
