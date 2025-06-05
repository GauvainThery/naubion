/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';
import { WebsiteService } from '../../domain/services/website-service.js';

// Import application services
import { WebsiteAnalysisService } from '../../application/services/website-analysis-service.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const websiteService = new WebsiteService();
const websiteAnalysisService = new WebsiteAnalysisService(resourceService);

// Export all services
export { resourceService, websiteService, websiteAnalysisService };
