#!/bin/bash

# Quick Restore Script for Kognisia
# Usage: ./scripts/quick-restore.sh [target_project]

set -e

if [ -z "$1" ]; then
    echo "❌ Usage: ./scripts/quick-restore.sh [target_project]"
    echo ""
    echo "🎯 Available targets:"
    echo "   sahabat-promil  - jjgfethvijznoyljylmi"
    echo "   kognisia-dev    - nrmkkuphbkmakzawkda"
    echo ""
    echo "📁 Latest backup: $(ls -t backups/ | head -1)"
    exit 1
fi

TARGET_PROJECT=$1
LATEST_BACKUP=$(ls -t backups/ | head -1)

# Project configurations
case $TARGET_PROJECT in
    "sahabat-promil")
        TARGET_URL="https://jjgfethvijznoyljylmi.supabase.co"
        TARGET_REF="jjgfethvijznoyljylmi"
        TARGET_NAME="sahabat-promil"
        ;;
    "kognisia-dev")
        TARGET_URL="https://nrmkkuphbkmakzawkda.supabase.co"
        TARGET_REF="nrmkkuphbkmakzawkda"
        TARGET_NAME="kognisia-dev"
        ;;
    *)
        echo "❌ Unknown target: $TARGET_PROJECT"
        exit 1
        ;;
esac

echo "🔄 Quick Restore Process"
echo "🎯 Target: $TARGET_NAME ($TARGET_REF)"
echo "📁 Backup: $LATEST_BACKUP"
echo "🌐 URL: $TARGET_URL"

# Get target service role key
echo ""
echo "🔑 Get SERVICE_ROLE_KEY from:"
echo "   https://supabase.com/dashboard/project/$TARGET_REF/settings/api"
echo ""
read -p "Enter SERVICE_ROLE_KEY for $TARGET_NAME: " -s TARGET_SERVICE_KEY

if [ -z "$TARGET_SERVICE_KEY" ]; then
    echo "❌ SERVICE_ROLE_KEY is required"
    exit 1
fi

# Run restore
echo ""
echo "🚀 Starting restore..."
./scripts/restore-api.sh "$TARGET_URL" "$TARGET_SERVICE_KEY" "$LATEST_BACKUP"

echo ""
echo "🎉 Quick restore completed!"
echo "📝 Next steps:"
echo "   1. cp .env.restored .env.local"
echo "   2. Update Vercel environment"
echo "   3. npm run build"
echo "   4. npm run deploy"