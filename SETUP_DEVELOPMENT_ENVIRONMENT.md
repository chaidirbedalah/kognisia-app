# Setup Development Environment - Clone & Experiment

Panduan lengkap untuk clone repository, database, dan Vercel agar Anda bisa experiment tanpa merusak production.

---

## BAGIAN 1: CLONE REPOSITORY

### Step 1.1: Clone dari GitHub
```bash
# Buka terminal/command prompt
# Navigasi ke folder tempat Anda ingin menyimpan project

# Clone repository
git clone https://github.com/coachchaidir/kognisia-app.git kognisia-app-dev

# Masuk ke folder project
cd kognisia-app-dev
```

### Step 1.2: Install Dependencies
```bash
# Install npm packages
npm install

# Tunggu sampai selesai (biasanya 2-5 menit)
```

### Step 1.3: Verifikasi Clone Berhasil
```bash
# Cek struktur folder
ls -la

# Cek git remote
git remote -v

# Output yang diharapkan:
# origin  https://github.com/coachchaidir/kognisia-app.git (fetch)
# origin  https://github.com/coachchaidir/kognisia-app.git (push)
```

---

## BAGIAN 2: SETUP DATABASE (Supabase)

### Step 2.1: Buat Project Supabase Baru
1. Buka https://supabase.com
2. Login dengan akun Anda
3. Klik "New Project"
4. Isi form:
   - **Name**: `kognisia-dev` (atau nama lain untuk development)
   - **Database Password**: Buat password yang kuat (simpan di tempat aman!)
   - **Region**: Pilih region terdekat (misal: Singapore)
5. Klik "Create new project"
6. Tunggu 2-3 menit sampai project selesai dibuat

### Step 2.2: Dapatkan Connection String
1. Di Supabase dashboard, buka project baru Anda
2. Klik "Settings" (gear icon) di sidebar kiri
3. Klik "Database"
4. Scroll ke bawah, cari "Connection string"
5. Pilih "URI" dan copy string-nya
6. Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

### Step 2.3: Setup Environment Variables
1. Di folder `kognisia-app-dev`, buka file `.env.local`
2. Update dengan Supabase credentials baru:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# Database Connection (untuk migrations)
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
```

**Cara mendapatkan keys:**
1. Di Supabase dashboard, klik "Settings" → "API"
2. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 2.4: Run Database Migrations
```bash
# Navigasi ke folder database
cd database/migrations

# List semua migration files
ls -la

# Jalankan migrations satu per satu (dalam urutan):
# 1. create_achievements_tables.sql
# 2. create_seasonal_achievements.sql
# 3. create_events_system.sql
# 4. create_cosmetics_system.sql
# 5. create_analytics_tables.sql
# 6. create_performance_indexes.sql

# Untuk setiap file, buka di Supabase SQL Editor:
# 1. Buka Supabase dashboard
# 2. Klik "SQL Editor" di sidebar
# 3. Klik "New Query"
# 4. Copy-paste isi file migration
# 5. Klik "Run"
# 6. Tunggu sampai berhasil (lihat "Success" notification)
```

**Atau gunakan Supabase CLI (lebih mudah):**
```bash
# Install Supabase CLI (jika belum)
npm install -g supabase

# Login ke Supabase
supabase login

# Link project
supabase link --project-ref [your-project-id]

# Run migrations
supabase migration up
```

### Step 2.5: Verifikasi Database
1. Di Supabase dashboard, klik "Table Editor"
2. Verifikasi tabel-tabel sudah ada:
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

## BAGIAN 3: SETUP VERCEL (Development Deployment)

### Step 3.1: Buat Vercel Account (jika belum)
1. Buka https://vercel.com
2. Klik "Sign Up"
3. Pilih "Continue with GitHub"
4. Authorize Vercel untuk akses GitHub

### Step 3.2: Import Project ke Vercel
1. Di Vercel dashboard, klik "Add New..." → "Project"
2. Cari repository `kognisia-app` di list
3. Klik "Import"
4. Di halaman "Configure Project":
   - **Project Name**: `kognisia-dev` (atau nama lain)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)

### Step 3.3: Setup Environment Variables di Vercel
1. Scroll ke bawah, cari "Environment Variables"
2. Tambahkan semua variables dari `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://[your-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
   ```
3. Klik "Deploy"
4. Tunggu deployment selesai (biasanya 3-5 menit)

### Step 3.4: Verifikasi Deployment
1. Setelah deployment selesai, Vercel akan memberikan URL
2. Buka URL tersebut di browser
3. Verifikasi halaman bisa diakses
4. Cek navigation bar sudah muncul
5. Cek semua pages bisa diakses (Dashboard, Squad, Events, Analytics, dll)

---

## BAGIAN 4: LOCAL DEVELOPMENT

### Step 4.1: Jalankan Development Server
```bash
# Di folder kognisia-app-dev
npm run dev

# Output:
# ▲ Next.js 16.0.7
# - Local:        http://localhost:3000
# - Environments: .env.local

# Buka browser ke http://localhost:3000
```

### Step 4.2: Mulai Experiment
Sekarang Anda bisa:
- ✅ Membuat branch baru untuk experiment
- ✅ Modify code tanpa takut merusak production
- ✅ Test fitur baru di local
- ✅ Push ke GitHub branch development
- ✅ Deploy ke Vercel development project

---

## BAGIAN 5: GIT WORKFLOW UNTUK DEVELOPMENT

### Step 5.1: Buat Branch Development
```bash
# Buat branch baru
git checkout -b feature/experiment-name

# Atau jika sudah ada branch development
git checkout development
git pull origin development
```

### Step 5.2: Commit Changes
```bash
# Lihat perubahan
git status

# Add files
git add .

# Commit
git commit -m "feat: describe your changes"

# Push ke branch
git push origin feature/experiment-name
```

### Step 5.3: Merge ke Main (Setelah Testing)
```bash
# Setelah yakin changes OK, buat Pull Request di GitHub
# 1. Buka GitHub
# 2. Klik "Pull requests"
# 3. Klik "New pull request"
# 4. Compare: feature/experiment-name → main
# 5. Klik "Create pull request"
# 6. Review changes
# 7. Klik "Merge pull request"
```

---

## BAGIAN 6: BACKUP & RESTORE DATABASE

### Step 6.1: Backup Database
```bash
# Menggunakan Supabase CLI
supabase db pull

# Atau manual:
# 1. Buka Supabase dashboard
# 2. Klik "Settings" → "Database"
# 3. Klik "Backups"
# 4. Klik "Create backup"
```

### Step 6.2: Restore Database
```bash
# Jika ada masalah, restore dari backup
supabase db push

# Atau manual:
# 1. Buka Supabase dashboard
# 2. Klik "Settings" → "Database"
# 3. Klik "Backups"
# 4. Pilih backup yang ingin di-restore
# 5. Klik "Restore"
```

---

## BAGIAN 7: TROUBLESHOOTING

### Problem: "Cannot find module" error
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Problem: Database connection error
```bash
# Verifikasi .env.local sudah benar
cat .env.local

# Test connection
npm run dev

# Cek error di console
```

### Problem: Vercel deployment failed
```bash
# Cek build logs di Vercel dashboard
# 1. Buka Vercel project
# 2. Klik "Deployments"
# 3. Klik deployment yang failed
# 4. Lihat "Build Logs"

# Biasanya error karena:
# - Missing environment variables
# - TypeScript errors
# - Missing dependencies
```

### Problem: Supabase migrations failed
```bash
# Cek error message di Supabase SQL Editor
# Biasanya karena:
# - Syntax error di SQL
# - Table sudah ada
# - Foreign key constraint

# Solution: Baca error message, fix, dan run lagi
```

---

## BAGIAN 8: CHECKLIST SETUP

- [ ] Repository di-clone
- [ ] npm install berhasil
- [ ] Supabase project baru dibuat
- [ ] Environment variables di-setup
- [ ] Database migrations di-run
- [ ] Database tables terverifikasi
- [ ] Vercel project dibuat
- [ ] Environment variables di-Vercel
- [ ] Vercel deployment berhasil
- [ ] Local dev server berjalan (npm run dev)
- [ ] Bisa akses http://localhost:3000
- [ ] Navigation bar muncul
- [ ] Semua pages bisa diakses

---

## BAGIAN 9: QUICK REFERENCE

### Folder Structure
```
kognisia-app-dev/
├── src/
│   ├── app/              # Pages & API routes
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilities & helpers
│   └── styles/          # CSS files
├── database/
│   └── migrations/      # SQL migration files
├── public/              # Static files
├── .env.local           # Environment variables (local)
├── package.json         # Dependencies
├── next.config.ts       # Next.js config
└── tsconfig.json        # TypeScript config
```

### Important Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run lint             # Run linter
npm run type-check       # Check TypeScript

# Git
git status              # Check changes
git add .               # Stage all changes
git commit -m "msg"     # Commit changes
git push origin branch   # Push to GitHub
git pull origin main    # Pull latest changes

# Database
supabase login          # Login to Supabase
supabase link           # Link project
supabase migration up   # Run migrations
```

---

## BAGIAN 10: NEXT STEPS

Setelah setup selesai:

1. **Explore Codebase**: Baca struktur project
2. **Understand Features**: Pelajari fitur yang sudah ada
3. **Plan Experiment**: Tentukan apa yang ingin di-experiment
4. **Create Branch**: Buat branch baru untuk experiment
5. **Code & Test**: Develop & test di local
6. **Deploy**: Push ke GitHub & deploy ke Vercel dev
7. **Verify**: Test di Vercel dev environment
8. **Merge**: Merge ke main jika OK

---

## SUPPORT

Jika ada masalah:
1. Baca error message dengan teliti
2. Cek documentation di:
   - https://nextjs.org/docs
   - https://supabase.com/docs
   - https://vercel.com/docs
3. Cek GitHub issues
4. Tanya di community forum

---

**Last Updated**: December 13, 2025
**Status**: ✅ Ready for Development
