# 🚨 JALANKAN MIGRATION INI SEKARANG!

## Error yang Anda alami:
```
Could not find the 'max_members' column of 'squads' in the schema cache
```

## Solusi: Jalankan Migration (2 menit)

---

## 📍 LANGKAH 1: Buka File Migration

File ada di:
```
kognisia-app/database/migrations/005_create_squad_battle_tables.sql
```

**Buka file ini dan COPY SEMUA isinya** (Cmd+A / Ctrl+A, lalu Cmd+C / Ctrl+C)

---

## 📍 LANGKAH 2: Buka Supabase SQL Editor

1. Buka: https://supabase.com/dashboard
2. Pilih project Kognisia
3. Klik **"SQL Editor"** di sidebar kiri
4. Klik **"New Query"**

---

## 📍 LANGKAH 3: Paste & Run

1. **PASTE** seluruh isi file migration (Cmd+V / Ctrl+V)
2. Klik tombol **"RUN"** (atau tekan Cmd+Enter / Ctrl+Enter)
3. Tunggu 5-10 detik

---

## 📍 LANGKAH 4: Verify Success

Anda akan melihat output:
```
✅ Migration 005 completed successfully!
```

---

## 📍 LANGKAH 5: Test Squad Battle

1. Refresh halaman aplikasi
2. Coba create squad lagi
3. Seharusnya berhasil! 🎉

---

## ⚠️ PENTING!

**Squad Battle TIDAK AKAN BERFUNGSI** sampai migration ini dijalankan!

Migration ini membuat:
- 5 tables baru (squads, squad_members, dll)
- 1 function (generate_invite_code)
- RLS policies

---

## 🆘 Butuh Bantuan?

Jika ada error saat run migration:
1. Screenshot error message
2. Check apakah Anda login sebagai owner project
3. Pastikan koneksi internet stabil

---

**Setelah migration selesai, Squad Battle siap digunakan!** 🚀
