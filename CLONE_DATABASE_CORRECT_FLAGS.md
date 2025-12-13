# Clone Database - Correct Flags

Solusi dengan flag yang benar untuk Supabase CLI.

---

## 🔴 ERROR YANG ANDA ALAMI

```
unknown flag: --force-skip-checks
```

**Penyebab:** Flag `--force-skip-checks` tidak ada di versi Supabase CLI Anda.

---

## ✅ SOLUSI: Gunakan Flag yang Benar

---

## OPSI 1: Push dengan --include-all (RECOMMENDED)

```bash
supabase db push --include-all
```

**Apa yang terjadi:**
- Push semua migrations
- Include migrations tidak ada di remote history
- Create/update semua tables

---

## OPSI 2: Push Normal (Paling Sederhana)

```bash
supabase db push
```

**Apa yang terjadi:**
- Push migrations yang belum ada di remote
- Create/update tables

---

## OPSI 3: Push dengan Dry Run (Untuk Test)

```bash
supabase db push --dry-run
```

**Apa yang terjadi:**
- Lihat migrations yang akan di-apply
- Tidak benar-benar apply
- Gunakan untuk verify sebelum push

---

## 📋 COMPLETE WORKFLOW (Dengan Flag yang Benar)

```bash
# 1. Login
supabase login

# 2. Masuk folder project
cd kognisia-app-dev

# 3. Link production project
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull schema (tanpa docker)
supabase db pull --skip-shadow

# 5. Link development project
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push schema (GUNAKAN INI!)
supabase db push --include-all

# 7. Verify di dashboard
# Buka https://supabase.com/dashboard → Table Editor

# Done! ✅
```

---

## 📝 COPY-PASTE COMMANDS (Dengan Flag yang Benar)

```bash
# 1. Login
supabase login

# 2. Masuk folder project
cd kognisia-app-dev

# 3. Link production (ganti YOUR_PRODUCTION_PROJECT_ID)
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull schema (tanpa docker)
supabase db pull --skip-shadow

# 5. Link development (ganti YOUR_DEVELOPMENT_PROJECT_ID)
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push schema (GUNAKAN INI!)
supabase db push --include-all

# 7. Verify di dashboard
# Buka https://supabase.com/dashboard → Table Editor

# Done! ✅
```

---

## 🎯 AVAILABLE FLAGS

Berikut flags yang tersedia untuk `supabase db push`:

```
--db-url string          Pushes to database specified by connection string
--dry-run                Print migrations that would be applied (tidak apply)
--include-all            Include all migrations not found on remote history
--include-roles          Include custom roles from supabase/roles.sql
--include-seed           Include seed data from config
--linked                 Pushes to linked project (default true)
--local                  Pushes to local database
-p, --password string    Password to remote Postgres database
```

---

## 🎯 RECOMMENDED FLAGS

| Use Case | Command |
|----------|---------|
| Push semua migrations | `supabase db push --include-all` |
| Push normal | `supabase db push` |
| Test sebelum push | `supabase db push --dry-run` |
| Push dengan roles | `supabase db push --include-roles` |
| Push dengan seed data | `supabase db push --include-seed` |

---

## 📋 STEP-BY-STEP (Dengan Flag yang Benar)

### STEP 1: Verify Pull Berhasil

```bash
ls -la supabase/migrations/
```

### STEP 2: Check Development Project Link

```bash
supabase projects list
```

### STEP 3: Push dengan --include-all

```bash
supabase db push --include-all
```

**Output yang diharapkan:**
```
Pushing schema to remote...
Uploaded schema to remote
```

### STEP 4: Verify di Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Pilih project development
3. Klik "Table Editor"
4. Cek apakah tabel sudah berubah

---

## 🆘 TROUBLESHOOTING

### Error: "No migrations to push"

**Solusi:**
```bash
# Coba dengan --include-all
supabase db push --include-all
```

### Error: "Permission denied"

**Solusi:**
```bash
# Pastikan Anda adalah owner development project
# Atau gunakan service role key
```

### Tabel masih tidak berubah

**Solusi:**
```bash
# 1. Cek status
supabase status

# 2. Cek migration list
supabase migration list

# 3. Coba push lagi
supabase db push --include-all

# 4. Jika masih tidak berubah, reset
supabase db reset
supabase db push
```

---

## 💡 TIPS

1. **Gunakan --include-all** - Untuk push semua migrations
2. **Gunakan --dry-run** - Untuk test sebelum push
3. **Verify di dashboard** - Selalu cek hasil
4. **Jika tidak berubah** - Coba reset & push ulang
5. **Check flags** - Gunakan `supabase db push --help` untuk lihat flags

---

## 📚 REFERENCES

- [Supabase CLI Push](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Supabase CLI Flags](https://supabase.com/docs/reference/cli/supabase-db-push)

---

## ✅ NEXT STEPS

1. **Jalankan:** `supabase db push --include-all`
2. **Tunggu sampai selesai**
3. **Verify di dashboard**
4. **Jika berhasil:** Done! ✅
5. **Jika tidak:** Coba `supabase db reset` dan `supabase db push`

---

**Status**: ✅ Ready
**Difficulty**: Very Easy
**Time**: 2-3 minutes
**Last Updated**: December 13, 2025

**GUNAKAN --include-all FLAG!** 🚀
