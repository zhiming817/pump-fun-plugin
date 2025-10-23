/**
 * Centralized configuration for the extension
 * All configurable values should be defined here for easy maintenance
 */

export const CONFIG = {
  /**
   * API configuration
   */
  api: {
    endpoint: 'https://api.your-backend.com/v1/memes/check-oath',
    timeout: 10000, // 10 seconds
  },

  /**
   * Official website URL
   */
  website: {
    url: 'https://your-website.com',
  },

  /**
   * Scanning configuration
   */
  scanner: {
    interval: 5000, // 5 seconds
    bannerDelay: 2000, // 2 seconds
  },

  /**
   * UI configuration
   */
  ui: {
    animationDuration: 300, // milliseconds
    tooltipDelay: 200, // milliseconds
  },

  /**
   * Feature flags
   */
  features: {
    enableBanner: true,
    enableOathTags: true,
    enableMutationObserver: true,
  },
} as const;

export default CONFIG;

