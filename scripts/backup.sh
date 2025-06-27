#!/bin/bash

# Backup script for production data
# Usage: ./scripts/backup.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +"%Y%m%d_%H%M%S")
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}💾 Starting backup process...${NC}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

echo -e "${YELLOW}🗄️  Backing up PostgreSQL database...${NC}"

# Backup PostgreSQL database
docker-compose -f $COMPOSE_FILE exec -T postgres pg_dumpall -U naubion > "$BACKUP_DIR/postgres_backup_$DATE.sql"

echo -e "${YELLOW}📁 Backing up Redis data...${NC}"

# Backup Redis data
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli BGSAVE
sleep 5
docker cp $(docker-compose -f $COMPOSE_FILE ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_backup_$DATE.rdb"

echo -e "${YELLOW}📦 Creating compressed archive...${NC}"

# Create compressed archive
tar -czf "$BACKUP_DIR/naubion_backup_$DATE.tar.gz" -C $BACKUP_DIR "postgres_backup_$DATE.sql" "redis_backup_$DATE.rdb"

# Clean up individual files
rm "$BACKUP_DIR/postgres_backup_$DATE.sql" "$BACKUP_DIR/redis_backup_$DATE.rdb"

echo -e "${YELLOW}🧹 Cleaning up old backups (keeping last 7 days)...${NC}"

# Clean up old backups (keep last 7 days)
find $BACKUP_DIR -name "naubion_backup_*.tar.gz" -mtime +7 -delete

echo -e "${GREEN}✅ Backup completed successfully!${NC}"
echo -e "Backup file: $BACKUP_DIR/naubion_backup_$DATE.tar.gz"

# Show backup size
du -h "$BACKUP_DIR/naubion_backup_$DATE.tar.gz"
