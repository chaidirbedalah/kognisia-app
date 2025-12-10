-- Check if subtests table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subtests'
) as subtests_exists;

-- If exists, show the data
SELECT * FROM subtests ORDER BY display_order;
