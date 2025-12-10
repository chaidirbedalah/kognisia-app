-- Verify Demo Accounts
-- Run this in Supabase SQL Editor to check created accounts

-- ============================================================================
-- COUNT ACCOUNTS BY ROLE
-- ============================================================================

SELECT 
  role,
  COUNT(*) as total
FROM users 
WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
GROUP BY role
ORDER BY role;

-- Expected output:
-- role     | total
-- ---------|------
-- student  | 30
-- teacher  | 10

-- ============================================================================
-- LIST ALL DEMO ACCOUNTS
-- ============================================================================

SELECT 
  email, 
  role, 
  full_name,
  created_at 
FROM users 
WHERE email LIKE '%@siswa.id' OR email LIKE '%@guru.id'
ORDER BY role, email;

-- ============================================================================
-- CHECK MISSING ACCOUNTS
-- ============================================================================

-- Student accounts that should exist
WITH expected_students AS (
  SELECT unnest(ARRAY[
    'andi@siswa.id', 'bagus@siswa.id', 'budi@siswa.id', 'candra@siswa.id', 
    'dedi@siswa.id', 'dewi@siswa.id', 'eka@siswa.id', 'fitri@siswa.id', 
    'galih@siswa.id', 'hana@siswa.id', 'indra@siswa.id', 'joko@siswa.id', 
    'kiki@siswa.id', 'lina@siswa.id', 'maya@siswa.id', 'nanda@siswa.id', 
    'putri@siswa.id', 'rani@siswa.id', 'riski@siswa.id', 'sari@siswa.id', 
    'tiara@siswa.id', 'tono@siswa.id', 'ujang@siswa.id', 'vera@siswa.id', 
    'wawan@siswa.id', 'yanti@siswa.id', 'yudi@siswa.id', 'zaki@siswa.id', 
    'zahra@siswa.id', 'riko@siswa.id'
  ]) AS email
),
expected_teachers AS (
  SELECT unnest(ARRAY[
    'bambang@guru.id', 'jaya@guru.id', 'agus@guru.id', 'rudi@guru.id', 
    'surya@guru.id', 'dewi@guru.id', 'fitri@guru.id', 'sari@guru.id', 
    'ratna@guru.id', 'lina@guru.id'
  ]) AS email
)
SELECT 
  'Missing Students' as type,
  es.email
FROM expected_students es
LEFT JOIN users u ON es.email = u.email
WHERE u.email IS NULL

UNION ALL

SELECT 
  'Missing Teachers' as type,
  et.email
FROM expected_teachers et
LEFT JOIN users u ON et.email = u.email
WHERE u.email IS NULL;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
DECLARE
  student_count INTEGER;
  teacher_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO student_count FROM users WHERE email LIKE '%@siswa.id';
  SELECT COUNT(*) INTO teacher_count FROM users WHERE email LIKE '%@guru.id';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Demo Accounts Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Students: % / 30', student_count;
  RAISE NOTICE 'Teachers: % / 10', teacher_count;
  RAISE NOTICE 'Total: % / 40', student_count + teacher_count;
  RAISE NOTICE '';
  
  IF student_count = 30 AND teacher_count = 10 THEN
    RAISE NOTICE '✅ All demo accounts created successfully!';
  ELSE
    RAISE NOTICE '⚠️  Some accounts are missing. Check the query above.';
  END IF;
END $$;
