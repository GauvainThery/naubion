import { GreenHostingResult } from '../../domain/models/green-hosting.js';
import { GreenHostingDomainService } from '../../domain/services/green-hosting-service.js';
import { extractDomain } from '../../domain/services/page-analysis-service.js';
import { GreenCheckAPIClient } from '../../infrastructure/externalApi/green-check-api.js';
import { AnalysisError } from '../../shared/errors.js';
import logger from '../../shared/logger.js';

export class GreenHostingService {
  private greenCheckAPIClient: GreenCheckAPIClient;
  private greenHostingDomainService: GreenHostingDomainService;

  constructor() {
    this.greenCheckAPIClient = new GreenCheckAPIClient();
    this.greenHostingDomainService = new GreenHostingDomainService();
  }

  /**
   * Perform comprehensive green hosting assessment of a URL
   */
  async assessGreenHosting(url: string): Promise<GreenHostingResult> {
    // Create assessment context using domain service
    const context = this.greenHostingDomainService.createGreenHostingContext(url);

    // Validate prerequisites
    this.greenHostingDomainService.validateGreenHostingAssessmentPrerequisites(context);

    const startTime = Date.now();
    logger.info(`Starting green hosting assessment for ${url}`);

    try {
      // Extract domain from URL
      const domain = extractDomain(url);

      const checkGreenHostingResults = await this.greenCheckAPIClient.checkGreenHosting(domain);

      // Create comprehensive result
      const result = this.greenHostingDomainService.createGreenHostingResult(
        context,
        checkGreenHostingResults.green,
        {
          hosted_by: checkGreenHostingResults.hosted_by,
          hosted_by_website: checkGreenHostingResults.hosted_by_website,
          supporting_documents: checkGreenHostingResults.supporting_documents
        }
      );

      const duration = Date.now() - startTime;
      logger.info(`Green hosting assessment completed in ${duration}ms for ${url}`, {
        green: result.green
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Green hosting assessment failed for ${url}`, { error: errorMessage });
      throw new AnalysisError(
        `Failed to perform green hosting assessment for ${url}: ${errorMessage}`,
        url
      );
    }
  }
}
