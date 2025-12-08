# Database Migrations

This directory contains SQL migration files for the Kognisia application database.

## Running Migrations

### Using Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of the migration file
4. Paste and execute the SQL

### Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Navigate to the project root
cd kognisia-app

# Run a specific migration
supabase db execute --file database/migrations/001_create_subtests_table.sql
```

### Manual Execution

You can also connect to your Supabase database using any PostgreSQL client and execute the migration files directly.

## Migration Files

### 001_create_subtests_table.sql

Creates the `subtests` reference table with the official UTBK 2026 structure:
- 6 subtests (PPU, PBM, PK, LIT_INDO, LIT_ING, PM)
- Total: 160 questions, 195 minutes
- Includes display order, question counts, and duration for each subtest

**Requirements:** 1.1, 1.3, 1.4, 1.5

### 002_update_question_bank_schema.sql

Updates the `question_bank` table for UTBK 2026 compliance:
- Adds `subtest_code` column with foreign key to `subtests` table
- Migrates old 7-subtest structure to new 6-subtest structure
- Maps 'PU' questions to 'PPU' (merges Penalaran Umum into Pengetahuan & Pemahaman Umum)
- Creates performance indexes on `subtest_code`
- Includes verification queries

**Requirements:** 1.2, 10.5

**Dependencies:** Must run after 001_create_subtests_table.sql

### 003_update_student_progress_schema.sql

Updates the `student_progress` table for Daily Challenge mode tracking:
- Adds `daily_challenge_mode` column (TEXT, CHECK: 'balanced' or 'focus')
- Adds `focus_subtest_code` column (TEXT, REFERENCES subtests)
- Creates performance indexes on `subtest_code`, `assessment_type`, and composite indexes
- Adds check constraint to ensure data integrity between mode and subtest selection

**Requirements:** 2.6, 4.5

**Dependencies:** Must run after 001_create_subtests_table.sql

### 004_update_assessment_types.sql

Updates assessment types for UTBK 2026 compliance:
- Adds support for 'mini_tryout' assessment type
- Updates existing 'marathon' records to 'tryout_utbk' for clarity
- Documents valid assessment types in column comment
- Includes verification queries to ensure data integrity

**Requirements:** 7.8

**Dependencies:** Must run after 003_update_student_progress_schema.sql

## Verification

After running the migration, verify the data:

```sql
-- Check that 6 subtests were created
SELECT COUNT(*) FROM subtests;
-- Expected: 6

-- Verify total questions and duration
SELECT 
  SUM(utbk_question_count) as total_questions,
  SUM(utbk_duration_minutes) as total_minutes
FROM subtests;
-- Expected: 160 questions, 195 minutes

-- View all subtests
SELECT * FROM subtests ORDER BY display_order;
```

## Rollback

To rollback this migration:

```sql
DROP TABLE IF EXISTS subtests CASCADE;
```

**Warning:** This will also drop any foreign key references to this table.
