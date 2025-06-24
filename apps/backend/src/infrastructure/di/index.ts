/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';

// Import application services
import { PageAnalysisService } from '../../application/services/page-analysis-service.js';
import { GreenHostingService } from '../../application/services/green-hosting-service.js';
import { Co2eBytesConversionService } from '../../application/services/co2e-bytes-conversion-service.js';
import { HumanReadableImpactService } from '../../application/services/human-readable-impact-service.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const greenHostingService = new GreenHostingService();
const co2eBytesConversionService = new Co2eBytesConversionService();
const humanReadableImpactService = new HumanReadableImpactService();
const pageAnalysisService = new PageAnalysisService(
  resourceService,
  greenHostingService,
  co2eBytesConversionService,
  humanReadableImpactService
);

// Export all services
export {
  resourceService,
  pageAnalysisService,
  greenHostingService,
  co2eBytesConversionService,
  humanReadableImpactService
};
