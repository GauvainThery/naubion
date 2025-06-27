#!/bin/bash

# Health check script for production services
# Usage: ./scripts/health-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    source .env
fi

FRONTEND_URL="https://${FRONTEND_DOMAIN:-localhost:3000}"
BACKEND_URL="https://${BACKEND_DOMAIN:-localhost:8080}"
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}🏥 Starting health check...${NC}"

# Check Docker services
echo -e "${YELLOW}🐳 Checking Docker services...${NC}"
docker-compose -f $COMPOSE_FILE ps

# Check if all services are running
services_status=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running")
all_services=$(docker-compose -f $COMPOSE_FILE ps --services)

if [ "$(echo "$services_status" | wc -l)" -eq "$(echo "$all_services" | wc -l)" ]; then
    echo -e "${GREEN}✅ All Docker services are running${NC}"
else
    echo -e "${RED}❌ Some Docker services are not running${NC}"
    exit 1
fi

# Check frontend health
echo -e "${YELLOW}🌐 Checking frontend health...${NC}"
if curl -f -s "$FRONTEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Check backend health
echo -e "${YELLOW}⚙️  Checking backend health...${NC}"
if curl -f -s "$BACKEND_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

# Check database connectivity
echo -e "${YELLOW}🗄️  Checking database connectivity...${NC}"
if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U naubion > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database is accessible${NC}"
else
    echo -e "${RED}❌ Database connectivity check failed${NC}"
    exit 1
fi

# Check Redis connectivity
echo -e "${YELLOW}📁 Checking Redis connectivity...${NC}"
if docker-compose -f $COMPOSE_FILE exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is accessible${NC}"
else
    echo -e "${RED}❌ Redis connectivity check failed${NC}"
    exit 1
fi

# Check SSL certificates (if using HTTPS)
if [[ "$FRONTEND_URL" == https* ]]; then
    echo -e "${YELLOW}🔒 Checking SSL certificates...${NC}"
    cert_expiry=$(echo | openssl s_client -servername "${FRONTEND_DOMAIN}" -connect "${FRONTEND_DOMAIN}:443" 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
    
    if [ -n "$cert_expiry" ]; then
        echo -e "${GREEN}✅ SSL certificate is valid until: $cert_expiry${NC}"
    else
        echo -e "${YELLOW}⚠️  Could not verify SSL certificate${NC}"
    fi
fi

# Resource usage check
echo -e "${YELLOW}📊 Checking resource usage...${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

echo -e "${GREEN}🎉 Health check completed successfully!${NC}"
