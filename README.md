# naubion

Website environmental impact analyzer - TypeScript monorepo

## Quick Start

### Local Development

```bash
# Prerequisites: Node.js 18+ and pnpm
git clone <repository-url>
cd naubion
pnpm install
pnpm run dev
```

**URLs:**

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Production Deployment

```bash
# Deploy with Docker
git push origin main  # Triggers automatic deployment
# or
./scripts/deploy.sh latest
```

## Project Structure

- **`apps/frontend`** - React + TypeScript + Vite
- **`apps/backend`** - Express + TypeScript + Puppeteer + PostgreSQL
- **`libs/shared`** - Shared TypeScript types

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Puppeteer, TypeORM, PostgreSQL
- **Deployment**: Docker, pnpm workspaces
