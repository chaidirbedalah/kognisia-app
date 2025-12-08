# QA Quick Start Guide

## Persiapan Testing

### 1. Setup Environment
```bash
# Pastikan development server running
npm run dev

# Buka browser di http://localhost:3000
```

### 2. Test Accounts
- **Student:** test@kognisia.com / test123456
- **Teacher:** guru@kognisia.com / guru123456

---

## Quick Smoke Test (15 menit)

### ✅ Checklist Cepat

#### 1. Login & Dashboard (3 menit)
- [ ] Login dengan test@kognisia.com
- [ ] Dashboard loads tanpa error (cek console)
- [ ] Stats cards menampilkan data
- [ ] Semua tabs bisa dibuka (Progress, Daily Challenge, Mini Try Out, Try Out UTBK)

#### 2. Daily Challenge - Balanced Mode (5 menit)
- [ ] Klik "Mulai Daily Challenge"
- [ ] Pilih "Balanced Mode"
- [ ] Dapat 21 soal (3 per subtest)
- [ ] Jawab beberapa soal
- [ ] Submit
- [ ] Lihat hasil (accuracy, per-subtest breakdown)
- [ ] Cek dashboard - streak bertambah

#### 3. Daily Challenge - Focus Mode (5 menit)
- [ ] Klik "Mulai Daily Challenge"
- [ ] Pilih "Focus Mode"
- [ ] Pilih salah satu subtest (misal: PU)
- [ ] Dapat 10 soal dari subtest tersebut
- [ ] Jawab beberapa soal
- [ ] Submit
- [ ] Lihat hasil
- [ ] Cek dashboard - data terupdate

#### 4. Console Check (2 menit)
- [ ] Buka Developer Console (F12)
- [ ] Refresh dashboard
- [ ] **TIDAK ADA ERROR** (hanya warning boleh)
- [ ] Network tab: semua request 200 OK

---

## Critical Path Test (30 menit)

### Test 1: Complete Daily Challenge Flow
1. Login sebagai student
2. Mulai Daily Challenge (Balanced)
3. Jawab semua 21 soal
4. Submit
5. Review hasil
6. Kembali ke dashboard
7. **Verify:** Streak +1, history updated, stats updated

### Test 2: Mini Try Out Flow
1. Dari dashboard, klik "Mulai Mini Try Out"
2. Dapat 70 soal (10 per subtest)
3. Jawab minimal 20 soal
4. Submit
5. Review hasil (per-subtest breakdown)
6. Kembali ke dashboard
7. **Verify:** Mini Try Out tab shows new entry

### Test 3: Try Out UTBK Flow
1. Dari dashboard, klik "Mulai Try Out UTBK"
2. Dapat 160 soal
3. Jawab minimal 30 soal
4. Submit
5. Review hasil (7 subtests breakdown)
6. Kembali ke dashboard
7. **Verify:** Try Out UTBK tab shows new entry

---

## Data Verification Queries

### Check Database Directly (Optional)

```sql
-- Check student progress records
SELECT 
  assessment_type,
  COUNT(*) as count,
  COUNT(DISTINCT student_id) as unique_students
FROM student_progress
GROUP BY assessment_type;

-- Check question distribution
SELECT 
  subtest_code,
  COUNT(*) as question_count
FROM question_bank
GROUP BY subtest_code
ORDER BY subtest_code;

-- Check recent completions
SELECT 
  student_id,
  assessment_type,
  COUNT(*) as questions_answered,
  AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100 as accuracy
FROM student_progress
WHERE created_at > NOW() - INTERVAL '1 day'
GROUP BY student_id, assessment_type;
```

---

## Common Issues & Solutions

### Issue 1: Dashboard tidak load
**Symptoms:** Blank screen, loading forever  
**Check:**
- Console errors?
- Network tab - failed requests?
- Supabase connection?

**Solution:**
- Check `.env.local` file
- Verify Supabase credentials
- Check database connection

### Issue 2: Questions tidak muncul
**Symptoms:** "No questions available"  
**Check:**
- Question bank ada data?
- Subtest codes valid?

**Solution:**
```sql
-- Check question count
SELECT COUNT(*) FROM question_bank;

-- Check subtests
SELECT * FROM subtests;
```

### Issue 3: Streak tidak update
**Symptoms:** Streak tetap 0 atau tidak bertambah  
**Check:**
- Progress records tersimpan?
- Assessment type correct?

**Solution:**
- Check student_progress table
- Verify streak calculation logic

---

## Performance Benchmarks

### Expected Load Times
- Dashboard initial load: < 2s
- Question fetch: < 500ms
- Answer submit: < 200ms
- Results calculation: < 1s

### How to Measure
1. Open DevTools → Network tab
2. Disable cache
3. Reload page
4. Check "DOMContentLoaded" and "Load" times

---

## Reporting Bugs

### Quick Bug Report
```
BUG: [Short description]
Steps: 
1. [Step 1]
2. [Step 2]
Result: [What happened]
Expected: [What should happen]
Console: [Any errors]
```

### Where to Report
- Create issue in GitHub
- Add to QA_TEST_PLAN.md
- Notify development team

---

## Test Status Dashboard

### Current Status
```
✅ Authentication: PASSED
✅ Dashboard Load: PASSED
✅ Daily Challenge: PASSED
✅ Mini Try Out: PASSED
✅ Try Out UTBK: PASSED
✅ Data Integrity: PASSED
✅ Performance: PASSED

🟡 Browser Compatibility: IN PROGRESS
⬜ Mobile Responsive: NOT STARTED
⬜ Accessibility: NOT STARTED
```

---

## Next Steps

1. ✅ Complete smoke test
2. ✅ Complete critical path test
3. 🟡 Full QA test plan (QA_TEST_PLAN.md)
4. ⬜ User acceptance testing
5. ⬜ Production deployment

---

**Happy Testing! 🧪**
