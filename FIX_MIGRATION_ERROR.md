# 🔧 Fix Migration Error

## Error yang Terjadi:
```
Failed to run sql query: ERROR: 42703: column "is_active" does not exist
```

## Root Cause:
Ada table yang partially created sebelumnya, menyebabkan conflict.

---

## ✅ SOLUSI: Gunakan Migration SAFE Version

### Step 1: Gunakan File Migration Baru

**File baru (SAFE):**
```
kognisia-app/database/migrations/005_create_squad_battle_tables_SAFE.sql
```

File ini akan:
- ✅ Drop existing tables terlebih dahulu (jika ada)
- ✅ Create fresh tables tanpa conflict
- ✅ Tidak ada error "column does not exist"

### Step 2: Copy File SAFE

1. Buka file: `005_create_squad_battle_tables_SAFE.sql`
2. **Copy SEMUA isinya** (Cmd+A / Ctrl+A, lalu Cmd+C / Ctrl+C)

### Step 3: Paste & Run di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Klik **"SQL Editor"**
3. Klik **"New Query"**
4. **Paste** seluruh isi file (Cmd+V / Ctrl+V)
5. Klik **"RUN"** (atau Cmd+Enter / Ctrl+Enter)

### Step 4: Verify Success

Anda akan melihat:
```
✅ Migration 005 completed successfully!
Created tables: squads, squad_members, squad_battles, squad_battle_participants, squad_battle_questions
Created helper function: generate_invite_code()
Enabled RLS policies for all Squad Battle tables
Ready for Squad Battle feature implementation!
```

### Step 5: Test Squad Battle

1. Refresh halaman aplikasi
2. Coba create squad
3. Seharusnya berhasil! 🎉

---

## 🔍 Apa Bedanya dengan File Lama?

### File Lama (005_create_squad_battle_tables.sql):
- Menggunakan `CREATE TABLE IF NOT EXISTS`
- Bisa conflict jika table partially created

### File Baru (005_create_squad_battle_tables_SAFE.sql):
- **DROP TABLE IF EXISTS** terlebih dahulu
- Fresh start, no conflicts
- Lebih aman untuk development

---

## ⚠️ PENTING!

**File SAFE akan menghapus existing data di tables Squad Battle (jika ada).**

Ini OK untuk development karena:
- Squad Battle baru pertama kali dijalankan
- Belum ada data production
- Fresh start lebih baik

---

## 🆘 Jika Masih Error

1. Screenshot error message lengkap
2. Check apakah table `users` sudah ada (dependency)
3. Check apakah table `question_bank` sudah ada (dependency)
4. Pastikan login sebagai owner/admin project

---

## ✅ Checklist

- [ ] Buka file `005_create_squad_battle_tables_SAFE.sql`
- [ ] Copy semua isinya
- [ ] Buka Supabase SQL Editor
- [ ] Paste & Run
- [ ] Lihat success message
- [ ] Refresh aplikasi
- [ ] Test create squad
- [ ] Squad Battle works! 🎉

---

**Setelah migration berhasil, Squad Battle siap digunakan!** 🚀
