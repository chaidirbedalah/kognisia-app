# Fix Your Migration Error - Solusi untuk Error Anda

Panduan untuk fix error yang Anda alami saat menjalankan migrations.

---

## 🔴 ERROR YANG ANDA ALAMI

```
zsh: no matches found: [project-id]
failed to connect to postgres: failed to connect to `host=127.0.0.1 user=postgres database=postgres`
```

---

## ✅ SOLUSI: Gunakan SQL Editor (Lebih Mudah!)

Daripada menggunakan CLI yang rumit, gunakan SQL Editor di Supabase - lebih mudah dan tidak perlu CLI!

---

## 🚀 LANGKAH-LANGKAH PERBAIKAN

### Step 1: Buka Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Login dengan akun Anda
3. Pilih project `kognisia-dev`

---

### Step 2: Buka SQL Editor

1. Di sidebar kiri, klik "SQL Editor"
2. Klik "New Query"

---

### Step 3: Copy-Paste Migration Files

Anda perlu menjalankan 6 migration files. Untuk setiap file:

1. **Buka file migration** di folder `database/migrations/`
2. **Copy semua isi** (Ctrl+A, Ctrl+C)
3. **Paste di SQL Editor** (Ctrl+V)
4. **Klik "Run"** button
5. **Tunggu sampai selesai** (lihat "Success" notification)
6. **Ulangi untuk file berikutnya**

---

### Step 4: Migration Files (Dalam Urutan)

Jalankan migrations ini satu per satu:

#### 1️⃣ create_achievements_tables.sql
```
File: database/migrations/create_achievements_tables.sql
Action: Copy → Paste → Run
```

#### 2️⃣ create_seasonal_achievements.sql
```
File: database/migrations/create_seasonal_achievements.sql
Action: Copy → Paste → Run
```

#### 3️⃣ create_events_system.sql
```
File: database/migrations/create_events_system.sql
Action: Copy → Paste → Run
```

#### 4️⃣ create_cosmetics_system.sql
```
File: database/migrations/create_cosmetics_system.sql
Action: Copy → Paste → Run
```

#### 5️⃣ create_analytics_tables.sql
```
File: database/migrations/create_analytics_tables.sql
Action: Copy → Paste → Run
```

#### 6️⃣ create_performance_indexes.sql
```
File: database/migrations/create_performance_indexes.sql
Action: Copy → Paste → Run
```

---

### Step 5: Verify Migrations

Setelah semua migrations selesai:

1. Klik "Table Editor" di sidebar
2. Verifikasi tabel-tabel sudah ada:
   - ✅ achievements
   - ✅ seasonal_achievements
   - ✅ events
   - ✅ event_challenges
   - ✅ cosmetics
   - ✅ user_cosmetics
   - ✅ analytics_events
   - ✅ analytics_achievements

---

## 📝 VISUAL GUIDE

```
Supabase Dashboard
    ↓
Pilih project "kognisia-dev"
    ↓
Klik "SQL Editor" (sidebar)
    ↓
Klik "New Query"
    ↓
Copy file migration (database/migrations/...)
    ↓
Paste di SQL Editor
    ↓
Klik "Run"
    ↓
Tunggu "Success" notification
    ↓
Ulangi untuk 5 file migration lainnya
    ↓
Klik "Table Editor"
    ↓
Verify tabel-tabel sudah ada
```

---

## 🎯 QUICK STEPS

```bash
# 1. Buka Supabase Dashboard
https://supabase.com/dashboard

# 2. Pilih project kognisia-dev

# 3. Klik SQL Editor

# 4. Untuk setiap migration file:
#    - Copy file dari database/migrations/
#    - Paste di SQL Editor
#    - Klik Run
#    - Tunggu selesai

# 5. Verify di Table Editor

# 6. Lanjut ke step berikutnya
```

---

## ❌ JANGAN LAKUKAN INI

- ❌ Jangan copy-paste `[project-id]` - ganti dengan project ID yang sebenarnya
- ❌ Jangan skip migrations - jalankan semua 6 files
- ❌ Jangan close tab sebelum ada "Success" notification
- ❌ Jangan jalankan migrations di urutan yang salah

---

## ✅ CHECKLIST

- [ ] Sudah buka Supabase Dashboard
- [ ] Sudah pilih project kognisia-dev
- [ ] Sudah buka SQL Editor
- [ ] Sudah run Migration 1 (create_achievements_tables.sql)
- [ ] Sudah run Migration 2 (create_seasonal_achievements.sql)
- [ ] Sudah run Migration 3 (create_events_system.sql)
- [ ] Sudah run Migration 4 (create_cosmetics_system.sql)
- [ ] Sudah run Migration 5 (create_analytics_tables.sql)
- [ ] Sudah run Migration 6 (create_performance_indexes.sql)
- [ ] Sudah verify tabel-tabel di Table Editor

---

## 🆘 JIKA MASIH ADA ERROR

### Error: "relation already exists"
- Abaikan, lanjut ke migration berikutnya

### Error: "syntax error"
- Baca error message
- Cek file migration di text editor
- Copy-paste lagi dengan hati-hati

### Error: "permission denied"
- Pastikan Anda login dengan akun yang benar
- Pastikan Anda adalah owner project

---

## 📚 FULL DOCUMENTATION

Untuk dokumentasi lengkap, baca:
- [MIGRATION_USING_SQL_EDITOR.md](./MIGRATION_USING_SQL_EDITOR.md) - Panduan lengkap SQL Editor
- [MIGRATION_STEP_BY_STEP.md](./MIGRATION_STEP_BY_STEP.md) - Panduan CLI (jika ingin coba lagi)

---

## 🎉 NEXT STEPS

Setelah migrations selesai:

1. Update `.env.local` dengan Supabase credentials
2. Run `npm run dev`
3. Buka http://localhost:3000
4. Mulai development!

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Time**: ~10 minutes
**Last Updated**: December 13, 2025
