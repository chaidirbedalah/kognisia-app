-- Migration 004: Update Assessment Types for UTBK 2026 Compliance
-- 
-- This migration:
-- 1. Adds 'mini_tryout' and 'tryout_utbk' to valid assessment types
-- 2. Updates existing 'marathon' records to 'tryout_utbk' for clarity
-- 
-- Requirements: 7.8
-- Dependencies: Must run after 003_update_student_progress_schema.sql

DO $$ 
BEGIN
  RAISE NOTICE 'Starting Migration 004: Update Assessment Types';
  RAISE NOTICE '================================================';
  
  -- Step 1: Check current assessment type distribution
  RAISE NOTICE 'Step 1: Checking current assessment type distribution...';
  
  -- Display current counts (for logging purposes)
  PERFORM assessment_type, COUNT(*) 
  FROM student_progress 
  GROUP BY assessment_type;
  
  -- Step 2: Update 'marathon' records to 'tryout_utbk'
  RAISE NOTICE 'Step 2: Updating marathon records to tryout_utbk...';
  
  UPDATE student_progress 
  SET assessment_type = 'tryout_utbk',
      updated_at = NOW()
  WHERE assessment_type = 'marathon';
  
  RAISE NOTICE 'Updated % marathon records to tryout_utbk', 
    (SELECT COUNT(*) FROM student_progress WHERE assessment_type = 'tryout_utbk');
  
  -- Step 3: Verify no 'marathon' records remain
  RAISE NOTICE 'Step 3: Verifying marathon migration...';
  
  IF EXISTS (SELECT 1 FROM student_progress WHERE assessment_type = 'marathon') THEN
    RAISE EXCEPTION 'Migration failed: marathon records still exist';
  END IF;
  
  RAISE NOTICE 'Verification passed: No marathon records remain';
  
  -- Step 4: Add comment to document valid assessment types
  RAISE NOTICE 'Step 4: Documenting valid assessment types...';
  
  COMMENT ON COLUMN student_progress.assessment_type IS 
    'Type of assessment: pre_test, daily_challenge, tryout, tryout_utbk, mini_tryout, scheduled. Note: marathon has been deprecated in favor of tryout_utbk.';
  
  -- Step 5: Display final assessment type distribution
  RAISE NOTICE 'Step 5: Final assessment type distribution:';
  
  PERFORM assessment_type, COUNT(*) 
  FROM student_progress 
  GROUP BY assessment_type
  ORDER BY assessment_type;
  
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration 004 completed successfully!';
  RAISE NOTICE 'Updated marathon -> tryout_utbk';
  RAISE NOTICE 'System now supports: pre_test, daily_challenge, tryout, tryout_utbk, mini_tryout, scheduled';
  
END $$;

-- Verification Queries
-- Run these after migration to verify success

-- 1. Check that no 'marathon' records exist
SELECT COUNT(*) as marathon_count 
FROM student_progress 
WHERE assessment_type = 'marathon';
-- Expected: 0

-- 2. View all assessment types in use
SELECT 
  assessment_type,
  COUNT(*) as count,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM student_progress
GROUP BY assessment_type
ORDER BY assessment_type;

-- 3. Check for any invalid assessment types
SELECT DISTINCT assessment_type
FROM student_progress
WHERE assessment_type NOT IN (
  'pre_test', 
  'daily_challenge', 
  'tryout', 
  'tryout_utbk',
  'mini_tryout', 
  'scheduled'
);
-- Expected: No rows (empty result)
