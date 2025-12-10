-- Migration 010: Setup Classes (Use Existing School)
-- Creates 3 classes and enrolls all demo users to existing SMA Kognisia

-- ============================================================================
-- GET EXISTING SCHOOL ID
-- ============================================================================

-- This migration uses the EXISTING school, not creating a new one
-- The school ID will be fetched dynamically

DO $$
DECLARE
  v_school_id UUID;
  v_school_name TEXT;
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
  
  RAISE NOTICE '✅ Using existing school: % (ID: %)', v_school_name, v_school_id;
  
  -- Store school_id in a temporary table for use in subsequent queries
  CREATE TEMP TABLE IF NOT EXISTS temp_school_id (id UUID);
  DELETE FROM temp_school_id;
  INSERT INTO temp_school_id VALUES (v_school_id);
END $$;

-- ============================================================================
-- CREATE CLASSES
-- ============================================================================

-- Class 1: 12 IPA 1
INSERT INTO classes (id, school_id, name, created_at)
SELECT 
  'c0000000-0000-0000-0000-000000000001'::uuid,
  id,
  '12 IPA 1',
  NOW()
FROM temp_school_id
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Class 2: 12 IPS 1
INSERT INTO classes (id, school_id, name, created_at)
SELECT 
  'c0000000-0000-0000-0000-000000000002'::uuid,
  id,
  '12 IPS 1',
  NOW()
FROM temp_school_id
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Class 3: 12 Bahasa 1
INSERT INTO classes (id, school_id, name, created_at)
SELECT 
  'c0000000-0000-0000-0000-000000000003'::uuid,
  id,
  '12 Bahasa 1',
  NOW()
FROM temp_school_id
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- ============================================================================
-- ENROLL STUDENTS TO CLASSES (ALPHABETICAL DISTRIBUTION)
-- ============================================================================

-- Get all student IDs and assign to classes
WITH student_ids AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY email) as rn
  FROM users 
  WHERE email LIKE '%@siswa.id'
),
-- Assign students to classes (10 per class, alphabetically)
student_assignments AS (
  SELECT 
    id,
    email,
    CASE 
      WHEN rn <= 10 THEN 'c0000000-0000-0000-0000-000000000001'::uuid  -- 12 IPA 1
      WHEN rn <= 20 THEN 'c0000000-0000-0000-0000-000000000002'::uuid  -- 12 IPS 1
      ELSE 'c0000000-0000-0000-0000-000000000003'::uuid                 -- 12 Bahasa 1
    END as class_id
  FROM student_ids
)
-- Insert enrollments (only student_id and class_id columns exist)
INSERT INTO enrollments (student_id, class_id)
SELECT 
  id,
  class_id
FROM student_assignments
ON CONFLICT (student_id, class_id) DO NOTHING;

-- ============================================================================
-- ASSIGN TEACHERS TO CLASSES
-- ============================================================================

-- Get teacher IDs and assign to classes
WITH teacher_ids AS (
  SELECT 
    id,
    email,
    ROW_NUMBER() OVER (ORDER BY email) as rn
  FROM users 
  WHERE email LIKE '%@guru.id'
),
-- Assign teachers to classes (alphabetically)
-- Teachers 1-3: Class 12 IPA 1
-- Teachers 4-6: Class 12 IPS 1
-- Teachers 7-9: Class 12 Bahasa 1
-- Teacher 10 (lina@guru.id): Principal (no class assignment)
teacher_assignments AS (
  SELECT 
    id,
    email,
    CASE 
      WHEN rn <= 3 THEN 'c0000000-0000-0000-0000-000000000001'::uuid   -- 12 IPA 1
      WHEN rn <= 6 THEN 'c0000000-0000-0000-0000-000000000002'::uuid   -- 12 IPS 1
      WHEN rn <= 9 THEN 'c0000000-0000-0000-0000-000000000003'::uuid   -- 12 Bahasa 1
      ELSE NULL  -- Principal (no class)
    END as class_id,
    CASE
      WHEN rn = 10 THEN 'principal'
      ELSE 'teacher'
    END as role_type
  FROM teacher_ids
)
-- Insert enrollments for teachers (excluding principal)
-- Note: enrollments table only has student_id and class_id columns
INSERT INTO enrollments (student_id, class_id)
SELECT 
  id,
  class_id
FROM teacher_assignments
WHERE class_id IS NOT NULL
ON CONFLICT (student_id, class_id) DO NOTHING;

-- Note: Teacher 10 (lina@guru.id) remains as 'teacher' role but has no class assignment
-- This designates them as the principal (teacher without class)

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

DO $$
DECLARE
  v_school_id UUID;
  v_school_name TEXT;
  class_12_ipa_1 INTEGER;
  class_12_ips_1 INTEGER;
  class_12_bahasa_1 INTEGER;
  total_teachers INTEGER;
  principal_count INTEGER;
BEGIN
  -- Get school info
  SELECT id, name INTO v_school_id, v_school_name
  FROM schools
  WHERE name LIKE '%Kognisia%'
  ORDER BY created_at
  LIMIT 1;
  
  -- Count students in each class
  SELECT COUNT(*) INTO class_12_ipa_1
  FROM enrollments e
  JOIN users u ON e.student_id = u.id
  WHERE e.class_id = 'c0000000-0000-0000-0000-000000000001'::uuid
  AND u.role = 'student';
  
  SELECT COUNT(*) INTO class_12_ips_1
  FROM enrollments e
  JOIN users u ON e.student_id = u.id
  WHERE e.class_id = 'c0000000-0000-0000-0000-000000000002'::uuid
  AND u.role = 'student';
  
  SELECT COUNT(*) INTO class_12_bahasa_1
  FROM enrollments e
  JOIN users u ON e.student_id = u.id
  WHERE e.class_id = 'c0000000-0000-0000-0000-000000000003'::uuid
  AND u.role = 'student';
  
  -- Count teachers with class assignments
  SELECT COUNT(DISTINCT e.student_id) INTO total_teachers
  FROM enrollments e
  JOIN users u ON e.student_id = u.id
  WHERE u.role = 'teacher';
  
  -- Count teachers without class (principal)
  SELECT COUNT(*) INTO principal_count
  FROM users u
  WHERE u.role = 'teacher'
  AND u.email LIKE '%@guru.id'
  AND NOT EXISTS (
    SELECT 1 FROM enrollments e WHERE e.student_id = u.id
  );
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'School Setup Summary';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🏫 School: % (ID: %)', v_school_name, v_school_id;
  RAISE NOTICE '';
  RAISE NOTICE '📚 Classes:';
  RAISE NOTICE '  - 12 IPA 1: % students, 3 teachers', class_12_ipa_1;
  RAISE NOTICE '  - 12 IPS 1: % students, 3 teachers', class_12_ips_1;
  RAISE NOTICE '  - 12 Bahasa 1: % students, 3 teachers', class_12_bahasa_1;
  RAISE NOTICE '';
  RAISE NOTICE '👥 Staff:';
  RAISE NOTICE '  - Teachers (with class): %', total_teachers;
  RAISE NOTICE '  - Principal (teacher without class): %', principal_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ Total: % students + % teachers (with class) + % principal (no class)', 
    class_12_ipa_1 + class_12_ips_1 + class_12_bahasa_1,
    total_teachers,
    principal_count;
END $$;

-- Clean up temp table
DROP TABLE IF EXISTS temp_school_id;

-- ============================================================================
-- SUMMARY
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration 010 completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created:';
  RAISE NOTICE '  - 3 Classes (12 IPA 1, 12 IPS 1, 12 Bahasa 1)';
  RAISE NOTICE '  - 30 Student enrollments (~10 per class)';
  RAISE NOTICE '  - 9 Teacher assignments (3 per class)';
  RAISE NOTICE '  - 1 Principal: lina@guru.id (teacher without class)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Structure:';
  RAISE NOTICE '  SMA Kognisia (EXISTING)';
  RAISE NOTICE '  ├── 12 IPA 1 (10 students, 3 teachers)';
  RAISE NOTICE '  ├── 12 IPS 1 (10 students, 3 teachers)';
  RAISE NOTICE '  ├── 12 Bahasa 1 (10 students, 3 teachers)';
  RAISE NOTICE '  └── Principal: lina@guru.id (teacher, no class)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NOTE: Using EXISTING school, not creating new one';
  RAISE NOTICE '';
END $$;
