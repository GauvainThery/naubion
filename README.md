# naubion

Website environmental impact analyzer - TypeScript monorepo

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd naubion
./setup.sh

# Start development
pnpm dev
```

**Development URLs:**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## Prerequisites

- **Node.js 18+** and **pnpm**
- **PostgreSQL 14+**

### Install Prerequisites

**macOS:**

```bash
brew install node pnpm postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**

```bash
# Node.js & pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql && sudo systemctl enable postgresql
```

## Database Setup

```bash
# Create database and user
createdb naubion
psql naubion -c "CREATE USER naubion WITH ENCRYPTED PASSWORD 'naubion_password';"
psql naubion -c "GRANT ALL PRIVILEGES ON DATABASE naubion TO naubion;"
psql naubion -c "GRANT ALL ON SCHEMA public TO naubion;"

# Configure environment
cp apps/backend/.env.example apps/backend/.env
# Update .env with database settings (see Environment section below)
```

## Project Structure

- **`apps/frontend`** - React + TypeScript + Vite
- **`apps/backend`** - Express + TypeScript + Puppeteer + PostgreSQL
- **`libs/shared`** - Shared TypeScript types

## Development Commands

```bash
pnpm dev              # Start both frontend and backend
pnpm build            # Build all packages
pnpm type-check       # TypeScript validation
pnpm lint             # Code linting
pnpm format           # Code formatting
pnpm clean            # Clean build outputs
```

## Environment Variables

Create `apps/backend/.env`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=naubion
DB_PASSWORD=naubion_password
DB_DATABASE=naubion
DB_SYNCHRONIZE=true

# Cache
CACHE_ANALYSIS_RESULTS=true
CACHE_TTL_HOURS=24

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Puppeteer, TypeORM, PostgreSQL
- **Tools**: pnpm workspaces, ESLint, Prettier

## Production Deployment

```bash
# Build
pnpm run build

# Configure production environment
# Set DB_SYNCHRONIZE=false, NODE_ENV=production in .env

# Start
pnpm start
```
