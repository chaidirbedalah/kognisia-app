# 🚀 SETUP GUIDE - MASTER (Satu-satunya yang Anda Butuhkan)

Panduan lengkap dan jelas untuk setup development environment. **Ikuti panduan ini saja!**

---

## ⏱️ WAKTU TOTAL: ~30 MENIT

---

## 📋 STEP 1: CLONE REPOSITORY (2 menit)

```bash
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
cd kognisia-app-dev
npm install
```

**Tunggu sampai selesai** (biasanya 2-5 menit)

---

## 🗄️ STEP 2: CREATE SUPABASE PROJECT (5 menit)

### 2.1: Buat Project Baru
1. Buka https://supabase.com
2. Login dengan akun Anda
3. Klik "New Project"
4. Isi form:
   - **Name**: `kognisia-dev`
   - **Database Password**: Buat password yang kuat (simpan di tempat aman!)
   - **Region**: Singapore (atau terdekat)
5. Klik "Create new project"
6. **Tunggu 2-3 menit** sampai project selesai dibuat

### 2.2: Dapatkan Credentials
1. Di Supabase dashboard, klik "Settings" (gear icon)
2. Klik "API"
3. Copy 3 credentials ini:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 📝 STEP 3: UPDATE .env.local (2 menit)

Di folder `kognisia-app-dev`, buka file `.env.local` dan update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

**Ganti** `[your-project-id]`, `[your-anon-key]`, `[your-service-role-key]` dengan credentials dari Step 2.2

---

## 🗄️ STEP 4: RUN DATABASE MIGRATIONS (10 menit)

### OPTION A: Menggunakan SQL Editor (RECOMMENDED - Paling Mudah)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project `kognisia-dev`
3. Klik "SQL Editor" di sidebar kiri
4. Klik "New Query"

**Jalankan 6 migration files satu per satu:**

#### Migration 1: create_achievements_tables.sql
```
1. Buka file: database/migrations/create_achievements_tables.sql
2. Copy semua isi (Ctrl+A, Ctrl+C)
3. Paste di SQL Editor (Ctrl+V)
4. Klik "Run"
5. Tunggu "Success" notification
```

#### Migration 2: create_seasonal_achievements.sql
```
1. Buka file: database/migrations/create_seasonal_achievements.sql
2. Copy semua isi
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu "Success"
```

#### Migration 3: create_events_system.sql
```
1. Buka file: database/migrations/create_events_system.sql
2. Copy semua isi
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu "Success"
```

#### Migration 4: create_cosmetics_system.sql
```
1. Buka file: database/migrations/create_cosmetics_system.sql
2. Copy semua isi
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu "Success"
```

#### Migration 5: create_analytics_tables.sql
```
1. Buka file: database/migrations/create_analytics_tables.sql
2. Copy semua isi
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu "Success"
```

#### Migration 6: create_performance_indexes.sql
```
1. Buka file: database/migrations/create_performance_indexes.sql
2. Copy semua isi
3. Paste di SQL Editor (buat query baru)
4. Klik "Run"
5. Tunggu "Success"
```

### OPTION B: Menggunakan Supabase CLI (Jika Anda Prefer)

```bash
npm install -g supabase --force
supabase login
supabase link --project-ref [your-project-id]
supabase migration up
```

**Ganti** `[your-project-id]` dengan project ID dari Supabase dashboard.

---

## ✅ STEP 5: VERIFY MIGRATIONS (2 menit)

1. Buka Supabase Dashboard
2. Klik "Table Editor" di sidebar
3. Verifikasi tabel-tabel sudah ada:
   - ✅ achievements
   - ✅ seasonal_achievements
   - ✅ events
   - ✅ event_challenges
   - ✅ cosmetics
   - ✅ user_cosmetics
   - ✅ analytics_events
   - ✅ user_engagement_metrics

Jika semua tabel ada → **Migrations berhasil!** ✅

---

## 🌐 STEP 6: SETUP VERCEL (5 menit)

### 6.1: Import Project
1. Buka https://vercel.com
2. Login dengan akun Anda
3. Klik "Add New" → "Project"
4. Cari repository `kognisia-app`
5. Klik "Import"

### 6.2: Configure Project
1. **Project Name**: `kognisia-dev`
2. **Framework Preset**: Next.js (auto-detected)
3. **Root Directory**: `./` (default)

### 6.3: Add Environment Variables
Scroll ke bawah, cari "Environment Variables", tambahkan:
```
NEXT_PUBLIC_SUPABASE_URL = https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
```

### 6.4: Deploy
1. Klik "Deploy"
2. Tunggu 3-5 menit sampai deployment selesai
3. Vercel akan memberikan URL production

---

## 💻 STEP 7: RUN LOCAL DEVELOPMENT (1 menit)

```bash
npm run dev
```

Buka browser ke: **http://localhost:3000**

Anda seharusnya melihat:
- ✅ Navigation bar di atas
- ✅ Halaman login atau dashboard
- ✅ Semua menu berfungsi

---

## 🎯 STEP 8: MULAI DEVELOPMENT

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes
# ... edit files ...

# 3. Commit
git add .
git commit -m "feat: describe your changes"

# 4. Push
git push origin feature/your-feature-name

# 5. Create Pull Request di GitHub
```

---

## ✅ FINAL CHECKLIST

- [ ] Repository di-clone
- [ ] npm install selesai
- [ ] Supabase project dibuat
- [ ] .env.local di-update dengan credentials
- [ ] 6 migrations sudah di-run
- [ ] Tabel-tabel terverifikasi di Supabase
- [ ] Vercel project dibuat
- [ ] Environment variables di-Vercel
- [ ] Vercel deployment berhasil
- [ ] npm run dev berjalan
- [ ] http://localhost:3000 bisa diakses
- [ ] Navigation bar muncul

---

## 🆘 TROUBLESHOOTING

### npm install fails
```bash
npm install --legacy-peer-deps
```

### Port 3000 already in use
```bash
npm run dev -- -p 3001
```

### Cannot find module
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database connection error
- Cek `.env.local` credentials sudah benar
- Cek Supabase project masih aktif

### Migration error
- Pastikan copy-paste file migration dengan benar
- Pastikan urutan migrations benar (1-6)
- Jika ada error, baca error message dengan teliti

### Vercel deployment failed
- Cek build logs di Vercel dashboard
- Biasanya karena missing environment variables
- Pastikan semua 3 credentials sudah di-add

---

## 📚 DOKUMENTASI LAINNYA

Jika Anda butuh informasi lebih detail:

- **Git Workflow**: [GIT_WORKFLOW_GUIDE.md](./GIT_WORKFLOW_GUIDE.md)
- **Database Backup**: [DATABASE_BACKUP_AND_RESTORE.md](./DATABASE_BACKUP_AND_RESTORE.md)
- **Navigation System**: [NAVIGATION_SYSTEM_IMPLEMENTATION.md](./NAVIGATION_SYSTEM_IMPLEMENTATION.md)

---

## 🔗 USEFUL LINKS

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/coachchaidir/kognisia-app |
| Supabase Dashboard | https://supabase.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| Next.js Docs | https://nextjs.org/docs |
| Supabase Docs | https://supabase.com/docs |

---

## 💡 TIPS

1. **Jangan skip steps** - Ikuti urutan yang benar
2. **Tunggu sampai selesai** - Jangan close tab/terminal sebelum selesai
3. **Copy-paste dengan hati-hati** - Pastikan semua isi ter-copy
4. **Verify setiap step** - Cek setiap step berhasil sebelum lanjut
5. **Jika ada error** - Baca error message, cek dokumentasi, coba lagi

---

**Status**: ✅ Ready
**Total Time**: ~30 minutes
**Difficulty**: Easy
**Last Updated**: December 13, 2025

**MULAI DARI STEP 1 DAN IKUTI SAMPAI SELESAI!** 🚀
