-- Migration 013: Add Foreign Key Constraint for subtest_code
-- This migration adds the foreign key constraint after subtests table is created

-- ============================================================================
-- ADD FOREIGN KEY CONSTRAINT
-- ============================================================================

-- Check if subtests table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'subtests'
  ) THEN
    RAISE EXCEPTION 'Subtests table does not exist! Please run migration 001 first.';
  END IF;
END $$;

-- Add foreign key constraint
ALTER TABLE squad_battles
ADD CONSTRAINT fk_squad_battles_subtest
FOREIGN KEY (subtest_code) 
REFERENCES subtests(code)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_squad_battles_subtest_code 
ON squad_battles(subtest_code);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 013 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Added:';
  RAISE NOTICE '  - Foreign key constraint: squad_battles.subtest_code -> subtests.code';
  RAISE NOTICE '  - Index: idx_squad_battles_subtest_code';
  RAISE NOTICE '';
END $$;
