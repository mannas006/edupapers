# 🔧 Supabase Storage Setup Guide

## The Problem
You're getting "Failed to load resource: the server responded with a status of 400" because the storage buckets don't exist in your Supabase project.

## 🚀 Quick Fix (Recommended)

### Option 1: Using Supabase Dashboard (Easiest)
1. **Go to your Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Open your project

2. **Create Storage Bucket**
   - Click on "Storage" in the left sidebar
   - Click "Create bucket"
   - Bucket name: `question-papers`
   - Make it **Public** (so files can be accessed)
   - Set file size limit: `2 MB`
   - Click "Create bucket"

3. **Set Upload Permissions**
   - Go to "Storage" → "Policies"
   - Create policies for the `question-papers` bucket:
     - **Upload policy**: Allow authenticated users to INSERT
     - **Download policy**: Allow public SELECT (for file sharing)

### Option 2: Using SQL (Advanced)
Run this SQL in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'question-papers',
  'question-papers', 
  true,
  2097152, -- 2MB
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png']
);

-- Create upload policy
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'question-papers');

-- Create read policy
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'question-papers');
```

## 🔍 Verification
After creating the bucket, you should see:
- Bucket `question-papers` listed in Storage
- Upload should work without errors
- Files should be accessible via public URLs

## ⚠️ If You Still Get Errors
1. Check your `.env` file has correct Supabase credentials
2. Make sure your Supabase project is active
3. Verify the bucket name matches exactly: `question-papers`
4. Check that RLS policies allow your user to upload

## 🆘 Alternative Solution
If you can't set up storage right now, you can temporarily disable file uploads and focus on other features by commenting out the storage upload code in `UploadMUI.tsx`.

---

**Need help?** The error messages will now show more detailed instructions when storage issues occur.
