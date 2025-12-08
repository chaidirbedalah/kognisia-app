# Database Setup Instructions

## 🎯 Quick Setup (5 menit)

### Step 1: Add Missing Columns

Buka **Supabase SQL Editor** dan run query ini:

```sql
-- Add missing columns to student_progress
ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS assessment_type TEXT;

ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS subtest_code TEXT;

ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS daily_challenge_mode TEXT 
  CHECK (daily_challenge_mode IN ('balanced', 'focus'));

ALTER TABLE student_progress 
  ADD COLUMN IF NOT EXISTS focus_subtest_code TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_progress_assessment_type 
  ON student_progress(assessment_type);

CREATE INDEX IF NOT EXISTS idx_student_progress_subtest_code 
  ON student_progress(subtest_code);

CREATE INDEX IF NOT EXISTS idx_student_progress_student_subtest 
  ON student_progress(student_id, subtest_code);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
```

**Expected Output:** Query should complete successfully with no errors.

### Step 2: Verify Columns Added

Run this query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'student_progress'
AND column_name IN ('assessment_type', 'subtest_code', 'daily_challenge_mode', 'focus_subtest_code')
ORDER BY column_name;
```

**Expected Output:** Should show 4 rows with the new columns.

### Step 3: Run Seed Script

Kembali ke terminal dan run:

```bash
npm run seed:test
```

**Expected Output:**
```
🚀 Starting test data seeding...
👤 Finding test user...
✅ Test user found: [user-id]
🧹 Cleaning existing data...
✅ Existing data cleaned
📚 Seeding Daily Challenge data...
  ✓ Day 1: 2025-12-08
  ✓ Day 2: 2025-12-07
  ...
✅ Daily Challenge data seeded (7 days, current streak: 7)
⚡ Seeding Mini Try Out data...
  ✓ Mini Try Out 1: 2025-12-05
  ...
✅ Mini Try Out data seeded (3 sessions)
📝 Seeding Try Out UTBK data...
  ✓ Try Out UTBK 1: 2025-12-03
  ...
✅ Try Out UTBK data seeded (2 sessions)
🎉 Test data seeding completed successfully!
```

### Step 4: Verify Dashboard

1. Refresh dashboard di browser
2. Seharusnya sekarang menampilkan:
   - ✅ Streak Harian: 7 hari
   - ✅ Daily Challenge: 7 sessions
   - ✅ Mini Try Out: 3 sessions
   - ✅ Try Out UTBK: 2 sessions
   - ✅ Total Soal: ~630 questions
   - ✅ Akurasi: 60-80%

---

## 🔍 Troubleshooting

### Issue: "Column already exists"
**Solution:** Ini normal jika column sudah ada. Query akan skip dengan `IF NOT EXISTS`.

### Issue: "Could not find column in schema cache"
**Solution:** Run reload schema:
```sql
NOTIFY pgrst, 'reload schema';
```

Atau restart Supabase project:
1. Settings → General
2. Pause project
3. Resume project

### Issue: "No questions found"
**Solution:** Check question_bank has data:
```sql
SELECT COUNT(*) FROM question_bank;
```

If 0, you need to seed questions first.

### Issue: Seed script fails with permission error
**Solution:** Make sure you're using the correct Supabase credentials in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## 📊 Verify Data

After seeding, check data in Supabase:

```sql
-- Check total records
SELECT COUNT(*) as total_records FROM student_progress;
-- Expected: ~630 records

-- Check by assessment type
SELECT 
  assessment_type,
  COUNT(*) as count
FROM student_progress
GROUP BY assessment_type
ORDER BY assessment_type;
-- Expected:
-- daily_challenge: ~147 (7 days × 21 questions)
-- mini_tryout: ~210 (3 sessions × 70 questions)
-- tryout_utbk: ~320 (2 sessions × 160 questions)

-- Check by subtest
SELECT 
  subtest_code,
  COUNT(*) as count
FROM student_progress
GROUP BY subtest_code
ORDER BY subtest_code;
-- Expected: Roughly equal distribution across subtests

-- Check streak data (last 7 days)
SELECT 
  DATE(created_at) as date,
  COUNT(*) as questions
FROM student_progress
WHERE assessment_type = 'daily_challenge'
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;
-- Expected: 7 rows, one for each day
```

---

## ✅ Success Criteria

After setup, you should have:

- ✅ 4 new columns in student_progress table
- ✅ ~630 test records in student_progress
- ✅ Dashboard showing realistic data
- ✅ 7-day streak visible
- ✅ Multiple assessment types represented
- ✅ All subtests have data

---

## 🚀 Next Steps

After successful setup:

1. **Manual QA Testing** - Test all features with real interactions
2. **E2E Tests** - Run `npm run test:e2e:ui` to verify
3. **Production Deployment** - Deploy to staging/production

---

**Need Help?** If you encounter any issues, paste the error message and I'll help debug!
