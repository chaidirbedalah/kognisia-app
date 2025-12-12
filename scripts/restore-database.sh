#!/bin/bash

# 🔄 Kognisia Database Restore Script
# This script restores your database from a backup file

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Kognisia Database Restore Script${NC}"
echo "=================================================="

# Check if pg_restore and psql are installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ Error: psql is not installed${NC}"
    echo "Please install PostgreSQL client tools first."
    exit 1
fi

# Check for backup file argument
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}📋 Available backup files:${NC}"
    ls -la ./database/backups/kognisia_backup_*.sql 2>/dev/null || echo "No backup files found"
    echo ""
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 ./database/backups/kognisia_backup_20241210_143022.sql"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Check if it's a compressed file
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}🗜️  Detected compressed backup, decompressing...${NC}"
    TEMP_FILE="${BACKUP_FILE%.gz}"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
    CLEANUP_TEMP=true
fi

# Check for target database URL
if [ -z "$TARGET_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  TARGET_DB_URL not set${NC}"
    echo "Please set your target database connection string:"
    echo "export TARGET_DB_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    echo ""
    echo "For localhost: export TARGET_DB_URL='postgresql://postgres:password@localhost:5432/kognisia'"
    exit 1
fi

echo -e "${YELLOW}📋 Restore Information:${NC}"
echo "Backup file: $BACKUP_FILE"
echo "Target database: $TARGET_DB_URL"
echo "Date: $(date)"
echo ""

# Warning prompt
echo -e "${RED}⚠️  WARNING: This will OVERWRITE the target database!${NC}"
echo "All existing data in the target database will be lost."
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo ""
echo -e "${YELLOW}🔄 Starting database restore...${NC}"

# Execute the restore
psql "$TARGET_DB_URL" < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database restore completed successfully!${NC}"
    
    # Cleanup temporary file if created
    if [ "$CLEANUP_TEMP" = true ]; then
        rm "$TEMP_FILE"
        echo "Cleaned up temporary decompressed file"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Your database has been restored!${NC}"
    echo "You can now connect to your restored database."
    
else
    echo -e "${RED}❌ Restore failed!${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi