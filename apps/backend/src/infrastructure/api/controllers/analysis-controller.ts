/**
 * API controller for website analysis
 */

import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { PageAnalysisService } from '../../../application/services/page-analysis-service.js';
import { PageAnalysisResult } from '../../../domain/models/page-analysis.js';
import { asyncHandler, validateAnalysisOptions, validateUrl } from '../../../shared/errors.js';
import logger from '../../../shared/logger.js';

type AnalysisRequestBody = {
  url: string;
  interactionLevel?: 'minimal' | 'default' | 'thorough';
  deviceType?: 'desktop' | 'mobile';
};

type AnalysisInitResponse = {
  analysisId: string;
  estimatedDuration: number;
  status: 'started';
  message: string;
};

// Store for tracking ongoing analyses
const ongoingAnalyses = new Map<
  string,
  {
    status: 'running' | 'completed' | 'failed';
    result?: PageAnalysisResult;
    error?: string;
    progress: number;
    currentStep: string;
  }
>();

// SSE connections for real-time updates
const sseConnections = new Map<string, Response[]>();

// Helper function to broadcast progress updates
function broadcastProgress(analysisId: string, progress: number, step: string, message?: string) {
  const connections = sseConnections.get(analysisId) || [];
  const data = {
    analysisId,
    progress,
    step,
    message,
    timestamp: new Date().toISOString()
  };

  connections.forEach(res => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

export class AnalysisController {
  constructor(private pageAnalysisService: PageAnalysisService) {}

  /**
   * Start analysis and return immediate response with estimation
   */
  analyze = asyncHandler(
    async (req: Request<object, unknown, AnalysisRequestBody>, res: Response) => {
      const { url, interactionLevel = 'default', deviceType = 'desktop' } = req.body;

      // Validate inputs
      validateUrl(url);
      validateAnalysisOptions({ interactionLevel, deviceType });

      // Generate unique analysis ID
      const analysisId = randomUUID();

      // Get time estimation
      const context = this.pageAnalysisService.createAnalysisContext(
        url,
        interactionLevel,
        deviceType
      );
      const estimatedDuration = this.pageAnalysisService.estimateAnalysisDuration(context.options);

      // Initialize tracking
      ongoingAnalyses.set(analysisId, {
        status: 'running',
        progress: 0,
        currentStep: 'initializing'
      });

      logger.info('Starting analysis', {
        analysisId,
        url,
        interactionLevel,
        deviceType,
        estimatedDuration,
        userAgent: req.get('User-Agent')
      });

      // Return immediate response
      const initResponse: AnalysisInitResponse = {
        analysisId,
        estimatedDuration,
        status: 'started',
        message: `Analysis started. Estimated completion in ${Math.round(estimatedDuration / 1000)} seconds.`
      };

      res.json(initResponse);

      // Start background analysis
      this.runBackgroundAnalysis(analysisId, url, { interactionLevel, deviceType });
    }
  );

  /**
   * Server-Sent Events endpoint for real-time progress updates
   */
  progress = asyncHandler(async (req: Request, res: Response) => {
    const { analysisId } = req.params;

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Add connection to tracking
    if (!sseConnections.has(analysisId)) {
      sseConnections.set(analysisId, []);
    }
    sseConnections.get(analysisId)!.push(res);

    // Send initial status
    const analysis = ongoingAnalyses.get(analysisId);
    if (analysis) {
      res.write(
        `data: ${JSON.stringify({
          analysisId,
          progress: analysis.progress,
          step: analysis.currentStep,
          status: analysis.status,
          timestamp: new Date().toISOString()
        })}\n\n`
      );
    }

    // Clean up on disconnect
    req.on('close', () => {
      const connections = sseConnections.get(analysisId) || [];
      const index = connections.indexOf(res);
      if (index > -1) {
        connections.splice(index, 1);
      }
      if (connections.length === 0) {
        sseConnections.delete(analysisId);
      }
    });
  });

  /**
   * Get final analysis results
   */
  result = asyncHandler(async (req: Request, res: Response) => {
    const { analysisId } = req.params;
    const analysis = ongoingAnalyses.get(analysisId);

    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    if (analysis.status === 'running') {
      return res.status(202).json({
        status: 'running',
        progress: analysis.progress,
        step: analysis.currentStep
      });
    }

    if (analysis.status === 'failed') {
      return res.status(500).json({ error: analysis.error });
    }

    // Clean up and return results
    ongoingAnalyses.delete(analysisId);
    sseConnections.delete(analysisId);
    res.json(analysis.result);
  });

  /**
   * Background analysis execution with progress updates
   */
  private async runBackgroundAnalysis(
    analysisId: string,
    url: string,
    options: { interactionLevel: string; deviceType: string }
  ) {
    try {
      // Enhanced analysis service call with progress callbacks
      const result = await this.pageAnalysisService.analyzeUrlWithProgress(url, {
        interactionLevel: options.interactionLevel as 'minimal' | 'default' | 'thorough',
        deviceType: options.deviceType as 'desktop' | 'mobile',
        progressCallback: (progress: number, step: string, message?: string) => {
          this.updateProgress(analysisId, progress, step, message);
        }
      });

      const analysis = ongoingAnalyses.get(analysisId);
      if (analysis) {
        analysis.status = 'completed';
        analysis.result = result;
      }

      logger.info('Analysis completed', { analysisId, url });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Analysis failed for ${url}`, { analysisId, error: errorMessage });

      const analysis = ongoingAnalyses.get(analysisId);
      if (analysis) {
        analysis.status = 'failed';
        analysis.error = errorMessage;
      }

      this.updateProgress(analysisId, 0, 'error', `Analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Update progress and broadcast to SSE connections
   */
  private updateProgress(analysisId: string, progress: number, step: string, message?: string) {
    const analysis = ongoingAnalyses.get(analysisId);
    if (analysis) {
      analysis.progress = progress;
      analysis.currentStep = step;
    }

    broadcastProgress(analysisId, progress, step, message);
  }

  /**
   * Health check endpoint
   */
  healthCheck = (req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      service: 'naubion-api',
      timestamp: new Date().toISOString()
    });
  };
}
