/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';

// Import application services
import { PageAnalysisService } from '../../application/services/page-analysis-service.js';
import { GreenHostingService } from '../../application/services/green-hosting-service.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const greenHostingService = new GreenHostingService();
const pageAnalysisService = new PageAnalysisService(resourceService, greenHostingService);

// Export all services
export { resourceService, pageAnalysisService, greenHostingService };
