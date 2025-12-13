# Clone Supabase Database - QUICK GUIDE

Cara tercepat dan termudah untuk clone database Supabase.

---

## ⚡ FASTEST WAY (5 MENIT)

### Step 1: Install CLI
```bash
npm install -g supabase --force
```

### Step 2: Login
```bash
supabase login
# Browser akan terbuka, authorize akses
```

### Step 3: Get Production Project ID
1. Buka https://supabase.com/dashboard
2. Pilih project production
3. Settings → General
4. Copy "Project ID" (16 karakter)

### Step 4: Link Production Project
```bash
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID
```

### Step 5: Pull Schema
```bash
supabase db pull
```

Ini akan download semua table schemas ke folder `supabase/migrations/`

### Step 6: Get Development Project ID
1. Buka https://supabase.com/dashboard
2. Pilih project development
3. Settings → General
4. Copy "Project ID"

### Step 7: Link Development Project
```bash
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID
```

### Step 8: Push Schema
```bash
supabase db push
```

Ini akan create semua tables di development project.

### Step 9: Verify
1. Buka Supabase Dashboard (development)
2. Klik "Table Editor"
3. Cek semua tabel sudah ada ✅

---

## 📋 COPY-PASTE COMMANDS

```bash
# 1. Install
npm install -g supabase --force

# 2. Login
supabase login

# 3. Link production (ganti YOUR_PRODUCTION_PROJECT_ID)
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull
supabase db pull

# 5. Link development (ganti YOUR_DEVELOPMENT_PROJECT_ID)
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push
supabase db push

# Done! ✅
```

---

## 🎯 WHAT GETS COPIED

✅ **Copied:**
- All table schemas
- All columns & data types
- All indexes
- All constraints
- All RLS policies
- All functions & triggers

❌ **NOT Copied (by default):**
- Data (use `supabase db pull --include-data` if needed)

---

## ⚠️ IMPORTANT

- **Project ID:** 16 karakter (bukan URL)
- **Ganti YOUR_PRODUCTION_PROJECT_ID** dengan project ID yang sebenarnya
- **Ganti YOUR_DEVELOPMENT_PROJECT_ID** dengan project ID development

---

## 🆘 TROUBLESHOOTING

| Error | Solution |
|-------|----------|
| "Not linked to a project" | Run `supabase link --project-ref YOUR_PROJECT_ID` |
| "Permission denied" | Make sure you're project owner |
| "Connection refused" | Check project ID is correct |
| "Command not found" | Run `npm install -g supabase --force` |

---

## 📚 FULL GUIDE

Untuk panduan lengkap dengan semua opsi:
→ Baca: [CLONE_SUPABASE_DATABASE.md](./CLONE_SUPABASE_DATABASE.md)

---

**Time**: 5 minutes
**Difficulty**: Easy
**Status**: ✅ Ready

**MULAI DARI STEP 1!** 🚀
