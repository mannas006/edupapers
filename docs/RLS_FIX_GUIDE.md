# 🔒 RLS Policy Error Fix Guide

## Error: "new row violates row-level security policy for table 'papers'"

This error occurs when Supabase's Row Level Security (RLS) is enabled but no policies exist to allow the operation.

## 🚨 Immediate Fix Required

### Step 1: Run the RLS Policy SQL
Copy and paste this SQL into your **Supabase SQL Editor**:

```sql
-- Fix Row Level Security (RLS) policies for papers table
-- Run this in your Supabase SQL editor

-- Check current RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'papers';

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can insert their own papers" ON papers;
DROP POLICY IF EXISTS "Users can view their own papers" ON papers;
DROP POLICY IF EXISTS "Users can update their own papers" ON papers;
DROP POLICY IF EXISTS "Users can delete their own papers" ON papers;

-- Create comprehensive RLS policies for the papers table

-- 1. Allow authenticated users to insert their own papers
CREATE POLICY "Users can insert their own papers" ON papers
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 2. Allow authenticated users to select their own papers
CREATE POLICY "Users can view their own papers" ON papers
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own papers
CREATE POLICY "Users can update their own papers" ON papers
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own papers
CREATE POLICY "Users can delete their own papers" ON papers
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable RLS if it's not already enabled
ALTER TABLE papers ENABLE ROW LEVEL SECURITY;
```

### Step 2: Verify the Fix
After running the SQL, verify it worked:

```sql
-- Check that RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'papers';

-- Check that policies exist
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'papers';

-- Test current user authentication
SELECT auth.uid() as current_user_id;
```

## 🔍 Debugging Authentication Issues

I've added debug logging to help identify authentication problems. Check your browser console for:

```javascript
// Look for these debug messages:
User authentication check: {
  user: {...},
  userId: "uuid-here",
  userEmail: "user@example.com",
  isAuthenticated: true
}

Supabase session check: {
  session: {...},
  sessionUserId: "uuid-here",
  localUserId: "uuid-here"
}
```

### Common Issues:

1. **User not logged in**: The `user` object is null
2. **Session mismatch**: `sessionUserId` doesn't match `localUserId`
3. **No RLS policies**: Policies don't exist (fixed by Step 1)

## 🛠️ Alternative Solutions

### Option A: Temporary Fix (For Testing Only)
If you need to test immediately, you can temporarily disable RLS:

```sql
-- ⚠️ WARNING: This makes your table publicly accessible
-- Only use for testing, never in production
ALTER TABLE papers DISABLE ROW LEVEL SECURITY;
```

### Option B: Allow All Authenticated Users
If you want any authenticated user to access all papers:

```sql
-- Allow any authenticated user to insert papers
CREATE POLICY "Allow authenticated users to insert papers" ON papers
  FOR INSERT TO authenticated WITH CHECK (true);

-- Allow any authenticated user to view all papers  
CREATE POLICY "Allow authenticated users to view papers" ON papers
  FOR SELECT TO authenticated USING (true);
```

## 🧪 Test the Fix

1. **Run the RLS SQL** in Supabase SQL Editor
2. **Refresh your browser** to clear any cached auth state
3. **Try uploading a PDF** again
4. **Check browser console** for debug messages
5. **Verify in Supabase** that the record was created

## 📊 Expected Results

After fixing RLS policies:
- ✅ No more "violates row-level security policy" errors
- ✅ Papers are inserted successfully
- ✅ Users can only see their own papers
- ✅ Processing continues to PDF extraction

## 🔐 Security Notes

The RLS policies ensure:
- Users can only insert papers with their own `user_id`
- Users can only view/edit/delete their own papers
- Authenticated users are required for all operations
- Database-level security enforcement

## 📞 Still Having Issues?

If the error persists:
1. Check that you're logged in properly
2. Verify the debug console messages
3. Ensure the SQL ran without errors
4. Check that `auth.uid()` returns a valid UUID in Supabase

The RLS policies should resolve the "violates row-level security policy" error! 🎉
