/**
 * Form handling module for URL input and analysis
 */

import { analyzeUrl } from '../api.js';
import { getUrlParameter, updateUrlParameter } from '../utils/url-params.js';
import { LoadingProgressUI } from './loading.js';
import { populateResults } from './results.js';

/**
 * Form handler class for managing URL analysis form
 */
export class FormHandler {
  constructor() {
    this.form = document.getElementById('urlForm');
    this.urlInput = document.getElementById('urlInput');
    this.analyzeBtn = document.getElementById('analyzeBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.resultsSection = document.getElementById('resultsSection');
    this.loadingSection = document.getElementById('loadingSection');
    this.loadingUI = new LoadingProgressUI();

    this.init();
  }

  /**
   * Initialize form event handlers
   */
  init() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.clearBtn.addEventListener('click', this.handleClear.bind(this));
    this.initializePage();
  }

  /**
   * Initialize page with URL parameter if present
   */
  initializePage() {
    // Support multiple parameter names for flexibility
    const urlParam =
      getUrlParameter('url') ||
      getUrlParameter('site') ||
      getUrlParameter('website') ||
      getUrlParameter('analyze');

    if (urlParam) {
      // Auto-correct URL if it doesn't have protocol
      let correctedUrl = urlParam;
      if (!urlParam.startsWith('http://') && !urlParam.startsWith('https://')) {
        correctedUrl = `https://${urlParam}`;
      }

      this.urlInput.value = correctedUrl;

      // Show a message that URL was pre-filled from parameter
      const description = document.querySelector('.description');
      const originalText = description.textContent;
      description.innerHTML = `
                <span style="color: #667eea; font-weight: 500;">
                    🔗 URL loaded from parameter: ${correctedUrl}
                </span><br>
                <span style="font-size: 0.9em; margin-top: 8px; display: inline-block;">
                    ${originalText}
                </span>
            `;

      // Auto-trigger analysis if URL is valid (but only for HTTPS URLs for security)
      if (correctedUrl.startsWith('https://')) {
        setTimeout(() => {
          if (this.analyzeBtn && !this.analyzeBtn.classList.contains('loading')) {
            // Add a subtle visual indication
            this.analyzeBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            this.analyzeBtn.innerHTML =
              '<span class="btn-text">✨ Auto-Analyze</span><div class="btn-loader"><div class="spinner"></div></div>';

            // Trigger the analysis
            this.form.dispatchEvent(new Event('submit'));
          }
        }, 1000);
      }
    }
  }

  /**
   * Handle form submission
   */
  async handleSubmit(e) {
    e.preventDefault();

    const url = this.urlInput.value;

    // Get analysis options from form
    const formData = new FormData(this.form);
    const interactionLevel = formData.get('interactionLevel') || 'default';
    const deviceType = formData.get('deviceType') || 'desktop';

    const analysisOptions = {
      url,
      interactionLevel,
      deviceType
    };

    // Update document title
    document.title = `Analyzing ${url} - Green Web Compass`;

    // Update URL parameter to reflect current analysis
    updateUrlParameter('url', url);

    // Show loading state and progress
    this.analyzeBtn.classList.add('loading');
    this.loadingSection.style.display = 'block';
    this.resultsSection.style.display = 'none';

    // Scroll to loading section
    this.loadingSection.scrollIntoView({ behavior: 'smooth' });

    try {
      // Start loading UI and get progress interval
      const progressInterval = this.loadingUI.show();

      // Make API call to backend with analysis options
      const data = await analyzeUrl(analysisOptions);

      // Complete loading UI
      this.loadingUI.complete(data);

      // Clear progress simulation
      clearInterval(progressInterval);

      // Wait a moment to show completion
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Hide loading state
      this.analyzeBtn.classList.remove('loading');
      this.loadingSection.style.display = 'none';

      // Reset button to original state
      this.resetAnalyzeButton();

      // Show results section
      this.resultsSection.style.display = 'block';
      this.resultsSection.scrollIntoView({ behavior: 'smooth' });

      // Populate with real data
      populateResults(data);
    } catch (error) {
      console.error('Error analyzing URL:', error);

      // Hide loading state and section
      this.analyzeBtn.classList.remove('loading');
      this.loadingSection.style.display = 'none';

      // Reset button to original state
      this.resetAnalyzeButton();

      // Show error message
      alert(`Error analyzing URL: ${error.message}`);
    }
  }

  /**
   * Handle clear button click
   */
  handleClear() {
    this.urlInput.value = '';
    this.resultsSection.style.display = 'none';
    updateUrlParameter('url', '');
    document.title = 'Green Web Compass - Page Weight Analyzer';

    // Reset description text if it was modified
    const description = document.querySelector('.description');
    description.innerHTML =
      'Enter a URL to get a comprehensive breakdown of page weight, resource sizes, and optimization opportunities';
  }

  /**
   * Reset analyze button to original state
   */
  resetAnalyzeButton() {
    this.analyzeBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    this.analyzeBtn.innerHTML =
      '<span class="btn-text">Analyze</span><div class="btn-loader"><div class="spinner"></div></div>';
  }
}
