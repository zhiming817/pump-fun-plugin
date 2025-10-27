/**
 * Polyfills for browser environment
 * This file should be imported at the very beginning of the application
 */

// Make global variables available
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
  // @ts-ignore
  window.process = {
    env: {},
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

// Note: Buffer polyfill will be handled by Vite's configuration


