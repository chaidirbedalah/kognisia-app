-- Migration 009: Create Demo Accounts
-- Creates 30 student accounts and 10 teacher accounts for testing

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 
-- Supabase Auth users cannot be created via SQL directly.
-- You have two options:
--
-- OPTION 1: Use Supabase Dashboard (Recommended for few users)
--   1. Go to Authentication → Users
--   2. Click "Add User"
--   3. Enter email and password
--   4. Set role in users table
--
-- OPTION 2: Use Supabase Admin API (Recommended for bulk creation)
--   See the script at: scripts/create-demo-users.ts
--
-- This migration will:
-- 1. Show you the list of accounts to create
-- 2. Prepare the users table structure
-- 3. Provide helper queries
--
-- ============================================================================

-- ============================================================================
-- DEMO ACCOUNTS LIST
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEMO ACCOUNTS TO CREATE';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📚 STUDENT ACCOUNTS (30):';
  RAISE NOTICE '1. andi@siswa.id';
  RAISE NOTICE '2. bagus@siswa.id';
  RAISE NOTICE '3. budi@siswa.id';
  RAISE NOTICE '4. candra@siswa.id';
  RAISE NOTICE '5. dedi@siswa.id';
  RAISE NOTICE '6. dewi@siswa.id';
  RAISE NOTICE '7. eka@siswa.id';
  RAISE NOTICE '8. fitri@siswa.id';
  RAISE NOTICE '9. galih@siswa.id';
  RAISE NOTICE '10. hana@siswa.id';
  RAISE NOTICE '11. indra@siswa.id';
  RAISE NOTICE '12. joko@siswa.id';
  RAISE NOTICE '13. kiki@siswa.id';
  RAISE NOTICE '14. lina@siswa.id';
  RAISE NOTICE '15. maya@siswa.id';
  RAISE NOTICE '16. nanda@siswa.id';
  RAISE NOTICE '17. putri@siswa.id';
  RAISE NOTICE '18. rani@siswa.id';
  RAISE NOTICE '19. riski@siswa.id';
  RAISE NOTICE '20. sari@siswa.id';
  RAISE NOTICE '21. tiara@siswa.id';
  RAISE NOTICE '22. tono@siswa.id';
  RAISE NOTICE '23. ujang@siswa.id';
  RAISE NOTICE '24. vera@siswa.id';
  RAISE NOTICE '25. wawan@siswa.id';
  RAISE NOTICE '26. yanti@siswa.id';
  RAISE NOTICE '27. yudi@siswa.id';
  RAISE NOTICE '28. zaki@siswa.id';
  RAISE NOTICE '29. zahra@siswa.id';
  RAISE NOTICE '30. riko@siswa.id';
  RAISE NOTICE '';
  RAISE NOTICE '👨‍🏫 TEACHER ACCOUNTS (10):';
  RAISE NOTICE '1. bambang@guru.id';
  RAISE NOTICE '2. jaya@guru.id';
  RAISE NOTICE '3. agus@guru.id';
  RAISE NOTICE '4. rudi@guru.id';
  RAISE NOTICE '5. surya@guru.id';
  RAISE NOTICE '6. dewi@guru.id';
  RAISE NOTICE '7. fitri@guru.id';
  RAISE NOTICE '8. sari@guru.id';
  RAISE NOTICE '9. ratna@guru.id';
  RAISE NOTICE '10. lina@guru.id';
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Default Password: demo123456';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '1. Use Supabase Dashboard to create auth users';
  RAISE NOTICE '2. Or run the script: npm run create-demo-users';
  RAISE NOTICE '3. Users will be automatically added to users table';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- HELPER: Check if users table has correct structure
-- ============================================================================

DO $$
BEGIN
  -- Check if users table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    RAISE NOTICE '✅ Users table exists';
  ELSE
    RAISE NOTICE '❌ Users table does not exist!';
  END IF;
  
  -- Check if role column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    RAISE NOTICE '✅ Role column exists';
  ELSE
    RAISE NOTICE '❌ Role column does not exist!';
  END IF;
END $$;

-- ============================================================================
-- HELPER QUERIES
-- ============================================================================

-- Query to check existing demo accounts
-- Uncomment to run:
-- SELECT email, role, created_at 
-- FROM users 
-- WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
-- ORDER BY role, email;

-- Query to count demo accounts
-- Uncomment to run:
-- SELECT 
--   role,
--   COUNT(*) as total
-- FROM users 
-- WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
-- GROUP BY role;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 009 completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Summary:';
  RAISE NOTICE '- 30 student accounts listed';
  RAISE NOTICE '- 10 teacher accounts listed';
  RAISE NOTICE '- Default password: demo123456';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT:';
  RAISE NOTICE 'Auth users must be created via:';
  RAISE NOTICE '1. Supabase Dashboard, OR';
  RAISE NOTICE '2. Admin API script';
  RAISE NOTICE '';
  RAISE NOTICE 'See: scripts/create-demo-users.ts';
  RAISE NOTICE '';
END $$;
