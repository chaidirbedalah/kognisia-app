#!/bin/bash

# Backup Kognisia Supabase Project
# Usage: ./scripts/backup-kognisia.sh [backup_name]

set -e

BACKUP_NAME=${1:-"kognisia_backup_$(date +%Y%m%d_%H%M%S)"}
BACKUP_DIR="./backups/$BACKUP_NAME"
SOURCE_PROJECT="luioyqrubylvjospgsjx"
SOURCE_URL="https://nxlkgjmwujolzqaxsine.supabase.co"

echo "🔄 Starting backup process for project: $SOURCE_PROJECT"
echo "📁 Backup directory: $BACKUP_DIR"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Check if logged in to correct project
echo "🔍 Checking Supabase connection..."
supabase link --project-ref $SOURCE_PROJECT

# 1. Backup database structure and data
echo "📊 Backing up database..."
supabase db dump > "$BACKUP_DIR/database_full.sql"

# 2. Backup schema only
echo "🏗️ Backing up schema..."
supabase db dump --schema-only > "$BACKUP_DIR/schema.sql"

# 3. Backup data only
echo "📋 Backing up data only..."
supabase db dump --data-only > "$BACKUP_DIR/data.sql"

# 4. Export important tables via API
echo "❓ Exporting question bank..."
curl -X GET "$SOURCE_URL/rest/v1/question_bank?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  > "$BACKUP_DIR/question_bank.json"

echo "👥 Exporting student progress..."
curl -X GET "$SOURCE_URL/rest/v1/student_progress?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  > "$BACKUP_DIR/student_progress.json"

echo "🏫 Exporting users..."
curl -X GET "$SOURCE_URL/auth/v1/admin/users?per_page=1000" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  > "$BACKUP_DIR/users.json"

echo "📚 Exporting subtests..."
curl -X GET "$SOURCE_URL/rest/v1/subtests?select=*" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  > "$BACKUP_DIR/subtests.json"

# 5. Create backup info
cat > "$BACKUP_DIR/backup_info.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "source_project": "$SOURCE_PROJECT",
  "source_url": "$SOURCE_URL",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "files": [
    "database_full.sql",
    "schema.sql", 
    "data.sql",
    "question_bank.json",
    "student_progress.json",
    "users.json",
    "subtests.json"
  ]
}
EOF

# 6. Create compressed archive
echo "🗜️ Creating compressed archive..."
cd backups
tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
cd ..

echo "✅ Backup completed successfully!"
echo "📁 Location: $BACKUP_DIR"
echo "📦 Archive: backups/$BACKUP_NAME.tar.gz"
echo "📊 Total size: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "🔄 To restore to another project:"
echo "   ./scripts/restore-kognisia.sh [TARGET_PROJECT_REF] $BACKUP_NAME"