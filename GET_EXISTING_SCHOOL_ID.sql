-- Get Existing School ID
-- Run this first to get the actual school ID

SELECT 
  id,
  name,
  address,
  created_at
FROM schools
WHERE name LIKE '%Kognisia%'
ORDER BY created_at
LIMIT 1;

-- Copy the 'id' value and use it in the migration
