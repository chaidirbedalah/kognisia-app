#!/bin/bash

# 🌐 Export Single Table via REST API
# Usage: ./scripts/export-single-table.sh [table_name]

SUPABASE_URL="https://luioyqrubylvjospgsjx.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aW95cXJ1Ynlsdmpvc3Bnc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTk5ODIsImV4cCI6MjA4MDY3NTk4Mn0.v3LZlEQ5viepRQZ622_AFapwxcNHamTePRlS-Cft07o"

BACKUP_DIR="./database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🌐 Export Single Table via REST API${NC}"
echo "=================================================="

# Check if table name provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Table name required${NC}"
  echo "Usage: $0 [table_name]"
  echo ""
  echo "Available tables:"
  echo "  - users"
  echo "  - squads"
  echo "  - squad_members"
  echo "  - squad_battles"
  echo "  - squad_battle_participants"
  echo "  - squad_battle_questions"
  echo "  - squad_battle_answers"
  echo "  - question_bank"
  echo "  - daily_challenges"
  echo "  - daily_challenge_answers"
  echo "  - mini_tryouts"
  echo "  - mini_tryout_answers"
  echo "  - tryout_utbk"
  echo "  - tryout_utbk_answers"
  echo "  - user_streaks"
  exit 1
fi

TABLE_NAME="$1"
BACKUP_FILE="kognisia_${TABLE_NAME}_${DATE}.json"

mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📋 Exporting table: $TABLE_NAME${NC}"
echo "URL: ${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*"
echo ""

# Export table
echo -e "${YELLOW}🔄 Fetching data...${NC}"
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  | jq '.' > "$BACKUP_DIR/$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Export successful!${NC}"
  
  # Get file size
  BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
  echo "File: $BACKUP_DIR/$BACKUP_FILE"
  echo "Size: $BACKUP_SIZE"
  
  # Count records
  RECORD_COUNT=$(jq 'length' "$BACKUP_DIR/$BACKUP_FILE")
  echo "Records: $RECORD_COUNT"
  
  # Compress
  echo -e "${YELLOW}🗜️  Compressing...${NC}"
  gzip -c "$BACKUP_DIR/$BACKUP_FILE" > "$BACKUP_DIR/${BACKUP_FILE}.gz"
  COMPRESSED_SIZE=$(du -h "$BACKUP_DIR/${BACKUP_FILE}.gz" | cut -f1)
  echo "Compressed: $COMPRESSED_SIZE"
  
else
  echo -e "${RED}❌ Export failed!${NC}"
  exit 1
fi