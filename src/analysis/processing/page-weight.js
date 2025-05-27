import puppeteer from 'puppeteer';
import { createUserSimulator } from '../browser/user-simulator.js';
import { NetworkMonitor } from '../monitoring/network-monitor.js';
import { ResourceProcessor } from './resource-processor.js';

/**
 * Main page weight analyzer
 * Orchestrates the analysis of a webpage's resource usage and environmental impact
 */
export async function getPageWeight(url, options = {}) {
  const { interactionLevel = 'default', deviceType = 'desktop', progressCallback = null } = options;

  console.log(`🌐 Starting page weight analysis for: ${url}`);
  console.log(`📱 Device: ${deviceType}, Interaction: ${interactionLevel}`);

  // Helper function to report progress
  const reportProgress = (currentStep, stepProgress, additionalData = {}) => {
    if (progressCallback) {
      progressCallback({
        currentStep,
        stepProgress,
        ...additionalData
      });
    }
  };

  // Step 0: Initialize (0-25%)
  reportProgress(0, 0);

  // Configure Puppeteer launch options based on device type
  const launchOptions = {
    headless: true,
    args: ['--disable-extensions', '--disable-plugins']
  };

  // Add mobile-specific optimizations
  if (deviceType === 'mobile') {
    launchOptions.args.push(
      '--disable-features=TranslateUI',
      '--disable-ipc-flooding-protection',
      '--enable-features=NetworkService,NetworkServiceLogging'
    );
  }

  reportProgress(0, 15);

  // Launch Puppeteer
  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  reportProgress(0, 30);

  // Configure viewport and user agent based on device type
  if (deviceType === 'mobile') {
    await page.setViewport({
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true
    });

    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    );
  } else {
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      isMobile: false,
      hasTouch: false
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
  }

  reportProgress(0, 50);

  // Create CDP (Chrome DevTool Protocol) session
  const client = await page.createCDPSession();

  // Initialize modules
  const networkMonitor = new NetworkMonitor(client);
  const resourceProcessor = new ResourceProcessor();

  const userSimulator = createUserSimulator(page, interactionLevel);

  reportProgress(0, 70);

  // Set up network monitoring
  await networkMonitor.setupListeners();

  // Connect the user simulator to the network monitor for better resource tracking
  userSimulator.setNetworkMonitor(networkMonitor);

  // Enable request interception
  await page.setRequestInterception(true);

  // Handle intercepted requests with progress tracking
  let resourceCount = 0;
  let totalDataSize = 0;

  page.on('request', request => {
    request.continue();
  });

  // Track responses for progress updates
  page.on('response', response => {
    resourceCount++;
    const contentLength = response.headers()['content-length'];
    if (contentLength) {
      totalDataSize += parseInt(contentLength, 10);
    }

    // Update progress with resource stats
    if (resourceCount % 5 === 0) {
      // Update every 5 resources to avoid spam
      reportProgress(networkMonitor.getCurrentStep?.() || 0, undefined, {
        resourceCount,
        dataSize: totalDataSize
      });
    }
  });

  reportProgress(0, 100);

  try {
    // Step 1: Navigate to page (0-100%)
    reportProgress(1, 0);

    // Navigate to the URL and wait for network idle
    console.log(`📖 Navigating to ${url}...`);
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    reportProgress(1, 70);

    // Wait for initial load
    console.log('⏱️ Initial page loaded, starting user simulation...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    reportProgress(1, 100);

    // Step 2: Simulate realistic user interactions (0-100%)
    reportProgress(2, 0);

    // Configure user simulator to report progress
    if (userSimulator.setProgressCallback) {
      userSimulator.setProgressCallback(progress => {
        reportProgress(2, progress, {
          resourceCount,
          dataSize: totalDataSize
        });
      });
    }

    await userSimulator.simulateUserBehavior();

    reportProgress(2, 100);

    // Wait a bit more to ensure all network events are captured
    console.log('⏳ Waiting for final network activity to settle...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Process collected resources
    const resources = networkMonitor.getResources();
    const analysisResults = resourceProcessor.processResources(resources);

    // Log summary
    resourceProcessor.logSummary(analysisResults);

    console.log(`✅ Page weight analysis completed for ${url}`);

    // Return the results
    return {
      totalTransferSize: analysisResults.totalTransferSize,
      sizeByType: analysisResults.sizeByType,
      resources,
      resourceCount: analysisResults.processedCount,
      resourceProcessor // Include for type determination
    };
  } catch (error) {
    console.error(`❌ Error analyzing ${url}:`, error);
    throw error;
  } finally {
    // Always close browser
    await browser.close();
  }
}
