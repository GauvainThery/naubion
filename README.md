# Green Web Compass - Page Weight Analyzer

A modern web application for analyzing website resource usage and environmental impact through intelligent page weight analysis.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Setup

```bash
# Clone the repository
git clone <repository-url>
cd green-web-compass

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 🏗️ Architecture Overview

This application follows a modular, service-oriented architecture with clear separation of concerns:

```
green-web-compass/
├── src/
│   ├── client/           # Frontend application
│   ├── server/           # Backend API server
│   ├── analysis/         # Core analysis engine
│   ├── config/           # Configuration management
│   └── utils/            # Shared utilities
├── tests/                # Test suites
├── public/               # Static assets
└── index.html           # Single-page application entry
```

### Core Components

- **Analysis Engine**: Puppeteer-based browser automation with intelligent user simulation
- **Network Monitoring**: Real-time resource tracking via Chrome DevTools Protocol
- **Modular Frontend**: Component-based UI with vanilla JavaScript
- **REST API**: Express.js backend with comprehensive validation
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🔬 Analysis Engine Deep Dive

The analysis engine is the heart of the application, consisting of several specialized modules:

### Browser Automation (`src/analysis/browser/`)

**UserSimulator** - Orchestrates realistic user behavior simulation:

- Configurable interaction strategies (minimal, default, thorough)
- Multi-device viewport simulation (desktop, mobile, tablet)
- Intelligent element discovery and interaction
- Form filling and hover behavior simulation

**Strategy Pattern Implementation**:

- `InteractionStrategies`: Direct, programmatic, data-attribute, and text-based interactions
- `ElementFinder`: Smart element discovery using CSS selectors, data attributes, and semantic analysis
- `BehaviorSimulator`: Scrolling, focus events, viewport changes, and device capability simulation

### Network Monitoring (`src/analysis/monitoring/`)

**NetworkMonitor** - Real-time resource tracking:

- Chrome DevTools Protocol (CDP) integration
- Request/response lifecycle monitoring
- Transfer size and timing analysis
- Resource type classification
- Network activity settlement detection

### Resource Processing (`src/analysis/processing/`)

**ResourceProcessor** - Categorizes and analyzes collected resources:

- Resource type determination (HTML, CSS, JS, media, fonts, other)
- Size aggregation and statistics
- Duplicate resource detection
- Performance metrics calculation

**PageWeight** - Main orchestrator:

- Coordinates browser automation, monitoring, and processing
- Progress tracking and reporting
- Error handling and cleanup
- Configurable analysis options

## 🌐 Frontend Architecture

### Component Structure (`src/client/`)

```
client/
├── js/
│   ├── app.js           # Main application entry point
│   ├── ui/              # UI components
│   │   ├── form.js      # Analysis form handler
│   │   ├── loading.js   # Progress indicator
│   │   └── results.js   # Results visualization
│   └── utils/           # Client utilities
└── css/                 # Stylesheets
```

### Design Principles

- **Progressive Enhancement**: Core functionality works without JavaScript
- **Component Isolation**: Each UI component is self-contained with clear APIs
- **State Management**: Centralized state handling with event-driven updates
- **Performance**: Lazy loading, efficient DOM manipulation, minimal dependencies

## 🔧 Backend Architecture

### Server Structure (`src/server/`)

```
server/
├── app.js              # Express application setup
├── routes/
│   └── api.js          # RESTful API endpoints
└── services/
    └── analysis.js     # Business logic layer
```

### Configuration Management (`src/config/`)

Centralized configuration system with:

- Environment variable support
- Validation and type checking
- Device and simulation profiles
- Development/production configurations

### Utilities (`src/utils/`)

- **Error Handling**: Custom error classes with HTTP status mapping
- **Logging**: Structured logging with configurable levels
- **Validation**: Input validation and sanitization

### API Design

**POST `/api/analyze`**

- Validates URL and analysis options
- Handles device type and interaction level parameters
- Returns structured analysis results
- Comprehensive error handling with meaningful messages

## 🔧 Development Workflow

### Code Quality

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Analysis Configuration
ANALYSIS_TIMEOUT=120000
MAX_CONCURRENT_ANALYSES=3

# Browser Configuration
BROWSER_HEADLESS=true
BROWSER_TIMEOUT=30000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=dev
```

### Scripts Reference

- `npm start` - Production server
- `npm run dev` - Development server with hot reload
- `npm run lint` - Code linting
- `npm run format` - Code formatting

## 📊 Performance Monitoring

### Metrics Collection

The application tracks:

- Analysis execution time
- Resource processing performance
- Network request patterns
- Error rates and types
- User interaction patterns

### Logging Levels

- **ERROR**: System errors and failures
- **WARN**: Performance issues and recoverable errors
- **INFO**: General application flow
- **DEBUG**: Detailed execution information

## 🔒 Security Considerations

### Input Validation

- URL format validation
- Parameter sanitization
- Request size limits
- Rate limiting (configurable)

### Error Handling

- Sensitive information filtering
- Structured error responses
- Graceful degradation
- Resource cleanup

## 🛠️ Extending the Application

### Adding New Analysis Features

1. **Create new analysis module** in `src/analysis/`
2. **Integrate with PageWeight orchestrator**
3. **Update API response schema**
4. **Add frontend visualization**

### Custom User Simulation Strategies

```javascript
// Example: Custom interaction strategy
export class CustomInteractionStrategy {
  constructor(page, networkMonitor) {
    this.page = page;
    this.networkMonitor = networkMonitor;
  }

  async customInteraction(element) {
    // Implement custom interaction logic
    return { success: true, method: 'custom' };
  }
}
```

### Adding New Resource Types

1. **Extend ResourceProcessor.determineResourceType()**
2. **Update sizeByType tracking**
3. **Add frontend visualization support**
4. **Update API documentation**

## 📚 API Documentation

### Analysis Endpoint

**POST /api/analyze**

Request Body:

```json
{
  "url": "https://example.com",
  "interactionLevel": "default", // minimal, default, thorough
  "deviceType": "desktop" // desktop, mobile, tablet
}
```

Response:

```json
{
  "url": "https://example.com",
  "totalSize": 1247,
  "sizeByType": {
    "html": 45,
    "css": 156,
    "js": 789,
    "media": 234,
    "font": 23,
    "other": 0
  },
  "resourceCount": 28,
  "resources": [
    {
      "url": "https://example.com/",
      "type": "html",
      "transferSize": 46234,
      "status": 200,
      "contentType": "text/html"
    }
  ]
}
```

### Error Responses

```json
{
  "error": "Invalid URL format",
  "details": "URL must include protocol (http:// or https://)"
}
```

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

**Green Web Compass** - Making the web more sustainable, one analysis at a time. 🌱
