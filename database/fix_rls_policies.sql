-- Disable Row Level Security for testing PDF processing
-- WARNING: This makes the papers table publicly accessible
-- Only use this for testing, enable RLS again for production

-- Turn off RLS for papers table
ALTER TABLE papers DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'papers';

-- The result should show: papers | f (false = RLS disabled)

-- Optional: Drop the existing policies since we're not using RLS
DROP POLICY IF EXISTS "Allow authenticated users to insert their own papers" ON papers;
DROP POLICY IF EXISTS "Users can insert their own papers" ON papers;
DROP POLICY IF EXISTS "Users can view their own papers" ON papers;
DROP POLICY IF EXISTS "Users can update their own papers" ON papers;
DROP POLICY IF EXISTS "Users can delete their own papers" ON papers;

-- TO RE-ENABLE RLS LATER (for production):
-- ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
-- Then recreate the policies as needed
