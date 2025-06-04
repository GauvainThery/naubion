# Backend - Green Web Compass

Express.js + TypeScript API server with Puppeteer browser automation for website analysis. Provides REST API and WebSocket real-time updates.

## Quick Start

```bash
# From monorepo root
pnpm install

# Set up environment
cd apps/backend && cp .env.example .env

# Start development
pnpm dev
# or from root: pnpm dev (starts both frontend and backend)
```

**Prerequisites:**

- Node.js 18+
- Chrome/Chromium (for Puppeteer)

The API will be available at http://localhost:3001

## Architecture

### Domain-Driven Design Structure

```
src/
├── app.ts                     # Express application setup
├── config/                    # Configuration management
├── application/               # Application services (use cases)
├── domain/                    # Business logic and models
├── infrastructure/            # External systems (API, browser, DB)
└── shared/                    # Cross-cutting concerns (logging, errors)
```

### Core Services

- **Website Analysis Service** - Orchestrates analysis workflow
- **Browser Manager** - Manages Puppeteer instances and automation
- **Resource Service** - Processes and categorizes network resources
- **WebSocket Service** - Real-time progress updates

## API Documentation

### Analysis Endpoint

**POST `/api/analyze`**

Analyzes a website and returns resource breakdown with environmental metrics.

#### Request Body

```json
{
  "url": "https://example.com",
  "analysisMode": "single-page",
  "interactionLevel": "default",
  "deviceType": "desktop"
}
```

#### Response

```json
{
  "url": "https://example.com",
  "analyzedUrl": "https://example.com/",
  "timestamp": "2025-01-03T10:30:45.123Z",
  "totalSize": 1247,
  "resourceCount": 28,
  "co2Emissions": 0.62,
  "energyConsumption": 1.24,
  "breakdown": {
    /* resource breakdown by type */
  },
  "resources": [
    /* all resources */
  ],
  "largestResources": [
    /* top resources by size */
  ]
}
```

### Health Check

**GET `/health`** - Returns server status and uptime

## WebSocket Integration

Real-time analysis progress updates via WebSocket connection:

```javascript
const ws = new WebSocket('ws://localhost:3001');
ws.onmessage = event => {
  const update = JSON.parse(event.data);
  // Handle progress: { id, step, percentage, message, timestamp }
};
```

### Progress Steps

1. **Initializing** (0-10%) - Setting up browser
2. **Loading** (10-30%) - Loading target website
3. **Analyzing** (30-80%) - Monitoring network resources
4. **Processing** (80-95%) - Categorizing results
5. **Complete** (100%) - Analysis finished

## Configuration

### Environment Variables

Create `.env` file:

```env
# Server
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# CORS
CORS_ORIGIN=http://localhost:3000

# Browser
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000

# Analysis
MAX_CONCURRENT_ANALYSIS=3
ANALYSIS_TIMEOUT=120000
ANALYSIS_RETRIES=2
```

## Browser Automation

### Puppeteer Integration

Realistic website analysis using Chrome/Chromium:

- **Device simulation** - Desktop, mobile, tablet viewports
- **User behavior** - Scroll, click, form interactions
- **Network monitoring** - Resource tracking via DevTools Protocol
- **Performance metrics** - Load times, transfer sizes

### Interaction Levels

- **Minimal** - Basic page load only
- **Default** - Standard user interactions (scroll, basic clicks)
- **Thorough** - Comprehensive simulation (forms, hovers, multiple actions)

## Development

### Available Scripts

```bash
pnpm dev          # Development with file watching
pnpm build        # Build TypeScript to JavaScript
pnpm start        # Start production server
pnpm type-check   # TypeScript validation
```

### Hot Reloading

Development server with automatic restart on file changes:

- TypeScript compilation on change
- Automatic server restart
- Real-time type checking

### Adding Features

1. **Define domain models** in `domain/models/`
2. **Create services** in `domain/services/` or `application/services/`
3. **Add API routes** in `infrastructure/api/routes.ts`
4. **Update shared types** if needed for frontend communication
5. **Add configuration** options in `config/index.ts`

## Error Handling

### Custom Error Classes

Structured error handling with proper HTTP status codes:

```typescript
class AnalysisError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
  }
}
```

### Error Categories

- **Validation** (400) - Invalid request parameters
- **Network** (500) - Website unreachable
- **Timeout** (408) - Analysis exceeded time limits
- **Browser** (500) - Puppeteer failures
- **Processing** (500) - Resource analysis failures

## Logging

Structured logging with configurable levels:

```typescript
logger.info('Analysis completed', {
  url: 'https://example.com',
  duration: 5432,
  resourceCount: 28
});
```

**Log levels:** ERROR, WARN, INFO, DEBUG

## Production Deployment

### Build Process

```bash
pnpm build    # Compile TypeScript
pnpm start    # Start production server
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS for production domain
- [ ] Set up process management (PM2)
- [ ] Configure reverse proxy (nginx)
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging aggregation
- [ ] Set up health check monitoring

## Performance Optimization

### Concurrent Analysis

Supports multiple simultaneous analyses with configurable limits:

- Queue management for excess requests
- Browser instance reuse
- Memory cleanup and monitoring

### Caching Strategy

Recommended for production:

- Analysis result caching for identical URLs
- Browser instance pooling
- Configuration caching

## Troubleshooting

### Common Issues

**Puppeteer Issues:**

- Ensure Chrome/Chromium is installed
- Check browser timeout settings
- Verify memory limitations in production environments

**Analysis Failures:**

- Check target website accessibility
- Review timeout configurations
- Monitor memory usage during analysis

**WebSocket Problems:**

- Verify port configuration
- Check CORS settings for WebSocket connections
- Ensure frontend connects to correct URL

**TypeScript Errors:**

- Run `pnpm type-check` for full error list
- Verify shared types are properly imported
- Check interface definitions match usage
