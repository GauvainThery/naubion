#!/bin/bash

# Performance optimization script
# Usage: ./scripts/optimize.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}⚡ Starting performance optimization...${NC}"

COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${YELLOW}🧹 Cleaning up unused Docker resources...${NC}"

# Clean up unused Docker resources
docker system prune -f
docker volume prune -f
docker network prune -f

echo -e "${YELLOW}🔧 Optimizing Docker containers...${NC}"

# Restart services to apply any memory optimizations
docker-compose -f $COMPOSE_FILE restart

echo -e "${YELLOW}📊 Database optimization...${NC}"

# Optimize PostgreSQL
docker-compose -f $COMPOSE_FILE exec -T postgres psql -U naubion -d naubion -c "VACUUM ANALYZE;"
docker-compose -f $COMPOSE_FILE exec -T postgres psql -U naubion -d naubion -c "REINDEX DATABASE naubion;"

echo -e "${YELLOW}💾 Redis optimization...${NC}"

# Optimize Redis
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli BGREWRITEAOF
docker-compose -f $COMPOSE_FILE exec -T redis redis-cli MEMORY PURGE

echo -e "${YELLOW}🌐 Nginx cache optimization...${NC}"

# Clear Nginx cache if exists
docker-compose -f $COMPOSE_FILE exec frontend sh -c "find /var/cache/nginx -type f -delete 2>/dev/null || true"

echo -e "${YELLOW}📈 Performance metrics...${NC}"

# Show current resource usage
echo "=== Current Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo ""
echo "=== Disk Usage ==="
df -h

echo ""
echo "=== Docker Images ==="
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo -e "${GREEN}✅ Performance optimization completed!${NC}"
