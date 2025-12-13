# Migration 6 - Final Fix

Panduan untuk fix dan re-run Migration 6 yang error.

---

## 🔴 ERRORS YANG ANDA ALAMI

```
ERROR: 42P01: relation "user_leaderboard" does not exist
ERROR: 42P01: relation "analytics_achievements" does not exist
```

**Penyebab:** File migration mencoba membuat index pada tabel yang tidak ada.

---

## ✅ SOLUSI

File migration sudah di-fix (2x). Sekarang Anda perlu re-run migration 6 dengan file yang sudah diperbaiki.

---

## 🚀 LANGKAH-LANGKAH

### Step 1: Pull Latest Changes

```bash
cd kognisia-app-dev
git pull origin main
```

Ini akan download file migration yang sudah di-fix.

---

### Step 2: Buka Supabase SQL Editor

1. Buka https://supabase.com/dashboard
2. Pilih project `kognisia-dev`
3. Klik "SQL Editor" di sidebar
4. Klik "New Query"

---

### Step 3: Copy File Migration yang Sudah Di-Fix

1. Buka file: `database/migrations/create_performance_indexes.sql`
2. Copy semua isi file
3. Paste di SQL Editor
4. Klik "Run"
5. Tunggu sampai selesai (lihat "Success" notification)

---

### Step 4: Verify

Setelah migration selesai, verifikasi:

1. Klik "Table Editor" di sidebar
2. Cek tabel-tabel masih ada (tidak ada yang hilang)
3. Semua 6 migrations sudah berhasil

---

## 📝 WHAT WAS FIXED

File migration `create_performance_indexes.sql` sudah di-fix 2x:

**Fix 1 - Dihapus:**
- ❌ Index untuk `user_leaderboard` (table tidak ada)
- ❌ Index untuk `daily_streaks` (table tidak ada)
- ❌ Index untuk `seasonal_leaderboard` (table tidak ada)
- ❌ Index untuk `user_profile_customization` (table tidak ada)
- ❌ Materialized views (terlalu kompleks)

**Fix 2 - Diperbaiki:**
- ❌ Index untuk `analytics_achievements` (table tidak ada)
- ❌ Index untuk `analytics_engagement` (table tidak ada)
- ✅ Diganti dengan tabel yang sebenarnya ada:
  - `user_engagement_metrics`
  - `achievement_unlock_stats`
  - `seasonal_performance_stats`

**Tetap ada (sudah benar):**
- ✅ Index untuk `achievements`
- ✅ Index untuk `user_achievements`
- ✅ Index untuk `seasonal_achievements`
- ✅ Index untuk `cosmetics`
- ✅ Index untuk `events`
- ✅ Index untuk `analytics_events`

---

## ✅ CHECKLIST

- [ ] Sudah pull latest changes (`git pull origin main`)
- [ ] Sudah buka Supabase SQL Editor
- [ ] Sudah copy file `create_performance_indexes.sql` yang sudah di-fix
- [ ] Sudah paste di SQL Editor
- [ ] Sudah klik "Run"
- [ ] Sudah lihat "Success" notification
- [ ] Sudah verify tabel-tabel di Table Editor

---

## 🎉 NEXT STEPS

Setelah migration 6 berhasil:

1. ✅ Semua 6 migrations sudah selesai
2. ✅ Database sudah siap
3. ✅ Update `.env.local` dengan Supabase credentials
4. ✅ Run `npm run dev`
5. ✅ Buka http://localhost:3000
6. ✅ Mulai development!

---

## 📚 RELATED GUIDES

- [MIGRATION_USING_SQL_EDITOR.md](./MIGRATION_USING_SQL_EDITOR.md) - Panduan lengkap SQL Editor
- [FIX_YOUR_MIGRATION_ERROR.md](./FIX_YOUR_MIGRATION_ERROR.md) - Fix untuk error pertama

---

**Status**: ✅ Fixed & Ready
**Time**: ~2 minutes
**Git Commits**: 
- `20e1400` - fix: remove non-existent table references
- `7061a45` - docs: add guide for migration 6 fix
- `bf38cf7` - fix: correct analytics table references

**Last Updated**: December 13, 2025
