# ⚠️ DATABASE MIGRATION REQUIRED!

## Error: "Could not find the 'max_members' column of 'squads' in the schema cache"

### Root Cause:
Squad Battle tables belum dibuat di database. Migration file belum dijalankan.

---

## 🚨 LANGKAH WAJIB - Jalankan Migration Sekarang!

### Step 1: Buka Supabase Dashboard
1. Buka browser
2. Go to: https://supabase.com/dashboard
3. Login dengan akun Anda
4. Pilih project Kognisia

### Step 2: Buka SQL Editor
1. Di sidebar kiri, klik **"SQL Editor"**
2. Atau langsung ke: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

### Step 3: Copy Migration File
1. Buka file: `kognisia-app/database/migrations/005_create_squad_battle_tables.sql`
2. **Copy SELURUH isi file** (dari baris pertama sampai terakhir)

### Step 4: Paste & Run
1. Di SQL Editor, paste seluruh isi file
2. Klik tombol **"Run"** (atau tekan Ctrl+Enter / Cmd+Enter)
3. Tunggu sampai selesai (sekitar 5-10 detik)

### Step 5: Verify Success
Anda akan melihat output seperti ini:
```
✅ Migration 005 completed successfully!
Created tables: squads, squad_members, squad_battles, squad_battle_participants, squad_battle_questions
Created helper function: generate_invite_code()
Enabled RLS policies for all Squad Battle tables
Ready for Squad Battle feature implementation!
```

---

## 📋 Apa yang Akan Dibuat?

Migration ini akan membuat:

### 5 Tables:
1. **squads** - Squad information
2. **squad_members** - Squad membership
3. **squad_battles** - Battle sessions
4. **squad_battle_participants** - Participant scores
5. **squad_battle_questions** - Battle questions

### 1 Function:
- **generate_invite_code()** - Generate unique 6-char invite code

### RLS Policies:
- Row Level Security untuk semua tables
- Users hanya bisa akses squad mereka sendiri

---

## ⏱️ Estimasi Waktu: 2 menit

1. Copy file: 30 detik
2. Paste & Run: 10 detik
3. Verify: 20 detik
4. Test create squad: 1 menit

---

## 🎯 Setelah Migration Berhasil

Anda bisa:
- ✅ Create squad
- ✅ Join squad
- ✅ Start battle
- ✅ View leaderboard
- ✅ Semua fitur Squad Battle

---

## 🆘 Troubleshooting

### Jika ada error "permission denied":
1. Pastikan Anda login sebagai owner/admin project
2. Atau gunakan Service Role key (Settings → API)

### Jika ada error "table already exists":
- Itu normal, migration akan skip table yang sudah ada
- Lihat output untuk konfirmasi

### Jika masih error:
1. Check error message di SQL Editor
2. Screenshot error
3. Share dengan developer

---

## 📝 Quick Copy-Paste

**File location:**
```
kognisia-app/database/migrations/005_create_squad_battle_tables.sql
```

**Supabase SQL Editor:**
```
Dashboard → SQL Editor → New Query → Paste → Run
```

---

## ✅ Checklist

- [ ] Buka Supabase Dashboard
- [ ] Buka SQL Editor
- [ ] Copy migration file
- [ ] Paste di SQL Editor
- [ ] Klik Run
- [ ] Lihat success message
- [ ] Test create squad
- [ ] Squad Battle works! 🎉

---

**IMPORTANT:** Migration ini HARUS dijalankan sebelum Squad Battle bisa digunakan!

Setelah migration selesai, refresh halaman dan coba create squad lagi.
