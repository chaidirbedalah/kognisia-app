-- Check subtests count and data
SELECT 
  code,
  name,
  description,
  display_order,
  is_active
FROM subtests 
ORDER BY display_order;

-- Count total subtests
SELECT COUNT(*) as total_subtests FROM subtests WHERE is_active = true;

-- Check if there are any inactive subtests
SELECT COUNT(*) as inactive_subtests FROM subtests WHERE is_active = false;