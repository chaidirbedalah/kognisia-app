# 🌐 REST API Backup Guide - Supabase Free Tier

## 📋 Overview

Panduan lengkap untuk backup database Kognisia menggunakan Supabase REST API. Metode ini **gratis** dan bekerja di **Free Tier** tanpa perlu upgrade plan.

## ✅ Keuntungan REST API Backup

- ✅ **Gratis** - Tidak perlu Pro plan
- ✅ **Reliable** - Menggunakan HTTPS (port 443)
- ✅ **Tidak terpengaruh DNS** - Bekerja meski DNS bermasalah
- ✅ **Mudah** - Hanya perlu curl dan API key
- ✅ **Scriptable** - Bisa di-automate dengan cron

## 🔑 API Key

Anda sudah punya API key di `.env.local`:

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Catatan:** Jangan share API key ini ke publik!

## 🚀 Quick Export (Cara Paling Mudah)

### Langkah 1: Jalankan Script

```bash
cd kognisia-app
./scripts/quick-export.sh
```

### Langkah 2: Lihat Hasil

```bash
ls -lh ./database/backups/
```

**Output:**
```
question_bank_20251212_113046.json (128K)
users_20251212_113046.json (4K)
squads_20251212_113046.json (4K)
squad_battles_20251212_113046.json (4K)
```

---

## 📊 Export Table Spesifik

### Syntax

```bash
./scripts/export-single-table.sh [table_name]
```

### Contoh

```bash
# Export question_bank
./scripts/export-single-table.sh question_bank

# Export squad_battles
./scripts/export-single-table.sh squad_battles

# Export users
./scripts/export-single-table.sh users

# Export squad_members
./scripts/export-single-table.sh squad_members
```

### Available Tables

```
- users
- squads
- squad_members
- squad_battles
- squad_battle_participants
- squad_battle_questions
- squad_battle_answers
- question_bank
- daily_challenges
- daily_challenge_answers
- mini_tryouts
- mini_tryout_answers
- tryout_utbk
- tryout_utbk_answers
- user_streaks
```

---

## 🔧 Manual Export via curl

Jika ingin export manual tanpa script:

```bash
# Set variables
SUPABASE_URL="https://luioyqrubylvjospgsjx.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Export question_bank
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/question_bank?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > question_bank_backup.json

# Export squad_battles
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/squad_battles?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > squad_battles_backup.json
```

**Penting:** Gunakan header `apikey` bukan `Authorization`!

---

## 💾 Simpan Backup dengan Aman

### Opsi 1: Archive Lengkap

```bash
# Buat satu file archive
tar -czf kognisia_backup_$(date +%Y%m%d_%H%M%S).tar.gz ./database/backups/

# Lihat file
ls -lh kognisia_backup_*.tar.gz
```

### Opsi 2: Upload ke Cloud

```bash
# Google Drive (jika punya gdrive CLI)
gdrive upload kognisia_backup_*.tar.gz

# Atau manual upload ke:
# - Google Drive
# - Dropbox
# - OneDrive
# - AWS S3
# - GitHub (private repo)
```

### Opsi 3: Backup ke External Drive

```bash
# Copy ke external drive
cp -r ./database/backups/ /Volumes/ExternalDrive/Kognisia_Backup/
```

---

## 🔄 Automated Backup (Cron Job)

### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Tambahkan baris ini untuk backup setiap hari jam 2 pagi:
0 2 * * * cd ~/kognisia-app && ./scripts/quick-export.sh

# Atau backup setiap jam:
0 * * * * cd ~/kognisia-app && ./scripts/quick-export.sh
```

### Verify Cron Job

```bash
# Lihat cron jobs yang aktif
crontab -l
```

---

## 📊 Restore dari Backup

### Restore ke Localhost

```bash
# Setup local PostgreSQL dulu
./scripts/setup-local-postgres.sh

# Restore dari JSON backup
# (Perlu script khusus untuk import JSON ke PostgreSQL)
```

### Restore ke Supabase Baru

```bash
# Gunakan Supabase Dashboard untuk import data
# Atau gunakan API untuk bulk insert
```

---

## 🆘 Troubleshooting

### Error: "No API key found"

**Penyebab:** Header salah atau API key tidak valid

**Solusi:**
```bash
# Gunakan header "apikey" bukan "Authorization"
curl -H "apikey: YOUR_KEY" ...
```

### Error: "DNS resolution failed"

**Penyebab:** Jaringan tidak bisa resolve hostname

**Solusi:** REST API tidak terpengaruh DNS, gunakan script yang sudah disediakan

### File Size Kecil (111B)

**Penyebab:** API key tidak terdeteksi, response error

**Solusi:** Cek header format, gunakan `apikey` bukan `Authorization`

---

## 📈 Monitoring Backup

### Cek Ukuran Backup

```bash
# Lihat total ukuran backup
du -sh ./database/backups/

# Lihat per file
ls -lh ./database/backups/
```

### Cek Jumlah Records

```bash
# Lihat jumlah records di question_bank
jq 'length' ./database/backups/kognisia_question_bank_*.json

# Lihat jumlah records di squad_battles
jq 'length' ./database/backups/kognisia_squad_battles_*.json
```

---

## 🎯 Best Practices

1. **Backup Reguler**
   - Minimal 1x seminggu
   - Ideal 1x sehari

2. **Multiple Locations**
   - Local: `./database/backups/`
   - Cloud: Google Drive, Dropbox
   - External: USB drive, external server

3. **Retention Policy**
   - Daily: Keep 7 days
   - Weekly: Keep 4 weeks
   - Monthly: Keep 12 months

4. **Test Restore**
   - Monthly test restore ke localhost
   - Verify data integrity
   - Document restore procedure

5. **Security**
   - Jangan share API key
   - Encrypt backup files
   - Secure cloud storage

---

## 📝 Checklist

- [ ] Jalankan `./scripts/quick-export.sh`
- [ ] Verify file size > 100K
- [ ] Cek jumlah records
- [ ] Upload ke cloud storage
- [ ] Setup cron job untuk automated backup
- [ ] Test restore ke localhost
- [ ] Document backup procedure

---

## 🎉 Summary

Anda sekarang punya:
- ✅ **Backup system** yang reliable
- ✅ **Gratis** di Free Tier
- ✅ **Automated** dengan cron job
- ✅ **Secure** dengan multiple locations
- ✅ **Documented** untuk team

**Database Anda sekarang aman dan terlindungi!** 🛡️

---

**Pertanyaan? Lihat troubleshooting section atau hubungi support!** 🚀