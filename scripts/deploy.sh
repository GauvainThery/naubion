#!/bin/bash

# Production deployment script
# Usage: ./scripts/deploy.sh [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="ghcr.io"
REPOSITORY="${GITHUB_REPOSITORY:-yourusername/naubion}"
VERSION="${1:-latest}"
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${GREEN}🚀 Starting production deployment...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found. Please copy .env.production and configure it.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("DATABASE_URL" "POSTGRES_PASSWORD" "FRONTEND_DOMAIN" "BACKEND_DOMAIN")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Required environment variable $var is not set${NC}"
        exit 1
    fi
done

echo -e "${YELLOW}📦 Pulling Docker images...${NC}"

# Pull the latest images
docker pull "${REGISTRY}/${REPOSITORY}/frontend:${VERSION}"
docker pull "${REGISTRY}/${REPOSITORY}/backend:${VERSION}"

echo -e "${YELLOW}🛑 Stopping existing services...${NC}"

# Stop existing services
docker-compose -f $COMPOSE_FILE down --remove-orphans

echo -e "${YELLOW}🏗️  Starting services...${NC}"

# Start services
FRONTEND_IMAGE="${REGISTRY}/${REPOSITORY}/frontend:${VERSION}" \
BACKEND_IMAGE="${REGISTRY}/${REPOSITORY}/backend:${VERSION}" \
docker-compose -f $COMPOSE_FILE up -d

echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"

# Wait for services to be healthy
timeout 300 bash -c '
until docker-compose -f docker-compose.prod.yml ps | grep -q "Up (healthy)"; do
    echo "Waiting for services to start..."
    sleep 5
done
'

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Show service status
echo -e "${YELLOW}📊 Service status:${NC}"
docker-compose -f $COMPOSE_FILE ps

# Show logs from the last minute
echo -e "${YELLOW}📄 Recent logs:${NC}"
docker-compose -f $COMPOSE_FILE logs --tail=50 --since=1m

echo -e "${GREEN}🎉 Deployment finished! Your application should be available at:${NC}"
echo -e "Frontend: https://${FRONTEND_DOMAIN}"
echo -e "Backend: https://${BACKEND_DOMAIN}"
echo -e "Traefik Dashboard: https://${TRAEFIK_DOMAIN}"
