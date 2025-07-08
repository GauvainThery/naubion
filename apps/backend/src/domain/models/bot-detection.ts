/**
 * Bot detection domain models - Core bot detection concepts and value objects
 */

// Bot detection types
export interface BotDetectionResult {
  detected: boolean;
  confidence: number; // 0-1 scale
  indicators: BotDetectionIndicator[];
  message?: string;
}

export interface BotDetectionIndicator {
  type:
    | 'captcha'
    | 'access_denied'
    | 'challenge_page'
    | 'suspicious_redirect'
    | 'rate_limit'
    | 'cloudflare_challenge'
    | 'suspicious_content';
  found: boolean;
  details?: string;
  element?: string; // CSS selector or description of detected element
}
