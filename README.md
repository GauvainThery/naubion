# naubion

[![Source Available](https://img.shields.io/badge/Source-Available-blue.svg)](./LICENSE)
[![License](https://img.shields.io/badge/License-Source%20Available-red.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Monorepo](https://img.shields.io/badge/Monorepo-pnpm-F69220.svg)](https://pnpm.io/)

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
```

## Project Structure

- **`apps/frontend`** - React + TypeScript + Vite
- **`apps/backend`** - Express + TypeScript + Puppeteer + PostgreSQL
- **`libs/shared`** - Shared TypeScript types

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Puppeteer, TypeORM, PostgreSQL
- **Deployment**: Docker, pnpm workspaces
