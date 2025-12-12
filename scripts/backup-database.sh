#!/bin/bash

# 🗄️ Kognisia Database Backup Script
# This script creates a complete backup of your Supabase database

# Configuration
BACKUP_DIR="./database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="kognisia_backup_${DATE}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🗄️ Kognisia Database Backup Script${NC}"
echo "=================================================="

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ Error: pg_dump is not installed${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_DB_URL not found in environment${NC}"
    echo "Please set your database connection string:"
    echo "export SUPABASE_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "You can find this in your Supabase project settings > Database > Connection string"
    exit 1
fi

echo -e "${YELLOW}📋 Backup Information:${NC}"
echo "Date: $(date)"
echo "Backup file: $BACKUP_FILE"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create full database backup
echo -e "${YELLOW}🔄 Creating database backup...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --format=plain \
    --file="$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "Backup saved to: $BACKUP_DIR/$BACKUP_FILE"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
    
    # Create compressed version
    echo -e "${YELLOW}🗜️  Creating compressed backup...${NC}"
    gzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/${BACKUP_FILE}.gz"
    COMPRESSED_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
    echo "Compressed size: $COMPRESSED_SIZE"
    
    echo ""
    echo -e "${GREEN}🎉 Backup process completed!${NC}"
    echo "Files created:"
    echo "  - $BACKUP_DIR/$BACKUP_FILE (SQL dump)"
    echo "  - $BACKUP_DIR/${BACKUP_FILE}.gz (Compressed)"
    
else
    echo -e "${RED}❌ Backup failed!${NC}"
    echo "Please check your database connection string and try again."
    exit 1
fi

# Cleanup old backups (keep last 10)
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
cd "$BACKUP_DIR"
ls -t kognisia_backup_*.sql | tail -n +11 | xargs -r rm
ls -t kognisia_backup_*.sql.gz | tail -n +11 | xargs -r rm
echo "Kept 10 most recent backups"

echo ""
echo -e "${GREEN}✅ All done! Your database is safely backed up.${NC}"