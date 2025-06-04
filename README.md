# Green Web Compass

A TypeScript monorepo for analyzing website resource usage and environmental impact.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment template
cp apps/backend/.env.example apps/backend/.env

# Start development (both frontend and backend)
pnpm run dev
```

**Access:**

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## 🏗️ Monorepo Architecture

This application uses a modern monorepo structure with TypeScript throughout:

```
green-web-compass/
├── apps/
│   ├── frontend/         # React + TypeScript frontend (port 3000)
│   │   ├── src/          # React components, hooks, utilities
│   │   ├── package.json  # Frontend dependencies
│   │   └── README.md     # Frontend-specific documentation
│   └── backend/          # Express + TypeScript backend (port 3001)
│       ├── src/          # API routes, services, configuration
│       ├── package.json  # Backend dependencies
│       └── README.md     # Backend-specific documentation
├── packages/
│   └── shared/           # Shared TypeScript types and utilities
│       ├── src/          # Common interfaces and types
│       └── package.json  # Shared package config
├── package.json          # Root workspace configuration
├── pnpm-workspace.yaml   # pnpm workspace setup
└── README.md             # This file
```

## 📜 Available Scripts

### Root level (manages entire monorepo)

```bash
# Development - starts both frontend and backend
pnpm run dev

# Build all packages and apps
pnpm run build

# Start production backend only
pnpm run start

# Type checking across all packages
pnpm run type-check

# Install dependencies for all workspaces
pnpm install
```

### App-specific commands

```bash
# Frontend specific
cd apps/frontend && pnpm dev     # Start frontend dev server
cd apps/frontend && pnpm build   # Build frontend for production

# Backend specific
cd apps/backend && pnpm dev      # Start backend dev server
cd apps/backend && pnpm build    # Build backend TypeScript
cd apps/backend && pnpm start    # Start production backend
```

## 🏗️ Applications

### 🎨 Frontend ([apps/frontend/](./apps/frontend/))

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Architecture**: Atomic Design pattern
- **Port**: 3000

**Key Features:**

- Responsive design with mobile support
- Real-time analysis progress tracking
- Interactive data visualizations
- TypeScript type safety throughout

### 🔧 Backend ([apps/backend/](./apps/backend/))

- **Framework**: Express.js + TypeScript
- **Browser Automation**: Puppeteer
- **Real-time**: WebSocket support
- **Port**: 3001

**Key Features:**

- Website analysis engine
- RESTful API with comprehensive validation
- Real-time progress updates via WebSocket
- Intelligent user behavior simulation

### 📦 Shared ([packages/shared/](./packages/shared/))

- **Purpose**: Common TypeScript types and utilities
- **Exports**: Analysis interfaces, API types, utility types

## 🔧 Configuration

### Environment Variables

Backend configuration (create `apps/backend/.env`):

```env
# Server Configuration
PORT=3001
HOST=localhost
NODE_ENV=development
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Browser Configuration
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000

# Analysis Configuration
MAX_CONCURRENT_ANALYSIS=3
ANALYSIS_TIMEOUT=120000
ANALYSIS_RETRIES=2
```

## 🛠️ Tech Stack

**Frontend:**

- ⚛️ React 19 with TypeScript
- ⚡ Vite 6 for build tooling
- 🎨 Tailwind CSS 4 for styling
- 🧩 Atomic Design component architecture

**Backend:**

- 🟢 Node.js + Express with TypeScript
- 🎭 Puppeteer for browser automation
- 🔌 WebSocket support for real-time updates
- 🛡️ Comprehensive error handling and validation

**Shared:**

- 📘 TypeScript type definitions
- 🔄 Common interfaces and utilities
- 📦 Workspace dependencies

**Development:**

- 📦 pnpm workspaces for monorepo management
- 🔄 Hot Module Replacement (HMR) for frontend
- 👀 File watching for backend development
- 🧪 TypeScript compilation with strict mode

## 🚀 Getting Started

1. **Read the app-specific READMEs** for detailed setup instructions:

   - [Frontend README](./apps/frontend/README.md)
   - [Backend README](./apps/backend/README.md)

2. **Development workflow**:

   ```bash
   # Install all dependencies
   pnpm install

   # Start development (both apps)
   pnpm run dev

   # In separate terminals, you can also run individually:
   cd apps/frontend && pnpm dev  # Frontend only
   cd apps/backend && pnpm dev   # Backend only
   ```

3. **Production build**:

   ```bash
   # Build all packages and apps
   pnpm run build

   # Start production backend
   pnpm run start
   ```

## 📚 Documentation

- [Frontend Documentation](./apps/frontend/README.md) - React app setup, components, and development
- [Backend Documentation](./apps/backend/README.md) - API documentation, services, and deployment
- [Shared Types](./packages/shared/src/index.ts) - Common TypeScript interfaces

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes in the appropriate app directory
4. Ensure all TypeScript builds pass (`pnpm run type-check`)
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Green Web Compass** - Making the web more sustainable, one analysis at a time. 🌱
