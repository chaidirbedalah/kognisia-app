# Fix Migration History Error

Solusi untuk error "The remote database's migration history does not match local files".

---

## 🔴 ERROR YANG ANDA ALAMI

```
The remote database's migration history does not match local files in supabase/migrations directory.
Make sure your local git repo is up-to-date. If the error persists, try repairing the migration history table:
supabase migration repair --status applied 20251212032215
```

**Penyebab:** 
- Anda mengubah nama folder
- Migration history di remote (production) tidak match dengan local files
- Supabase CLI tidak bisa track migrations dengan benar

---

## ✅ SOLUSI: Ada 3 Opsi

---

## OPSI 1: Repair Migration History (RECOMMENDED - Paling Mudah)

Jalankan command yang disarankan oleh error message:

```bash
supabase migration repair --status applied 20251212032215
```

**Apa yang terjadi:**
- Repair migration history table
- Mark migration sebagai "applied"
- Sync local dengan remote

**Output yang diharapkan:**
```
Repaired migration history
```

**Setelah itu, coba lagi:**
```bash
supabase db pull
```

---

## OPSI 2: Reset & Pull Fresh (Jika Opsi 1 Tidak Bekerja)

Jika Opsi 1 tidak bekerja, gunakan opsi ini:

### Step 1: Backup migrations (jika ada)

```bash
# Backup folder migrations
cp -r supabase/migrations supabase/migrations.backup
```

### Step 2: Reset database

```bash
supabase db reset
```

**Apa yang terjadi:**
- Drop semua tables
- Reset migration history
- Recreate dari migrations

**Catatan:** Ini akan menghapus semua data di development!

### Step 3: Pull schema baru

```bash
supabase db pull
```

---

## OPSI 3: Manual Fix (Advanced)

Jika Opsi 1 & 2 tidak bekerja:

### Step 1: Check migration status

```bash
supabase migration list
```

### Step 2: View migration files

```bash
ls -la supabase/migrations/
```

### Step 3: Check remote migrations

```bash
supabase db remote-info
```

### Step 4: Manually sync

```bash
# Force push
supabase db push --force-skip-checks
```

**Catatan:** Gunakan dengan hati-hati!

---

## 🎯 RECOMMENDED WORKFLOW

### Untuk Kasus Anda (Mengubah Nama Folder):

```bash
# 1. Repair migration history (COBA DULU)
supabase migration repair --status applied 20251212032215

# 2. Coba pull lagi
supabase db pull

# Jika berhasil → Done! ✅
# Jika tidak berhasil → Lanjut ke Opsi 2
```

---

## 📋 STEP-BY-STEP UNTUK KASUS ANDA

### STEP 1: Repair Migration History

```bash
supabase migration repair --status applied 20251212032215
```

**Tunggu sampai selesai**

### STEP 2: Coba Pull Lagi

```bash
supabase db pull
```

**Jika berhasil:**
```
Pulling schema from remote...
Downloaded schema from remote
```

**Jika masih error, lanjut ke STEP 3**

### STEP 3: Reset Database (Jika Perlu)

```bash
supabase db reset
```

**Tunggu sampai selesai**

### STEP 4: Pull Schema Baru

```bash
supabase db pull
```

### STEP 5: Verify

```bash
ls -la supabase/migrations/
```

**Seharusnya ada file migrations**

---

## 🆘 TROUBLESHOOTING

### Error: "Migration not found"

**Solusi:**
```bash
supabase migration list
# Lihat migration ID yang benar
# Ganti 20251212032215 dengan ID yang benar
supabase migration repair --status applied [CORRECT_ID]
```

### Error: "Permission denied"

**Solusi:**
```bash
sudo supabase migration repair --status applied 20251212032215
# Masukkan password Mac Anda
```

### Error: "Not linked to a project"

**Solusi:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
supabase migration repair --status applied 20251212032215
```

### Masih error setelah repair?

**Solusi:**
```bash
# Reset database
supabase db reset

# Pull schema baru
supabase db pull
```

---

## 📝 COPY-PASTE COMMANDS

```bash
# 1. Repair migration history (COBA DULU)
supabase migration repair --status applied 20251212032215

# 2. Coba pull lagi
supabase db pull

# Jika berhasil → Done! ✅

# Jika tidak berhasil, lanjut:

# 3. Backup migrations
cp -r supabase/migrations supabase/migrations.backup

# 4. Reset database
supabase db reset

# 5. Pull schema baru
supabase db pull

# Done! ✅
```

---

## 💡 TIPS

1. **Coba Opsi 1 dulu** - Paling mudah
2. **Jika tidak bekerja** - Gunakan Opsi 2
3. **Backup migrations** - Sebelum reset
4. **Jangan gunakan --force** - Kecuali terpaksa
5. **Commit ke git** - Setelah berhasil

---

## 🎯 QUICK ANSWER

**Q: Apa yang harus saya lakukan?**

A: Jalankan command ini:

```bash
supabase migration repair --status applied 20251212032215
```

Kemudian coba lagi:

```bash
supabase db pull
```

Jika masih error, jalankan:

```bash
supabase db reset
supabase db pull
```

---

## 📚 REFERENCES

- [Supabase Migration Docs](https://supabase.com/docs/guides/cli/local-development)
- [Migration Repair](https://supabase.com/docs/reference/cli/supabase-migration-repair)
- [Database Reset](https://supabase.com/docs/reference/cli/supabase-db-reset)

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Time**: 2-5 minutes
**Last Updated**: December 13, 2025

**JALANKAN COMMAND REPAIR DULU!** 🚀
