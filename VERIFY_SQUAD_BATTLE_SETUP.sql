-- Verification Query: Check Squad Battle Setup
-- Run this to verify all migrations completed successfully

-- ============================================================================
-- 1. CHECK SUBTESTS TABLE
-- ============================================================================

SELECT 
  '1. Subtests Table' as check_name,
  COUNT(*) as total_subtests,
  STRING_AGG(code, ', ' ORDER BY display_order) as subtest_codes
FROM subtests;

-- ============================================================================
-- 2. CHECK SQUAD_BATTLES COLUMNS
-- ============================================================================

SELECT 
  '2. Squad Battles Columns' as check_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'squad_battles'
AND column_name IN ('battle_type', 'subtest_code', 'question_count')
ORDER BY column_name;

-- ============================================================================
-- 3. CHECK FOREIGN KEY CONSTRAINT
-- ============================================================================

SELECT 
  '3. Foreign Key Constraint' as check_name,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'squad_battles'
AND kcu.column_name = 'subtest_code';

-- ============================================================================
-- 4. CHECK INDEXES
-- ============================================================================

SELECT 
  '4. Indexes' as check_name,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'squad_battles'
AND indexname LIKE '%subtest%';

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Squad Battle Setup Verification';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Expected Results:';
  RAISE NOTICE '  1. Subtests: 6 subtests (PPU, PBM, PK, LIT_INDO, LIT_ING, PM)';
  RAISE NOTICE '  2. Columns: battle_type, subtest_code, question_count';
  RAISE NOTICE '  3. Foreign Key: fk_squad_battles_subtest';
  RAISE NOTICE '  4. Index: idx_squad_battles_subtest_code';
  RAISE NOTICE '';
  RAISE NOTICE 'If all checks pass, Squad Battle feature is ready! 🎉';
  RAISE NOTICE '';
END $$;
