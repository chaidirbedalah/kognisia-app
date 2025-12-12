#!/bin/bash

# 🌐 Export Kognisia Database via REST API
# Ini script untuk export data tanpa perlu direct database connection

# Configuration
SUPABASE_URL="https://luioyqrubylvjospgsjx.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aW95cXJ1Ynlsdmpvc3Bnc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTk5ODIsImV4cCI6MjA4MDY3NTk4Mn0.v3LZlEQ5viepRQZ622_AFapwxcNHamTePRlS-Cft07o"

BACKUP_DIR="./database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="kognisia_backup_rest_api_${DATE}.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🌐 Kognisia Database Export via REST API${NC}"
echo "=================================================="

# Create backup directory
mkdir -p "$BACKUP_DIR"

# List of tables to export
TABLES=(
  "users"
  "squads"
  "squad_members"
  "squad_battles"
  "squad_battle_participants"
  "squad_battle_questions"
  "squad_battle_answers"
  "question_bank"
  "daily_challenges"
  "daily_challenge_answers"
  "mini_tryouts"
  "mini_tryout_answers"
  "tryout_utbk"
  "tryout_utbk_answers"
  "user_streaks"
)

echo -e "${YELLOW}📋 Tables to export:${NC}"
for table in "${TABLES[@]}"; do
  echo "  - $table"
done

echo ""
echo -e "${YELLOW}🔄 Starting export...${NC}"

# Create JSON file with all tables
echo "{" > "$BACKUP_DIR/$BACKUP_FILE"
echo "  \"backup_date\": \"$(date)\"," >> "$BACKUP_DIR/$BACKUP_FILE"
echo "  \"tables\": {" >> "$BACKUP_DIR/$BACKUP_FILE"

first_table=true

for table in "${TABLES[@]}"; do
  echo -e "${YELLOW}  Exporting table: $table${NC}"
  
  # Add comma before each table except the first
  if [ "$first_table" = false ]; then
    echo "," >> "$BACKUP_DIR/$BACKUP_FILE"
  fi
  first_table=false
  
  # Export table data via REST API
  echo "    \"$table\": " >> "$BACKUP_DIR/$BACKUP_FILE"
  
  curl -s -X GET \
    "${SUPABASE_URL}/rest/v1/${table}?select=*" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    >> "$BACKUP_DIR/$BACKUP_FILE"
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}    ✅ Success${NC}"
  else
    echo -e "${RED}    ❌ Failed${NC}"
  fi
done

echo "" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "  }" >> "$BACKUP_DIR/$BACKUP_FILE"
echo "}" >> "$BACKUP_DIR/$BACKUP_FILE"

echo ""
echo -e "${GREEN}✅ Export completed!${NC}"
echo "Backup saved to: $BACKUP_DIR/$BACKUP_FILE"

# Get file size
BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Compress
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
gzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/${BACKUP_FILE}.gz"
COMPRESSED_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
echo "Compressed size: $COMPRESSED_SIZE"

echo ""
echo -e "${GREEN}🎉 Export via REST API completed!${NC}"
echo "Files created:"
echo "  - $BACKUP_DIR/$BACKUP_FILE (JSON)"
echo "  - $BACKUP_DIR/${BACKUP_FILE}.gz (Compressed)"