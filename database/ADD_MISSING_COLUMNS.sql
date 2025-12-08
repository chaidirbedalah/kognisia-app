-- Add Missing Columns to student_progress
-- Run this in Supabase SQL Editor

-- Step 1: Add assessment_type column
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS assessment_type TEXT;

-- Step 2: Add subtest_code column
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS subtest_code TEXT;

-- Step 3: Add daily_challenge_mode column
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS daily_challenge_mode TEXT 
  CHECK (daily_challenge_mode IN ('balanced', 'focus'));

-- Step 4: Add focus_subtest_code column
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS focus_subtest_code TEXT;

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_progress_assessment_type 
  ON student_progress(assessment_type);

CREATE INDEX IF NOT EXISTS idx_student_progress_subtest_code 
  ON student_progress(subtest_code);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_subtest 
  ON student_progress(student_id, subtest_code);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_assessment 
  ON student_progress(student_id, assessment_type);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN student_progress.assessment_type IS 
  'Type of assessment: daily_challenge, mini_tryout, tryout_utbk, try_out, pre_test, scheduled';

COMMENT ON COLUMN student_progress.subtest_code IS 
  'Subtest code: PPU, PBM, PK, LIT_INDO, LIT_ING, PM';

COMMENT ON COLUMN student_progress.daily_challenge_mode IS 
  'Daily Challenge mode: balanced (21 questions) or focus (10 questions)';

COMMENT ON COLUMN student_progress.focus_subtest_code IS 
  'Selected subtest when using Focus mode in Daily Challenge';

-- Step 7: Reload schema cache
NOTIFY pgrst, 'reload schema';

-- Step 8: Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_progress'
AND column_name IN ('assessment_type', 'subtest_code', 'daily_challenge_mode', 'focus_subtest_code')
ORDER BY column_name;

-- Expected output: 4 rows showing the new columns
