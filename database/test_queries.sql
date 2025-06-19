-- Test queries for the PDF processing integration
-- Run these in your Supabase SQL editor to verify the integration

-- 1. Check if the new columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'papers' 
ORDER BY ordinal_position;

-- 2. View all papers with their processing status
SELECT 
    id,
    file_name,
    university,
    course,
    semester,
    processing_status,
    questions_count,
    processed_at,
    created_at
FROM papers 
ORDER BY created_at DESC;

-- 3. Count papers by processing status
SELECT 
    processing_status,
    COUNT(*) as count
FROM papers 
GROUP BY processing_status
ORDER BY count DESC;

-- 4. View papers with extracted questions
SELECT 
    file_name,
    questions_count,
    processed_at,
    CASE 
        WHEN questions_data IS NOT NULL THEN 'Has Questions'
        ELSE 'No Questions'
    END as has_questions_data
FROM papers 
WHERE processing_status = 'completed'
ORDER BY questions_count DESC;

-- 5. Sample questions from a specific paper (replace with actual paper ID)
-- SELECT 
--     file_name,
--     questions_count,
--     jsonb_pretty(questions_data) as questions
-- FROM papers 
-- WHERE id = 'your-paper-id-here'
-- AND processing_status = 'completed';

-- 6. Count total questions across all papers
SELECT 
    COUNT(*) as total_papers,
    SUM(questions_count) as total_questions,
    AVG(questions_count) as avg_questions_per_paper
FROM papers 
WHERE processing_status = 'completed';

-- 7. Performance metrics (processing time)
SELECT 
    file_name,
    processing_status,
    questions_count,
    EXTRACT(EPOCH FROM (processed_at - created_at))/60 as processing_minutes
FROM papers 
WHERE processed_at IS NOT NULL
ORDER BY processing_minutes DESC;

-- 8. Recent processing activity (last 24 hours)
SELECT 
    file_name,
    processing_status,
    questions_count,
    processed_at,
    created_at
FROM papers 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
