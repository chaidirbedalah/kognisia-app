# 🗄️ Kognisia Database Management

## 📋 Overview

This directory contains database management scripts and backups for the Kognisia application.

## 🔐 Database Password Reset Impact

### What Happens When You Reset Supabase Database Password:

1. **Immediate Effects:**
   - All existing database connections terminated
   - Applications using old password lose access
   - Database connection errors in your app

2. **What Remains Working:**
   - ✅ Supabase client SDK (uses API keys, not database password)
   - ✅ Your app's `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ Your app's `SUPABASE_SERVICE_ROLE_KEY`
   - ✅ All Supabase Auth, Storage, and Edge Functions

3. **What Needs Updating:**
   - ❌ Direct PostgreSQL connection strings
   - ❌ Database backup scripts
   - ❌ Any tools using direct database access

### Safe Password Reset Process:

1. **Before Reset:**
   ```bash
   # Create backup with current password
   export SUPABASE_DB_URL="postgresql://postgres:OLD_PASSWORD@..."
   ./scripts/backup-database.sh
   ```

2. **Reset Password in Supabase Dashboard**

3. **After Reset:**
   ```bash
   # Update connection string with new password
   export SUPABASE_DB_URL="postgresql://postgres:NEW_PASSWORD@..."
   # Test connection
   psql "$SUPABASE_DB_URL" -c "SELECT version();"
   ```

## 💾 Backup & Restore Scripts

### 🗄️ Full Database Backup
```bash
# Set your Supabase connection string
export SUPABASE_DB_URL="postgresql://postgres:[password]@[host]:5432/postgres"

# Create full backup (structure + data)
./scripts/backup-database.sh
```

**Output:**
- `./database/backups/kognisia_backup_YYYYMMDD_HHMMSS.sql`
- `./database/backups/kognisia_backup_YYYYMMDD_HHMMSS.sql.gz` (compressed)

### 🏗️ Schema-Only Backup
```bash
# Create structure-only backup (no data)
./scripts/backup-schema-only.sh
```

**Use Cases:**
- Setting up development environment
- Creating new database with same structure
- Version control for database schema

### 🔄 Database Restore
```bash
# Set target database (localhost or VPS)
export TARGET_DB_URL="postgresql://postgres:password@localhost:5432/kognisia"

# Restore from backup
./scripts/restore-database.sh ./database/backups/kognisia_backup_20241210_143022.sql
```

### 🐘 Local PostgreSQL Setup
```bash
# Set up local PostgreSQL database
./scripts/setup-local-postgres.sh
```

**Creates:**
- Database: `kognisia`
- User: `kognisia_user`
- Password: `kognisia_password`
- Connection: `postgresql://kognisia_user:kognisia_password@localhost:5432/kognisia`

## 🚀 Migration to VPS

### Step 1: Prepare VPS
```bash
# On your VPS (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb kognisia
sudo -u postgres createuser kognisia_user
sudo -u postgres psql -c "ALTER USER kognisia_user WITH PASSWORD 'your_secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kognisia TO kognisia_user;"
```

### Step 2: Create Backup from Supabase
```bash
# On your local machine
export SUPABASE_DB_URL="postgresql://postgres:[supabase_password]@[supabase_host]:5432/postgres"
./scripts/backup-database.sh
```

### Step 3: Transfer and Restore
```bash
# Upload backup to VPS
scp ./database/backups/kognisia_backup_*.sql user@your-vps:/tmp/

# On VPS, restore database
export TARGET_DB_URL="postgresql://kognisia_user:your_secure_password@localhost:5432/kognisia"
psql "$TARGET_DB_URL" < /tmp/kognisia_backup_*.sql
```

### Step 4: Update Application
```bash
# Update your app's environment variables
DATABASE_URL="postgresql://kognisia_user:your_secure_password@your-vps-ip:5432/kognisia"
```

## 📊 Backup Strategy Recommendations

### 🕐 Automated Backups
```bash
# Add to crontab for daily backups
0 2 * * * /path/to/kognisia-app/scripts/backup-database.sh

# Weekly full backup + daily incremental
0 2 * * 0 /path/to/kognisia-app/scripts/backup-database.sh  # Sunday full
0 2 * * 1-6 /path/to/kognisia-app/scripts/backup-schema-only.sh  # Mon-Sat schema
```

### 🗂️ Backup Retention
- **Daily:** Keep 7 days
- **Weekly:** Keep 4 weeks  
- **Monthly:** Keep 12 months
- **Yearly:** Keep indefinitely

### 📍 Storage Locations
1. **Local:** `./database/backups/` (development)
2. **Cloud Storage:** AWS S3, Google Drive, Dropbox
3. **VPS:** `/var/backups/kognisia/`
4. **External:** USB drive, external server

## 🔧 Troubleshooting

### Connection Issues
```bash
# Test Supabase connection
psql "$SUPABASE_DB_URL" -c "SELECT version();"

# Test local connection
psql "postgresql://kognisia_user:kognisia_password@localhost:5432/kognisia" -c "SELECT version();"
```

### Permission Issues
```bash
# Fix PostgreSQL permissions
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE kognisia TO kognisia_user;"
sudo -u postgres psql -d kognisia -c "GRANT ALL ON SCHEMA public TO kognisia_user;"
```

### Large Database Backups
```bash
# For large databases, use custom format
pg_dump "$SUPABASE_DB_URL" --format=custom --file=backup.dump

# Restore custom format
pg_restore --dbname="$TARGET_DB_URL" backup.dump
```

## 📋 Checklist: Database Migration

### Pre-Migration
- [ ] Create full Supabase backup
- [ ] Test backup integrity
- [ ] Document current connection strings
- [ ] Prepare VPS environment
- [ ] Test VPS PostgreSQL installation

### Migration
- [ ] Create final Supabase backup
- [ ] Transfer backup to VPS
- [ ] Restore database on VPS
- [ ] Test database functionality
- [ ] Update application environment variables

### Post-Migration
- [ ] Test application with new database
- [ ] Set up automated backups on VPS
- [ ] Monitor performance and errors
- [ ] Update documentation
- [ ] Decommission Supabase (if desired)

## 🆘 Emergency Recovery

### If Database is Lost
1. **Check Backups:** `ls -la ./database/backups/`
2. **Find Latest:** Most recent `kognisia_backup_*.sql`
3. **Restore Quickly:** Use restore script
4. **Verify Data:** Check critical tables
5. **Resume Operations:** Update connection strings

### If Backup is Corrupted
1. **Try Compressed Version:** `.sql.gz` files
2. **Use Schema Backup:** Restore structure, rebuild data
3. **Contact Supabase:** They may have point-in-time recovery
4. **Check Git History:** Database migrations in version control

---

## 🎯 Best Practices

1. **Regular Backups:** Daily automated backups
2. **Test Restores:** Monthly restore testing
3. **Multiple Locations:** Store backups in multiple places
4. **Version Control:** Track schema changes in Git
5. **Documentation:** Keep connection strings secure but documented
6. **Monitoring:** Set up alerts for backup failures

**Your database is your most valuable asset - protect it well!** 🛡️