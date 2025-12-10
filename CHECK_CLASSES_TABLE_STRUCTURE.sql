-- Check Classes Table Structure
-- Run this to see actual columns in classes table

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;
