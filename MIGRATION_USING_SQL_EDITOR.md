# Database Migration - Using SQL Editor (Easiest Way)

Panduan untuk menjalankan migrations menggunakan Supabase SQL Editor (tanpa CLI).

---

## ✅ RECOMMENDED: Gunakan SQL Editor

Jika Anda mengalami masalah dengan CLI, gunakan SQL Editor - lebih mudah dan tidak perlu CLI!

---

## 📋 STEP 1: Buka Supabase SQL Editor

1. Buka https://supabase.com/dashboard
2. Pilih project `kognisia-dev`
3. Klik "SQL Editor" di sidebar kiri
4. Klik "New Query"

---

## 📝 STEP 2: Copy-Paste Migration Files

Anda perlu menjalankan 6 migration files dalam urutan ini:

### Migration 1: Create Achievements Tables

1. Buka file: `database/migrations/create_achievements_tables.sql`
2. Copy semua isi file
3. Paste di SQL Editor
4. Klik "Run"
5. Tunggu sampai selesai (lihat "Success" notification)

### Migration 2: Create Seasonal Achievements

1. Buka file: `database/migrations/create_seasonal_achievements.sql`
2. Copy semua isi file
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu sampai selesai

### Migration 3: Create Events System

1. Buka file: `database/migrations/create_events_system.sql`
2. Copy semua isi file
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu sampai selesai

### Migration 4: Create Cosmetics System

1. Buka file: `database/migrations/create_cosmetics_system.sql`
2. Copy semua isi file
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu sampai selesai

### Migration 5: Create Analytics Tables

1. Buka file: `database/migrations/create_analytics_tables.sql`
2. Copy semua isi file
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu sampai selesai

### Migration 6: Create Performance Indexes

1. Buka file: `database/migrations/create_performance_indexes.sql`
2. Copy semua isi file
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu sampai selesai

---

## ✅ STEP 3: Verify Migrations

Setelah semua migrations selesai, verifikasi tabel-tabel sudah ada:

1. Klik "Table Editor" di sidebar
2. Cek tabel-tabel berikut sudah ada:
   - ✅ `achievements`
   - ✅ `seasonal_achievements`
   - ✅ `events`
   - ✅ `event_challenges`
   - ✅ `cosmetics`
   - ✅ `user_cosmetics`
   - ✅ `analytics_events`
   - ✅ `analytics_achievements`
   - ✅ `analytics_engagement`
   - ✅ `analytics_trends`

---

## 🎯 STEP-BY-STEP VISUAL GUIDE

### Buka SQL Editor
```
Supabase Dashboard
  ↓
Pilih project "kognisia-dev"
  ↓
Klik "SQL Editor" (sidebar kiri)
  ↓
Klik "New Query"
```

### Copy-Paste & Run
```
1. Buka file migration di text editor
2. Copy semua isi (Ctrl+A, Ctrl+C)
3. Paste di SQL Editor (Ctrl+V)
4. Klik "Run" button
5. Tunggu "Success" notification
6. Ulangi untuk migration berikutnya
```

### Verify
```
Supabase Dashboard
  ↓
Klik "Table Editor"
  ↓
Cek tabel-tabel sudah ada
```

---

## 📂 MIGRATION FILES LOCATION

Semua migration files ada di folder:
```
kognisia-app-dev/database/migrations/
```

Files:
1. `create_achievements_tables.sql`
2. `create_seasonal_achievements.sql`
3. `create_events_system.sql`
4. `create_cosmetics_system.sql`
5. `create_analytics_tables.sql`
6. `create_performance_indexes.sql`

---

## 🆘 TROUBLESHOOTING

### Error: "relation already exists"

**Penyebab:** Tabel sudah ada dari migration sebelumnya.

**Solusi:** Abaikan error ini, lanjut ke migration berikutnya.

---

### Error: "syntax error"

**Penyebab:** Ada kesalahan saat copy-paste.

**Solusi:**
1. Baca error message dengan teliti
2. Cek file migration di text editor
3. Copy-paste lagi dengan hati-hati
4. Pastikan semua isi file ter-copy

---

### Error: "permission denied"

**Penyebab:** Akun Supabase tidak punya permission.

**Solusi:**
1. Pastikan Anda login dengan akun yang benar
2. Pastikan Anda adalah owner project
3. Cek di Supabase Settings → Members

---

## ✅ CHECKLIST

- [ ] Sudah buka Supabase Dashboard
- [ ] Sudah pilih project `kognisia-dev`
- [ ] Sudah buka SQL Editor
- [ ] Sudah run Migration 1 (create_achievements_tables.sql)
- [ ] Sudah run Migration 2 (create_seasonal_achievements.sql)
- [ ] Sudah run Migration 3 (create_events_system.sql)
- [ ] Sudah run Migration 4 (create_cosmetics_system.sql)
- [ ] Sudah run Migration 5 (create_analytics_tables.sql)
- [ ] Sudah run Migration 6 (create_performance_indexes.sql)
- [ ] Sudah verify tabel-tabel di Table Editor

---

## 📝 COMPLETE WORKFLOW

```
1. Clone repository
   git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
   cd kognisia-app-dev

2. Install dependencies
   npm install

3. Buka Supabase Dashboard
   https://supabase.com/dashboard

4. Pilih project kognisia-dev

5. Buka SQL Editor
   Klik "SQL Editor" di sidebar

6. Run 6 migrations (satu per satu)
   - Copy file migration
   - Paste di SQL Editor
   - Klik "Run"
   - Tunggu selesai
   - Ulangi untuk migration berikutnya

7. Verify tabel-tabel
   Klik "Table Editor" → Cek tabel-tabel

8. Update .env.local
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...

9. Run local dev
   npm run dev

10. Buka http://localhost:3000
```

---

## 💡 TIPS

1. **Jangan skip migrations** - Jalankan semua 6 migrations dalam urutan
2. **Tunggu sampai selesai** - Jangan close tab sampai ada "Success" notification
3. **Copy-paste dengan hati-hati** - Pastikan semua isi file ter-copy
4. **Verify setelah selesai** - Cek tabel-tabel di Table Editor
5. **Jika ada error** - Baca error message, cek file, coba lagi

---

## 🎯 QUICK REFERENCE

| Step | Action | Time |
|------|--------|------|
| 1 | Buka SQL Editor | 1 min |
| 2 | Run Migration 1 | 1 min |
| 3 | Run Migration 2 | 1 min |
| 4 | Run Migration 3 | 1 min |
| 5 | Run Migration 4 | 1 min |
| 6 | Run Migration 5 | 1 min |
| 7 | Run Migration 6 | 1 min |
| 8 | Verify tabel-tabel | 2 min |
| **TOTAL** | | **~10 min** |

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Last Updated**: December 13, 2025
