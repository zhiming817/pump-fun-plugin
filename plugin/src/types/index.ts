/**
 * Type definitions for the Pump.fun Pledge Tracker extension
 */

/**
 * Pledge status of a meme coin
 */
export type PledgeStatus = 'PLEDGED' | 'NOT_PLEDGED' | 'UNKNOWN' | 'ERROR';

/**
 * Meme coin data returned from the API
 */
export interface MemeData {
  /** Pledge status of the coin */
  status: PledgeStatus;
  /** Centralization risk (0-1), only present when status is NOT_PLEDGED */
  centralizationRisk?: number;
}

/**
 * API response for batch pledge check
 */
export interface CheckPledgeResponse {
  data: {
    [memeId: string]: MemeData;
  };
}

/**
 * API request for batch pledge check
 */
export interface CheckPledgeRequest {
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
  /** Whether the pledge tag has been injected */
  hasInjectedTag: boolean;
}

/**
 * Configuration for the extension
 */
export interface ExtensionConfig {
  /** API endpoint for pledge checking */
  apiEndpoint: string;
  /** Official website URL */
  officialWebsite: string;
  /** Scan interval in milliseconds */
  scanInterval: number;
  /** API request timeout in milliseconds */
  apiTimeout: number;
}

/**
 * Props for PledgeTag component
 */
export interface PledgeTagProps {
  status: PledgeStatus;
  centralizationRisk?: number;
}

/**
 * Props for MainBanner component
 */
export interface MainBannerProps {
  websiteUrl: string;
}

