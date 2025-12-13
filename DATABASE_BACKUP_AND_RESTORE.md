# Database Backup & Restore Guide

Panduan lengkap untuk backup dan restore database Supabase.

---

## 📦 BACKUP DATABASE

### Method 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref [your-project-id]

# Pull database schema & data
supabase db pull

# Ini akan membuat file di folder supabase/migrations/
```

### Method 2: Supabase Dashboard

1. Buka Supabase Dashboard
2. Klik "Settings" (gear icon)
3. Klik "Database"
4. Scroll ke "Backups"
5. Klik "Create backup"
6. Tunggu selesai
7. Backup akan tersimpan otomatis

### Method 3: Manual SQL Export

```bash
# Menggunakan psql (PostgreSQL client)
# Pastikan psql sudah installed

# Export database
pg_dump -h [host] -U [user] -d [database] > backup.sql

# Contoh:
# pg_dump -h db.supabase.co -U postgres -d postgres > kognisia_backup.sql
```

---

## 💾 RESTORE DATABASE

### Method 1: Supabase CLI

```bash
# Push database schema & data
supabase db push

# Atau jika ingin restore dari backup tertentu:
# 1. Buka Supabase Dashboard
# 2. Settings → Database → Backups
# 3. Pilih backup yang ingin di-restore
# 4. Klik "Restore"
```

### Method 2: Supabase Dashboard

1. Buka Supabase Dashboard
2. Klik "Settings"
3. Klik "Database"
4. Scroll ke "Backups"
5. Pilih backup yang ingin di-restore
6. Klik "Restore"
7. Confirm
8. Tunggu selesai (biasanya 5-10 menit)

### Method 3: Manual SQL Restore

```bash
# Restore dari file SQL
psql -h [host] -U [user] -d [database] < backup.sql

# Contoh:
# psql -h db.supabase.co -U postgres -d postgres < kognisia_backup.sql
```

---

## 🔄 BACKUP STRATEGY

### Daily Backups
Supabase otomatis membuat backup harian. Anda bisa restore dari backup manapun dalam 7 hari terakhir.

### Weekly Manual Backups
```bash
# Buat backup mingguan
supabase db pull

# Commit ke git
git add supabase/migrations/
git commit -m "backup: weekly database backup"
git push origin main
```

### Before Major Changes
```bash
# Sebelum membuat perubahan besar, buat backup
supabase db pull

# Commit
git add supabase/migrations/
git commit -m "backup: before major changes"
git push origin main
```

---

## 📋 BACKUP CHECKLIST

- [ ] Supabase CLI installed
- [ ] Logged in to Supabase
- [ ] Project linked
- [ ] Backup created
- [ ] Backup file saved
- [ ] Backup committed to git

---

## 🆘 DISASTER RECOVERY

### Jika Database Corrupt

1. **Stop application** - Jangan biarkan app menulis ke database
2. **Create backup** - Backup current state
3. **Restore from backup** - Restore dari backup terakhir yang baik
4. **Verify data** - Cek data sudah benar
5. **Restart application** - Mulai app lagi

### Jika Perlu Rollback

```bash
# Lihat history migrations
git log --oneline supabase/migrations/

# Checkout ke commit sebelumnya
git checkout [commit-hash] -- supabase/migrations/

# Push ke Supabase
supabase db push
```

---

## 📊 BACKUP RETENTION

| Backup Type | Retention | Auto-created |
|------------|-----------|--------------|
| Daily | 7 days | Yes |
| Weekly | 4 weeks | Manual |
| Monthly | 12 months | Manual |
| Before Major Changes | Unlimited | Manual |

---

## 🔐 SECURITY NOTES

1. **Never commit credentials** - Jangan commit `.env.local` ke git
2. **Backup credentials** - Simpan credentials di tempat aman
3. **Encrypt backups** - Jika backup di-store di cloud, encrypt
4. **Test restore** - Regularly test restore process
5. **Access control** - Limit siapa yang bisa access backups

---

## 📝 BACKUP SCHEDULE

### Recommended Schedule

```
Monday:    Automatic daily backup (Supabase)
Wednesday: Automatic daily backup (Supabase)
Friday:    Manual weekly backup (supabase db pull)
Sunday:    Verify backup integrity
```

### Automation Script

```bash
#!/bin/bash
# backup.sh

# Create backup
supabase db pull

# Commit
git add supabase/migrations/
git commit -m "backup: automated weekly backup - $(date +%Y-%m-%d)"

# Push
git push origin main

# Log
echo "Backup completed at $(date)" >> backup.log
```

---

## 🔗 USEFUL COMMANDS

```bash
# List all backups
supabase db list-backups

# Get backup info
supabase db get-backup [backup-id]

# Restore specific backup
supabase db restore [backup-id]

# Pull latest schema
supabase db pull

# Push schema
supabase db push

# Check migration status
supabase migration list
```

---

## 📚 REFERENCES

- [Supabase Backups Docs](https://supabase.com/docs/guides/database/backups)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-pull)
- [PostgreSQL Backup Docs](https://www.postgresql.org/docs/current/backup.html)

---

**Last Updated**: December 13, 2025
**Status**: ✅ Ready for Use
