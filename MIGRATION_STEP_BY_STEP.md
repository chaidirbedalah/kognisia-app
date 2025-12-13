# Database Migration - Step by Step

Panduan detail untuk menjalankan database migrations dengan benar.

---

## ⚠️ PENTING: Ganti [project-id] dengan Project ID Anda!

Jangan copy-paste `[project-id]` - ganti dengan project ID yang sebenarnya!

**Contoh:**
- ❌ SALAH: `supabase link --project-ref [project-id]`
- ✅ BENAR: `supabase link --project-ref abcdefghijklmnop`

---

## 📋 STEP 1: Dapatkan Project ID

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project `kognisia-dev` yang sudah dibuat
3. Klik "Settings" (gear icon) di sidebar
4. Klik "General"
5. Cari "Project ID" - copy project ID-nya
   - Format: `abcdefghijklmnop` (16 karakter)

**Contoh Project ID:**
```
abcdefghijklmnop
```

---

## 🔧 STEP 2: Fix Supabase Installation

Jika ada error `EEXIST`, gunakan `--force`:

```bash
npm install -g supabase --force
```

---

## 🔗 STEP 3: Link Project ke Supabase CLI

Ganti `YOUR_PROJECT_ID` dengan project ID yang sudah di-copy:

```bash
# CONTOH (ganti YOUR_PROJECT_ID):
supabase link --project-ref YOUR_PROJECT_ID

# CONTOH NYATA:
supabase link --project-ref abcdefghijklmnop
```

**Output yang diharapkan:**
```
Linked to project: kognisia-dev (abcdefghijklmnop)
```

---

## 🚀 STEP 4: Run Migrations

Setelah link berhasil, jalankan migrations:

```bash
supabase migration up
```

**Output yang diharapkan:**
```
Applying migration: 20250101000000_create_achievements_tables.sql
Applying migration: 20250101000001_create_seasonal_achievements.sql
...
All migrations applied successfully!
```

---

## ✅ STEP 5: Verify Migrations

Buka Supabase Dashboard dan cek:

1. Buka https://supabase.com/dashboard
2. Pilih project `kognisia-dev`
3. Klik "Table Editor" di sidebar
4. Verifikasi tabel-tabel sudah ada:
   - `achievements`
   - `seasonal_achievements`
   - `events`
   - `event_challenges`
   - `cosmetics`
   - `user_cosmetics`
   - `analytics_events`
   - `analytics_achievements`
   - dll

---

## 🆘 TROUBLESHOOTING

### Error: "zsh: no matches found: [project-id]"

**Penyebab:** Anda copy-paste `[project-id]` tanpa mengganti dengan project ID yang sebenarnya.

**Solusi:**
```bash
# ❌ SALAH:
supabase link --project-ref [project-id]

# ✅ BENAR (ganti dengan project ID Anda):
supabase link --project-ref abcdefghijklmnop
```

---

### Error: "failed to connect to postgres"

**Penyebab:** Ini normal! Kita tidak perlu local database.

**Solusi:** Abaikan error ini, migrations akan tetap berjalan di Supabase cloud.

---

### Error: "EEXIST: file already exists"

**Penyebab:** Supabase CLI sudah installed.

**Solusi:**
```bash
npm install -g supabase --force
```

---

### Error: "Not linked to a project"

**Penyebab:** Belum menjalankan `supabase link`.

**Solusi:**
```bash
# Pastikan sudah login
supabase login

# Link project
supabase link --project-ref YOUR_PROJECT_ID
```

---

## 📝 COMPLETE WORKFLOW

Berikut workflow lengkap dari awal:

```bash
# 1. Clone repository
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
cd kognisia-app-dev

# 2. Install dependencies
npm install

# 3. Install Supabase CLI (jika belum)
npm install -g supabase --force

# 4. Login ke Supabase
supabase login
# Tekan Enter, browser akan terbuka
# Authorize akses

# 5. Dapatkan Project ID dari Supabase Dashboard
# Settings → General → Project ID
# Copy project ID-nya

# 6. Link project (GANTI YOUR_PROJECT_ID!)
supabase link --project-ref YOUR_PROJECT_ID

# 7. Run migrations
supabase migration up

# 8. Verify di Supabase Dashboard
# Table Editor → Cek tabel-tabel sudah ada

# 9. Update .env.local dengan credentials
# NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
# SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# 10. Run local dev
npm run dev
```

---

## 🎯 QUICK REFERENCE

| Step | Command | Notes |
|------|---------|-------|
| 1 | `npm install -g supabase --force` | Install CLI |
| 2 | `supabase login` | Login to Supabase |
| 3 | `supabase link --project-ref YOUR_PROJECT_ID` | Link project (ganti YOUR_PROJECT_ID!) |
| 4 | `supabase migration up` | Run migrations |
| 5 | Verify di Dashboard | Check tables di Table Editor |

---

## 📌 IMPORTANT NOTES

1. **Ganti [project-id] atau YOUR_PROJECT_ID** dengan project ID yang sebenarnya
2. **Project ID** bisa dilihat di Supabase Dashboard → Settings → General
3. **Jangan copy-paste** placeholder text
4. **Error "connection refused"** adalah normal, abaikan
5. **Migrations akan berjalan** di Supabase cloud, bukan local

---

## ✅ CHECKLIST

- [ ] Sudah dapatkan Project ID dari Supabase Dashboard
- [ ] Sudah install Supabase CLI (`npm install -g supabase --force`)
- [ ] Sudah login ke Supabase (`supabase login`)
- [ ] Sudah link project dengan project ID yang benar (`supabase link --project-ref YOUR_PROJECT_ID`)
- [ ] Sudah run migrations (`supabase migration up`)
- [ ] Sudah verify tabel-tabel di Supabase Dashboard
- [ ] Sudah update .env.local dengan credentials

---

**Status**: ✅ Ready
**Last Updated**: December 13, 2025
