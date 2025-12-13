# Quick Setup Guide - 15 Menit Setup

Panduan cepat untuk setup development environment dalam 15 menit.

---

## 🚀 STEP 1: Clone Repository (2 menit)

```bash
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
cd kognisia-app-dev
npm install
```

---

## 🗄️ STEP 2: Setup Supabase Database (5 menit)

### 2.1: Buat Project Baru
1. Buka https://supabase.com
2. Login → "New Project"
3. Isi:
   - Name: `kognisia-dev`
   - Password: (buat password kuat)
   - Region: Singapore (atau terdekat)
4. Tunggu 2-3 menit

### 2.2: Dapatkan Credentials
1. Settings → API
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### 2.3: Update `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### 2.4: Run Migrations
**Option A: Supabase CLI (Recommended)**
```bash
npm install -g supabase
supabase login
supabase link --project-ref [project-id]
supabase migration up
```

**Option B: Manual (SQL Editor)**
1. Buka Supabase → SQL Editor
2. Buat query baru
3. Copy-paste dari `database/migrations/create_achievements_tables.sql`
4. Run
5. Ulangi untuk semua migration files

---

## 🌐 STEP 3: Setup Vercel (5 menit)

### 3.1: Import Project
1. Buka https://vercel.com
2. "Add New" → "Project"
3. Cari `kognisia-app` → "Import"

### 3.2: Configure
1. Project Name: `kognisia-dev`
2. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [key]
   SUPABASE_SERVICE_ROLE_KEY = [key]
   ```
3. "Deploy"
4. Tunggu 3-5 menit

### 3.3: Verify
- Buka URL yang diberikan Vercel
- Cek navigation bar muncul
- Cek pages bisa diakses

---

## 💻 STEP 4: Local Development (1 menit)

```bash
npm run dev

# Buka http://localhost:3000
```

---

## ✅ Checklist

- [ ] Repository di-clone
- [ ] npm install selesai
- [ ] Supabase project dibuat
- [ ] .env.local di-update
- [ ] Migrations di-run
- [ ] Vercel project dibuat
- [ ] Vercel deployment berhasil
- [ ] npm run dev berjalan
- [ ] http://localhost:3000 bisa diakses

---

## 🔗 Useful Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/coachchaidir/kognisia-app |
| Supabase Dashboard | https://supabase.com/dashboard |
| Vercel Dashboard | https://vercel.com/dashboard |
| Next.js Docs | https://nextjs.org/docs |
| Supabase Docs | https://supabase.com/docs |

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot find module" | `rm -rf node_modules && npm install` |
| Database connection error | Check `.env.local` credentials |
| Vercel deployment failed | Check build logs in Vercel dashboard |
| Port 3000 already in use | `npm run dev -- -p 3001` |

---

## 📝 Next Steps

1. ✅ Setup selesai
2. 🔀 Buat branch: `git checkout -b feature/your-feature`
3. 💻 Code & test di local
4. 🚀 Push & deploy ke Vercel dev
5. ✔️ Merge ke main setelah testing

---

**Estimated Time**: 15 minutes
**Difficulty**: Easy
**Status**: ✅ Ready
