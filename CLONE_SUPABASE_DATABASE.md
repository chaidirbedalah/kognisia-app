# Clone Supabase Database - Panduan Lengkap

Panduan untuk clone semua tabel dari Supabase production ke development dengan cara termudah.

---

## 🎯 OPSI TERBAIK: Gunakan Supabase CLI (Paling Mudah)

**Waktu:** ~5 menit
**Kesulitan:** Easy
**Hasil:** Semua tabel + schema + data (optional)

---

## 📋 STEP 1: Install Supabase CLI

```bash
npm install -g supabase --force
```

---

## 🔑 STEP 2: Login ke Supabase

```bash
supabase login
```

Browser akan terbuka untuk login. Authorize akses.

---

## 🔗 STEP 3: Link Production Project

```bash
# Ganti YOUR_PROJECT_ID dengan project ID production Anda
supabase link --project-ref YOUR_PROJECT_ID
```

**Cara mendapatkan Project ID:**
1. Buka Supabase Dashboard
2. Pilih project production
3. Settings → General
4. Copy "Project ID"

---

## 💾 STEP 4: Pull Database Schema & Data

### Option A: Pull Schema SAJA (Recommended untuk development)

```bash
supabase db pull
```

Ini akan:
- ✅ Download semua table schemas
- ✅ Download semua migrations
- ✅ Simpan di folder `supabase/migrations/`
- ❌ TIDAK download data (lebih cepat)

### Option B: Pull Schema + Data

```bash
supabase db pull --include-data
```

Ini akan:
- ✅ Download semua table schemas
- ✅ Download semua data
- ✅ Simpan di folder `supabase/migrations/`
- ⚠️ Lebih lambat (tergantung ukuran data)

---

## 🗄️ STEP 5: Push ke Development Project

### 5.1: Link Development Project

```bash
# Ganti YOUR_DEV_PROJECT_ID dengan project ID development Anda
supabase link --project-ref YOUR_DEV_PROJECT_ID
```

### 5.2: Push Schema & Data

```bash
supabase db push
```

Ini akan:
- ✅ Push semua migrations
- ✅ Create semua tables
- ✅ Push data (jika ada)

---

## ✅ STEP 6: Verify

1. Buka Supabase Dashboard development project
2. Klik "Table Editor"
3. Verifikasi semua tabel sudah ada
4. Cek data sudah ter-copy (jika menggunakan --include-data)

---

## 🚀 QUICK REFERENCE

```bash
# 1. Install CLI
npm install -g supabase --force

# 2. Login
supabase login

# 3. Link production project
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull schema (recommended)
supabase db pull

# 5. Link development project
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push ke development
supabase db push
```

---

## 📊 ALTERNATIVE OPSI: Export/Import Manual

Jika CLI tidak bekerja, gunakan cara manual:

### Export dari Production

1. Buka Supabase Dashboard (production)
2. Klik "SQL Editor"
3. Klik "New Query"
4. Copy-paste query ini:

```sql
-- Export semua table definitions
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

5. Klik "Run"
6. Untuk setiap table, jalankan:

```sql
-- Export table structure
\d table_name

-- Export table data
SELECT * FROM table_name;
```

### Import ke Development

1. Buka Supabase Dashboard (development)
2. Klik "SQL Editor"
3. Klik "New Query"
4. Paste SQL dari export
5. Klik "Run"

**Catatan:** Cara ini lebih manual dan time-consuming.

---

## 🔄 ALTERNATIVE OPSI: Gunakan pg_dump (Advanced)

Jika Anda familiar dengan PostgreSQL:

```bash
# Export dari production
pg_dump -h [production-host] -U [user] -d [database] > backup.sql

# Import ke development
psql -h [development-host] -U [user] -d [database] < backup.sql
```

**Catatan:** Perlu credentials database.

---

## ⚠️ IMPORTANT NOTES

1. **Project ID vs Project URL:**
   - Project ID: `abcdefghijklmnop` (16 karakter)
   - Project URL: `https://abcdefghijklmnop.supabase.co`
   - Gunakan Project ID, bukan URL!

2. **Data Sensitivity:**
   - Jika ada data sensitif, gunakan `supabase db pull` (schema only)
   - Jangan pull data production ke development jika ada PII

3. **Migrations:**
   - Semua migrations akan tersimpan di `supabase/migrations/`
   - Commit ke git untuk version control

4. **Timing:**
   - Schema only: ~1-2 menit
   - Schema + data: ~5-10 menit (tergantung ukuran)

---

## 🆘 TROUBLESHOOTING

### Error: "Not linked to a project"

```bash
# Solution: Link project terlebih dahulu
supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Permission denied"

```bash
# Solution: Pastikan Anda adalah owner project
# Atau gunakan service role key
```

### Error: "Connection refused"

```bash
# Solution: Pastikan project ID benar
# Cek di Supabase Dashboard → Settings → General
```

### Migrations tidak ter-pull

```bash
# Solution: Pastikan sudah login
supabase login

# Cek status
supabase status
```

---

## 📋 CHECKLIST

- [ ] Supabase CLI installed (`npm install -g supabase --force`)
- [ ] Sudah login (`supabase login`)
- [ ] Production project ID didapat
- [ ] Linked ke production project (`supabase link --project-ref ...`)
- [ ] Schema di-pull (`supabase db pull`)
- [ ] Development project ID didapat
- [ ] Linked ke development project (`supabase link --project-ref ...`)
- [ ] Schema di-push (`supabase db push`)
- [ ] Verified di Supabase Dashboard

---

## 🎯 RECOMMENDED WORKFLOW

```
1. Production Project (Existing)
   ↓
2. supabase db pull (download schema)
   ↓
3. supabase/migrations/ (local files)
   ↓
4. git commit & push (version control)
   ↓
5. Development Project (New)
   ↓
6. supabase db push (upload schema)
   ↓
7. Verify di Supabase Dashboard
```

---

## 💡 TIPS

1. **Gunakan CLI** - Paling mudah dan reliable
2. **Pull schema only** - Lebih cepat, lebih aman
3. **Commit migrations** - Untuk version control
4. **Test di development** - Sebelum production
5. **Backup regularly** - Jangan lupa backup

---

## 🔗 USEFUL COMMANDS

```bash
# Check status
supabase status

# List projects
supabase projects list

# View migrations
supabase migration list

# Reset database
supabase db reset

# View logs
supabase functions list
```

---

## 📚 REFERENCES

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-pull)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development)
- [PostgreSQL Backup](https://www.postgresql.org/docs/current/backup.html)

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Time**: ~5 minutes
**Last Updated**: December 13, 2025

**GUNAKAN SUPABASE CLI - PALING MUDAH!** 🚀
