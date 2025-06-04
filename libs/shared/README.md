# Green Web Compass - Shared Types

Common TypeScript types, interfaces, and utilities shared across the Green Web Compass monorepo. This package ensures type consistency between the frontend and backend applications.

## ✨ Features

- 🔒 **Type Safety**: Shared TypeScript interfaces for consistent typing
- 🔄 **Cross-Package Consistency**: Same types used in frontend and backend
- 📝 **Comprehensive Coverage**: Types for all API requests, responses, and data structures
- 🚀 **Developer Experience**: Enhanced autocomplete and IntelliSense
- 📦 **Workspace Integration**: Seamless integration with pnpm workspaces

## 📦 Installation

This package is automatically installed as a workspace dependency:

```bash
# In frontend or backend package.json
{
  "dependencies": {
    "@green-web-compass/shared": "workspace:*"
  }
}
```

## 🏗️ Type Definitions

### Core Analysis Types

```typescript
// Analysis request from frontend to backend
interface AnalysisRequest {
  url: string;
  analysisMode: 'single-page' | 'multi-page';
  averagePages?: number;
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

// Complete analysis response
interface AnalysisResponse {
  url: string;
  analyzedUrl: string;
  timestamp: string;
  totalSize: number;
  resourceCount: number;
  co2Emissions: number;
  energyConsumption: number;
  breakdown: ResourceBreakdown;
  resources: NetworkResource[];
  largestResources: NetworkResource[];
}
```

### Resource Types

```typescript
// Individual network resource
interface NetworkResource {
  url: string;
  type: ResourceType;
  size: number;
  loadTime: number;
  method: string;
  status: number;
  headers?: Record<string, string>;
}

// Resource categorization
type ResourceType = 'html' | 'css' | 'js' | 'media' | 'font' | 'other';

// Resource breakdown by type
interface ResourceBreakdown {
  html: ResourceTypeStats;
  css: ResourceTypeStats;
  js: ResourceTypeStats;
  media: ResourceTypeStats;
  font: ResourceTypeStats;
  other: ResourceTypeStats;
}

// Statistics for each resource type
interface ResourceTypeStats {
  size: number;
  count: number;
  percentage: number;
  average: number;
}
```

### Progress Tracking

```typescript
// Real-time progress updates via WebSocket
interface ProgressUpdate {
  id: string;
  step: string;
  percentage: number;
  message?: string;
  timestamp: string;
}

// Analysis progress steps
type ProgressStep = 'initializing' | 'loading' | 'analyzing' | 'processing' | 'complete' | 'error';
```

### Error Handling

```typescript
// Standardized error response
interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
  requestId?: string;
}

// Custom error types
type AnalysisErrorType = 'validation' | 'network' | 'timeout' | 'browser' | 'processing';
```

### Configuration Types

```typescript
// Browser configuration options
interface BrowserConfig {
  headless: boolean;
  timeout: number;
  viewport: ViewportConfig;
  userAgent: string;
}

// Viewport configuration for different devices
interface ViewportConfig {
  width: number;
  height: number;
  deviceScaleFactor: number;
}

// Server configuration
interface ServerConfig {
  port: number;
  host: string;
  corsOrigin: string;
  maxConcurrentAnalysis: number;
  analysisTimeout: number;
}
```

## 🔧 Usage

### In Frontend (React + TypeScript)

```typescript
import type { AnalysisRequest, AnalysisResponse, ProgressUpdate } from '@green-web-compass/shared';

// Type-safe API call
const analyzeWebsite = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  return response.json();
};

// Type-safe WebSocket handling
const handleProgress = (update: ProgressUpdate) => {
  console.log(`${update.step}: ${update.percentage}%`);
};
```

### In Backend (Express + TypeScript)

```typescript
import type { AnalysisRequest, AnalysisResponse, NetworkResource } from '@green-web-compass/shared';

// Type-safe route handler
app.post('/api/analyze', (req: Request, res: Response) => {
  const request: AnalysisRequest = req.body;

  // TypeScript ensures request has all required properties
  const result: AnalysisResponse = await analyzeWebsite(request);

  res.json(result);
});

// Type-safe service methods
class AnalysisService {
  async processResources(resources: NetworkResource[]): Promise<ResourceBreakdown> {
    // Implementation with full type safety
  }
}
```

## 📜 Available Types

### Exported Interfaces

- `AnalysisRequest` - API request structure
- `AnalysisResponse` - API response structure
- `NetworkResource` - Individual resource data
- `ResourceBreakdown` - Resource statistics by type
- `ResourceTypeStats` - Statistics for each resource type
- `ProgressUpdate` - Real-time progress updates
- `ErrorResponse` - Standardized error format
- `BrowserConfig` - Browser configuration options
- `ViewportConfig` - Viewport settings
- `ServerConfig` - Server configuration

### Exported Types

- `ResourceType` - Resource category union type
- `ProgressStep` - Analysis step union type
- `AnalysisErrorType` - Error category union type
- `DeviceType` - Device simulation options
- `InteractionLevel` - User interaction levels
- `AnalysisMode` - Analysis scope options

## 🛠️ Development

### Adding New Types

1. **Define interface** in `src/index.ts`
2. **Export interface** from the main file
3. **Update version** in `package.json` if needed
4. **Use in frontend/backend** packages

### Type Conventions

- **Interfaces**: Use `PascalCase` for interface names
- **Properties**: Use `camelCase` for properties
- **Union Types**: Use `kebab-case` for string literals
- **Optional Properties**: Mark with `?` when appropriate
- **Documentation**: Include JSDoc comments for complex types

### Example Type Definition

```typescript
/**
 * Configuration for website analysis
 */
interface AnalysisConfig {
  /** URL to analyze */
  url: string;

  /** Analysis timeout in milliseconds */
  timeout?: number;

  /** Whether to include detailed resource information */
  includeDetails?: boolean;

  /** Custom headers to send with requests */
  headers?: Record<string, string>;
}
```

## 📚 Benefits

### Type Safety Across Apps

- **Consistent APIs**: Same interfaces used in frontend and backend
- **Compile-time Validation**: Catch type mismatches during development
- **Refactoring Safety**: Changes to types are validated across all apps
- **Documentation**: Types serve as living documentation

### Developer Experience

- **IntelliSense**: Enhanced autocomplete in IDEs
- **Error Prevention**: Catch mistakes before runtime
- **Code Navigation**: Jump to type definitions across packages
- **Consistency**: Enforced data structure consistency

### Maintenance Benefits

- **Single Source of Truth**: Types defined once, used everywhere
- **Version Control**: Track type changes across the monorepo
- **Easy Updates**: Update types in one place
- **Breaking Changes**: Detect breaking changes across apps

## 🔄 Version Management

This package follows semantic versioning:

- **Major**: Breaking changes to existing types
- **Minor**: New types or optional properties
- **Patch**: Bug fixes or documentation updates

Workspace packages always use the latest version via `workspace:*`.

## 🤝 Contributing

### Adding New Types

1. **Consider impact**: Will this type be used in multiple apps?
2. **Define clearly**: Use descriptive names and JSDoc comments
3. **Export properly**: Add to main export in `src/index.ts`
4. **Test usage**: Verify types work in both frontend and backend
5. **Document**: Update this README if needed

### Type Guidelines

- **Be specific**: Use narrow types when possible
- **Use unions**: Prefer union types over generic strings
- **Optional properties**: Only make properties optional when they truly are
- **Consistency**: Follow existing naming conventions
- **Future-proof**: Consider how types might evolve

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Interface Documentation](https://www.typescriptlang.org/docs/handbook/interfaces.html)
- [pnpm Workspace Documentation](https://pnpm.io/workspaces)

---

Ensuring type safety across the Green Web Compass monorepo. 🔒
