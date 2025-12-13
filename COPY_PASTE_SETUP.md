# Copy-Paste Setup Commands

Salin dan paste commands ini satu per satu untuk setup development environment.

---

## 🚀 STEP 1: Clone Repository

```bash
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
cd kognisia-app-dev
npm install
```

---

## 🗄️ STEP 2: Create Supabase Project

1. Buka https://supabase.com
2. Login → "New Project"
3. Isi:
   - Name: `kognisia-dev`
   - Password: (buat password kuat)
   - Region: Singapore
4. Tunggu 2-3 menit

---

## 🔑 STEP 3: Get Supabase Credentials

1. Buka Supabase dashboard
2. Settings → API
3. Copy:
   - Project URL
   - anon public key
   - service_role secret

---

## 📝 STEP 4: Update .env.local

Buka file `.env.local` dan update dengan credentials dari Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

---

## 🗄️ STEP 5: Run Database Migrations

### Option A: Supabase CLI (Recommended)

```bash
npm install -g supabase
supabase login
supabase link --project-ref [your-project-id]
supabase migration up
```

### Option B: Manual (SQL Editor)

1. Buka Supabase → SQL Editor
2. Buat query baru
3. Copy-paste dari `database/migrations/create_achievements_tables.sql`
4. Run
5. Ulangi untuk semua migration files:
   - create_achievements_tables.sql
   - create_seasonal_achievements.sql
   - create_events_system.sql
   - create_cosmetics_system.sql
   - create_analytics_tables.sql
   - create_performance_indexes.sql

---

## 🌐 STEP 6: Setup Vercel

1. Buka https://vercel.com
2. "Add New" → "Project"
3. Cari `kognisia-app` → "Import"
4. Project Name: `kognisia-dev`
5. Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [url]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [key]
   SUPABASE_SERVICE_ROLE_KEY = [key]
   ```
6. "Deploy"
7. Tunggu 3-5 menit

---

## 💻 STEP 7: Run Local Development

```bash
npm run dev
```

Buka browser ke: http://localhost:3000

---

## ✅ VERIFICATION

Cek semua ini berhasil:

```bash
# 1. Check git
git status
git log --oneline -3

# 2. Check npm
npm list | head -20

# 3. Check build
npm run build

# 4. Check dev server
npm run dev
# Buka http://localhost:3000
```

---

## 🎯 NEXT STEPS

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

## 🆘 QUICK TROUBLESHOOTING

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
```bash
# Check .env.local
cat .env.local

# Verify credentials are correct
```

### Vercel deployment failed
```bash
# Check build locally
npm run build

# Check for errors
npm run type-check
npm run lint
```

---

## 📚 FULL DOCUMENTATION

Untuk dokumentasi lengkap, baca:
- [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md)
- [SETUP_DEVELOPMENT_ENVIRONMENT.md](./SETUP_DEVELOPMENT_ENVIRONMENT.md)
- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

**Time**: ~15 minutes
**Difficulty**: Easy
**Status**: ✅ Ready
