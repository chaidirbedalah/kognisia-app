# Clone Supabase Database - DETAILED GUIDE

Panduan detail dengan screenshot dan penjelasan untuk setiap step.

---

## 🎯 JAWABAN SINGKAT

**Q: Di mana menjalankan command?**
A: Di **Terminal Mac Anda** (bukan di folder project)

**Q: Harus masuk folder project?**
A: **TIDAK perlu** untuk step 1-2. Untuk step 3-8, bisa dari mana saja.

---

## 📍 LOKASI MENJALANKAN COMMAND

### Step 1-2: Install & Login (Bisa dari mana saja)

```bash
# Buka Terminal Mac Anda
# Tidak perlu masuk folder project
# Bisa dari folder mana saja (home, desktop, dll)

npm install -g supabase --force
supabase login
```

**Lokasi:** Anywhere (home directory, desktop, dll)

### Step 3-8: Link & Pull/Push (Bisa dari mana saja)

```bash
# Bisa dari folder project atau folder lain
# Tapi RECOMMENDED dari folder project

supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID
supabase db pull
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID
supabase db push
```

**Lokasi:** Anywhere, tapi recommended dari folder project

---

## 🖥️ STEP-BY-STEP DENGAN LOKASI

### STEP 1: Buka Terminal Mac

**Lokasi:** Anywhere (tidak perlu folder project)

```
1. Buka Finder
2. Tekan Cmd + Space
3. Ketik "Terminal"
4. Tekan Enter
5. Terminal terbuka
```

**Atau:**
```
1. Buka Spotlight (Cmd + Space)
2. Ketik "terminal"
3. Tekan Enter
```

---

### STEP 2: Install Supabase CLI

**Lokasi:** Terminal (tidak perlu folder project)

```bash
npm install -g supabase --force
```

**Output yang diharapkan:**
```
added 592 packages in 16s
```

**Catatan:**
- `-g` = global (install di system, bukan di project)
- Tidak perlu masuk folder project
- Bisa dari folder mana saja

---

### STEP 3: Login ke Supabase

**Lokasi:** Terminal (tidak perlu folder project)

```bash
supabase login
```

**Output:**
```
Hello from Supabase! Press Enter to open browser and login automatically.
Here is your login link in case browser did not open https://supabase.com/dashboard/cli/login?...
Enter your verification code: 
```

**Apa yang terjadi:**
1. Browser akan terbuka
2. Login dengan akun Supabase Anda
3. Authorize akses
4. Copy verification code
5. Paste di Terminal
6. Tekan Enter

---

### STEP 4: Masuk Folder Project (OPTIONAL tapi RECOMMENDED)

**Lokasi:** Terminal

```bash
# Masuk folder project
cd kognisia-app-dev

# Atau jika sudah di folder project, tidak perlu command ini
```

**Mengapa recommended?**
- Migrations akan tersimpan di `supabase/migrations/` dalam project
- Lebih terorganisir
- Bisa di-commit ke git

---

### STEP 5: Link Production Project

**Lokasi:** Terminal (di folder project atau tidak)

```bash
# Ganti YOUR_PRODUCTION_PROJECT_ID dengan project ID Anda
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID
```

**Cara mendapatkan Project ID:**
1. Buka https://supabase.com/dashboard
2. Pilih project production
3. Klik "Settings" (gear icon)
4. Klik "General"
5. Cari "Project ID" (16 karakter)
6. Copy project ID

**Contoh:**
```bash
supabase link --project-ref abcdefghijklmnop
```

**Output:**
```
Linked to project: kognisia-dev (abcdefghijklmnop)
```

---

### STEP 6: Pull Schema

**Lokasi:** Terminal (di folder project RECOMMENDED)

```bash
supabase db pull
```

**Output:**
```
Pulling schema from remote...
Downloaded schema from remote
```

**Apa yang terjadi:**
- Download semua table schemas
- Simpan di `supabase/migrations/` (dalam project)
- Tidak download data (lebih cepat)

---

### STEP 7: Link Development Project

**Lokasi:** Terminal (di folder project atau tidak)

```bash
# Ganti YOUR_DEVELOPMENT_PROJECT_ID dengan project ID development Anda
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID
```

**Contoh:**
```bash
supabase link --project-ref zyxwvutsrqponmlk
```

**Output:**
```
Linked to project: kognisia-dev-2 (zyxwvutsrqponmlk)
```

---

### STEP 8: Push Schema

**Lokasi:** Terminal (di folder project RECOMMENDED)

```bash
supabase db push
```

**Output:**
```
Pushing schema to remote...
Uploaded schema to remote
```

**Apa yang terjadi:**
- Upload semua migrations
- Create semua tables di development project
- Selesai!

---

## 📋 COMPLETE WORKFLOW DENGAN LOKASI

```
1. Buka Terminal Mac
   Lokasi: Anywhere
   Command: npm install -g supabase --force

2. Login
   Lokasi: Anywhere
   Command: supabase login

3. Masuk folder project (OPTIONAL tapi RECOMMENDED)
   Lokasi: Terminal
   Command: cd kognisia-app-dev

4. Link production project
   Lokasi: Terminal (di folder project atau tidak)
   Command: supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

5. Pull schema
   Lokasi: Terminal (di folder project RECOMMENDED)
   Command: supabase db pull

6. Link development project
   Lokasi: Terminal (di folder project atau tidak)
   Command: supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

7. Push schema
   Lokasi: Terminal (di folder project RECOMMENDED)
   Command: supabase db push

8. Verify
   Lokasi: Browser
   URL: https://supabase.com/dashboard
```

---

## 🎯 QUICK ANSWER

| Pertanyaan | Jawaban |
|-----------|---------|
| Di mana menjalankan command? | Di Terminal Mac |
| Harus masuk folder project? | TIDAK perlu untuk step 1-2, RECOMMENDED untuk step 3-8 |
| Bisa dari folder lain? | Ya, bisa dari mana saja |
| Bagaimana cara masuk folder project? | `cd kognisia-app-dev` |
| Bagaimana cara tahu lokasi saat ini? | Ketik `pwd` di Terminal |
| Bagaimana cara kembali ke home? | Ketik `cd ~` di Terminal |

---

## 🖥️ TERMINAL BASICS (Jika Anda Baru)

### Buka Terminal
```
Cmd + Space → Ketik "terminal" → Enter
```

### Lihat lokasi saat ini
```bash
pwd
```

### Masuk folder
```bash
cd folder_name
```

### Kembali ke home
```bash
cd ~
```

### Lihat isi folder
```bash
ls
```

### Lihat isi folder dengan detail
```bash
ls -la
```

---

## 📝 COPY-PASTE COMMANDS (Dari Terminal Mac)

```bash
# 1. Install (bisa dari mana saja)
npm install -g supabase --force

# 2. Login (bisa dari mana saja)
supabase login

# 3. Masuk folder project (RECOMMENDED)
cd kognisia-app-dev

# 4. Link production (ganti YOUR_PRODUCTION_PROJECT_ID)
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 5. Pull schema
supabase db pull

# 6. Link development (ganti YOUR_DEVELOPMENT_PROJECT_ID)
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 7. Push schema
supabase db push

# Done! ✅
```

---

## ⚠️ IMPORTANT NOTES

1. **Terminal Mac:** Bukan VS Code terminal, bukan folder project
2. **Global install:** `-g` berarti install di system, bukan project
3. **Project ID:** 16 karakter, bukan URL
4. **Ganti placeholder:** YOUR_PRODUCTION_PROJECT_ID → project ID yang sebenarnya
5. **Folder project:** RECOMMENDED tapi tidak wajib

---

## 🆘 TROUBLESHOOTING

### Error: "command not found: supabase"

**Penyebab:** Supabase CLI belum ter-install

**Solusi:**
```bash
npm install -g supabase --force
```

### Error: "Not linked to a project"

**Penyebab:** Belum menjalankan `supabase link`

**Solusi:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Permission denied"

**Penyebab:** Tidak punya permission untuk install global

**Solusi:**
```bash
sudo npm install -g supabase --force
# Masukkan password Mac Anda
```

### Tidak tahu Project ID

**Solusi:**
1. Buka https://supabase.com/dashboard
2. Pilih project
3. Settings → General
4. Copy "Project ID"

---

## 📚 REFERENCES

- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-pull)
- [Terminal Basics](https://support.apple.com/en-us/HT201236)
- [npm Global Install](https://docs.npmjs.com/cli/v8/commands/npm-install)

---

**Status**: ✅ Ready
**Difficulty**: Very Easy
**Time**: 5 minutes
**Last Updated**: December 13, 2025

**BUKA TERMINAL MAC DAN MULAI DARI STEP 1!** 🚀
