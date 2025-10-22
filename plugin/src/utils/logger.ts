/**
 * Logging utility for the extension
 * Provides consistent logging format and can be easily disabled in production
 */

const PREFIX = '[Pledge Tracker]';
// In browser extensions, we can use import.meta.env for build-time environment variables
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';

/**
 * Log an info message
 */
export function logInfo(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.log(`${PREFIX} ${message}`, ...args);
  }
}

/**
 * Log a warning message
 */
export function logWarning(message: string, ...args: any[]): void {
  console.warn(`${PREFIX} ${message}`, ...args);
}

/**
 * Log an error message
 */
export function logError(message: string, ...args: any[]): void {
  console.error(`${PREFIX} ${message}`, ...args);
}

/**
 * Log a debug message (only in development)
 */
export function logDebug(message: string, ...args: any[]): void {
  if (isDevelopment) {
    console.debug(`${PREFIX} [DEBUG] ${message}`, ...args);
  }
}

