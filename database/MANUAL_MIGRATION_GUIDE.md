# Manual Migration Guide

Jika schema cache tidak sync atau migrations belum dijalankan, ikuti langkah ini:

## Step 1: Check Current Schema

Jalankan di SQL Editor:

```sql
-- Check student_progress columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_progress'
ORDER BY ordinal_position;
```

## Step 2: Check If Migrations Needed

Jika columns berikut TIDAK ADA, Anda perlu run migrations:
- `assessment_type`
- `subtest_code`
- `hint_used`
- `solution_viewed`
- `time_spent`
- `daily_challenge_mode`
- `focus_subtest_code`

## Step 3: Run Migrations (If Needed)

### Migration 1: Create Subtests Table

```sql
-- Create subtests table if not exists
CREATE TABLE IF NOT EXISTS subtests (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert UTBK 2026 subtests
INSERT INTO subtests (code, name, description) VALUES
  ('PPU', 'Pengetahuan & Pemahaman Umum', 'Pengetahuan dan Pemahaman Umum'),
  ('PBM', 'Pemahaman Bacaan & Menulis', 'Pemahaman Bacaan dan Menulis'),
  ('PK', 'Pengetahuan Kuantitatif', 'Pengetahuan Kuantitatif'),
  ('LIT_INDO', 'Literasi Bahasa Indonesia', 'Literasi dalam Bahasa Indonesia'),
  ('LIT_ING', 'Literasi Bahasa Inggris', 'Literasi dalam Bahasa Inggris'),
  ('PM', 'Penalaran Matematika', 'Penalaran Matematika')
ON CONFLICT (code) DO NOTHING;
```

### Migration 2: Update Question Bank Schema

```sql
-- Add subtest_code column to question_bank
ALTER TABLE question_bank 
  ADD COLUMN IF NOT EXISTS subtest_code TEXT;

-- Update existing questions (if you have old 'subtest' column)
UPDATE question_bank 
SET subtest_code = CASE 
  WHEN subtest = 'PU' THEN 'PPU'
  WHEN subtest = 'PPU' THEN 'PPU'
  WHEN subtest = 'PBM' THEN 'PBM'
  WHEN subtest = 'PK' THEN 'PK'
  WHEN subtest = 'LIT_INDO' THEN 'LIT_INDO'
  WHEN subtest = 'LIT_ING' THEN 'LIT_ING'
  WHEN subtest = 'PM' THEN 'PM'
  ELSE 'PPU'
END
WHERE subtest_code IS NULL;

-- Add foreign key constraint
ALTER TABLE question_bank
  DROP CONSTRAINT IF EXISTS fk_question_bank_subtest;

ALTER TABLE question_bank
  ADD CONSTRAINT fk_question_bank_subtest
  FOREIGN KEY (subtest_code) 
  REFERENCES subtests(code)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_question_bank_subtest_code 
  ON question_bank(subtest_code);
```

### Migration 3: Update Student Progress Schema

```sql
-- Add assessment_type if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS assessment_type TEXT;

-- Add subtest_code if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS subtest_code TEXT;

-- Add hint_used if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS hint_used BOOLEAN DEFAULT FALSE;

-- Add solution_viewed if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS solution_viewed BOOLEAN DEFAULT FALSE;

-- Add time_spent if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- Add daily_challenge_mode if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS daily_challenge_mode TEXT 
  CHECK (daily_challenge_mode IN ('balanced', 'focus'));

-- Add focus_subtest_code if not exists
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS focus_subtest_code TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_student_progress_subtest_code 
  ON student_progress(subtest_code);

CREATE INDEX IF NOT EXISTS idx_student_progress_assessment_type 
  ON student_progress(assessment_type);

CREATE INDEX IF NOT EXISTS idx_student_progress_user_subtest 
  ON student_progress(user_id, subtest_code);
```

### Migration 4: Update Assessment Types

```sql
-- Update marathon to tryout_utbk
UPDATE student_progress 
SET assessment_type = 'tryout_utbk',
    updated_at = NOW()
WHERE assessment_type = 'marathon';

-- Add comment
COMMENT ON COLUMN student_progress.assessment_type IS 
  'Type of assessment: pre_test, daily_challenge, tryout, tryout_utbk, mini_tryout, scheduled';
```

## Step 4: Verify Schema

```sql
-- Check student_progress columns again
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_progress'
ORDER BY ordinal_position;

-- Should see all these columns:
-- - id
-- - user_id (or student_id)
-- - question_id
-- - is_correct
-- - assessment_type
-- - subtest_code
-- - hint_used
-- - solution_viewed
-- - time_spent
-- - daily_challenge_mode
-- - focus_subtest_code
-- - created_at
-- - updated_at
```

## Step 5: Reload Schema Cache

After running migrations, reload schema:

```sql
NOTIFY pgrst, 'reload schema';
```

Or:

```sql
SELECT pg_notify('pgrst', 'reload schema');
```

## Step 6: Test

Setelah migrations selesai, coba run seed script lagi:

```bash
npm run seed:test
```

---

## Troubleshooting

### Issue: "Column not found in schema cache"
**Solution:** Run `NOTIFY pgrst, 'reload schema';` atau restart project

### Issue: "Foreign key constraint violation"
**Solution:** Pastikan subtests table sudah ada dan terisi

### Issue: "user_id vs student_id"
**Solution:** Check dengan query:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'student_progress' 
AND column_name IN ('user_id', 'student_id');
```

Jika hasilnya `student_id`, update seed script untuk gunakan `student_id` instead of `user_id`.

---

## Quick Check Script

Jalankan ini untuk quick check:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'question_bank', 'student_progress', 'subtests')
ORDER BY table_name;

-- Check student_progress has required columns
SELECT 
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'assessment_type') as has_assessment_type,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'subtest_code') as has_subtest_code,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'hint_used') as has_hint_used,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'solution_viewed') as has_solution_viewed,
  EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'student_progress' AND column_name = 'time_spent') as has_time_spent;

-- All should return 'true'
```
