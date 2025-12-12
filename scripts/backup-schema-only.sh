#!/bin/bash

# 🏗️ Kognisia Schema-Only Backup Script
# This script creates a backup of database structure without data

# Configuration
BACKUP_DIR="./database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
SCHEMA_FILE="kognisia_schema_${DATE}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏗️ Kognisia Schema Backup Script${NC}"
echo "=================================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_DB_URL not found in environment${NC}"
    echo "Please set your database connection string first."
    exit 1
fi

echo -e "${YELLOW}📋 Schema Backup Information:${NC}"
echo "Date: $(date)"
echo "Schema file: $SCHEMA_FILE"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Create schema-only backup
echo -e "${YELLOW}🔄 Creating schema backup...${NC}"
pg_dump "$SUPABASE_DB_URL" \
    --verbose \
    --clean \
    --if-exists \
    --create \
    --schema-only \
    --format=plain \
    --file="$BACKUP_DIR/$SCHEMA_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema backup completed successfully!${NC}"
    echo "Schema saved to: $BACKUP_DIR/$SCHEMA_FILE"
    
    # Get file size
    SCHEMA_SIZE=$(du -h "$BACKUP_DIR/$SCHEMA_FILE" | cut -f1)
    echo "Schema size: $SCHEMA_SIZE"
    
    echo ""
    echo -e "${GREEN}🎉 Schema backup completed!${NC}"
    echo "This file contains:"
    echo "  - All table structures"
    echo "  - Indexes and constraints"
    echo "  - Functions and triggers"
    echo "  - RLS policies"
    echo "  - No actual data"
    
else
    echo -e "${RED}❌ Schema backup failed!${NC}"
    exit 1
fi