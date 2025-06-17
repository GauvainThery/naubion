/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';

// Import application services
import { PageAnalysisService } from '../../application/services/page-analysis-service.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const pageAnalysisService = new PageAnalysisService(resourceService);

// Export all services
export { resourceService, pageAnalysisService };
