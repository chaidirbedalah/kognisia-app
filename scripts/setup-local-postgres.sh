#!/bin/bash

# 🐘 Local PostgreSQL Setup Script for Kognisia
# This script helps you set up a local PostgreSQL database

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🐘 Kognisia Local PostgreSQL Setup${NC}"
echo "=================================================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo ""
    echo -e "${YELLOW}📦 Installation instructions:${NC}"
    echo "macOS (Homebrew):"
    echo "  brew install postgresql"
    echo "  brew services start postgresql"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install postgresql postgresql-contrib"
    echo "  sudo systemctl start postgresql"
    echo ""
    echo "Windows:"
    echo "  Download from: https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Database configuration
DB_NAME="kognisia"
DB_USER="kognisia_user"
DB_PASSWORD="kognisia_password"
DB_HOST="localhost"
DB_PORT="5432"

echo ""
echo -e "${YELLOW}📋 Database Configuration:${NC}"
echo "Database Name: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo ""

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to recreate it? (This will delete all data) (yes/no): " -r
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        echo "Dropping existing database..."
        dropdb "$DB_NAME" 2>/dev/null || true
        psql -c "DROP USER IF EXISTS $DB_USER;" 2>/dev/null || true
    else
        echo "Setup cancelled."
        exit 1
    fi
fi

echo -e "${YELLOW}🔄 Creating database and user...${NC}"

# Create user
psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"

# Create database
createdb -O "$DB_USER" "$DB_NAME"

# Grant privileges
psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"
psql -d "$DB_NAME" -c "GRANT ALL ON SCHEMA public TO $DB_USER;"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database setup completed successfully!${NC}"
    
    # Create connection string
    CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    echo ""
    echo -e "${GREEN}🔗 Connection Information:${NC}"
    echo "Connection String: $CONNECTION_STRING"
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "1. Add to your .env.local file:"
    echo "   LOCAL_DB_URL=\"$CONNECTION_STRING\""
    echo ""
    echo "2. To restore from Supabase backup:"
    echo "   export TARGET_DB_URL=\"$CONNECTION_STRING\""
    echo "   ./scripts/restore-database.sh ./database/backups/your_backup.sql"
    echo ""
    echo "3. Test connection:"
    echo "   psql \"$CONNECTION_STRING\""
    
else
    echo -e "${RED}❌ Database setup failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Local PostgreSQL setup completed!${NC}"