# 🛡️ Kognisia Database Backup & Migration Guide

## 🔐 **Database Password Reset - What You Need to Know**

### **✅ Safe to Reset (Won't Break Your App):**
- **Supabase Client SDK** - Uses API keys, not database password
- **Your Application** - Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- **Authentication System** - Supabase Auth works independently
- **File Storage** - Supabase Storage uses API keys
- **Edge Functions** - All Supabase services remain functional

### **⚠️ Will Be Affected (Need Updates):**
- **Direct PostgreSQL connections** - Backup scripts, database tools
- **Connection strings** - Any tools using `postgresql://postgres:password@...`
- **Third-party integrations** - Tools connecting directly to database

### **🔄 Safe Reset Process:**
1. **Create backup first** (with current password)
2. **Reset password in Supabase dashboard**
3. **Update connection strings** in backup scripts
4. **Test new connection**

## 💾 **Complete Backup Solution**

I've created comprehensive backup scripts for you:

### **📁 Files Created:**
```
kognisia-app/
├── scripts/
│   ├── backup-database.sh          # Full backup (structure + data)
│   ├── backup-schema-only.sh       # Structure only backup
│   ├── restore-database.sh         # Restore from backup
│   └── setup-local-postgres.sh     # Setup local PostgreSQL
└── database/
    ├── README.md                   # Complete documentation
    └── backups/                    # Backup storage directory
```

## 🚀 **Quick Start Guide**

### **1. Create Your First Backup**
```bash
# Get your Supabase connection string from:
# Supabase Dashboard > Settings > Database > Connection string

# Set environment variable
export SUPABASE_DB_URL="postgresql://postgres:[YOUR_PASSWORD]@[HOST]:5432/postgres"

# Create backup
./scripts/backup-database.sh
```

**Output:**
- `./database/backups/kognisia_backup_20241210_143022.sql`
- `./database/backups/kognisia_backup_20241210_143022.sql.gz` (compressed)

### **2. Setup Local PostgreSQL (Optional)**
```bash
# Install PostgreSQL first (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# Setup local database
./scripts/setup-local-postgres.sh
```

**Creates:**
- Database: `kognisia`
- User: `kognisia_user` 
- Password: `kognisia_password`
- Connection: `postgresql://kognisia_user:kognisia_password@localhost:5432/kognisia`

### **3. Restore to Local Database**
```bash
# Set target database
export TARGET_DB_URL="postgresql://kognisia_user:kognisia_password@localhost:5432/kognisia"

# Restore from backup
./scripts/restore-database.sh ./database/backups/kognisia_backup_20241210_143022.sql
```

## 🏗️ **VPS Migration Strategy**

### **Phase 1: Preparation**
```bash
# 1. Create final Supabase backup
export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"
./scripts/backup-database.sh

# 2. Setup VPS PostgreSQL
# On VPS (Ubuntu/Debian):
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### **Phase 2: Database Setup on VPS**
```bash
# On VPS, create database and user
sudo -u postgres createdb kognisia
sudo -u postgres createuser kognisia_user
sudo -u postgres psql -c "ALTER USER kognisia_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kognisia TO kognisia_user;"
```

### **Phase 3: Transfer & Restore**
```bash
# Transfer backup to VPS
scp ./database/backups/kognisia_backup_*.sql user@your-vps:/tmp/

# On VPS, restore database
export TARGET_DB_URL="postgresql://kognisia_user:your_secure_password@localhost:5432/kognisia"
psql "$TARGET_DB_URL" < /tmp/kognisia_backup_*.sql
```

### **Phase 4: Update Application**
```bash
# Update your .env files
DATABASE_URL="postgresql://kognisia_user:your_secure_password@your-vps-ip:5432/kognisia"

# Update Vercel environment variables
# Vercel Dashboard > Project > Settings > Environment Variables
```

## 📊 **Backup Strategy Recommendations**

### **🕐 Automated Backup Schedule**
```bash
# Add to crontab for automated backups
crontab -e

# Daily backup at 2 AM
0 2 * * * /path/to/kognisia-app/scripts/backup-database.sh

# Weekly full backup on Sunday
0 2 * * 0 /path/to/kognisia-app/scripts/backup-database.sh
```

### **📍 Multiple Storage Locations**
1. **Local Development:** `./database/backups/`
2. **Cloud Storage:** Google Drive, Dropbox, AWS S3
3. **VPS Storage:** `/var/backups/kognisia/`
4. **External Backup:** USB drive, external server

### **🗂️ Retention Policy**
- **Daily:** Keep 7 days
- **Weekly:** Keep 4 weeks
- **Monthly:** Keep 12 months
- **Critical Milestones:** Keep indefinitely

## 🔧 **Troubleshooting**

### **Connection Test**
```bash
# Test Supabase connection
psql "$SUPABASE_DB_URL" -c "SELECT version();"

# Test local connection  
psql "postgresql://kognisia_user:kognisia_password@localhost:5432/kognisia" -c "SELECT version();"
```

### **Common Issues & Solutions**

#### **"pg_dump: command not found"**
```bash
# Install PostgreSQL client tools
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql-client
# Windows: Download from postgresql.org
```

#### **"Permission denied"**
```bash
# Make scripts executable
chmod +x scripts/*.sh
```

#### **"Connection refused"**
```bash
# Check if PostgreSQL is running
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
```

## 🎯 **Best Practices**

### **Security**
- ✅ **Never commit passwords** to Git
- ✅ **Use environment variables** for connection strings
- ✅ **Secure VPS access** with SSH keys
- ✅ **Regular password rotation** for database users

### **Reliability**
- ✅ **Test backups regularly** by restoring to test environment
- ✅ **Monitor backup success** with alerts
- ✅ **Multiple backup locations** for redundancy
- ✅ **Document recovery procedures** for team

### **Performance**
- ✅ **Compress large backups** to save space
- ✅ **Schedule backups** during low-traffic hours
- ✅ **Use incremental backups** for large databases
- ✅ **Monitor backup duration** and optimize

## 📋 **Migration Checklist**

### **Pre-Migration**
- [ ] Create comprehensive Supabase backup
- [ ] Test backup integrity by restoring locally
- [ ] Document all current connection strings
- [ ] Prepare VPS environment and PostgreSQL
- [ ] Test VPS database connectivity

### **Migration Day**
- [ ] Create final production backup
- [ ] Transfer backup files to VPS
- [ ] Restore database on VPS
- [ ] Test database functionality thoroughly
- [ ] Update application environment variables
- [ ] Deploy application with new database settings

### **Post-Migration**
- [ ] Monitor application performance and errors
- [ ] Set up automated backup system on VPS
- [ ] Update team documentation
- [ ] Test disaster recovery procedures
- [ ] Consider Supabase decommissioning timeline

## 🆘 **Emergency Recovery Plan**

### **If Database is Compromised**
1. **Stop application** to prevent further damage
2. **Assess damage** - check what data is affected
3. **Find latest backup** - `ls -la ./database/backups/`
4. **Restore from backup** - use restore script
5. **Verify data integrity** - check critical tables
6. **Resume operations** - update connection strings

### **If Backup is Corrupted**
1. **Try compressed version** - `.sql.gz` files often survive
2. **Use schema backup** - restore structure, rebuild data
3. **Check version control** - database migrations in Git
4. **Contact Supabase support** - they may have point-in-time recovery

---

## 🏆 **Summary**

### **✅ What You Get:**
- **Complete backup solution** with automated scripts
- **Local development setup** for offline work
- **VPS migration strategy** for independence
- **Emergency recovery plan** for peace of mind
- **Best practices guide** for long-term success

### **🎯 Next Steps:**
1. **Create your first backup** using the scripts
2. **Test local restore** to verify everything works
3. **Set up automated backups** for regular protection
4. **Plan VPS migration** when you're ready for independence

**Your database is now protected and portable!** 🛡️🚀

**Files ready to use - just set your connection string and run the scripts!** ✨