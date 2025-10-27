/**
 * Polyfills for browser environment
 * This file should be imported at the very beginning of the application
 */

import { Buffer } from 'buffer';

// Make Buffer globally available
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.Buffer = Buffer;
  // @ts-ignore
  window.global = window;
  // @ts-ignore
  window.process = {
    env: {},
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}

export { Buffer };


