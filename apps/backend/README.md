# Green Web Compass - Backend

A robust Express.js + TypeScript backend server that powers the Green Web Compass web analysis platform. Features intelligent browser automation, real-time WebSocket communication, and comprehensive website resource analysis.

## ✨ Features

- 🚀 **Express.js + TypeScript**: Type-safe REST API with comprehensive validation
- 🎭 **Puppeteer Integration**: Advanced browser automation for realistic website analysis
- 🔌 **WebSocket Support**: Real-time progress updates during analysis
- 🌐 **CORS Enabled**: Secure cross-origin resource sharing configuration
- 🛡️ **Error Handling**: Comprehensive error management with structured logging
- ⚙️ **Environment Configuration**: Flexible configuration management
- 📊 **Resource Analysis**: Deep website resource tracking and categorization
- 🔄 **Shared Types**: Type safety across the entire monorepo

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Chrome/Chromium browser (for Puppeteer)

### Installation & Development

```bash
# From the monorepo root
pnpm install

# Set up environment variables
cd apps/backend
cp .env.example .env

# Start backend development server
pnpm dev

# Or from the root (starts both frontend and backend)
cd ../..
pnpm run dev
```

The backend will be available at `http://localhost:3001`

## 🏗️ Architecture

### Project Structure

```
apps/backend/
├── src/
│   ├── app.ts                   # Main Express application entry
│   ├── config/
│   │   └── index.ts             # Configuration management
│   ├── routes/
│   │   └── api.ts               # REST API route handlers
│   ├── services/
│   │   ├── analysis.ts          # Core analysis business logic
│   │   ├── websocket.ts         # WebSocket service for real-time updates
│   │   └── progress-tracker.ts  # Analysis progress tracking
│   └── utils/
│       ├── errors.ts            # Custom error classes and handling
│       └── logger.ts            # Structured logging utility
├── dist/                        # Compiled JavaScript output
├── .env.example                 # Environment variables template
├── package.json                 # Backend dependencies
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

### Core Services

#### Analysis Service (`src/services/analysis.ts`)

The heart of the website analysis engine:

```typescript
interface AnalysisService {
  analyzeWebsite(request: AnalysisRequest): Promise<AnalysisResponse>;
  validateRequest(request: unknown): AnalysisRequest;
  processResources(resources: NetworkResource[]): ResourceBreakdown;
}
```

**Features:**

- Puppeteer-based browser automation
- Network resource monitoring via Chrome DevTools Protocol
- Intelligent user behavior simulation
- Resource categorization and size analysis
- CO2 emissions and energy consumption calculation

#### WebSocket Service (`src/services/websocket.ts`)

Real-time communication for analysis progress:

```typescript
interface WebSocketService {
  broadcastProgress(progress: ProgressUpdate): void;
  handleConnection(ws: WebSocket): void;
  cleanup(): void;
}
```

**Features:**

- Real-time progress updates during analysis
- Connection management and cleanup
- Broadcasting to multiple connected clients
- Error handling for connection issues

#### Progress Tracker (`src/services/progress-tracker.ts`)

Tracks and reports analysis progress:

```typescript
interface ProgressTracker {
  startAnalysis(id: string): void;
  updateProgress(id: string, step: string, percentage: number): void;
  completeAnalysis(id: string): void;
  failAnalysis(id: string, error: string): void;
}
```

## 🔧 TypeScript Integration

### Type Safety Features

- **🛡️ Complete Type Coverage**: All API endpoints, services, and data structures are strictly typed
- **📝 Shared Types**: Uses types from `@green-web-compass/shared` package
- **🎯 Request/Response Validation**: Runtime validation with TypeScript types
- **🚫 Runtime Error Prevention**: Catch type errors at compile time
- **🔄 Safe Refactoring**: Confident code changes with type validation

### Key Interfaces

```typescript
// API Request/Response Types
interface AnalysisRequest {
  url: string;
  analysisMode: 'single-page' | 'multi-page';
  averagePages?: number;
  interactionLevel: 'minimal' | 'default' | 'thorough';
  deviceType: 'desktop' | 'mobile' | 'tablet';
}

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

// WebSocket Progress Updates
interface ProgressUpdate {
  id: string;
  step: string;
  percentage: number;
  message?: string;
  timestamp: string;
}
```

## 📜 Available Scripts

```bash
# Development server with file watching
pnpm dev

# Build TypeScript to JavaScript
pnpm build

# Start production server (requires build first)
pnpm start

# Type checking only (no build)
pnpm type-check

# Lint TypeScript files
pnpm lint

# Clean build artifacts
pnpm clean
```

## 🌐 API Documentation

### Analysis Endpoint

**POST `/api/analyze`**

Analyzes a website and returns detailed resource breakdown.

#### Request Body

```json
{
  "url": "https://example.com",
  "analysisMode": "single-page",
  "averagePages": 1,
  "interactionLevel": "default",
  "deviceType": "desktop"
}
```

#### Request Parameters

| Parameter          | Type   | Required | Description                                                      |
| ------------------ | ------ | -------- | ---------------------------------------------------------------- |
| `url`              | string | Yes      | The website URL to analyze (must include protocol)               |
| `analysisMode`     | string | Yes      | Analysis scope: `"single-page"` or `"multi-page"`                |
| `averagePages`     | number | No       | Number of pages for multi-page analysis (default: 1)             |
| `interactionLevel` | string | Yes      | User simulation level: `"minimal"`, `"default"`, or `"thorough"` |
| `deviceType`       | string | Yes      | Device simulation: `"desktop"`, `"mobile"`, or `"tablet"`        |

#### Success Response (200)

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
    "html": { "size": 45, "count": 1, "percentage": 3.6, "average": 45 },
    "css": { "size": 156, "count": 3, "percentage": 12.5, "average": 52 },
    "js": { "size": 789, "count": 8, "percentage": 63.3, "average": 98.6 },
    "media": { "size": 234, "count": 12, "percentage": 18.8, "average": 19.5 },
    "font": { "size": 23, "count": 2, "percentage": 1.8, "average": 11.5 },
    "other": { "size": 0, "count": 0, "percentage": 0, "average": 0 }
  },
  "resources": [
    {
      "url": "https://example.com/main.js",
      "type": "js",
      "size": 245,
      "loadTime": 120,
      "method": "GET",
      "status": 200
    }
  ],
  "largestResources": [
    {
      "url": "https://example.com/large-image.jpg",
      "type": "media",
      "size": 1024,
      "loadTime": 300,
      "method": "GET",
      "status": 200
    }
  ]
}
```

#### Error Responses

**400 Bad Request**

```json
{
  "error": "Invalid URL format",
  "details": "URL must include protocol (http:// or https://)"
}
```

**500 Internal Server Error**

```json
{
  "error": "Analysis failed",
  "details": "Unable to load the specified website"
}
```

### Health Check Endpoint

**GET `/health`**

Returns server health status.

```json
{
  "status": "healthy",
  "timestamp": "2025-01-03T10:30:45.123Z",
  "uptime": 3600
}
```

## 🔌 WebSocket Integration

### Connection

Connect to the WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to analysis updates');
};

ws.onmessage = event => {
  const update = JSON.parse(event.data);
  console.log('Progress update:', update);
};
```

### Progress Updates

The server sends progress updates during analysis:

```json
{
  "id": "analysis-uuid",
  "step": "Loading website",
  "percentage": 25,
  "message": "Navigating to https://example.com",
  "timestamp": "2025-01-03T10:30:45.123Z"
}
```

#### Progress Steps

1. **Initializing** (0-10%): Setting up browser and navigation
2. **Loading** (10-30%): Loading the target website
3. **Analyzing** (30-80%): Monitoring network resources
4. **Processing** (80-95%): Categorizing and calculating results
5. **Complete** (100%): Analysis finished

## ⚙️ Configuration

### Environment Variables

Create `.env` file in the backend directory:

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

# WebSocket Configuration
WS_PORT=3001
WS_PATH=/
```

### Configuration Values

| Variable                  | Type    | Default               | Description                              |
| ------------------------- | ------- | --------------------- | ---------------------------------------- |
| `PORT`                    | number  | 3001                  | Server port                              |
| `HOST`                    | string  | localhost             | Server host                              |
| `NODE_ENV`                | string  | development           | Environment mode                         |
| `LOG_LEVEL`               | string  | info                  | Logging level (error, warn, info, debug) |
| `CORS_ORIGIN`             | string  | http://localhost:3000 | CORS allowed origin                      |
| `BROWSER_HEADLESS`        | boolean | true                  | Run browser in headless mode             |
| `BROWSER_TIMEOUT`         | number  | 30000                 | Browser operation timeout (ms)           |
| `MAX_CONCURRENT_ANALYSIS` | number  | 3                     | Maximum concurrent analyses              |
| `ANALYSIS_TIMEOUT`        | number  | 120000                | Analysis timeout (ms)                    |
| `ANALYSIS_RETRIES`        | number  | 2                     | Number of retry attempts                 |

## 🎭 Browser Automation

### Puppeteer Integration

The backend uses Puppeteer for realistic website analysis:

```typescript
interface BrowserConfig {
  headless: boolean;
  timeout: number;
  viewport: {
    width: number;
    height: number;
    deviceScaleFactor: number;
  };
  userAgent: string;
}
```

### Device Simulation

**Desktop Configuration:**

```typescript
{
  viewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
  userAgent: 'Desktop Chrome User Agent'
}
```

**Mobile Configuration:**

```typescript
{
  viewport: { width: 375, height: 667, deviceScaleFactor: 2 },
  userAgent: 'Mobile Chrome User Agent'
}
```

**Tablet Configuration:**

```typescript
{
  viewport: { width: 768, height: 1024, deviceScaleFactor: 2 },
  userAgent: 'Tablet Chrome User Agent'
}
```

### Interaction Levels

**Minimal:**

- Basic page load
- Wait for network idle
- No user interactions

**Default:**

- Page load with basic interactions
- Scroll simulation
- Click common elements

**Thorough:**

- Comprehensive user simulation
- Form interactions
- Hover effects
- Multiple scroll patterns

## 📊 Resource Analysis

### Network Monitoring

The backend monitors all network requests using Chrome DevTools Protocol:

```typescript
interface NetworkResource {
  url: string;
  type: ResourceType;
  size: number;
  loadTime: number;
  method: string;
  status: number;
  headers?: Record<string, string>;
}

type ResourceType = 'html' | 'css' | 'js' | 'media' | 'font' | 'other';
```

### Resource Categorization

Resources are automatically categorized by:

- **HTML**: Document, XHR, fetch requests
- **CSS**: Stylesheets and style-related resources
- **JavaScript**: Scripts and modules
- **Media**: Images, videos, audio files
- **Fonts**: Web fonts and font files
- **Other**: All other resource types

### Metrics Calculation

**CO2 Emissions:**

- Based on energy consumption models
- Calculated per KB of data transfer
- Includes both device and network energy

**Energy Consumption:**

- CPU usage estimation
- Network transfer energy
- Display energy for rendering

## 🛡️ Error Handling

### Custom Error Classes

```typescript
class AnalysisError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: string
  ) {
    super(message);
    this.name = 'AnalysisError';
  }
}
```

### Error Categories

- **Validation Errors** (400): Invalid request parameters
- **Network Errors** (500): Website unreachable or loading failures
- **Timeout Errors** (408): Analysis exceeded time limits
- **Browser Errors** (500): Puppeteer or browser-related issues
- **Processing Errors** (500): Resource analysis failures

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": "Technical details about the error",
  "timestamp": "2025-01-03T10:30:45.123Z",
  "requestId": "uuid-for-tracking"
}
```

## 📝 Logging

### Structured Logging

The backend uses structured logging with configurable levels:

```typescript
interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}
```

### Log Levels

- **ERROR**: System errors and failures
- **WARN**: Performance issues and recoverable errors
- **INFO**: General application flow and important events
- **DEBUG**: Detailed execution information for troubleshooting

### Example Log Output

```json
{
  "level": "info",
  "message": "Analysis completed successfully",
  "timestamp": "2025-01-03T10:30:45.123Z",
  "requestId": "req-uuid",
  "metadata": {
    "url": "https://example.com",
    "duration": 5432,
    "resourceCount": 28,
    "totalSize": 1247
  }
}
```

## 🛠️ Development

### TypeScript Development

The backend is built with TypeScript for enhanced development experience:

```bash
# Watch mode with automatic restart
pnpm dev

# Type checking without building
pnpm type-check

# Build for production
pnpm build
```

### Hot Reloading

Development server uses Node.js `--watch` flag for automatic restarts:

- **File Changes**: Automatically detects TypeScript file changes
- **Compilation**: Builds TypeScript to JavaScript on change
- **Restart**: Restarts the server with new changes
- **Logging**: Shows restart information in console

### Development Workflow

1. **Start development server**: `pnpm dev`
2. **Make changes**: Edit TypeScript files with full type checking
3. **Automatic restart**: Server restarts on file changes
4. **Test changes**: API endpoints automatically reflect updates
5. **Type validation**: TypeScript validates types in real-time

## 🧪 Testing

### API Testing

Use tools like Postman, curl, or HTTPie to test endpoints:

```bash
# Test analysis endpoint
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "analysisMode": "single-page",
    "interactionLevel": "default",
    "deviceType": "desktop"
  }'

# Test health endpoint
curl http://localhost:3001/health
```

### WebSocket Testing

Test WebSocket connections:

```javascript
// Simple WebSocket test
const ws = new WebSocket('ws://localhost:3001');
ws.onopen = () => console.log('Connected');
ws.onmessage = event => console.log('Message:', event.data);
```

## 🚀 Production Deployment

### Build Process

```bash
# Build TypeScript to JavaScript
pnpm build

# Start production server
pnpm start
```

### Production Configuration

```env
# Production environment variables
NODE_ENV=production
PORT=3001
LOG_LEVEL=warn
BROWSER_HEADLESS=true
CORS_ORIGIN=https://your-frontend-domain.com
```

### Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up process management (PM2, Docker)
- [ ] Configure reverse proxy (Nginx, Apache)
- [ ] Set up SSL/TLS certificates
- [ ] Configure logging aggregation
- [ ] Set up monitoring and health checks
- [ ] Configure browser dependencies (Chrome/Chromium)

### Docker Support

Example Dockerfile:

```dockerfile
FROM node:18-alpine

# Install Chrome dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Chrome path for Puppeteer
ENV CHROME_BIN=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 3001

CMD ["npm", "start"]
```

## 🔧 Performance Optimization

### Concurrent Analysis

The backend supports multiple concurrent analyses:

```typescript
interface ConcurrencyConfig {
  maxConcurrent: number;
  queueSize: number;
  timeout: number;
}
```

### Memory Management

- **Browser Instance Reuse**: Reuses Puppeteer instances when possible
- **Resource Cleanup**: Automatic cleanup of browser resources
- **Memory Monitoring**: Tracks memory usage during analysis
- **Garbage Collection**: Proper cleanup of analysis data

### Caching Strategy

Recommended caching for production:

- **Browser Results**: Cache analysis results for identical URLs
- **Static Assets**: Cache static resources to reduce load times
- **Configuration**: Cache configuration to avoid repeated file reads

## 🤝 Contributing

### Adding New Features

1. **Create service** in `src/services/` with proper TypeScript interfaces
2. **Add routes** in `src/routes/api.ts` with validation
3. **Update types** in shared package if needed
4. **Add configuration** options in `src/config/index.ts`
5. **Include error handling** with proper error classes
6. **Add logging** for debugging and monitoring

### Code Style Guidelines

- **TypeScript**: Always use TypeScript for new files
- **Interfaces**: Define interfaces for all service methods and data structures
- **Error Handling**: Use custom error classes with proper HTTP status codes
- **Logging**: Include structured logging for all significant operations
- **Validation**: Validate all incoming requests with TypeScript types

### Example Service Template

```typescript
import { AnalysisRequest, AnalysisResponse } from '@green-web-compass/shared';
import { logger } from '../utils/logger.js';
import { AnalysisError } from '../utils/errors.js';

export class ExampleService {
  async processRequest(request: AnalysisRequest): Promise<AnalysisResponse> {
    try {
      logger.info('Processing request', { url: request.url });

      // Service implementation
      const result = await this.performAnalysis(request);

      logger.info('Request processed successfully', {
        url: request.url,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      logger.error('Request processing failed', {
        url: request.url,
        error: error.message
      });
      throw new AnalysisError('Processing failed', 500, error.message);
    }
  }

  private async performAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    // Implementation details
  }
}
```

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Puppeteer Documentation](https://pptr.dev/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)

## 🐛 Troubleshooting

### Common Issues

**TypeScript Compilation Errors:**

- Run `pnpm type-check` to see all type errors
- Ensure shared types are properly imported
- Check that all interfaces are correctly defined

**Puppeteer Issues:**

- Ensure Chrome/Chromium is installed
- Check `BROWSER_HEADLESS` environment variable
- Verify browser timeout settings
- Check for memory limitations

**WebSocket Connection Problems:**

- Verify WebSocket port configuration
- Check CORS settings for WebSocket connections
- Ensure frontend is connecting to correct WebSocket URL

**Analysis Failures:**

- Check target website accessibility
- Verify timeout settings are sufficient
- Review browser console logs in debug mode
- Check network connectivity

**Performance Issues:**

- Monitor concurrent analysis limits
- Check memory usage during analysis
- Review timeout configurations
- Consider browser instance reuse

---

Built with ⚡ using Express + TypeScript + Puppeteer for the Green Web Compass project.
