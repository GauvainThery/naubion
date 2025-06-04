# Frontend - Green Web Compass

React + TypeScript frontend for analyzing website environmental impact. Built with Vite and Tailwind CSS using Atomic Design principles.

## Quick Start

```bash
# From monorepo root
pnpm install

# Start frontend development
cd apps/frontend && pnpm dev
# or from root: pnpm dev (starts both frontend and backend)
```

**Prerequisites:**

- Node.js 18+
- Backend running on port 3001

The app will be available at http://localhost:3000

## Architecture

### Component Structure

Built using **Atomic Design** methodology:

- **`components/atoms/`** - Basic UI elements (Button, Input, Card, etc.)
- **`components/molecules/`** - Simple component combinations (RadioGroup, MetricCard, etc.)
- **`components/organisms/`** - Complex sections (AnalysisForm, ResultsSection, etc.)
- **`components/templates/`** - Page layout components

### Key Directories

- **`hooks/`** - Custom React hooks (useAnalysis for state management)
- **`types/`** - TypeScript types (re-exports shared types + frontend-specific)
- **`utils/`** - Utility functions and helpers
- **`styles/`** - Global CSS and Tailwind configuration

## State Management

### useAnalysis Hook

Primary hook for managing analysis workflow:

```typescript
const { isLoading, results, error, startAnalysis } = useAnalysis();
```

**Features:**

- Type-safe state management
- Real-time progress tracking via WebSocket
- Error handling and loading states
- Automatic cleanup

## Styling

### Tailwind CSS

Utility-first CSS framework with:

- Mobile-first responsive design
- Consistent design system
- Optimized production builds
- Custom color palette for environmental theme

## API Integration

### Backend Communication

Communicates with Express backend on port 3001:

- REST API for analysis requests
- WebSocket for real-time progress updates
- Type-safe API calls using shared types

### Real-time Updates

WebSocket integration provides live analysis progress:

- Connection management
- Progress percentage updates
- Step-by-step status messages

## Development

### Available Scripts

```bash
pnpm dev          # Start development server with HMR
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm type-check   # TypeScript validation
pnpm lint         # ESLint validation
```

### Hot Module Replacement

Vite provides instant updates:

- Component state preservation
- Real-time type checking
- Fast refresh on changes

### Environment Configuration

Create `.env` for custom settings:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

## Adding Features

### Component Development

1. **Choose the right level** - Start with atoms, compose into molecules/organisms
2. **Define TypeScript interfaces** for all props and state
3. **Export from index.ts** in the appropriate directory
4. **Use shared types** from `@green-web-compass/shared` when possible

### Example Component

```typescript
import React from 'react';
import type { SomeSharedType } from '@green-web-compass/shared';

interface ComponentProps {
  data: SomeSharedType;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export const ComponentName: React.FC<ComponentProps> = ({
  data, onAction, isLoading = false
}) => (
  <div className="p-4 bg-white rounded-lg shadow">
    {/* Component implementation */}
  </div>
);
```

### State Management

For complex state, create custom hooks following the `useAnalysis` pattern:

- Return typed state and actions
- Handle loading and error states
- Clean up resources on unmount

## Build

### Production Build

```bash
pnpm build  # Creates optimized build in dist/
```

## TypeScript Integration

### Type Safety

- **Complete type coverage** - All components, props, and state typed
- **Shared types** - Consistent interfaces across frontend/backend
- **Compile-time validation** - Catch errors before runtime
- **IDE support** - Enhanced autocomplete and refactoring

### Key Types

Import shared types for API communication:

```typescript
import type { AnalysisRequest, AnalysisResponse, ProgressUpdate } from '@green-web-compass/shared';
```

## Troubleshooting

### Common Issues

**Build failures:**

- Run `pnpm type-check` to see TypeScript errors
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure backend is accessible during development

**Styling issues:**

- Check Tailwind config includes all content paths
- Verify PostCSS configuration

**WebSocket connection:**

- Ensure backend WebSocket server is running
- Check browser console for connection errors
- Verify CORS settings allow WebSocket connections
