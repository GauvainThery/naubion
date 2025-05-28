/**
 * Application configuration management
 * Centralizes all configuration settings for easier maintenance
 */

// Default configuration values
const DEFAULT_CONFIG = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // Analysis configuration
  analysis: {
    timeout: parseInt(process.env.ANALYSIS_TIMEOUT) || 120000,
    maxInteractions: parseInt(process.env.MAX_INTERACTIONS) || 5,
    maxScrollSteps: parseInt(process.env.MAX_SCROLL_STEPS) || 5,
    networkIdleTime: parseInt(process.env.NETWORK_IDLE_TIME) || 2000,
    interactionTimeout: parseInt(process.env.INTERACTION_TIMEOUT) || 30000
  },

  // Browser configuration
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    args: ['--disable-extensions', '--disable-plugins', '--no-sandbox', '--disable-setuid-sandbox']
  },

  // Device configurations
  devices: {
    desktop: {
      viewport: {
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false
      },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    mobile: {
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true
      },
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    }
  },

  // User simulation profiles
  simulationProfiles: {
    minimal: {
      maxInteractions: 3,
      maxScrollSteps: 3,
      enableHoverSimulation: false,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      verboseLogging: false
    },
    default: {
      maxInteractions: 5,
      maxScrollSteps: 5,
      enableHoverSimulation: true,
      enableFormInteraction: false,
      enableResponsiveTesting: false,
      verboseLogging: true
    },
    thorough: {
      maxInteractions: 10,
      maxScrollSteps: 8,
      enableHoverSimulation: true,
      enableFormInteraction: true,
      enableResponsiveTesting: true,
      verboseLogging: true
    }
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING !== 'false'
  }
};

/**
 * Get configuration value by path (e.g., 'server.port')
 */
export function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], DEFAULT_CONFIG);
}

/**
 * Get full configuration object
 */
export function getAllConfig() {
  return { ...DEFAULT_CONFIG };
}

/**
 * Validate required configuration
 */
export function validateConfig() {
  const errors = [];

  // Validate port
  const port = getConfig('server.port');
  if (!port || port < 1 || port > 65535) {
    errors.push('Invalid server port');
  }

  // Validate timeouts
  const analysisTimeout = getConfig('analysis.timeout');
  if (analysisTimeout < 1000) {
    errors.push('Analysis timeout too low (minimum 1000ms)');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }

  return true;
}

export default {
  getConfig,
  getAllConfig,
  validateConfig,
  ...DEFAULT_CONFIG
};
