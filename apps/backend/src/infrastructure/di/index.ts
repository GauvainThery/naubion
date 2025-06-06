/**
 * Application entry point with dependency injection
 */

// Import domain services
import { ResourceService } from '../../domain/services/resource-service.js';
import { WebsiteService } from '../../domain/services/website-service.js';
import { WebsiteAnalysisDomainService } from '../../domain/services/analysis/website-analysis-service.js';

// Import application services
import { PageAnalysisService } from '../../application/services/page-analysis-service.js';
import { WebsiteAnalysisService } from '../../application/services/website-analysis-service.js';

// Create services (dependency injection)
const resourceService = new ResourceService();
const websiteService = new WebsiteService();
const websiteAnalysisDomainService = new WebsiteAnalysisDomainService();
const websiteAnalysisService = new PageAnalysisService(resourceService);
const fullWebsiteAnalysisService = new WebsiteAnalysisService(
  websiteAnalysisService,
  websiteService
);

// Export all services
export {
  resourceService,
  websiteService,
  websiteAnalysisDomainService,
  websiteAnalysisService,
  fullWebsiteAnalysisService
};
