#!/bin/bash
# Simple production deployment script for Naubion

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Compose."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are available"
}

# Deploy application
deploy() {
    print_header "Deploying Naubion to Production"
    
    print_status "Pulling latest images..."
    docker compose pull
    
    print_status "Building images..."
    docker compose build --no-cache
    
    print_status "Starting services..."
    docker compose up -d
    
    print_status "Waiting for services to be healthy..."
    sleep 10
    
    # Check if services are running
    if docker compose ps | grep -q "Up"; then
        print_status "Services are running!"
        docker compose ps
    else
        print_error "Some services failed to start"
        docker compose logs
        exit 1
    fi
}

# Show status
show_status() {
    print_header "Deployment Status"
    
    print_status "Service status:"
    docker compose ps
    
    print_status "Application URLs:"
    echo "Frontend: http://localhost:${FRONTEND_PORT:-3000}"
    echo "Backend:  http://localhost:${BACKEND_PORT:-8080}"
    echo "Health:   http://localhost:${BACKEND_PORT:-8080}/api/health"
}

# Show logs
show_logs() {
    print_header "Application Logs"
    docker compose logs -f
}

# Stop application
stop() {
    print_header "Stopping Naubion"
    docker compose down
    print_status "Application stopped"
}

# Restart application
restart() {
    print_header "Restarting Naubion"
    docker compose restart
    print_status "Application restarted"
}

# Show usage
usage() {
    echo "Usage: $0 {deploy|status|logs|stop|restart|help}"
    echo ""
    echo "Commands:"
    echo "  deploy   - Deploy Naubion to production (validates environment and starts services)"
    echo "  status   - Show current deployment status"
    echo "  logs     - Show application logs"
    echo "  stop     - Stop all services"
    echo "  restart  - Restart all services"
    echo "  help     - Show this help message"
    echo ""
    echo "Before first deployment, make sure to:"
    echo "1. Copy .env.example to .env"
    echo "2. Configure all required variables in .env"
    echo "3. Run './scripts/manage-secrets.sh generate' for secure passwords"
    exit 1
}

# Main execution
case "${1:-}" in
    deploy)
        check_prerequisites
        deploy
        show_status
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    help)
        usage
        ;;
    *)
        usage
        ;;
esac
