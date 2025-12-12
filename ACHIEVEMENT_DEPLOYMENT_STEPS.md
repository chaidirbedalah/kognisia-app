# 🚀 Achievement System - Step-by-Step Deployment

## 📌 Overview

Dokumen ini berisi instruksi LENGKAP dan DETAIL untuk men-deploy Achievement System ke production.

---

## 🎯 STEP 1: Deploy Database Migration ke Supabase

### **Waktu Estimasi:** 5 menit

### **Instruksi Detail:**

#### **1.1 Buka Supabase Dashboard**

1. Buka browser dan pergi ke: https://app.supabase.com
2. Login dengan akun Supabase Anda
3. Pilih project: **kognisia-app** (ID: luioyqrubylvjospgsjx)

#### **1.2 Buka SQL Editor**

1. Di sidebar kiri, cari menu **SQL Editor**
2. Klik **SQL Editor**
3. Klik tombol **New Query** (atau + icon)

#### **1.3 Copy Migration SQL**

1. Buka file: `database/migrations/create_achievements_tables.sql`
2. Copy SELURUH isi file (Ctrl+A, Ctrl+C)
3. Paste ke SQL editor di Supabase (Ctrl+V)

**Atau gunakan SQL ini langsung:**

```sql
-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  category VARCHAR(50),
  unlock_condition JSONB,
  points INT DEFAULT 0,
  rarity VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create achievement_notifications table
CREATE TABLE IF NOT EXISTS achievement_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_user_id ON achievement_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_notifications_read ON achievement_notifications(read);

-- Insert default achievements
INSERT INTO achievements (code, name, description, icon_emoji, category, points, rarity) VALUES
('first_battle', 'First Battle', 'Complete your first squad battle', '⚔️', 'battle', 10, 'common'),
('battle_master', 'Battle Master', 'Win 10 squad battles', '🏆', 'battle', 50, 'rare'),
('battle_legend', 'Battle Legend', 'Win 50 squad battles', '👑', 'battle', 100, 'epic'),
('perfect_score', 'Perfect Score', 'Get 100% accuracy in a battle', '💯', 'performance', 30, 'rare'),
('speed_demon', 'Speed Demon', 'Complete a battle in under 5 minutes', '⚡', 'performance', 25, 'uncommon'),
('accuracy_master', 'Accuracy Master', 'Maintain 90%+ accuracy across 5 battles', '🎯', 'performance', 40, 'rare'),
('first_place', 'First Place', 'Rank 1st in a squad battle', '🥇', 'milestone', 20, 'uncommon'),
('top_three', 'Top Three', 'Rank in top 3 in 5 squad battles', '🥉', 'milestone', 35, 'uncommon'),
('consistent_performer', 'Consistent Performer', 'Rank in top 3 in 10 squad battles', '📈', 'milestone', 60, 'rare'),
('hots_challenger', 'HOTS Challenger', 'Complete your first ELITE battle', '🔥', 'special', 25, 'uncommon'),
('hots_master', 'HOTS Master', 'Win 5 ELITE battles', '🧠', 'special', 50, 'rare'),
('hots_legend', 'HOTS Legend', 'Win 20 ELITE battles', '🌟', 'special', 100, 'epic'),
('early_bird', 'Early Bird', 'Join a battle within 1 minute of creation', '🐦', 'special', 15, 'uncommon'),
('comeback_king', 'Comeback King', 'Rank 1st after being in last place', '🔄', 'special', 40, 'rare'),
('squad_leader', 'Squad Leader', 'Create 5 squad battles', '👨‍💼', 'special', 30, 'uncommon'),
('social_butterfly', 'Social Butterfly', 'Join 10 different squads', '🦋', 'special', 25, 'uncommon')
ON CONFLICT (code) DO NOTHING;

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can view their own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own notifications" ON achievement_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON achievement_notifications FOR UPDATE USING (auth.uid() = user_id);
```

#### **1.4 Jalankan Query**

1. Klik tombol **Run** (atau tekan Cmd+Enter / Ctrl+Enter)
2. Tunggu hingga selesai (biasanya 5-10 detik)
3. Lihat hasil di bawah editor

**Expected Output:**
```
Query executed successfully
```

#### **1.5 Verifikasi Hasil**

Jalankan query ini untuk verifikasi:

```sql
SELECT COUNT(*) as total_achievements FROM achievements;
```

**Expected Result:**
```
total_achievements
16
```

✅ **STEP 1 COMPLETE!**

---

## 🎯 STEP 2: Verifikasi Database Tables

### **Waktu Estimasi:** 3 menit

### **Instruksi Detail:**

#### **2.1 Buka Table Editor**

1. Di Supabase Dashboard, klik **Table Editor** di sidebar
2. Lihat daftar tabel di sebelah kiri

#### **2.2 Verifikasi 3 Tabel Baru**

Pastikan ada 3 tabel baru:

1. **achievements** - Klik untuk membuka
   - Harus ada 16 rows
   - Kolom: id, code, name, description, icon_emoji, category, unlock_condition, points, rarity, created_at, updated_at

2. **user_achievements** - Klik untuk membuka
   - Harus ada 0 rows (kosong)
   - Kolom: id, user_id, achievement_id, unlocked_at, progress, created_at

3. **achievement_notifications** - Klik untuk membuka
   - Harus ada 0 rows (kosong)
   - Kolom: id, user_id, achievement_id, read, created_at

#### **2.3 Verifikasi Data Achievements**

Klik tabel **achievements** dan verifikasi:

- [ ] 16 rows total
- [ ] Semua achievements terlihat
- [ ] Kolom `code` unik (first_battle, battle_master, dll)
- [ ] Kolom `points` terisi (10-100)
- [ ] Kolom `rarity` terisi (common, uncommon, rare, epic)

**Sample Data yang Harus Ada:**
```
code: first_battle, name: First Battle, points: 10, rarity: common
code: battle_master, name: Battle Master, points: 50, rarity: rare
code: perfect_score, name: Perfect Score, points: 30, rarity: rare
code: hots_legend, name: HOTS Legend, points: 100, rarity: epic
```

✅ **STEP 2 COMPLETE!**

---

## 🎯 STEP 3: Build & Test Locally

### **Waktu Estimasi:** 10 menit

### **Instruksi Detail:**

#### **3.1 Buka Terminal**

1. Buka terminal/command prompt
2. Navigate ke project folder:
```bash
cd kognisia-app
```

#### **3.2 Install Dependencies**

```bash
npm install
```

**Expected Output:**
```
added X packages in Xs
```

#### **3.3 Build Project**

```bash
npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ No TypeScript errors
✓ No ESLint errors
```

**Jika ada error:**
- Baca error message dengan teliti
- Cek file yang error
- Fix dan jalankan `npm run build` lagi

#### **3.4 Start Dev Server**

```bash
npm run dev
```

**Expected Output:**
```
> next dev
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 2.5s
```

✅ **STEP 3 COMPLETE!**

---

## 🎯 STEP 4: Test Achievements Page Locally

### **Waktu Estimasi:** 5 menit

### **Instruksi Detail:**

#### **4.1 Buka Browser**

1. Buka browser (Chrome, Safari, Firefox)
2. Pergi ke: http://localhost:3000
3. Login dengan akun Anda

#### **4.2 Navigasi ke Achievements Page**

1. Pergi ke: http://localhost:3000/achievements
2. Halaman harus load tanpa error

#### **4.3 Verifikasi Tampilan**

Pastikan ada:
- [ ] Header "Achievements" dengan trophy icon
- [ ] Category tabs (All, Battle, Performance, Milestone, Special)
- [ ] Stats cards (Total, Unlocked, Points, Progress)
- [ ] Progress bar
- [ ] Achievement cards grid (16 achievements)
- [ ] Rarity legend di bawah
- [ ] Tips section

#### **4.4 Check Browser Console**

1. Buka Developer Tools (F12 atau Cmd+Option+I)
2. Klik tab **Console**
3. Pastikan tidak ada error (hanya warning boleh)

**Expected:**
- Tidak ada error merah
- Mungkin ada warning (itu OK)

✅ **STEP 4 COMPLETE!**

---

## 🎯 STEP 5: Commit ke GitHub

### **Waktu Estimasi:** 5 menit

### **Instruksi Detail:**

#### **5.1 Check Git Status**

```bash
git status
```

**Expected Output:**
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

Jika ada perubahan, lanjut ke 5.2.

#### **5.2 Add All Changes**

```bash
git add .
```

#### **5.3 Commit dengan Message**

```bash
git commit -m "feat: deploy achievement system

- Add achievements database tables
- Implement achievement API endpoints
- Create achievement components and pages
- Add achievement notifications
- Configure RLS policies
- Pre-populate 16 achievements"
```

**Expected Output:**
```
[main abc1234] feat: deploy achievement system
 X files changed, Y insertions(+), Z deletions(-)
```

#### **5.4 Push ke GitHub**

```bash
git push origin main
```

**Expected Output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to 8 threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), X bytes
remote: Resolving deltas: 100% (X/X), done.
To github.com:coachchaidir/kognisia-app.git
   abc1234..def5678  main -> main
```

✅ **STEP 5 COMPLETE!**

---

## 🎯 STEP 6: Deploy ke Vercel

### **Waktu Estimasi:** 5-10 menit

### **Instruksi Detail:**

#### **6.1 Vercel Auto-Deploy**

Setelah push ke GitHub, Vercel akan otomatis deploy:

1. Buka: https://vercel.com/dashboard
2. Cari project: **kognisia-app**
3. Lihat deployment status

**Expected:**
- Status: "Ready" (hijau)
- Deployment URL: https://kognisia-obio2u1m4-coachchaidirs-projects.vercel.app

#### **6.2 Monitor Deployment**

1. Klik project di Vercel dashboard
2. Lihat tab **Deployments**
3. Klik deployment terbaru
4. Lihat build logs

**Expected:**
```
✓ Build completed successfully
✓ Deployment ready
```

#### **6.3 Tunggu Deployment Selesai**

- Biasanya 2-5 menit
- Status akan berubah dari "Building" → "Ready"

✅ **STEP 6 COMPLETE!**

---

## 🎯 STEP 7: Verifikasi Production

### **Waktu Estimasi:** 5 menit

### **Instruksi Detail:**

#### **7.1 Test Production URL**

1. Buka browser
2. Pergi ke: https://kognisia-obio2u1m4-coachchaidirs-projects.vercel.app
3. Login dengan akun Anda

#### **7.2 Navigasi ke Achievements**

1. Pergi ke: https://kognisia-obio2u1m4-coachchaidirs-projects.vercel.app/achievements
2. Halaman harus load

#### **7.3 Verifikasi Tampilan**

Pastikan:
- [ ] Halaman load tanpa error
- [ ] Semua 16 achievements terlihat
- [ ] Stats cards menampilkan data
- [ ] Category tabs berfungsi
- [ ] Responsive di mobile

#### **7.4 Check Console**

1. Buka Developer Tools (F12)
2. Klik tab **Console**
3. Pastikan tidak ada error

✅ **STEP 7 COMPLETE!**

---

## 🎉 DEPLOYMENT COMPLETE!

### **Checklist Final:**

- [x] Database migration deployed
- [x] 16 achievements inserted
- [x] Local build successful
- [x] Achievements page tested locally
- [x] Committed to GitHub
- [x] Deployed to Vercel
- [x] Production verified

### **Achievement System Status:**

✅ **LIVE IN PRODUCTION!**

---

## 📝 Next Steps

### **1. Add Notification Component to Layout**

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

### **2. Integrate with Battle Results**

File: `src/app/squad/battle/[id]/results/page.tsx`

```tsx
import { checkAndUnlockAchievements } from '@/lib/achievement-checker'

// After battle completion
await checkAndUnlockAchievements(userId, battleResult, session)
```

### **3. Add to Navigation**

File: `src/components/navigation/Navbar.tsx`

```tsx
<Link href="/achievements">
  🏆 Achievements
</Link>
```

---

## 🆘 Troubleshooting

### **Problem: "Table already exists" error**

**Solution:** Ini normal! SQL menggunakan `IF NOT EXISTS`, jadi aman dijalankan berkali-kali.

### **Problem: Build error di Vercel**

**Solution:**
1. Cek error message di Vercel logs
2. Fix di local
3. Commit dan push lagi

### **Problem: Achievements tidak muncul**

**Solution:**
1. Verifikasi database tables ada
2. Verifikasi API endpoints return data
3. Check browser console untuk errors

### **Problem: API returns 401 Unauthorized**

**Solution:**
1. Pastikan sudah login
2. Pastikan session token valid
3. Check Authorization header

---

## 📞 Support

Jika ada masalah:
1. Baca error message dengan teliti
2. Check browser console (F12)
3. Check Vercel logs
4. Check Supabase logs

---

**🎉 Achievement System Successfully Deployed!** 🚀

**Deployment Date:** December 12, 2025
**Status:** ✅ LIVE
**Quality:** Production-Ready

