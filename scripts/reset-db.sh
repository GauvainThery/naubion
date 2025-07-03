#!/bin/bash

# Database Reset Script for Local Development
# This script will drop and recreate the PostgreSQL database for Naubion project

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
VERBOSE=false
if [[ "$1" == "--verbose" || "$1" == "-v" ]]; then
    VERBOSE=true
    echo -e "${BLUE}🔍 Verbose mode enabled${NC}"
fi

# Load environment variables from .env file
if [ -f ".env" ]; then
    export $(cat .env | grep -v '#' | xargs)
else
    echo -e "${RED}❌ .env file not found! Make sure you're running this from the project root.${NC}"
    exit 1
fi

# Database configuration from .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USERNAME=${DB_USERNAME:-naubion}
DB_PASSWORD=${DB_PASSWORD:-naubion_password}
DB_DATABASE=${DB_DATABASE:-naubion}

echo -e "${BLUE}🔄 Starting database reset for local development...${NC}"
echo -e "${YELLOW}Database: ${DB_DATABASE} on ${DB_HOST}:${DB_PORT}${NC}"

# Function to check if PostgreSQL is running
check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL client (psql) not found. Please install PostgreSQL.${NC}"
        exit 1
    fi
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}🔍 Testing PostgreSQL connection to ${DB_HOST}:${DB_PORT} as user ${DB_USERNAME}${NC}"
    fi
    
    if ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USERNAME &> /dev/null; then
        echo -e "${RED}❌ PostgreSQL server is not running or not accessible.${NC}"
        echo -e "${YELLOW}💡 Make sure PostgreSQL is running: brew services start postgresql${NC}"
        
        if [ "$VERBOSE" = true ]; then
            echo -e "${BLUE}🔍 Testing connection details:${NC}"
            echo -e "${BLUE}   Host: ${DB_HOST}${NC}"
            echo -e "${BLUE}   Port: ${DB_PORT}${NC}"
            echo -e "${BLUE}   Username: ${DB_USERNAME}${NC}"
            echo -e "${BLUE}   Database: ${DB_DATABASE}${NC}"
        fi
        exit 1
    fi
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${GREEN}✅ PostgreSQL connection test successful${NC}"
    fi
}

# Function to drop database
drop_database() {
    echo -e "${YELLOW}🗑️  Dropping existing database: ${DB_DATABASE}${NC}"
    
    # First, check if database exists
    if [ "$VERBOSE" = true ]; then
        echo -e "${BLUE}🔍 Checking if database exists...${NC}"
    fi
    
    DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_DATABASE';" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ]; then
        echo -e "${YELLOW}Database exists, terminating connections...${NC}"
        
        if [ "$VERBOSE" = true ]; then
            echo -e "${BLUE}🔍 Listing active connections...${NC}"
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "
                SELECT pid, usename, application_name, client_addr, state
                FROM pg_stat_activity
                WHERE datname = '$DB_DATABASE';" 2>/dev/null || true
        fi
        
        # Terminate active connections to the database with more aggressive approach
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "
            UPDATE pg_database SET datallowconn = 'false' WHERE datname = '$DB_DATABASE';
            ALTER DATABASE \"$DB_DATABASE\" CONNECTION LIMIT 1;
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = '$DB_DATABASE' AND pid <> pg_backend_pid();
        " 2>/dev/null || true
        
        # Wait a moment for connections to terminate
        sleep 2
        
        # Drop the database
        echo -e "${YELLOW}Dropping database...${NC}"
        if [ "$VERBOSE" = true ]; then
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE \"$DB_DATABASE\";"
        else
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE \"$DB_DATABASE\";" 2>/dev/null
        fi
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database dropped successfully${NC}"
        else
            echo -e "${RED}❌ Failed to drop database. Trying force drop...${NC}"
            # Force drop with more aggressive termination
            PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "
                SELECT pg_terminate_backend(pid)
                FROM pg_stat_activity
                WHERE datname = '$DB_DATABASE';
            " 2>/dev/null || true
            sleep 1
            
            if [ "$VERBOSE" = true ]; then
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE \"$DB_DATABASE\";"
            else
                PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "DROP DATABASE \"$DB_DATABASE\";" 2>/dev/null
            fi
            
            if [ $? -ne 0 ]; then
                echo -e "${RED}❌ Could not drop database. It might be in use by another process.${NC}"
                echo -e "${YELLOW}💡 Try stopping your backend server and any database connections first.${NC}"
                echo -e "${YELLOW}💡 Or run with --verbose flag to see detailed error messages.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}Database does not exist, skipping drop.${NC}"
    fi
}

# Function to create database
create_database() {
    echo -e "${YELLOW}🏗️  Creating new database: ${DB_DATABASE}${NC}"
    
    # Check if database already exists
    DB_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_DATABASE';" 2>/dev/null || echo "")
    
    if [ "$DB_EXISTS" = "1" ]; then
        echo -e "${YELLOW}Database already exists, skipping creation.${NC}"
    else
        if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USERNAME -d postgres -c "CREATE DATABASE \"$DB_DATABASE\";"; then
            echo -e "${GREEN}✅ Database created successfully${NC}"
        else
            echo -e "${RED}❌ Failed to create database${NC}"
            exit 1
        fi
    fi
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}📊 Building TypeScript and running migrations...${NC}"
    
    # Build the backend first (needed for migrations)
    echo -e "${YELLOW}Building backend...${NC}"
    cd apps/backend
    if npm run build; then
        echo -e "${GREEN}✅ Backend built successfully${NC}"
    else
        echo -e "${RED}❌ Failed to build backend${NC}"
        cd ../..
        exit 1
    fi
    
    # Run migrations using TypeORM CLI
    echo -e "${YELLOW}Running migrations...${NC}"
    if npm run typeorm migration:run -- -d dist/infrastructure/database/data-source.js; then
        echo -e "${GREEN}✅ Migrations completed successfully${NC}"
    else
        echo -e "${RED}❌ Failed to run migrations${NC}"
        cd ../..
        exit 1
    fi
    
    cd ../..
}

# Main execution
main() {
    # Show usage if help is requested
    if [[ "$1" == "--help" || "$1" == "-h" ]]; then
        echo -e "${BLUE}Database Reset Script for Local Development${NC}"
        echo -e "${YELLOW}Usage: $0 [OPTIONS]${NC}"
        echo -e "${YELLOW}Options:${NC}"
        echo -e "${YELLOW}  -v, --verbose    Show detailed output and error messages${NC}"
        echo -e "${YELLOW}  -h, --help       Show this help message${NC}"
        echo ""
        echo -e "${YELLOW}This script will:${NC}"
        echo -e "${YELLOW}  1. Check PostgreSQL connection${NC}"
        echo -e "${YELLOW}  2. Drop existing database (if any)${NC}"
        echo -e "${YELLOW}  3. Create new database${NC}"
        echo -e "${YELLOW}  4. Run TypeORM migrations${NC}"
        exit 0
    fi
    
    # Check if PostgreSQL is available
    check_postgres
    
    # Confirmation prompt
    echo -e "${RED}⚠️  WARNING: This will completely destroy and recreate the database!${NC}"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}❌ Database reset cancelled.${NC}"
        exit 0
    fi
    
    # Execute reset steps
    drop_database
    create_database
    run_migrations
    
    echo -e "${GREEN}✅ Database reset completed successfully!${NC}"
    echo -e "${BLUE}💡 You can now start your backend server with: cd apps/backend && npm run dev${NC}"
}

# Run main function
main "$@"
