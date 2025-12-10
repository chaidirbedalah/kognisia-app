-- Migration 011: Update Users School ID
-- Links all demo users to SMA Kognisia school

-- ============================================================================
-- UPDATE SCHOOL_ID FOR ALL DEMO USERS
-- ============================================================================

DO $$
DECLARE
  v_school_id UUID;
  v_school_name TEXT;
  v_updated_count INTEGER;
BEGIN
  -- Get existing school ID
  SELECT id, name INTO v_school_id, v_school_name
  FROM schools
  WHERE name LIKE '%Kognisia%'
  ORDER BY created_at
  LIMIT 1;
  
  IF v_school_id IS NULL THEN
    RAISE EXCEPTION 'School not found! Please create SMA Kognisia first.';
  END IF;
  
  RAISE NOTICE '✅ Found school: % (ID: %)', v_school_name, v_school_id;
  
  -- Update all demo users (students and teachers) to link to this school
  UPDATE users
  SET school_id = v_school_id
  WHERE (email LIKE '%@siswa.id' OR email LIKE '%@guru.id')
  AND school_id IS NULL;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RAISE NOTICE '✅ Updated % users with school_id', v_updated_count;
  
  -- Verification
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Verification';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  
  -- Count students linked to school
  RAISE NOTICE '👨‍🎓 Students linked to %: %', 
    v_school_name,
    (SELECT COUNT(*) FROM users WHERE school_id = v_school_id AND role = 'student');
  
  -- Count teachers linked to school
  RAISE NOTICE '👨‍🏫 Teachers linked to %: %', 
    v_school_name,
    (SELECT COUNT(*) FROM users WHERE school_id = v_school_id AND role = 'teacher');
  
  -- Count users still without school
  RAISE NOTICE '⚠️  Users without school: %', 
    (SELECT COUNT(*) FROM users WHERE school_id IS NULL);
  
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 011 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Updated:';
  RAISE NOTICE '  - All demo students (@siswa.id) linked to SMA Kognisia';
  RAISE NOTICE '  - All demo teachers (@guru.id) linked to SMA Kognisia';
  RAISE NOTICE '';
END $$;
