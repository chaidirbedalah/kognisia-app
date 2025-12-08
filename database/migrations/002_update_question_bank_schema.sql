-- Migration: Update question_bank schema for UTBK 2026 compliance
-- This migration adds subtest_code column and migrates old 7-subtest structure to new 6-subtest structure

-- Step 1: Add subtest_code column (nullable initially for migration)
ALTER TABLE question_bank 
  ADD COLUMN IF NOT EXISTS subtest_code TEXT;

-- Step 2: Create mapping from old subtest values to new subtest_code
-- Old structure had 7 subtests including 'PU' (Penalaran Umum)
-- New structure has 6 subtests, merging 'PU' into 'PPU'
UPDATE question_bank 
SET subtest_code = CASE 
  WHEN subtest = 'PU' THEN 'PPU'  -- Merge Penalaran Umum into Pengetahuan & Pemahaman Umum
  WHEN subtest = 'PPU' THEN 'PPU'
  WHEN subtest = 'PBM' THEN 'PBM'
  WHEN subtest = 'PK' THEN 'PK'
  WHEN subtest = 'LIT_INDO' THEN 'LIT_INDO'
  WHEN subtest = 'LIT_ING' THEN 'LIT_ING'
  WHEN subtest = 'PM' THEN 'PM'
  ELSE NULL  -- Flag any unmapped values for review
END
WHERE subtest_code IS NULL;

-- Step 3: Verify migration - check for any unmapped questions
DO $$
DECLARE
  unmapped_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unmapped_count
  FROM question_bank
  WHERE subtest_code IS NULL;
  
  IF unmapped_count > 0 THEN
    RAISE WARNING 'Found % questions with unmapped subtest values. Please review manually.', unmapped_count;
  ELSE
    RAISE NOTICE 'All questions successfully mapped to new subtest structure.';
  END IF;
END $$;

-- Step 4: Add foreign key constraint to subtests table
ALTER TABLE question_bank
  ADD CONSTRAINT fk_question_bank_subtest
  FOREIGN KEY (subtest_code) 
  REFERENCES subtests(code)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Step 5: Add NOT NULL constraint after migration
-- This will fail if there are any unmapped questions
ALTER TABLE question_bank 
  ALTER COLUMN subtest_code SET NOT NULL;

-- Step 6: Create index on subtest_code for performance
CREATE INDEX IF NOT EXISTS idx_question_bank_subtest_code 
  ON question_bank(subtest_code);

-- Step 7: Create composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_question_bank_subtest_difficulty 
  ON question_bank(subtest_code, difficulty);

-- Verification queries
-- Check distribution of questions across new subtests
SELECT 
  subtest_code,
  COUNT(*) as question_count,
  COUNT(DISTINCT topic) as topic_count
FROM question_bank
GROUP BY subtest_code
ORDER BY subtest_code;

-- Verify all subtest_codes are valid
SELECT DISTINCT subtest_code
FROM question_bank
WHERE subtest_code NOT IN (
  SELECT code FROM subtests
);
-- Expected: 0 rows (all codes should be valid)

-- Summary statistics
SELECT 
  COUNT(*) as total_questions,
  COUNT(DISTINCT subtest_code) as distinct_subtests,
  COUNT(CASE WHEN subtest_code = 'PPU' THEN 1 END) as ppu_count,
  COUNT(CASE WHEN subtest_code = 'PBM' THEN 1 END) as pbm_count,
  COUNT(CASE WHEN subtest_code = 'PK' THEN 1 END) as pk_count,
  COUNT(CASE WHEN subtest_code = 'LIT_INDO' THEN 1 END) as lit_indo_count,
  COUNT(CASE WHEN subtest_code = 'LIT_ING' THEN 1 END) as lit_ing_count,
  COUNT(CASE WHEN subtest_code = 'PM' THEN 1 END) as pm_count
FROM question_bank;
