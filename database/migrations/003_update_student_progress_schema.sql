-- Migration: Update student_progress schema for Daily Challenge mode tracking
-- This migration adds columns to track Daily Challenge mode selection (Balanced vs Focus)
-- and creates performance indexes for common query patterns

-- Step 1: Add daily_challenge_mode column
-- Tracks whether the student chose 'balanced' (18 questions) or 'focus' (10 questions) mode
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS daily_challenge_mode TEXT 
  CHECK (daily_challenge_mode IN ('balanced', 'focus'));

-- Step 2: Add focus_subtest_code column
-- Stores which subtest was selected when using Focus mode
-- NULL for Balanced mode or non-Daily Challenge assessments
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS focus_subtest_code TEXT 
  REFERENCES subtests(code)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Step 3: Add check constraint to ensure focus_subtest_code is only set for focus mode
-- This ensures data integrity: focus_subtest_code should only exist when mode is 'focus'
ALTER TABLE student_progress
  ADD CONSTRAINT check_focus_mode_consistency
  CHECK (
    (daily_challenge_mode = 'focus' AND focus_subtest_code IS NOT NULL) OR
    (daily_challenge_mode = 'balanced' AND focus_subtest_code IS NULL) OR
    (daily_challenge_mode IS NULL AND focus_subtest_code IS NULL)
  );

-- Step 4: Create index on subtest_code for performance
-- Optimizes queries filtering by subtest (e.g., "show me all PPU progress")
CREATE INDEX IF NOT EXISTS idx_student_progress_subtest_code 
  ON student_progress(subtest_code);

-- Step 5: Create index on assessment_type for performance
-- Optimizes queries filtering by assessment type (e.g., "show me all daily challenges")
CREATE INDEX IF NOT EXISTS idx_student_progress_assessment_type 
  ON student_progress(assessment_type);

-- Step 6: Create composite index for common query patterns
-- Optimizes queries like "show me user X's progress for subtest Y"
CREATE INDEX IF NOT EXISTS idx_student_progress_user_subtest 
  ON student_progress(user_id, subtest_code);

-- Step 7: Create composite index for mode-based queries
-- Optimizes queries like "show me all focus mode sessions for user X"
CREATE INDEX IF NOT EXISTS idx_student_progress_user_mode 
  ON student_progress(user_id, daily_challenge_mode) 
  WHERE daily_challenge_mode IS NOT NULL;

-- Verification queries
-- Check that columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'student_progress' 
  AND column_name IN ('daily_challenge_mode', 'focus_subtest_code')
ORDER BY column_name;

-- Check that indexes were created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'student_progress'
  AND indexname LIKE 'idx_student_progress_%'
ORDER BY indexname;

-- Check constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'student_progress'::regclass
  AND conname IN ('check_focus_mode_consistency', 'student_progress_daily_challenge_mode_check')
ORDER BY conname;

-- Summary
DO $$
BEGIN
  RAISE NOTICE 'Migration 003 completed successfully!';
  RAISE NOTICE 'Added columns: daily_challenge_mode, focus_subtest_code';
  RAISE NOTICE 'Created indexes: subtest_code, assessment_type, user_subtest, user_mode';
  RAISE NOTICE 'Added constraint: check_focus_mode_consistency';
END $$;
