# Green Web Compass - Frontend

A modern React + TypeScript frontend application for analyzing website resource usage and environmental impact. Built with Vite for lightning-fast development and optimized production builds.

## ✨ Features

- 🎨 **Modern React 19 + TypeScript**: Full type safety with latest React features
- ⚡ **Vite 6 Build System**: Lightning-fast HMR and optimized builds
- 🎨 **Tailwind CSS 4**: Modern utility-first styling framework
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🔍 **Real-time Analysis**: Live progress tracking with WebSocket integration
- 📊 **Interactive Visualizations**: Beautiful charts and resource breakdowns
- 🏗️ **Atomic Design**: Scalable component architecture
- 🔄 **Shared Types**: Type safety across the entire monorepo

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- The backend application running on port 3001

### Installation & Development

```bash
# From the monorepo root
pnpm install

# Start frontend development server
cd apps/frontend
pnpm dev

# Or from the root (starts both frontend and backend)
cd ../..
pnpm run dev
```

The frontend will be available at `http://localhost:3000`

## 🏗️ Architecture

### Project Structure

```
apps/frontend/
├── src/
│   ├── components/          # Atomic Design components
│   │   ├── atoms/           # Basic UI elements
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── RadioOption.tsx
│   │   ├── molecules/       # Component combinations
│   │   │   ├── LoadingStep.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RadioGroup.tsx
│   │   │   └── ResourceBreakdownItem.tsx
│   │   ├── organisms/       # Complex UI sections
│   │   │   ├── AnalysisForm.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingSection.tsx
│   │   │   └── ResultsSection.tsx
│   │   └── templates/       # Page layouts
│   │       └── MainLayout.tsx
│   ├── hooks/
│   │   └── useAnalysis.ts   # Custom React hooks with TypeScript
│   ├── types/
│   │   └── index.ts         # Re-exports shared types + frontend-specific
│   ├── utils/
│   │   └── helpers.ts       # Utility functions
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── package.json             # Frontend dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # This file
```

### Component Architecture

This frontend follows **Atomic Design** principles for scalable component organization:

#### Atoms (`src/components/atoms/`)

Basic UI building blocks with no dependencies:

- **Button**: Reusable button with variants (primary, secondary, disabled)
- **Card**: Container component with consistent styling
- **Input**: Form input with proper TypeScript typing
- **LoadingSpinner**: Animated loading indicator
- **ProgressBar**: Progress visualization component
- **RadioOption**: Individual radio button option

#### Molecules (`src/components/molecules/`)

Simple combinations of atoms:

- **LoadingStep**: Loading state with progress step indication
- **MetricCard**: Displays analysis metrics with proper formatting
- **RadioGroup**: Group of radio options with TypeScript generics
- **ResourceBreakdownItem**: Individual resource breakdown display

#### Organisms (`src/components/organisms/`)

Complex UI components combining molecules and atoms:

- **AnalysisForm**: Complete form for analysis configuration
- **Header**: Application header with branding
- **LoadingSection**: Full loading state management
- **ResultsSection**: Complete results display with visualizations

#### Templates (`src/components/templates/`)

Page-level layout components:

- **MainLayout**: Main application layout structure

## 🔧 TypeScript Integration

### Type Safety Features

- **🛡️ Complete Type Coverage**: All components, props, and state are strictly typed
- **📝 Shared Types**: Uses types from `@green-web-compass/shared` package
- **🎯 Smart Autocomplete**: Enhanced IDE support with intelligent completion
- **🚫 Runtime Error Prevention**: Catch type errors at compile time
- **🔄 Safe Refactoring**: Confident code changes with type validation

### Key Type Definitions

```typescript
// Example of component props typing
interface AnalysisFormProps {
  onSubmit: (data: AnalysisRequest) => void;
  isLoading: boolean;
  disabled?: boolean;
}

// Example of hook return typing
interface UseAnalysisReturn {
  data: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  submitAnalysis: (request: AnalysisRequest) => Promise<void>;
}
```

## 📜 Available Scripts

```bash
# Development server with HMR
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking only (no build)
pnpm type-check

# Lint TypeScript files
pnpm lint

# Clean build artifacts
pnpm clean
```

## 🎨 Styling

### Tailwind CSS 4

The project uses **Tailwind CSS 4** for styling:

- **🎨 Utility-First**: Compose styles using utility classes
- **📱 Responsive Design**: Mobile-first responsive utilities
- **🎭 Dark Mode**: Built-in dark mode support
- **⚡ Optimized**: Automatic CSS purging for smaller bundles

### Design System

```css
/* Color palette */
Primary: Blue (analysis theme)
Secondary: Green (environmental theme)
Neutral: Gray scale for text and backgrounds
Success: Green for completed states
Warning: Yellow for warnings
Error: Red for error states

/* Typography */
Font Family: System font stack for optimal performance
Sizes: Responsive typography scale
Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

/* Spacing */
Scale: 0.25rem increments (4px base)
Container: Max-width containers for content
Grid: CSS Grid and Flexbox for layouts
```

## 🔌 API Integration

### Backend Communication

The frontend communicates with the backend API running on port 3001:

```typescript
// Example API integration
const analyzeWebsite = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  const response = await fetch('http://localhost:3001/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return response.json();
};
```

### Real-time Updates

WebSocket integration for real-time analysis progress:

```typescript
// WebSocket connection for progress updates
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = event => {
  const update: ProgressUpdate = JSON.parse(event.data);
  // Handle progress updates in real-time
};
```

## 🔄 State Management

### Custom Hooks

The application uses custom React hooks for state management:

#### `useAnalysis` Hook

```typescript
interface UseAnalysisReturn {
  // Analysis state
  data: AnalysisResponse | null;
  isLoading: boolean;
  error: string | null;
  progress: ProgressUpdate | null;

  // Actions
  submitAnalysis: (request: AnalysisRequest) => Promise<void>;
  resetAnalysis: () => void;
}
```

**Features:**

- Type-safe state management
- Error handling and loading states
- Real-time progress tracking
- Automatic cleanup on component unmount

## 🛠️ Development

### Hot Module Replacement

Vite provides instant HMR for React components:

- **⚡ Instant Updates**: Changes reflect immediately without page refresh
- **🔄 State Preservation**: Component state is preserved during updates
- **🧩 TypeScript Integration**: Type errors are shown in real-time

### Development Workflow

1. **Start development server**: `pnpm dev`
2. **Make changes**: Edit TypeScript files with full type checking
3. **See updates**: Changes appear instantly in the browser
4. **Type checking**: TypeScript validates types in real-time
5. **Build validation**: `pnpm build` ensures production readiness

### ESLint Configuration

The project includes comprehensive ESLint rules:

```json
{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

## 📦 Build Process

### Vite Configuration

The Vite configuration includes:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020'
  }
});
```

**Features:**

- **🔄 API Proxy**: Automatic proxy to backend during development
- **📦 Optimized Builds**: Tree-shaking and code splitting
- **🗺️ Source Maps**: Debug support for production builds
- **⚡ Fast Builds**: Optimized for both development and production

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

**Build Output:**

- **`dist/`**: Optimized production assets
- **Chunked JS**: Code splitting for optimal loading
- **CSS Optimization**: Purged and minified styles
- **Asset Optimization**: Compressed images and fonts

## 🧪 Testing

### Type Testing

TypeScript serves as compile-time testing:

```bash
# Validate all types without building
pnpm type-check
```

### Component Testing Strategy

Recommended testing approach:

1. **Type Safety**: TypeScript ensures compile-time correctness
2. **Component Contracts**: Props and state interfaces serve as contracts
3. **Integration Testing**: Test full user workflows
4. **Visual Testing**: Ensure responsive design works across devices

## 🔧 Configuration

### Environment Variables

Frontend environment configuration in `.env`:

```env
# Development
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Production
VITE_API_URL=https://your-backend-domain.com
VITE_WS_URL=wss://your-backend-domain.com
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🚀 Deployment

### Production Build

```bash
# Build optimized production assets
pnpm build

# The dist/ folder contains all production files
# Deploy the contents of dist/ to your static hosting provider
```

### Deployment Options

**Static Hosting:**

- Vercel (recommended for React apps)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

**Configuration:**

- Ensure backend API URLs are configured for production
- Set up proper CORS headers on the backend
- Configure WebSocket connections for production domain

## 🤝 Contributing

### Adding New Components

1. **Create component** in appropriate atomic design level
2. **Add TypeScript interfaces** for props and state
3. **Export component** from the components directory
4. **Update shared types** if needed
5. **Follow naming conventions**: PascalCase for components

### Code Style Guidelines

- **TypeScript**: Always use TypeScript for new files
- **Props Interface**: Define interfaces for all component props
- **Naming**: Use descriptive names for components and functions
- **Imports**: Use absolute imports for shared types
- **Styling**: Use Tailwind CSS classes for styling

### Example Component Template

```typescript
import React from 'react';
import { SomeSharedType } from '@green-web-compass/shared';

interface ComponentNameProps {
  data: SomeSharedType;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  data,
  onAction,
  isLoading = false,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      {/* Component implementation */}
    </div>
  );
};
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Atomic Design Methodology](https://bradfrost.com/blog/post/atomic-web-design/)

## 🐛 Troubleshooting

### Common Issues

**TypeScript Errors:**

- Run `pnpm type-check` to see all type errors
- Ensure shared types are properly imported from `@green-web-compass/shared`
- Check that all props interfaces are correctly defined

**Build Failures:**

- Clear cache: `rm -rf node_modules/.vite`
- Rebuild dependencies: `pnpm install`
- Check for TypeScript errors: `pnpm type-check`

**Development Server Issues:**

- Ensure port 3000 is available
- Check that backend is running on port 3001
- Verify proxy configuration in `vite.config.ts`

**Styling Issues:**

- Ensure Tailwind CSS is properly configured
- Check that `tailwind.config.js` includes all content paths
- Verify PostCSS configuration

---

Built with ❤️ using React + TypeScript + Vite for the Green Web Compass project.
