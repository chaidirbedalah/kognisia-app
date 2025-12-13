# 🚀 START HERE

Panduan cepat untuk clone, setup, dan experiment dengan Kognisia App.

---

## ⚡ FASTEST WAY (15 minutes)

### 1️⃣ Clone Repository
```bash
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev
cd kognisia-app-dev
npm install
```

### 2️⃣ Create Supabase Project
- Buka https://supabase.com
- Login → "New Project"
- Name: `kognisia-dev`
- Password: (buat password kuat)
- Region: Singapore
- Tunggu 2-3 menit

### 3️⃣ Get Credentials
- Settings → API
- Copy: Project URL, anon key, service_role key

### 4️⃣ Update .env.local
```env
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### 5️⃣ Run Migrations
```bash
npm install -g supabase
supabase login
supabase link --project-ref [project-id]
supabase migration up
```

### 6️⃣ Setup Vercel
- Buka https://vercel.com
- "Add New" → "Project"
- Cari `kognisia-app` → "Import"
- Name: `kognisia-dev`
- Add environment variables (sama seperti .env.local)
- "Deploy"

### 7️⃣ Run Local Dev
```bash
npm run dev
# Buka http://localhost:3000
```

---

## 📚 FULL DOCUMENTATION

Untuk panduan lengkap, baca:

| File | Purpose | Time |
|------|---------|------|
| [COPY_PASTE_SETUP.md](./COPY_PASTE_SETUP.md) | Copy-paste commands | 5 min |
| [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md) | Quick setup | 15 min |
| [SETUP_DEVELOPMENT_ENVIRONMENT.md](./SETUP_DEVELOPMENT_ENVIRONMENT.md) | Detailed setup | 30 min |
| [GIT_WORKFLOW_GUIDE.md](./GIT_WORKFLOW_GUIDE.md) | Git best practices | 15 min |
| [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) | When stuck | 10 min |
| [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) | All docs | 5 min |

---

## ✅ VERIFY SETUP

```bash
# Check git
git status

# Check npm
npm list | head -10

# Check build
npm run build

# Check dev server
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

## 🆘 STUCK?

Baca [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)

Common issues:
- npm install fails → `npm install --legacy-peer-deps`
- Port 3000 in use → `npm run dev -- -p 3001`
- Cannot find module → `rm -rf node_modules && npm install`
- Database error → Check `.env.local` credentials

---

## 🔗 LINKS

- GitHub: https://github.com/coachchaidir/kognisia-app
- Supabase: https://supabase.com/dashboard
- Vercel: https://vercel.com/dashboard

---

**Time**: ~15 minutes
**Difficulty**: Easy
**Status**: ✅ Ready

**Next**: Read [COPY_PASTE_SETUP.md](./COPY_PASTE_SETUP.md) or [QUICK_SETUP_GUIDE.md](./QUICK_SETUP_GUIDE.md)
