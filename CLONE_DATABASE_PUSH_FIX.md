# Clone Database - Push Not Working Fix

Solusi untuk ketika pull berhasil tapi tabel di development tidak berubah.

---

## 🔴 MASALAH YANG ANDA ALAMI

```
Semua proses jalan lancar, tapi tabel di development tidak berubah, masih beda dengan tabel dari sumber.
```

**Penyebab:**
- Pull berhasil (schema ter-download)
- Tapi push tidak bekerja (schema tidak ter-upload ke development)
- Atau push berhasil tapi tidak ada perubahan

---

## ✅ SOLUSI: Ada 3 Langkah

---

## STEP 1: Verify Pull Berhasil

Cek apakah migrations sudah ter-download:

```bash
ls -la supabase/migrations/
```

**Output yang diharapkan:**
```
total 120
-rw-r--r--  1 user  staff  2048 Dec 13 10:00 20251212032215_create_achievements_tables.sql
-rw-r--r--  1 user  staff  1024 Dec 13 10:00 20251212032216_create_seasonal_achievements.sql
... (lebih banyak files)
```

**Jika tidak ada files:**
- Pull tidak berhasil
- Coba lagi: `supabase db pull --skip-shadow`

---

## STEP 2: Check Development Project Link

Verifikasi Anda sudah link ke development project yang benar:

```bash
supabase projects list
```

**Output yang diharapkan:**
```
Linked project: kognisia-dev-2 (zyxwvutsrqponmlk)
```

**Jika project ID salah:**
- Link ulang ke development project yang benar
- `supabase link --project-ref YOUR_CORRECT_DEV_PROJECT_ID`

---

## STEP 3: Push dengan Force

Coba push dengan flag `--force-skip-checks`:

```bash
supabase db push --force-skip-checks
```

**Apa yang terjadi:**
- Force push semua migrations
- Skip validation checks
- Create/update semua tables

**Output yang diharapkan:**
```
Pushing schema to remote...
Uploaded schema to remote
```

---

## STEP 4: Verify di Supabase Dashboard

1. Buka https://supabase.com/dashboard
2. Pilih project development
3. Klik "Table Editor"
4. Cek apakah tabel sudah berubah

**Jika tabel sudah berubah:**
- ✅ Berhasil!

**Jika tabel masih sama:**
- Lanjut ke STEP 5

---

## STEP 5: Reset & Push Ulang (Jika Perlu)

Jika push masih tidak bekerja, reset development database:

```bash
# 1. Backup migrations
cp -r supabase/migrations supabase/migrations.backup

# 2. Reset development database
supabase db reset

# 3. Push schema
supabase db push

# 4. Verify di dashboard
```

**Catatan:** Ini akan menghapus semua data di development!

---

## 📋 COMPLETE WORKFLOW (Jika Tabel Tidak Berubah)

```bash
# 1. Verify pull berhasil
ls -la supabase/migrations/

# 2. Check development project link
supabase projects list

# 3. Push dengan force
supabase db push --force-skip-checks

# 4. Verify di dashboard
# Buka https://supabase.com/dashboard → Table Editor

# Jika masih tidak berubah:

# 5. Reset & push ulang
supabase db reset
supabase db push

# 6. Verify lagi di dashboard
```

---

## 🎯 QUICK DIAGNOSIS

Jalankan commands ini untuk diagnose masalah:

```bash
# 1. Cek migrations ter-download
ls -la supabase/migrations/ | wc -l

# 2. Cek project link
supabase projects list

# 3. Cek status
supabase status

# 4. Cek migration list
supabase migration list
```

---

## 📝 COPY-PASTE COMMANDS (Untuk Fix)

```bash
# 1. Verify pull
ls -la supabase/migrations/

# 2. Check link
supabase projects list

# 3. Push dengan force
supabase db push --force-skip-checks

# Jika masih tidak berubah:

# 4. Reset & push
supabase db reset
supabase db push

# Done! ✅
```

---

## 🆘 TROUBLESHOOTING

### Error: "No migrations to push"

**Penyebab:** Migrations tidak ter-download

**Solusi:**
```bash
# Pull lagi
supabase db pull --skip-shadow

# Cek migrations
ls -la supabase/migrations/

# Push
supabase db push
```

### Error: "Permission denied"

**Penyebab:** Tidak punya permission ke development project

**Solusi:**
1. Pastikan Anda adalah owner development project
2. Atau gunakan service role key
3. Cek di Supabase Settings → Members

### Error: "Connection refused"

**Penyebab:** Development project tidak aktif

**Solusi:**
1. Buka Supabase Dashboard
2. Cek development project masih aktif
3. Coba link ulang: `supabase link --project-ref YOUR_DEV_PROJECT_ID`

### Tabel masih tidak berubah setelah push

**Penyebab:** Push tidak benar-benar ter-execute

**Solusi:**
```bash
# Reset database
supabase db reset

# Push ulang
supabase db push

# Verify di dashboard
```

---

## 💡 TIPS

1. **Verify pull dulu** - Pastikan migrations ter-download
2. **Check project link** - Pastikan link ke development project yang benar
3. **Gunakan --force-skip-checks** - Jika push normal tidak bekerja
4. **Reset jika perlu** - Jika push masih tidak bekerja
5. **Verify di dashboard** - Selalu cek di Supabase Dashboard

---

## 🎯 RECOMMENDED WORKFLOW

```
1. Pull schema dari production
   supabase db pull --skip-shadow

2. Verify migrations ter-download
   ls -la supabase/migrations/

3. Check development project link
   supabase projects list

4. Push ke development
   supabase db push --force-skip-checks

5. Verify di Supabase Dashboard
   https://supabase.com/dashboard → Table Editor

6. Jika tidak berubah, reset & push ulang
   supabase db reset
   supabase db push
```

---

## 📚 REFERENCES

- [Supabase CLI Push](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Supabase CLI Reset](https://supabase.com/docs/reference/cli/supabase-db-reset)
- [Supabase CLI Status](https://supabase.com/docs/reference/cli/supabase-status)

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Time**: 5-10 minutes
**Last Updated**: December 13, 2025

**IKUTI WORKFLOW DI ATAS!** 🚀
