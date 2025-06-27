# Production Deployment Guide

This guide covers deploying the Naubion application to production using Docker and GitHub Actions.

## Quick Start

1. **Fork/Clone the repository**
2. **Configure GitHub Secrets** (see [GitHub Secrets](#github-secrets))
3. **Set up your production server** (see [Server Setup](#server-setup))
4. **Deploy** by pushing to `main` branch or manually running the deployment

## Architecture Overview

The production setup includes:

- **Frontend**: React application served by Nginx
- **Backend**: Node.js Express API
- **Database**: PostgreSQL
- **Cache**: Redis
- **Reverse Proxy**: Traefik with automatic SSL/TLS
- **Container Registry**: GitHub Container Registry (GHCR)

## GitHub Actions CI/CD

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)

   - Runs on push/PR to `main` and `develop`
   - Tests, lints, builds, and deploys
   - Automated security scanning

2. **Release** (`.github/workflows/release.yml`)
   - Triggered on version tags (`v*`)
   - Creates GitHub releases with Docker images

### GitHub Secrets

Configure these secrets in your GitHub repository:

```
GITHUB_TOKEN                 # Automatically provided
```

For deployment, you'll also need:

```
PRODUCTION_HOST             # Your production server IP/domain
PRODUCTION_USER             # SSH user for deployment
PRODUCTION_SSH_KEY          # Private SSH key for deployment
```

## Server Setup

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name pointing to your server
- Firewall configured (ports 80, 443, 22)

### Installation Script

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/naubion
cd /opt/naubion

# Clone repository (or copy deployment files)
git clone https://github.com/yourusername/naubion.git .
```

## Configuration

### Environment Variables

Copy the example environment file and configure:

```bash
cp .env.production .env
```

Edit `.env` with your specific values:

```bash
# Database
DATABASE_URL=postgresql://naubion:YOUR_SECURE_PASSWORD@postgres:5432/naubion
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD

# Email service (Mailjet)
MAILJET_API_KEY=your-mailjet-api-key
MAILJET_SECRET_KEY=your-mailjet-secret-key

# Domains
FRONTEND_DOMAIN=yourdomain.com
BACKEND_DOMAIN=api.yourdomain.com
TRAEFIK_DOMAIN=traefik.yourdomain.com

# SSL/TLS
ACME_EMAIL=your-email@yourdomain.com

# GitHub Container Registry
GITHUB_REPOSITORY=yourusername/naubion
```

### DNS Configuration

Point your domains to your server:

```
yourdomain.com          A     YOUR_SERVER_IP
api.yourdomain.com      A     YOUR_SERVER_IP
traefik.yourdomain.com  A     YOUR_SERVER_IP
```

## Deployment

### Automatic Deployment (Recommended)

Push to the `main` branch to trigger automatic deployment:

```bash
git push origin main
```

### Manual Deployment

Run the deployment script:

```bash
./scripts/deploy.sh latest
```

Or deploy a specific version:

```bash
./scripts/deploy.sh v1.2.3
```

### First-Time Setup

1. **Deploy the application**:

   ```bash
   ./scripts/deploy.sh
   ```

2. **Initialize the database** (if needed):

   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
   ```

3. **Verify deployment**:
   ```bash
   ./scripts/health-check.sh
   ```

## Monitoring and Maintenance

### Health Checks

Run health checks:

```bash
./scripts/health-check.sh
```

### Backups

Create backups:

```bash
./scripts/backup.sh
```

Backups are stored in `./backups/` and automatically cleaned up (7-day retention).

### Logs

View application logs:

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Updates

To update to a new version:

1. **Automatic**: Push new code to `main` branch
2. **Manual**: Run `./scripts/deploy.sh <version>`

### SSL/TLS Certificates

Traefik automatically handles SSL certificates via Let's Encrypt. Certificates are automatically renewed.

## Security

### Features Included

- ✅ Non-root containers
- ✅ Automatic SSL/TLS with Let's Encrypt
- ✅ Security headers in Nginx
- ✅ Container vulnerability scanning
- ✅ Isolated Docker networks
- ✅ Firewall configuration
- ✅ Automated dependency updates

### Best Practices

1. **Regular Updates**: Keep dependencies and base images updated
2. **Monitoring**: Set up monitoring and alerting
3. **Backups**: Automate regular backups
4. **Access Control**: Use SSH keys, disable password authentication
5. **Firewall**: Only open necessary ports (80, 443, 22)

## Troubleshooting

### Common Issues

**Services not starting:**

```bash
docker-compose -f docker-compose.prod.yml logs <service_name>
```

**SSL certificate issues:**

```bash
docker-compose -f docker-compose.prod.yml logs traefik
```

**Database connection issues:**

```bash
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U naubion
```

**Performance issues:**

```bash
docker stats
```

### Support

- Check logs first: `docker-compose logs`
- Verify configuration: `./scripts/health-check.sh`
- Review the [GitHub Issues](https://github.com/yourusername/naubion/issues)

## Development vs Production

| Feature    | Development     | Production               |
| ---------- | --------------- | ------------------------ |
| Build      | Hot reload      | Optimized build          |
| SSL/TLS    | HTTP            | HTTPS with Let's Encrypt |
| Database   | Local/Docker    | PostgreSQL container     |
| Caching    | None/Local      | Redis                    |
| Monitoring | Local logs      | Centralized logging      |
| Security   | Basic           | Hardened containers      |
| Scaling    | Single instance | Horizontal scaling ready |

## Scaling

The setup is designed for horizontal scaling:

1. **Load Balancer**: Add multiple frontend/backend instances
2. **Database**: Use external managed PostgreSQL
3. **Cache**: Use external Redis cluster
4. **CDN**: Add CloudFlare or similar
5. **Container Orchestration**: Migrate to Kubernetes
