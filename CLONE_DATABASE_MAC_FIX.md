# Clone Supabase Database - MAC FIX

Solusi untuk error "Installing Supabase CLI as a global module is not supported" di Mac.

---

## 🔴 ERROR YANG ANDA ALAMI

```
npm error Installing Supabase CLI as a global module is not supported.
npm error Please use one of the supported package managers
```

**Penyebab:** Supabase CLI tidak bisa di-install via npm lagi. Harus menggunakan package manager lain.

---

## ✅ SOLUSI: Gunakan Homebrew (Untuk Mac)

Homebrew adalah package manager untuk Mac yang lebih cocok untuk Supabase CLI.

---

## 📋 STEP 1: Check Apakah Homebrew Sudah Installed

Di Terminal Mac, ketik:

```bash
brew --version
```

**Jika output seperti ini, Homebrew sudah installed:**
```
Homebrew 4.0.0
```

**Jika error "command not found", lanjut ke Step 2**

---

## 📋 STEP 2: Install Homebrew (Jika Belum Ada)

Jika Homebrew belum installed, jalankan:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Tunggu sampai selesai** (biasanya 5-10 menit)

**Output yang diharapkan:**
```
==> Installation successful!
```

---

## 📋 STEP 3: Install Supabase CLI via Homebrew

Sekarang install Supabase CLI menggunakan Homebrew:

```bash
brew install supabase
```

**Output yang diharapkan:**
```
==> Downloading https://...
==> Installing supabase
==> Caveats
...
```

---

## 📋 STEP 4: Verify Installation

Cek apakah Supabase CLI sudah ter-install:

```bash
supabase --version
```

**Output yang diharapkan:**
```
supabase-cli 1.x.x
```

---

## 📋 STEP 5: Login ke Supabase

```bash
supabase login
```

**Apa yang terjadi:**
1. Browser akan terbuka
2. Login dengan akun Supabase Anda
3. Authorize akses
4. Copy verification code
5. Paste di Terminal
6. Tekan Enter

---

## 📋 STEP 6: Masuk Folder Project

```bash
cd kognisia-app-dev
```

---

## 📋 STEP 7: Link Production Project

```bash
# Ganti YOUR_PRODUCTION_PROJECT_ID dengan project ID Anda
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID
```

**Cara mendapatkan Project ID:**
1. Buka https://supabase.com/dashboard
2. Pilih project production
3. Settings → General
4. Copy "Project ID" (16 karakter)

---

## 📋 STEP 8: Pull Schema

```bash
supabase db pull
```

---

## 📋 STEP 9: Link Development Project

```bash
# Ganti YOUR_DEVELOPMENT_PROJECT_ID dengan project ID development Anda
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID
```

---

## 📋 STEP 10: Push Schema

```bash
supabase db push
```

---

## ✅ STEP 11: Verify

1. Buka https://supabase.com/dashboard
2. Pilih project development
3. Klik "Table Editor"
4. Cek semua tabel sudah ada ✅

---

## 📝 COPY-PASTE COMMANDS (Dari Terminal Mac)

```bash
# 1. Check Homebrew
brew --version

# 2. Install Homebrew (jika belum ada)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Install Supabase CLI
brew install supabase

# 4. Verify
supabase --version

# 5. Login
supabase login

# 6. Masuk folder project
cd kognisia-app-dev

# 7. Link production (ganti YOUR_PRODUCTION_PROJECT_ID)
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 8. Pull schema
supabase db pull

# 9. Link development (ganti YOUR_DEVELOPMENT_PROJECT_ID)
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 10. Push schema
supabase db push

# Done! ✅
```

---

## 🎯 QUICK SUMMARY

| Step | Command | Lokasi |
|------|---------|--------|
| 1 | `brew --version` | Terminal |
| 2 | `/bin/bash -c "$(curl -fsSL ...)"` | Terminal (jika perlu) |
| 3 | `brew install supabase` | Terminal |
| 4 | `supabase --version` | Terminal |
| 5 | `supabase login` | Terminal |
| 6 | `cd kognisia-app-dev` | Terminal |
| 7 | `supabase link --project-ref ...` | Terminal |
| 8 | `supabase db pull` | Terminal |
| 9 | `supabase link --project-ref ...` | Terminal |
| 10 | `supabase db push` | Terminal |

---

## 🆘 TROUBLESHOOTING

### Error: "command not found: brew"

**Penyebab:** Homebrew belum ter-install

**Solusi:**
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Error: "command not found: supabase"

**Penyebab:** Supabase CLI belum ter-install

**Solusi:**
```bash
brew install supabase
```

### Error: "Not linked to a project"

**Penyebab:** Belum menjalankan `supabase link`

**Solusi:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Permission denied"

**Penyebab:** Tidak punya permission

**Solusi:**
```bash
sudo brew install supabase
# Masukkan password Mac Anda
```

---

## 💡 TIPS

1. **Gunakan Homebrew** - Lebih cocok untuk Mac
2. **Jangan gunakan npm** - Tidak support lagi
3. **Pastikan Homebrew installed** - Cek dengan `brew --version`
4. **Ganti placeholder** - YOUR_PRODUCTION_PROJECT_ID → project ID yang sebenarnya
5. **Masuk folder project** - Untuk step 6-10

---

## 📚 REFERENCES

- [Supabase CLI Install](https://supabase.com/docs/guides/cli/getting-started)
- [Homebrew](https://brew.sh)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-pull)

---

## ✅ NEXT STEPS

1. **Buka Terminal Mac**
2. **Jalankan:** `brew --version`
3. **Jika tidak ada:** Install Homebrew
4. **Jalankan:** `brew install supabase`
5. **Lanjutkan step 5-10** dari panduan ini

---

**Status**: ✅ Ready
**Difficulty**: Easy
**Time**: 10 minutes
**Last Updated**: December 13, 2025

**GUNAKAN HOMEBREW, BUKAN NPM!** 🚀
