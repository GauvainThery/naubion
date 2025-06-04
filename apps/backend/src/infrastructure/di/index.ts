/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';
import { WebsiteService } from '../../domain/services/website-service.js';

// Import application services
import { WebsiteAnalysisService } from '../../application/services/website-analysis-service.js';

// Import infrastructure services
import { WebsiteAnalyzer } from '../browser/website-analyzer.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const websiteService = new WebsiteService();
const websiteAnalyzer = new WebsiteAnalyzer(resourceService);
const websiteAnalysisService = new WebsiteAnalysisService(resourceService);

// Export all services
export { resourceService, websiteService, websiteAnalyzer, websiteAnalysisService };
