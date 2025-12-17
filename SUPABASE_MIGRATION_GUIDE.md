# 🔄 **Panduan Backup & Pindah Supabase Project**

## **📋 Metode Backup yang Tersedia**

### **🔧 Metode 1: Via Supabase CLI (Recommended)**
```bash
# 1. Login ke akun sumber
supabase login

# 2. Link ke project sumber
supabase link --project-ref luioyqrubylvjospgsjx

# 3. Backup database
supabase db dump --data-only > kognisia_backup.sql

# 4. Backup storage (jika ada file)
supabase storage download --bucket=avatars ./backup_storage/
```

### **🌐 Metode 2: Via Dashboard (Manual)**
1. **Database Backup**:
   - Dashboard → Project Settings → Database
   - Click "Create new backup"
   - Download backup file

2. **Schema Export**:
   - Dashboard → Database → SQL Editor
   - Run: `SELECT * FROM pg_tables WHERE schemaname = 'public'`
   - Export table structures

### **⚙️ Metode 3: Via REST API (Programmatic)**
```bash
# Export data via API
curl -X POST 'https://nxlkgjmwujolzqaxsine.supabase.co/rest/v1/rpc/export_all_tables' \
  -H "apikey: YOUR_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  > backup_data.json
```

---

## **🚀 Cara Pindah ke Akun Berbeda**

### **📝 Step 1: Setup Project Baru**
```bash
# 1. Login ke akun target
supabase logout
supabase login

# 2. Buat project baru di dashboard target
# Atau gunakan project existing: sahabat-promil atau kognisia-dev

# 3. Link ke project target
supabase link --project-ref [REFERENCE_ID_TARGET]
```

### **📊 Step 2: Restore Database**
```bash
# 1. Restore schema dulu
supabase db reset

# 2. Restore data
supabase db push kognisia_backup.sql

# 3. Atur RLS policies
supabase db push
```

### **🗂️ Step 3: Restore Storage**
```bash
# Upload file storage jika ada
supabase storage upload --bucket=avatars ./backup_storage/*
```

---

## **🛠️ Script Otomatisasi**

### **📄 Script Backup Lengkap**
```bash
#!/bin/bash
# backup-kognisia.sh

echo "🔄 Starting backup process..."

# Set variables
SOURCE_PROJECT="luioyqrubylvjospgsjx"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# 1. Backup database
echo "📊 Backing up database..."
supabase db dump --data-only > $BACKUP_DIR/database.sql

# 2. Backup schema
echo "🏗️ Backing up schema..."
supabase db dump --schema-only > $BACKUP_DIR/schema.sql

# 3. Export questions
echo "❓ Exporting questions..."
curl -X POST 'https://nxlkgjmwujolzqaxsine.supabase.co/rest/v1/question_bank' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  > $BACKUP_DIR/questions.json

# 4. Export users
echo "👥 Exporting users..."
curl -X POST 'https://nxlkgjmwujolzqaxsine.supabase.co/auth/v1/admin/users' \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  > $BACKUP_DIR/users.json

echo "✅ Backup completed: $BACKUP_DIR"
```

### **📄 Script Restore Lengkap**
```bash
#!/bin/bash
# restore-kognisia.sh

TARGET_PROJECT=$1
BACKUP_DIR=$2

if [ -z "$TARGET_PROJECT" ] || [ -z "$BACKUP_DIR" ]; then
    echo "Usage: ./restore-kognisia.sh [TARGET_PROJECT_REF] [BACKUP_DIR]"
    exit 1
fi

echo "🔄 Starting restore to $TARGET_PROJECT..."

# 1. Link ke target project
supabase link --project-ref $TARGET_PROJECT

# 2. Reset database
echo "🗑️ Resetting target database..."
supabase db reset

# 3. Restore schema
echo "🏗️ Restoring schema..."
supabase db push $BACKUP_DIR/schema.sql

# 4. Restore data
echo "📊 Restoring data..."
supabase db push $BACKUP_DIR/database.sql

# 5. Restore questions via API
echo "❓ Restoring questions..."
curl -X POST "https://[TARGET_URL]/rest/v1/question_bank" \
  -H "apikey: $TARGET_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $TARGET_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d @$BACKUP_DIR/questions.json

echo "✅ Restore completed!"
```

---

## **🎯 Scenario Spesifik untuk Kognisia**

### **📋 Scenario A: Pindah ke Project `sahabat-promil`**
```bash
# 1. Backup dari kognisia-app
supabase link --project-ref luioyqrubylvjospgsjx
./backup-kognisia.sh

# 2. Restore ke sahabat-promil
supabase link --project-ref jjgfethvijznoyljylmi
./restore-kognisia.sh jjgfethvijznoyljylmi ./backups/20251217_100000/
```

### **📋 Scenario B: Pindah ke Project `kognisia-dev`**
```bash
# 1. Backup dari kognisia-app
supabase link --project-ref luioyqrubylvjospgsjx
./backup-kognisia.sh

# 2. Restore ke kognisia-dev
supabase link --project-ref nrmkkuphbkmakzawkxda
./restore-kognisia.sh nrmkkuphbkmakzawkxda ./backups/20251217_100000/
```

---

## **⚠️ Important Notes**

### **🔑 Authentication & RLS**
- **Service Role Keys** berbeda antar project
- **RLS Policies** harus di-setup ulang
- **Auth users** harus di-migrate manual

### **📊 Data Types yang Perlu Attention**
- **UUID references** mungkin berubah
- **Timestamps** akan menggunakan timezone baru
- **Foreign keys** harus di-recreate

### **🔄 Environment Variables**
Update di `.env.local`:
```bash
# Project lama
NEXT_PUBLIC_SUPABASE_URL=https://nxlkgjmwujolzqaxsine.supabase.co
SUPABASE_SERVICE_ROLE_KEY=old_key

# Project baru
NEXT_PUBLIC_SUPABASE_URL=https://new-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=new_key
```

---

## **🚀 Quick Start Commands**

### **Backup Cepat:**
```bash
# Backup semua data penting
npm run backup-all
```

### **Restore Cepat:**
```bash
# Restore ke project target
npm run restore-to-project [TARGET_REF]
```

### **Test Migration:**
```bash
# Test dengan sample data
npm run test-migration
```

---

## **📞 Support & Troubleshooting**

### **🔍 Common Issues:**
1. **Permission Denied**: Check service role key
2. **UUID Mismatch**: Update foreign key references
3. **RLS Errors**: Re-enable policies after restore

### **🛠️ Debug Commands:**
```bash
# Check connection
supabase status

# Test database
supabase db shell --command "SELECT version();"

# Check tables
supabase db shell --command "\dt"
```

---

**📋 Checklist Sebelum Migration:**
- [ ] Backup lengkap database
- [ ] Backup storage files
- [ ] Document environment variables
- [ ] Test restore di development
- [ ] Update deployment configuration
- [ ] Test semua API endpoints
- [ ] Verify user authentication

**Ready untuk migrasi!** 🚀