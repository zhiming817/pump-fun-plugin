/**
 * Type definitions for the Pump.fun Oath Tracker extension
 */

/**
 * Oath status of a meme coin
 */
export type OathStatus = 'OATHED' | 'NOT_OATHED' | 'UNKNOWN' | 'ERROR';

/**
 * Meme coin data returned from the API
 */
export interface MemeData {
  /** Oath status of the coin */
  status: OathStatus;
  /** Centralization risk (0-1), only present when status is NOT_OATHED */
  centralizationRisk?: number;
}

/**
 * API response for batch oath check
 */
export interface CheckOathResponse {
  data: {
    [memeId: string]: MemeData;
  };
}

/**
 * API request for batch oath check
 */
export interface CheckOathRequest {
  memeIds: string[];
}

/**
 * Internal representation of a meme coin on the page
 */
export interface MemeCardInfo {
  /** Unique identifier extracted from DOM */
  id: string;
  /** The DOM element of the meme card */
  element: HTMLElement;
  /** Whether the oath tag has been injected */
  hasInjectedTag: boolean;
}

/**
 * Configuration for the extension
 */
export interface ExtensionConfig {
  /** API endpoint for oath checking */
  apiEndpoint: string;
  /** Official website URL */
  officialWebsite: string;
  /** Scan interval in milliseconds */
  scanInterval: number;
  /** API request timeout in milliseconds */
  apiTimeout: number;
}

/**
 * Props for OathTag component
 */
export interface OathTagProps {
  status: OathStatus;
  centralizationRisk?: number;
}

/**
 * Props for MainBanner component
 */
export interface MainBannerProps {
  websiteUrl: string;
}

