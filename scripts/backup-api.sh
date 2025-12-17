#!/bin/bash

# Backup Kognisia via API (No Docker Required)
# Usage: ./scripts/backup-api.sh [backup_name]

set -e

BACKUP_NAME=${1:-"kognisia_api_backup_$(date +%Y%m%d_%H%M%S)"}
BACKUP_DIR="./backups/$BACKUP_NAME"
SOURCE_URL="https://nxlkgjmwujolzqaxsine.supabase.co"
SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    echo "📝 Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_key"
    exit 1
fi

echo "🔄 Starting API backup process"
echo "📁 Backup directory: $BACKUP_DIR"
echo "🌐 Source URL: $SOURCE_URL"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Export question bank
echo "❓ Exporting question bank..."
curl -s -X GET "$SOURCE_URL/rest/v1/question_bank?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/question_bank.json"

echo "✅ Question bank exported: $(jq length "$BACKUP_DIR/question_bank.json") records"

# 2. Export student progress
echo "📈 Exporting student progress..."
curl -s -X GET "$SOURCE_URL/rest/v1/student_progress?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/student_progress.json"

echo "✅ Student progress exported: $(jq length "$BACKUP_DIR/student_progress.json") records"

# 3. Export subtests
echo "📋 Exporting subtests..."
curl -s -X GET "$SOURCE_URL/rest/v1/subtests?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/subtests.json"

echo "✅ Subtests exported: $(jq length "$BACKUP_DIR/subtests.json") records"

# 4. Export users (auth)
echo "👥 Exporting users..."
curl -s -X GET "$SOURCE_URL/auth/v1/admin/users?per_page=1000" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/users.json"

echo "✅ Users exported: $(jq length "$BACKUP_DIR/users.json") users"

# 5. Export assessments
echo "📝 Exporting assessments..."
curl -s -X GET "$SOURCE_URL/rest/v1/assessments?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/assessments.json"

echo "✅ Assessments exported: $(jq length "$BACKUP_DIR/assessments.json") records"

# 6. Export classes
echo "🏫 Exporting classes..."
curl -s -X GET "$SOURCE_URL/rest/v1/classes?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/classes.json"

echo "✅ Classes exported: $(jq length "$BACKUP_DIR/classes.json") records"

# 7. Export squads
echo "👥 Exporting squads..."
curl -s -X GET "$SOURCE_URL/rest/v1/squads?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/squads.json"

echo "✅ Squads exported: $(jq length "$BACKUP_DIR/squads.json") records"

# 8. Export achievements
echo "🏆 Exporting achievements..."
curl -s -X GET "$SOURCE_URL/rest/v1/achievements?select=*" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  | jq '.' > "$BACKUP_DIR/achievements.json"

echo "✅ Achievements exported: $(jq length "$BACKUP_DIR/achievements.json") records"

# 9. Create backup info
cat > "$BACKUP_DIR/backup_info.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "source_url": "$SOURCE_URL",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "method": "api_export",
  "files": [
    "question_bank.json",
    "student_progress.json", 
    "subtests.json",
    "users.json",
    "assessments.json",
    "classes.json",
    "squads.json",
    "achievements.json"
  ],
  "record_counts": {
    "question_bank": $(jq length "$BACKUP_DIR/question_bank.json"),
    "student_progress": $(jq length "$BACKUP_DIR/student_progress.json"),
    "subtests": $(jq length "$BACKUP_DIR/subtests.json"),
    "users": $(jq length "$BACKUP_DIR/users.json"),
    "assessments": $(jq length "$BACKUP_DIR/assessments.json"),
    "classes": $(jq length "$BACKUP_DIR/classes.json"),
    "squads": $(jq length "$BACKUP_DIR/squads.json"),
    "achievements": $(jq length "$BACKUP_DIR/achievements.json")
  }
}
EOF

# 10. Create compressed archive
echo "🗜️ Creating compressed archive..."
cd backups
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
cd ..

# 11. Generate summary
echo ""
echo "📊 Backup Summary:"
echo "📁 Directory: $BACKUP_DIR"
echo "📦 Archive: backups/$BACKUP_NAME.tar.gz"
echo "📏 Size: $(du -sh $BACKUP_DIR | cut -f1)"
echo "📦 Archive Size: $(du -sh backups/$BACKUP_NAME.tar.gz | cut -f1)"
echo ""
cat "$BACKUP_DIR/backup_info.json" | jq '.record_counts'
echo ""
echo "🔄 To restore to another project:"
echo "   ./scripts/restore-api.sh [TARGET_URL] [TARGET_SERVICE_KEY] $BACKUP_NAME"
echo ""
echo "✅ API backup completed successfully!"