# Green Web Compass

A TypeScript monorepo for analyzing website resource usage and environmental impact using automated browser testing.

## Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp apps/backend/.env.example apps/backend/.env

# Start development (both frontend and backend)
pnpm dev
```

**Development URLs:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Architecture

This is a pnpm workspace monorepo with three main packages:

- **`apps/frontend`** - React + TypeScript web application
- **`apps/backend`** - Express + TypeScript API server with Puppeteer
- **`libs/shared`** - Shared TypeScript types and utilities

## Available Commands

```bash
# Development
pnpm dev              # Start both frontend and backend
pnpm build            # Build all packages
pnpm start            # Start production backend
pnpm type-check       # TypeScript validation across all packages
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js, TypeScript, Puppeteer
- **Tooling**: pnpm workspaces, ESLint, shared type definitions

## Development

For detailed setup and development instructions, see the individual app READMEs:

- [Frontend README](./apps/frontend/README.md) - React app architecture, components, and development
- [Backend README](./apps/backend/README.md) - API architecture, services, and deployment

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/name`)
3. Make changes and ensure TypeScript builds pass (`pnpm type-check`)
4. Commit changes (`git commit -m 'Add feature'`)
5. Push to branch (`git push origin feature/name`)
6. Open a Pull Request

## License

ISC License - see LICENSE file for details.
