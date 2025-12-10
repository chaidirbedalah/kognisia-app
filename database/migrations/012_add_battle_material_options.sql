-- Migration 012: Add Battle Material Options
-- Adds columns for battle material selection (subtest or mini tryout)

-- ============================================================================
-- UPDATE SQUAD_BATTLES TABLE
-- ============================================================================

-- Add battle_type column (subtest or mini_tryout)
ALTER TABLE squad_battles
ADD COLUMN IF NOT EXISTS battle_type TEXT DEFAULT 'subtest' CHECK (battle_type IN ('subtest', 'mini_tryout'));

-- Add subtest_code column (for subtest battles)
-- Note: Foreign key constraint will be added after subtests table is created
ALTER TABLE squad_battles
ADD COLUMN IF NOT EXISTS subtest_code TEXT;

-- Add question_count column (number of questions for subtest battles)
ALTER TABLE squad_battles
ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 10 CHECK (question_count > 0 AND question_count <= 50);

-- Add comment for clarity
COMMENT ON COLUMN squad_battles.battle_type IS 'Type of battle: subtest (specific subtest) or mini_tryout (all subtests)';
COMMENT ON COLUMN squad_battles.subtest_code IS 'Subtest code if battle_type is subtest';
COMMENT ON COLUMN squad_battles.question_count IS 'Number of questions for subtest battles';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 012 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Added columns to squad_battles:';
  RAISE NOTICE '  - battle_type (subtest or mini_tryout)';
  RAISE NOTICE '  - subtest_code (for subtest battles)';
  RAISE NOTICE '  - question_count (number of questions)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Battle Options:';
  RAISE NOTICE '  1. Subtest Battle: Choose 1 of 7 subtests + question count';
  RAISE NOTICE '  2. Mini Try Out: All subtests combined';
  RAISE NOTICE '';
END $$;
