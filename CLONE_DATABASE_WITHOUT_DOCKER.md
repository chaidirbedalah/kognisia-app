# Clone Supabase Database - WITHOUT Docker

Solusi untuk clone database tanpa perlu Docker Desktop.

---

## 🔴 ERROR YANG ANDA ALAMI

```
failed to inspect docker image: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
Docker Desktop is a prerequisite for local development.
```

**Penyebab:** Supabase CLI memerlukan Docker untuk membuat shadow database saat pull.

---

## ✅ SOLUSI: Ada 2 Opsi

---

## OPSI 1: Skip Shadow Database (RECOMMENDED - Paling Mudah)

Gunakan flag `--skip-shadow` untuk skip shadow database:

```bash
supabase db pull --skip-shadow
```

**Apa yang terjadi:**
- ✅ Pull schema dari remote
- ✅ Tidak perlu Docker
- ✅ Lebih cepat
- ❌ Tidak ada shadow database (tapi tidak penting untuk clone)

**Output yang diharapkan:**
```
Pulling schema from remote...
Downloaded schema from remote
```

---

## OPSI 2: Install Docker Desktop (Jika Ingin Shadow Database)

Jika Anda ingin shadow database, install Docker Desktop:

1. Buka https://www.docker.com/products/docker-desktop
2. Download Docker Desktop untuk Mac
3. Install
4. Buka Docker Desktop
5. Tunggu sampai Docker daemon running
6. Coba lagi: `supabase db pull`

**Catatan:** Ini lebih kompleks dan memerlukan resources lebih banyak.

---

## 🎯 RECOMMENDED: Gunakan OPSI 1

Untuk clone database, Anda tidak perlu shadow database. Cukup gunakan:

```bash
supabase db pull --skip-shadow
```

---

## 📋 COMPLETE WORKFLOW (Tanpa Docker)

```bash
# 1. Login
supabase login

# 2. Masuk folder project
cd kognisia-app-dev

# 3. Link production project
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull schema (TANPA DOCKER)
supabase db pull --skip-shadow

# 5. Link development project
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push schema
supabase db push

# Done! ✅
```

---

## 📝 COPY-PASTE COMMANDS (Tanpa Docker)

```bash
# 1. Login
supabase login

# 2. Masuk folder project
cd kognisia-app-dev

# 3. Link production (ganti YOUR_PRODUCTION_PROJECT_ID)
supabase link --project-ref YOUR_PRODUCTION_PROJECT_ID

# 4. Pull schema (TANPA DOCKER - GUNAKAN INI!)
supabase db pull --skip-shadow

# 5. Link development (ganti YOUR_DEVELOPMENT_PROJECT_ID)
supabase link --project-ref YOUR_DEVELOPMENT_PROJECT_ID

# 6. Push schema
supabase db push

# Done! ✅
```

---

## 🎯 PERBEDAAN DENGAN & TANPA DOCKER

| Feature | Dengan Docker | Tanpa Docker |
|---------|---------------|--------------|
| Pull schema | ✅ Ya | ✅ Ya |
| Shadow database | ✅ Ya | ❌ Tidak |
| Push schema | ✅ Ya | ✅ Ya |
| Perlu install | Docker Desktop | Tidak perlu |
| Kecepatan | Lebih lambat | Lebih cepat |
| Resources | Lebih banyak | Lebih sedikit |
| Untuk clone | ✅ Bisa | ✅ Bisa |

---

## 💡 TIPS

1. **Gunakan --skip-shadow** - Untuk clone database
2. **Tidak perlu Docker** - Untuk use case ini
3. **Lebih cepat** - Tanpa Docker
4. **Lebih mudah** - Tanpa Docker
5. **Recommended** - Gunakan OPSI 1

---

## 🆘 TROUBLESHOOTING

### Error: "command not found: supabase"

**Solusi:**
```bash
brew install supabase
```

### Error: "Not linked to a project"

**Solusi:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

### Error: "Permission denied"

**Solusi:**
```bash
sudo supabase db pull --skip-shadow
# Masukkan password Mac Anda
```

### Masih error setelah --skip-shadow?

**Solusi:**
```bash
# Coba dengan force
supabase db pull --skip-shadow --force
```

---

## 📚 REFERENCES

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli/local-development)
- [Skip Shadow Database](https://supabase.com/docs/reference/cli/supabase-db-pull)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (optional)

---

## ✅ NEXT STEPS

1. **Buka Terminal Mac**
2. **Jalankan:** `supabase db pull --skip-shadow`
3. **Tunggu sampai selesai**
4. **Lanjut ke step berikutnya**

---

**Status**: ✅ Ready
**Difficulty**: Very Easy
**Time**: 2-3 minutes
**Last Updated**: December 13, 2025

**GUNAKAN --skip-shadow FLAG!** 🚀
