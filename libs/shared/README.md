# Shared Library

TypeScript types and interfaces shared across the Green Web Compass monorepo to ensure type consistency between frontend and backend.

## Overview

This package provides common type definitions used throughout the application:

- **API Contracts**: Request/response types for all endpoints
- **Data Models**: Core business domain types
- **Configuration**: Shared configuration interfaces
- **Error Handling**: Standardized error types

## Installation

Automatically included as a workspace dependency:

```json
{
  "dependencies": {
    "@green-web-compass/shared": "workspace:*"
  }
}
```

## Core Types

### Analysis Flow

```typescript
// Request from frontend
interface AnalysisRequest {
  url: string;
  analysisMode: 'single-page' | 'multi-page';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  interactionLevel: 'minimal' | 'default' | 'thorough';
}

// Response to frontend
interface AnalysisResponse {
  url: string;
  totalSize: number;
  co2Emissions: number;
  energyConsumption: number;
  breakdown: ResourceBreakdown;
  resources: NetworkResource[];
}

// Real-time progress updates
interface ProgressUpdate {
  id: string;
  step: string;
  percentage: number;
  message?: string;
}
```

### Resource Data

```typescript
interface NetworkResource {
  url: string;
  type: ResourceType;
  size: number;
  loadTime: number;
  status: number;
}

type ResourceType = 'html' | 'css' | 'js' | 'media' | 'font' | 'other';

interface ResourceBreakdown {
  html: ResourceTypeStats;
  css: ResourceTypeStats;
  js: ResourceTypeStats;
  media: ResourceTypeStats;
  font: ResourceTypeStats;
  other: ResourceTypeStats;
}
```

## Usage Examples

### Frontend

```typescript
import type { AnalysisRequest, AnalysisResponse } from '@green-web-compass/shared';

const analyzeWebsite = async (request: AnalysisRequest): Promise<AnalysisResponse> => {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    body: JSON.stringify(request)
  });
  return response.json();
};
```

### Backend

```typescript
import type { AnalysisRequest, AnalysisResponse } from '@green-web-compass/shared';

app.post('/api/analyze', (req: Request, res: Response) => {
  const request: AnalysisRequest = req.body;
  const result: AnalysisResponse = await analyzeWebsite(request);
  res.json(result);
});
```

## Adding New Types

When adding types that will be used across multiple apps:

1. Define the interface in `src/index.ts`
2. Export it from the main file
3. Use descriptive names and JSDoc comments
4. Follow existing naming conventions

### Type Conventions

- **Interfaces**: `PascalCase` (e.g., `AnalysisRequest`)
- **Properties**: `camelCase` (e.g., `deviceType`)
- **Union literals**: `kebab-case` (e.g., `'single-page'`)
- **Optional properties**: Use `?` sparingly and intentionally

## Key Benefits

- **Type Safety**: Compile-time validation across apps
- **Consistency**: Same data structures everywhere
- **Refactoring**: Changes propagate safely across the monorepo
- **Documentation**: Types serve as living API documentation

## Available Exports

### Main Interfaces

- `AnalysisRequest`, `AnalysisResponse` - API contracts
- `NetworkResource`, `ResourceBreakdown` - Resource data
- `ProgressUpdate` - Real-time updates
- `ErrorResponse` - Error handling

### Union Types

- `ResourceType` - Resource categories
- `ProgressStep` - Analysis stages
- `DeviceType` - Device simulation options
