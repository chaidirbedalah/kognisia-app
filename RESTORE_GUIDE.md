# 🚀 **Panduan Restore ke Akun Supabase Berbeda**

## **📋 Script yang Tersedia:**

### **1. Quick Restore (Recommended)**
```bash
# Untuk restore ke sahabat-promil
./scripts/quick-restore.sh sahabat-promil

# Untuk restore ke kognisia-dev  
./scripts/quick-restore.sh kognisia-dev
```

### **2. Manual Restore**
```bash
./scripts/restore-api.sh [TARGET_URL] [SERVICE_ROLE_KEY] [BACKUP_NAME]
```

### **3. Backup Lengkap (jika perlu backup baru)**
```bash
./scripts/backup-api.sh [backup_name]
```

---

## **🎯 Target Projects Anda:**

### **Project 1: sahabat-promil**
- **Reference ID**: `jjgfethvijznoyljylmi`
- **URL**: `https://jjgfethvijznoyljylmi.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/jjgfethvijznoyljylmi

### **Project 2: kognisia-dev**
- **Reference ID**: `nrmkkuphbkmakzawkda`
- **URL**: `https://nrmkkuphbkmakzawkda.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/nrmkkuphbkmakzawkda

---

## **🔑 Cara Mendapatkan Service Role Key:**

### **Step-by-Step:**
1. **Buka Dashboard**: https://supabase.com/dashboard
2. **Pilih Project Target**:
   - Klik "sahabat-promil" atau "kognisia-dev"
3. **Menu Settings**:
   - Klik "Settings" (icon gear) → "API"
4. **Copy Service Role Key**:
   - Cari section "Project API keys"
   - Copy "service_role" key
   - Key format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **⚠️ Security Note:**
- Service Role Key punya akses penuh
- Jangan bagikan ke publik
- Simpan di environment variable yang aman

---

## **🚀 Cara Restore:**

### **Method 1: Quick Restore (Mudah)**
```bash
# Restore ke sahabat-promil
./scripts/quick-restore.sh sahabat-promil

# Akan diminta:
# 1. Service Role Key untuk sahabat-promil
# 2. Konfirmasi restore
```

### **Method 2: Manual Restore (Full Control)**
```bash
# Restore ke sahabat-promil
./scripts/restore-api.sh \
  https://jjgfethvijznoyljylmi.supabase.co \
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
  kognisia_api_backup_20251217_095148
```

### **Method 3: Interactive Restore**
```bash
# Jalankan script restore
./scripts/restore-api.sh

# Akan diminta:
# 1. Target URL
# 2. Service Role Key  
# 3. Backup name
```

---

## **📊 Backup yang Tersedia:**

### **Latest Backup:**
- **Name**: `kognisia_api_backup_20251217_095148`
- **Size**: 16KB (compressed)
- **Records**:
  - Question Bank: 45 soal
  - Subtests: 4 records
  - Users: 2 users
  - Classes: 4 records
  - Assessments: 4 records

---

## **🔄 Setelah Restore:**

### **1. Update Environment:**
```bash
# Copy file environment yang baru
cp .env.restored .env.local

# Atau update manual
NEXT_PUBLIC_SUPABASE_URL=https://jjgfethvijznoyljylmi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

### **2. Update Vercel:**
```bash
# Deploy ke Vercel dengan environment baru
vercel --prod
```

### **3. Test Application:**
- Buka URL Vercel yang baru
- Test login dengan user yang ada
- Verifikasi data sudah pindah

---

## **⚠️ Important Notes:**

### **Data yang Akan Di-restore:**
✅ **Question Bank** (45 soal)  
✅ **Subtests** (4 records)  
✅ **Classes** (4 records)  
✅ **Assessments** (4 records)  
✅ **Users** (2 users)  

### **Data yang Perlu Manual:**
⚠️ **Student Progress** (0 records)  
⚠️ **Achievements** (0 records)  
⚠️ **Squads** (0 records)  

### **Limitations:**
- **Auth users** perlu di-migrate manual
- **UUID references** mungkin berubah
- **Storage files** perlu di-upload manual

---

## **🎯 Quick Start Commands:**

### **Backup Current Project:**
```bash
export SUPABASE_SERVICE_ROLE_KEY=your_current_key
./scripts/backup-api.sh
```

### **Restore to sahabat-promil:**
```bash
./scripts/quick-restore.sh sahabat-promil
# Masukkan service role key sahabat-promil
```

### **Restore to kognisia-dev:**
```bash
./scripts/quick-restore.sh kognisia-dev
# Masukkan service role key kognisia-dev
```

---

## **📞 Bantuan:**

### **Jika Ada Masalah:**
1. **Check Connection**: `curl -I [TARGET_URL]/rest/v1/`
2. **Verify Key**: Test di API playground Supabase
3. **Check Logs**: `vercel logs [deployment_url]`
4. **Manual Import**: Gunakan dashboard Supabase

### **Debug Commands:**
```bash
# Test API connection
curl -X GET "https://target.supabase.co/rest/v1/question_bank?limit=1" \
  -H "apikey: YOUR_SERVICE_ROLE_KEY"

# Check backup integrity
tar -tzf backups/backup_name.tar.gz
```

---

**🚀 Ready untuk migrasi!** 

Pilih target project, dapatkan service role key, dan jalankan restore script!