-- Supabase Storage Setup for EduPapers
-- Run this in your Supabase SQL editor to create the storage bucket

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-papers',
  'question-papers', 
  true,
  2097152, -- 2MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
);

-- 2. Create storage policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'question-papers');

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated reads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'question-papers');

-- Allow public access to files (for sharing)
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'question-papers');

-- 3. Alternative: If you prefer a private bucket, use this instead:
/*
-- For private bucket (users can only access their own files)
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'question-papers' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'question-papers' AND auth.uid()::text = (storage.foldername(name))[1]);
*/

-- 4. Verify the bucket was created
SELECT * FROM storage.buckets WHERE id = 'question-papers';
