-- Check Enrollments Table Structure
-- Run this to see actual columns in enrollments table

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'enrollments'
ORDER BY ordinal_position;
