# 🎯 Achievement System - Deployment Guide

## 📋 Overview

Panduan lengkap untuk men-deploy Achievement System ke production Supabase dan Vercel.

## 🚀 Deployment Steps

### **Step 1: Deploy Database Migration (Supabase)**

Karena menggunakan Free Tier Supabase, migration harus dijalankan manual via dashboard.

#### **Option A: Via Supabase Dashboard (Recommended)**

1. Buka Supabase Dashboard: https://app.supabase.com
2. Pilih project: `kognisia-app` (luioyqrubylvjospgsjx)
3. Klik menu **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy seluruh isi file: `database/migrations/create_achievements_tables.sql`
6. Paste ke SQL editor
7. Klik tombol **Run** (atau tekan Cmd+Enter)
8. Tunggu hingga selesai (biasanya 5-10 detik)

**Expected Output:**
```
Query executed successfully
```

#### **Option B: Via Supabase CLI**

```bash
cd kognisia-app
supabase db push
```

**Note:** Memerlukan Docker Desktop untuk menjalankan Supabase CLI.

---

### **Step 2: Verify Database Tables**

Setelah migration berhasil, verifikasi tabel sudah dibuat:

1. Di Supabase Dashboard, klik **Table Editor**
2. Pastikan ada 3 tabel baru:
   - ✅ `achievements` (16 records)
   - ✅ `user_achievements` (empty)
   - ✅ `achievement_notifications` (empty)

**Verify Query:**
```sql
SELECT COUNT(*) as total_achievements FROM achievements;
-- Expected: 16
```

---

### **Step 3: Build & Test Locally**

Sebelum deploy ke production, test di local:

```bash
cd kognisia-app

# Install dependencies (jika belum)
npm install

# Build project
npm run build

# Run tests (optional)
npm run test

# Start dev server
npm run dev
```

**Expected Build Output:**
```
✓ Compiled successfully
✓ No TypeScript errors
✓ No ESLint errors
```

---

### **Step 4: Test Achievement APIs**

Buka browser dan test endpoints:

#### **Test 1: Get All Achievements**
```
GET http://localhost:3000/api/achievements/list
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total_achievements": 16,
    "unlocked_count": 0,
    "locked_count": 16,
    "total_points": 0,
    "completion_percentage": 0
  },
  "achievements": [...]
}
```

#### **Test 2: Unlock Achievement**
```
POST http://localhost:3000/api/achievements/unlock
Content-Type: application/json

{
  "achievement_code": "first_battle"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Achievement unlocked!",
  "achievement": {...}
}
```

#### **Test 3: Get Notifications**
```
GET http://localhost:3000/api/achievements/notifications
```

**Expected Response:**
```json
{
  "success": true,
  "notifications": [...],
  "unread_count": 1
}
```

---

### **Step 5: Deploy to Vercel**

#### **Option A: Via Git Push (Recommended)**

```bash
cd kognisia-app

# Commit changes
git add .
git commit -m "feat: deploy achievement system"

# Push to GitHub
git push origin main

# Vercel akan auto-deploy
```

#### **Option B: Manual Deploy**

```bash
# Install Vercel CLI (jika belum)
npm install -g vercel

# Deploy
vercel --prod
```

**Expected Output:**
```
✓ Production: https://kognisia-obio2u1m4-coachchaidirs-projects.vercel.app
✓ Deployment complete
```

---

### **Step 6: Verify Production Deployment**

Setelah deploy ke Vercel, test production endpoints:

```bash
# Test production API
curl https://kognisia-obio2u1m4-coachchaidirs-projects.vercel.app/api/achievements/list

# Expected: 200 OK with achievements data
```

---

## ✅ Deployment Checklist

- [ ] Database migration deployed to Supabase
- [ ] 3 achievement tables created
- [ ] 16 achievements inserted
- [ ] RLS policies enabled
- [ ] Local build successful (npm run build)
- [ ] All API endpoints tested locally
- [ ] Achievement components render correctly
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Committed to GitHub
- [ ] Deployed to Vercel
- [ ] Production endpoints verified

---

## 🔧 Troubleshooting

### **Issue: "Table already exists" error**

**Solution:** Migration sudah pernah dijalankan. Ini normal, SQL menggunakan `IF NOT EXISTS`.

### **Issue: "Permission denied" error**

**Solution:** Pastikan menggunakan Service Role Key, bukan Anon Key.

### **Issue: API returns 401 Unauthorized**

**Solution:** Pastikan sudah login dan memiliki valid session token.

### **Issue: Achievements tidak muncul di UI**

**Solution:**
1. Verifikasi database tables ada
2. Verifikasi API endpoints return data
3. Check browser console untuk errors
4. Verifikasi RLS policies tidak memblokir akses

---

## 📊 Database Verification Queries

Jalankan queries ini di Supabase SQL Editor untuk verify:

```sql
-- Check achievements table
SELECT COUNT(*) as total FROM achievements;
-- Expected: 16

-- Check achievements by category
SELECT category, COUNT(*) as count FROM achievements GROUP BY category;
-- Expected: battle (3), performance (3), milestone (3), special (7)

-- Check achievements by rarity
SELECT rarity, COUNT(*) as count FROM achievements GROUP BY rarity;
-- Expected: common (2), uncommon (6), rare (6), epic (2), legendary (0)

-- Check total points
SELECT SUM(points) as total_points FROM achievements;
-- Expected: 570

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'achievements';
-- Expected: 1 policy
```

---

## 🎯 Integration Points

### **1. Add to Root Layout**

File: `src/app/layout.tsx`

```tsx
import { AchievementNotification } from '@/components/achievements/AchievementNotification'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <AchievementNotification />
      </body>
    </html>
  )
}
```

### **2. Add to Squad Battle Results**

File: `src/app/squad/battle/[id]/results/page.tsx`

```tsx
import { checkAndUnlockAchievements } from '@/lib/achievement-checker'

export default async function ResultsPage() {
  // After battle completion
  await checkAndUnlockAchievements(userId, battleResult, session)
  
  return (...)
}
```

### **3. Add to Navigation**

File: `src/components/navigation/Navbar.tsx`

```tsx
<Link href="/achievements">
  🏆 Achievements
</Link>
```

---

## 📈 Monitoring

### **Check Achievement Unlocks**

```sql
SELECT 
  u.email,
  a.name,
  ua.unlocked_at
FROM user_achievements ua
JOIN auth.users u ON ua.user_id = u.id
JOIN achievements a ON ua.achievement_id = a.id
ORDER BY ua.unlocked_at DESC
LIMIT 10;
```

### **Check Notifications**

```sql
SELECT 
  u.email,
  a.name,
  an.read,
  an.created_at
FROM achievement_notifications an
JOIN auth.users u ON an.user_id = u.id
JOIN achievements a ON an.achievement_id = a.id
ORDER BY an.created_at DESC
LIMIT 10;
```

---

## 🎉 Success Indicators

✅ **Deployment Successful When:**
1. Database tables created in Supabase
2. 16 achievements visible in table editor
3. Local build completes without errors
4. API endpoints return 200 OK
5. Achievement components render correctly
6. Production deployment shows no errors
7. Users can view achievements page
8. Achievements unlock after battles

---

## 📝 Next Steps

After successful deployment:

1. **Test End-to-End:**
   - Create a squad battle
   - Complete the battle
   - Check if achievements unlock
   - Verify notifications appear

2. **Monitor Production:**
   - Check Vercel logs for errors
   - Monitor Supabase database usage
   - Track achievement unlock rates

3. **Gather Feedback:**
   - Ask users about achievement system
   - Collect feedback on UI/UX
   - Plan future enhancements

4. **Future Enhancements:**
   - Add seasonal achievements
   - Implement achievement leaderboards
   - Add cosmetic rewards
   - Create achievement hunting events

---

**🎯 Achievement System Deployment Complete!** 🚀

**Deployment Date:** December 12, 2025
**Status:** Ready for Production
**Quality:** Production-Ready ✅

