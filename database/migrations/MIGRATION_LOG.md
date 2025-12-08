# Migration Log

## 001_create_subtests_table.sql

**Date**: December 8, 2025
**Status**: Ready to deploy
**Task**: Task 1 - Create subtests reference table and seed data

### What This Migration Does

1. Creates the `subtests` table with the following structure:
   - `code` (TEXT, PRIMARY KEY) - Subtest code (PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
   - `name` (TEXT, NOT NULL) - Full name in Indonesian
   - `description` (TEXT) - Description of what the subtest covers
   - `icon` (TEXT) - Emoji icon for UI display
   - `display_order` (INTEGER, NOT NULL) - Order for display (1-6)
   - `utbk_question_count` (INTEGER, NOT NULL) - Number of questions in UTBK
   - `utbk_duration_minutes` (DECIMAL(4,1), NOT NULL) - Time allocation in minutes
   - `created_at` (TIMESTAMPTZ) - Record creation timestamp
   - `updated_at` (TIMESTAMPTZ) - Record update timestamp

2. Creates an index on `display_order` for efficient ordering queries

3. Inserts 6 official UTBK 2026 subtests:
   - PPU: Pengetahuan & Pemahaman Umum (20 questions, 15 minutes)
   - PBM: Pemahaman Bacaan & Menulis (20 questions, 25 minutes)
   - PK: Pengetahuan Kuantitatif (20 questions, 20 minutes)
   - LIT_INDO: Literasi Bahasa Indonesia (30 questions, 42.5 minutes)
   - LIT_ING: Literasi Bahasa Inggris (20 questions, 20 minutes)
   - PM: Penalaran Matematika (20 questions, 42.5 minutes)

4. Includes verification query to check totals

### Requirements Satisfied

- ✅ Requirement 1.1: System supports exactly 6 subtests
- ✅ Requirement 1.3: Consistent subtest names maintained
- ✅ Requirement 1.4: Time allocation stored for each subtest
- ✅ Requirement 1.5: Question count stored for each subtest

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Review SQL file for syntax errors
- [ ] Verify Supabase connection
- [ ] Ensure no existing `subtests` table (or plan for conflict resolution)

### Post-Migration Verification

Run these queries to verify:

```sql
-- Should return 6
SELECT COUNT(*) FROM subtests;

-- Should return 160 and 195
SELECT 
  SUM(utbk_question_count) as total_questions,
  SUM(utbk_duration_minutes) as total_minutes
FROM subtests;

-- Should show all 6 subtests in order
SELECT code, name, utbk_question_count, utbk_duration_minutes 
FROM subtests 
ORDER BY display_order;
```

### Rollback Plan

If issues occur:

```sql
DROP TABLE IF EXISTS subtests CASCADE;
```

**Warning**: This will cascade to any foreign key references.

### Dependencies

**Required by**:
- Task 2: question_bank schema update (adds foreign key to subtests)
- Task 3: student_progress schema update (adds foreign key to subtests)
- All assessment type implementations

**Depends on**:
- None (this is the first migration)

### Notes

- Uses `ON CONFLICT (code) DO NOTHING` to allow safe re-running
- Decimal type used for duration to support fractional minutes (42.5)
- Icons use emoji for visual representation
- All fields are required except description and icon
- Table is designed to be read-only after initial seed (reference data)

### Testing

After migration:
1. Run verification queries (see above)
2. Test TypeScript constants import: `import { UTBK_2026_SUBTESTS } from '@/lib/utbk-constants'`
3. Test API functions: `await fetchSubtests()`
4. Verify in Supabase dashboard that table appears correctly

### Status

- [x] SQL file created
- [x] TypeScript constants created
- [x] API functions created
- [x] Documentation written
- [ ] Migration executed in database
- [ ] Verification completed
- [ ] Application tested with new table

---

## 002_update_question_bank_schema.sql

**Date**: December 8, 2025
**Status**: Ready to deploy
**Task**: Task 2 - Update question_bank schema

### What This Migration Does

1. Adds `subtest_code` column to `question_bank` table (initially nullable)

2. Migrates data from old 7-subtest structure to new 6-subtest structure:
   - Maps 'PU' (Penalaran Umum) → 'PPU' (merged into Pengetahuan & Pemahaman Umum)
   - Maps 'PPU' → 'PPU'
   - Maps 'PBM' → 'PBM'
   - Maps 'PK' → 'PK'
   - Maps 'LIT_INDO' → 'LIT_INDO'
   - Maps 'LIT_ING' → 'LIT_ING'
   - Maps 'PM' → 'PM'
   - Flags any unmapped values as NULL for manual review

3. Adds foreign key constraint to `subtests` table

4. Sets `subtest_code` column to NOT NULL after migration

5. Creates performance indexes:
   - `idx_question_bank_subtest_code` on `subtest_code`
   - `idx_question_bank_subtest_difficulty` on `(subtest_code, difficulty)`

6. Includes verification queries to check migration success

### Requirements Satisfied

- ✅ Requirement 1.2: Questions categorized into 6 official subtests
- ✅ Requirement 10.5: Migration path for updating question bank subtest categorizations

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Verify migration 001 (subtests table) has been executed
- [ ] Review current `question_bank` schema
- [ ] Check for any questions with unexpected subtest values
- [ ] Ensure no existing `subtest_code` column

### Post-Migration Verification

Run these queries to verify:

```sql
-- Should return 0 (no unmapped questions)
SELECT COUNT(*) FROM question_bank WHERE subtest_code IS NULL;

-- Should return 6 distinct subtests
SELECT COUNT(DISTINCT subtest_code) FROM question_bank;

-- Check distribution across subtests
SELECT 
  subtest_code,
  COUNT(*) as question_count
FROM question_bank
GROUP BY subtest_code
ORDER BY subtest_code;

-- Verify all codes are valid (should return 0 rows)
SELECT DISTINCT subtest_code
FROM question_bank
WHERE subtest_code NOT IN (SELECT code FROM subtests);
```

### Rollback Plan

If issues occur:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_question_bank_subtest_code;
DROP INDEX IF EXISTS idx_question_bank_subtest_difficulty;

-- Remove foreign key constraint
ALTER TABLE question_bank DROP CONSTRAINT IF EXISTS fk_question_bank_subtest;

-- Remove column
ALTER TABLE question_bank DROP COLUMN IF EXISTS subtest_code;
```

### Dependencies

**Required by**:
- All assessment implementations (Daily Challenge, Try Out UTBK, Mini Try Out)
- Dashboard analytics and progress tracking
- Question fetching APIs

**Depends on**:
- Migration 001: subtests table must exist for foreign key constraint

### Notes

- Migration is designed to be idempotent (safe to re-run)
- Uses CASE statement for clear mapping logic
- Includes warning if unmapped questions are found
- Foreign key uses ON DELETE RESTRICT to prevent accidental subtest deletion
- Composite index optimizes common query pattern (filter by subtest and difficulty)
- Old `subtest` column is preserved for backward compatibility (not dropped)

### Testing

After migration:
1. Run verification queries (see above)
2. Test question fetching by subtest: `SELECT * FROM question_bank WHERE subtest_code = 'PPU' LIMIT 10`
3. Verify foreign key constraint: Try inserting question with invalid subtest_code (should fail)
4. Test index performance: `EXPLAIN ANALYZE SELECT * FROM question_bank WHERE subtest_code = 'PPU'`
5. Check application still works with updated schema

### Status

- [x] SQL file created
- [ ] Migration executed in database
- [ ] Verification completed
- [ ] Application tested with updated schema
- [ ] Property-based test written


---

## 003_update_student_progress_schema.sql

**Date**: December 8, 2025
**Status**: Ready to deploy
**Task**: Task 3 - Update student_progress schema

### What This Migration Does

1. Adds `daily_challenge_mode` column to `student_progress` table:
   - Type: TEXT with CHECK constraint ('balanced' or 'focus')
   - Tracks which Daily Challenge mode the student selected
   - NULL for non-Daily Challenge assessments

2. Adds `focus_subtest_code` column to `student_progress` table:
   - Type: TEXT with foreign key reference to `subtests(code)`
   - Stores the selected subtest when using Focus mode
   - NULL for Balanced mode or non-Daily Challenge assessments

3. Adds check constraint `check_focus_mode_consistency`:
   - Ensures `focus_subtest_code` is only set when mode is 'focus'
   - Ensures `focus_subtest_code` is NULL when mode is 'balanced'
   - Maintains data integrity between mode and subtest selection

4. Creates performance indexes:
   - `idx_student_progress_subtest_code` on `subtest_code`
   - `idx_student_progress_assessment_type` on `assessment_type`
   - `idx_student_progress_user_subtest` on `(user_id, subtest_code)`
   - `idx_student_progress_user_mode` on `(user_id, daily_challenge_mode)` (partial index)

5. Includes verification queries to check migration success

### Requirements Satisfied

- ✅ Requirement 2.6: System records selected mode in student progress data
- ✅ Requirement 4.5: System records progress only for selected subtest in Focus mode

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Verify migration 001 (subtests table) has been executed
- [ ] Review current `student_progress` schema
- [ ] Ensure no existing `daily_challenge_mode` or `focus_subtest_code` columns
- [ ] Check for any existing data that might violate new constraints

### Post-Migration Verification

Run these queries to verify:

```sql
-- Verify columns were added
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'student_progress' 
  AND column_name IN ('daily_challenge_mode', 'focus_subtest_code')
ORDER BY column_name;

-- Verify indexes were created (should return 4 indexes)
SELECT 
  indexname, 
  indexdef
FROM pg_indexes
WHERE tablename = 'student_progress'
  AND indexname LIKE 'idx_student_progress_%'
ORDER BY indexname;

-- Verify constraints exist
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'student_progress'::regclass
  AND conname IN ('check_focus_mode_consistency', 'student_progress_daily_challenge_mode_check')
ORDER BY conname;

-- Test constraint (should fail)
-- INSERT INTO student_progress (daily_challenge_mode, focus_subtest_code) 
-- VALUES ('balanced', 'PPU');  -- Should fail: balanced mode can't have focus_subtest_code
```

### Rollback Plan

If issues occur:

```sql
-- Remove indexes
DROP INDEX IF EXISTS idx_student_progress_subtest_code;
DROP INDEX IF EXISTS idx_student_progress_assessment_type;
DROP INDEX IF EXISTS idx_student_progress_user_subtest;
DROP INDEX IF EXISTS idx_student_progress_user_mode;

-- Remove constraints
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS check_focus_mode_consistency;
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_daily_challenge_mode_check;

-- Remove foreign key constraint
ALTER TABLE student_progress DROP CONSTRAINT IF EXISTS student_progress_focus_subtest_code_fkey;

-- Remove columns
ALTER TABLE student_progress DROP COLUMN IF EXISTS daily_challenge_mode;
ALTER TABLE student_progress DROP COLUMN IF EXISTS focus_subtest_code;
```

### Dependencies

**Required by**:
- Daily Challenge mode selection implementation
- Daily Challenge Balanced mode (18 questions)
- Daily Challenge Focus mode (10 questions)
- Progress recording for both modes
- Dashboard mode indicator display

**Depends on**:
- Migration 001: subtests table must exist for foreign key constraint on `focus_subtest_code`

### Notes

- Migration is designed to be idempotent (safe to re-run with IF NOT EXISTS)
- Check constraint ensures data integrity between mode and subtest selection
- Partial index on `user_mode` only indexes rows where `daily_challenge_mode IS NOT NULL` for efficiency
- Foreign key uses ON DELETE RESTRICT to prevent accidental subtest deletion
- Composite indexes optimize common query patterns:
  - User's progress by subtest
  - User's Daily Challenge sessions by mode
- Existing `student_progress` records will have NULL values for new columns (backward compatible)

### Testing

After migration:
1. Run verification queries (see above)
2. Test inserting balanced mode record:
   ```sql
   INSERT INTO student_progress (user_id, assessment_type, daily_challenge_mode, focus_subtest_code)
   VALUES ('test-user', 'daily_challenge', 'balanced', NULL);
   ```
3. Test inserting focus mode record:
   ```sql
   INSERT INTO student_progress (user_id, assessment_type, daily_challenge_mode, focus_subtest_code)
   VALUES ('test-user', 'daily_challenge', 'focus', 'PPU');
   ```
4. Test constraint violation (should fail):
   ```sql
   INSERT INTO student_progress (user_id, assessment_type, daily_challenge_mode, focus_subtest_code)
   VALUES ('test-user', 'daily_challenge', 'balanced', 'PPU');
   ```
5. Test index performance:
   ```sql
   EXPLAIN ANALYZE 
   SELECT * FROM student_progress 
   WHERE user_id = 'test-user' AND subtest_code = 'PPU';
   ```
6. Test application with updated schema

### Status

- [x] SQL file created
- [x] Migration log updated
- [ ] Migration executed in database
- [ ] Verification completed
- [ ] Application tested with updated schema


---

## 004_update_assessment_types.sql

**Date**: December 8, 2025
**Status**: Ready to deploy
**Task**: Task 4 - Update assessments table

### What This Migration Does

1. Updates existing 'marathon' records to 'tryout_utbk':
   - Changes assessment_type from 'marathon' to 'tryout_utbk' for all student_progress records
   - Updates the updated_at timestamp for modified records
   - Provides clearer naming that aligns with UTBK terminology

2. Verifies migration success:
   - Checks that no 'marathon' records remain after migration
   - Raises exception if migration fails

3. Documents valid assessment types:
   - Adds column comment listing all valid assessment types
   - Notes that 'marathon' has been deprecated in favor of 'tryout_utbk'

4. Includes verification queries to check data integrity

### Requirements Satisfied

- ✅ Requirement 7.8: System stores assessment type as 'mini_tryout' in student progress

### Pre-Migration Checklist

- [ ] Backup database
- [ ] Verify migration 003 (student_progress schema update) has been executed
- [ ] Check current distribution of assessment types
- [ ] Review any application code that references 'marathon' assessment type
- [ ] Update TypeScript types to remove 'marathon' and ensure 'mini_tryout' and 'tryout_utbk' are included

### Post-Migration Verification

Run these queries to verify:

```sql
-- Should return 0 (no marathon records remain)
SELECT COUNT(*) as marathon_count 
FROM student_progress 
WHERE assessment_type = 'marathon';

-- View all assessment types in use
SELECT 
  assessment_type,
  COUNT(*) as count,
  MIN(created_at) as first_record,
  MAX(created_at) as last_record
FROM student_progress
GROUP BY assessment_type
ORDER BY assessment_type;

-- Check for any invalid assessment types (should return 0 rows)
SELECT DISTINCT assessment_type
FROM student_progress
WHERE assessment_type NOT IN (
  'pre_test', 
  'daily_challenge', 
  'tryout', 
  'tryout_utbk',
  'mini_tryout', 
  'scheduled'
);
```

### Rollback Plan

If issues occur:

```sql
-- Revert tryout_utbk back to marathon
UPDATE student_progress 
SET assessment_type = 'marathon',
    updated_at = NOW()
WHERE assessment_type = 'tryout_utbk' 
  AND updated_at >= '[migration_timestamp]';  -- Use actual migration timestamp

-- Remove column comment
COMMENT ON COLUMN student_progress.assessment_type IS NULL;
```

### Dependencies

**Required by**:
- Mini Try Out implementation (needs 'mini_tryout' type)
- Try Out UTBK implementation (uses 'tryout_utbk' instead of 'marathon')
- Dashboard analytics (needs to handle new assessment types)
- Historical data display (needs to show 'tryout_utbk' correctly)

**Depends on**:
- Migration 003: student_progress table must have assessment_type column

### Notes

- Migration is designed to be safe and reversible
- Uses transaction block (DO $$) to ensure atomicity
- Includes detailed logging with RAISE NOTICE statements
- No schema changes, only data updates
- TypeScript types must be updated to match new valid values
- Application code referencing 'marathon' should be updated to use 'tryout_utbk'
- The term 'tryout_utbk' is more descriptive and aligns with Indonesian terminology

### Code Updates Required

After this migration, update the following:

1. **TypeScript types** (`src/lib/types.ts`):
   ```typescript
   export type AssessmentType = 
     | 'pre_test' 
     | 'daily_challenge' 
     | 'tryout' 
     | 'tryout_utbk'  // Updated from 'marathon'
     | 'mini_tryout'   // New type
     | 'scheduled'
   ```

2. **API endpoints**: Update any code that filters by 'marathon' to use 'tryout_utbk'

3. **Dashboard components**: Update display labels from "Marathon" to "Try Out UTBK"

4. **Analytics queries**: Update to use 'tryout_utbk' instead of 'marathon'

### Testing

After migration:
1. Run verification queries (see above)
2. Test that no 'marathon' records exist
3. Verify 'tryout_utbk' records have correct data
4. Test application displays Try Out UTBK data correctly
5. Test that new Mini Try Out sessions can be created with 'mini_tryout' type
6. Verify dashboard shows correct assessment type labels
7. Check historical data displays correctly

### Status

- [x] SQL file created
- [x] TypeScript types updated
- [x] Migration log updated
- [x] Database README updated
- [ ] Migration executed in database
- [ ] Verification completed
- [ ] Application code updated to use new types
- [ ] Application tested with updated data
