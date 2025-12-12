#!/bin/bash

# 🚀 Quick Export via REST API
# Cara paling sederhana untuk export data

SUPABASE_URL="https://luioyqrubylvjospgsjx.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1aW95cXJ1Ynlsdmpvc3Bnc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwOTk5ODIsImV4cCI6MjA4MDY3NTk4Mn0.v3LZlEQ5viepRQZ622_AFapwxcNHamTePRlS-Cft07o"

BACKUP_DIR="./database/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

echo "🌐 Quick Export via REST API"
echo "============================"
echo ""

# Export question_bank (most important)
echo "📚 Exporting question_bank..."
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/question_bank?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > "$BACKUP_DIR/question_bank_${DATE}.json"
echo "✅ Done: $BACKUP_DIR/question_bank_${DATE}.json"

# Export users
echo "👥 Exporting users..."
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/users?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > "$BACKUP_DIR/users_${DATE}.json"
echo "✅ Done: $BACKUP_DIR/users_${DATE}.json"

# Export squads
echo "⚔️  Exporting squads..."
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/squads?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > "$BACKUP_DIR/squads_${DATE}.json"
echo "✅ Done: $BACKUP_DIR/squads_${DATE}.json"

# Export squad_battles
echo "🎯 Exporting squad_battles..."
curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/squad_battles?select=*&limit=10000" \
  -H "apikey: ${ANON_KEY}" \
  | jq '.' > "$BACKUP_DIR/squad_battles_${DATE}.json"
echo "✅ Done: $BACKUP_DIR/squad_battles_${DATE}.json"

echo ""
echo "🎉 Export completed!"
echo "Files saved to: $BACKUP_DIR/"
echo ""
echo "Backup files:"
ls -lh "$BACKUP_DIR"/*_${DATE}.json 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'