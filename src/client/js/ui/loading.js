/**
 * Loading progress UI component
 */

export class LoadingProgressUI {
  constructor() {
    this.progressInterval = null;
    this.startTime = null;
    this.steps = ['step1', 'step2', 'step3', 'step4'];
    this.currentStep = 0;
    this.stepProgress = 0;
    this.isCompleted = false;
    this.progressCallbacks = [];

    // Step definitions with more realistic timing expectations
    this.stepDefinitions = [
      { name: 'Loading Page', expectedDuration: 3000, minDuration: 1000 },
      { name: 'User Simulation', expectedDuration: 8000, minDuration: 3000 },
      { name: 'Network Monitoring', expectedDuration: 6000, minDuration: 2000 },
      { name: 'Analysis', expectedDuration: 4000, minDuration: 1500 }
    ];
  }

  /**
   * Show loading section and start progress simulation
   */
  show() {
    const loadingSection = document.getElementById('loadingSection');
    loadingSection.style.display = 'block';
    loadingSection.scrollIntoView({ behavior: 'smooth' });

    this.startTime = Date.now();
    this.progressInterval = this.simulateProgress();
  }

  /**
   * Hide loading section and cleanup
   */
  hide() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }

    const loadingSection = document.getElementById('loadingSection');
    loadingSection.style.display = 'none';
  }

  /**
   * Complete all steps
   */
  async complete() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }

    // Complete all steps
    this.updateProgress(4, 100);

    // Wait a moment to show completion
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Update progress bar and step indicators
   * @param {number} stepIndex - Current step index (0-4)
   * @param {number} progress - Progress within current step (0-100)
   */
  updateProgress(stepIndex, progress = 0) {
    // Update progress bar
    const totalProgress = Math.min(100, stepIndex * 25 + progress * 0.25);
    document.getElementById('progressFill').style.width = `${totalProgress}%`;
    document.getElementById('progressPercentage').textContent = `${Math.round(totalProgress)}%`;

    // Update step states
    this.steps.forEach((stepId, index) => {
      const stepEl = document.getElementById(stepId);
      stepEl.classList.remove('active', 'completed');

      if (index < stepIndex) {
        stepEl.classList.add('completed');
      } else if (index === stepIndex) {
        stepEl.classList.add('active');
      }
    });
  }

  /**
   * Simulate realistic progress
   */
  simulateProgress() {
    return setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;

      if (elapsed < 5) {
        // Step 1: Loading page (0-5 seconds)
        this.updateProgress(0, Math.min(100, (elapsed / 5) * 100));
      } else if (elapsed < 15) {
        // Step 2: User simulation (5-15 seconds)
        this.updateProgress(1, Math.min(100, ((elapsed - 5) / 10) * 100));
      } else if (elapsed < 25) {
        // Step 3: Network monitoring (15-25 seconds)
        this.updateProgress(2, Math.min(100, ((elapsed - 15) / 10) * 100));
      } else {
        // Step 4: Analysis (25+ seconds)
        this.updateProgress(3, Math.min(100, ((elapsed - 25) / 10) * 100));
      }
    }, 200);
  }
}
