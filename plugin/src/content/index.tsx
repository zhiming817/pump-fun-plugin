/**
 * Content Script Entry Point
 *
 * This is the main entry point for the content script that runs on pump.fun pages.
 * It orchestrates the entire oath tracking workflow:
 *
 * 1. Periodically scans the page for meme coin cards
 * 2. Extracts meme IDs and queries the oath API
 * 3. Injects React components (OathTag) into the page using Shadow DOM
 * 4. Displays a main banner promoting the official website
 *
 * The script is designed to be robust, handling DOM changes, API failures,
 * and ensuring no conflicts with pump.fun's existing styles and scripts.
 */

import { createRoot, Root } from 'react-dom/client';
import { OathTag } from '@/components/OathTag';
import { MainBanner } from '@/components/MainBanner';
import {
  scanMemeCards,
  markCardAsInjected,
  findInjectionPoint,
} from './dom-scanner';
import { checkOathStatus } from '@/api/client';
import type { MemeCardInfo, MemeData } from '@/types';
import '@/styles/index.css';

/**
 * Configuration
 */
const CONFIG = {
  scanInterval: 10000, // Scan every 10 seconds (reduced frequency)
  officialWebsite: 'https://oathantidump.vercel.app/',
  bannerInjectionDelay: 2000, // Wait 2 seconds before injecting banner
};

/**
 * Track React roots for cleanup
 */
const reactRoots = new Map<string, Root>();

/**
 * Flag to track if banner has been injected
 */
let bannerInjected = false;

/**
 * Main initialization function
 * Called when the content script loads
 */
function initialize(): void {
  console.log('[Oath Tracker] Extension initialized on pump.fun');

  // Inject main banner after a short delay to ensure page is loaded
  setTimeout(() => {
    injectMainBanner();
  }, CONFIG.bannerInjectionDelay);

  // Start periodic scanning
  startPeriodicScan();

  // Also do an immediate scan
  performScan();

  // Listen for DOM changes (for dynamically loaded content)
  observeDOMChanges();
}

/**
 * Start periodic scanning of meme cards
 */
function startPeriodicScan(): void {
  setInterval(() => {
    performScan();
  }, CONFIG.scanInterval);
}

/**
 * Perform a single scan of the page
 */
async function performScan(): Promise<void> {
  try {
    // Scan for meme cards
    const cards = scanMemeCards();

    if (cards.length === 0) {
      // Reduce log frequency - only log first time
      return;
    }

    // Filter cards that haven't been injected yet
    const cardsToProcess = cards.filter((card) => !card.hasInjectedTag);

    if (cardsToProcess.length === 0) {
      // No new cards to process, skip logging
      return;
    }

    // Extract IDs for API query
    const memeIds = cardsToProcess.map((card) => card.id);

    // Query API for oath status - only log when actually querying
    console.log(`[Oath Tracker] Processing ${memeIds.length} new meme cards`);
    const oathData = await checkOathStatus(memeIds);

    // Inject tags for each card
    let injectedCount = 0;
    for (const card of cardsToProcess) {
      const data = oathData[card.id];
      if (data) {
        injectOathTag(card, data);
        markCardAsInjected(card.id);
        injectedCount++;
      }
    }
    
    // Single summary log instead of one per card
    if (injectedCount > 0) {
      console.log(`[Oath Tracker] Injected ${injectedCount} oath tags`);
    }
  } catch (error) {
    console.error('[Oath Tracker] Error during scan:', error);
  }
}

/**
 * Inject an oath tag component into a meme card
 *
 * @param card - The meme card information
 * @param data - The oath data from API
 */
function injectOathTag(card: MemeCardInfo, data: MemeData): void {
  try {
    // Find the best place to inject the tag
    const injectionPoint = findInjectionPoint(card.element);
    if (!injectionPoint) {
      // Silently skip if no injection point - this is expected for some layouts
      return;
    }

    // Create a container for the React component
    const container = document.createElement('div');
    container.className = 'oath-tag-wrapper';
    
    // Use more specific positioning to avoid overlap
    container.style.cssText = `
      position: absolute;
      top: 4px;
      left: 4px;
      z-index: 99999 !important;
      pointer-events: auto;
      max-width: calc(100% - 8px);
    `;

    // Create Shadow DOM to isolate styles
    const shadowRoot = container.attachShadow({ mode: 'open' });

    // Create a div inside shadow root for React
    const reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);

    // Inject Tailwind styles into Shadow DOM
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getTailwindStyles();
    shadowRoot.appendChild(styleSheet);

    // Render React component
    const root = createRoot(reactContainer);
    root.render(
      <OathTag
        status={data.status}
        centralizationRisk={data.centralizationRisk}
      />
    );

    // Store root for potential cleanup
    reactRoots.set(card.id, root);

    // Inject into DOM
    // Make sure the injection point has relative positioning and proper stacking context
    const computedStyle = getComputedStyle(injectionPoint);
    if (computedStyle.position === 'static') {
      injectionPoint.style.position = 'relative';
    }
    // Ensure parent doesn't clip overflow
    injectionPoint.style.overflow = 'visible';
    injectionPoint.appendChild(container);

    // Removed individual log - summary log in performScan instead
  } catch (error) {
    console.error('[Oath Tracker] Error injecting tag:', error);
  }
}

/**
 * Inject the main banner component
 */
function injectMainBanner(): void {
  if (bannerInjected) return;

  try {
    // 查找主内容区域（pump.fun 的主要内容区域）
    // 尝试多种选择器以找到最佳注入点
    const mainContentSelectors = [
      'main',
      '[role="main"]',
      '#root > div > div:last-child', // 通常是右侧主内容区
      'body > div:first-child > div:last-child', // 另一种常见布局
    ];

    let targetElement: HTMLElement | null = null;
    
    // 先尝试找主内容区
    for (const selector of mainContentSelectors) {
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement && element.offsetWidth > 500) {
        // 确保找到的是宽度足够的主区域，不是侧边栏
        targetElement = element;
        break;
      }
    }

    // 如果还是没找到，尝试找 body 的直接子元素中最宽的
    if (!targetElement) {
      const bodyChildren = Array.from(document.body.children) as HTMLElement[];
      const wideElement = bodyChildren.find(el => el.offsetWidth > 500);
      if (wideElement) {
        // 如果这个元素有多个子元素，选择最后一个（通常是主内容区）
        const children = Array.from(wideElement.children) as HTMLElement[];
        targetElement = children.length > 1 ? children[children.length - 1] : wideElement;
      }
    }

    // 最后的回退方案
    if (!targetElement) {
      targetElement = document.body;
    }

    if (!targetElement) {
      console.warn('[Oath Tracker] Could not find injection point for banner');
      return;
    }

    // Create container
    const container = document.createElement('div');
    container.className = 'oath-banner-root';
    container.style.cssText = `
      position: sticky;
      top: 0;
      z-index: 9999;
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 16px;
      border-radius: 8px;
    `;

    // Create Shadow DOM
    const shadowRoot = container.attachShadow({ mode: 'open' });

    // Create React container
    const reactContainer = document.createElement('div');
    shadowRoot.appendChild(reactContainer);

    // Inject styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = getTailwindStyles();
    shadowRoot.appendChild(styleSheet);

    // Render React component
    const root = createRoot(reactContainer);
    root.render(<MainBanner websiteUrl={CONFIG.officialWebsite} />);

    // Store root
    reactRoots.set('main-banner', root);

    // Inject into DOM (at the top of the target element)
    targetElement.insertBefore(container, targetElement.firstChild);

    bannerInjected = true;
    console.log('[Oath Tracker] Main banner injected into:', targetElement.tagName);
  } catch (error) {
    console.error('[Oath Tracker] Error injecting banner:', error);
  }
}

/**
 * Observe DOM changes to handle dynamically loaded content
 */
function observeDOMChanges(): void {
  // Create a debounced scan function ONCE, outside the observer callback
  const debouncedScan = debounce(() => performScan(), 2000);
  
  const observer = new MutationObserver((mutations) => {
    // Check if new meme cards were added
    let shouldScan = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        // Only trigger if added nodes are elements (not text nodes)
        const hasElementNodes = Array.from(mutation.addedNodes).some(
          node => node.nodeType === Node.ELEMENT_NODE
        );
        if (hasElementNodes) {
          shouldScan = true;
          break;
        }
      }
    }

    if (shouldScan) {
      // Use the same debounced function instance
      debouncedScan();
    }
  });

  // Start observing - only watch for direct children changes, not all subtree
  // This significantly reduces the number of mutations being tracked
  observer.observe(document.body, {
    childList: true,
    subtree: false, // Only watch direct children, not deep changes
  });
  
  // Also watch the main content container if it exists
  const mainContainer = document.querySelector('main, #root, [role="main"]');
  if (mainContainer) {
    observer.observe(mainContainer, {
      childList: true,
      subtree: true,
    });
  }
}

/**
 * Debounce helper function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

/**
 * Get compiled Tailwind styles as a string
 * In production, this would be the compiled CSS from the build process
 */
function getTailwindStyles(): string {
  // This is a simplified version. In the actual build, Vite will handle this.
  // For now, we'll import the essential styles.
  return `
    /* Import base Tailwind utilities */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Tailwind-like utility classes - simplified for Shadow DOM */
    .bg-oathed { background-color: #10b981; }
    .bg-oathed-dark { background-color: #059669; }
    .bg-oathed-light { background-color: #d1fae5; }
    .bg-notOathed { background-color: #f59e0b; }
    .bg-notOathed-dark { background-color: #d97706; }
    .bg-notOathed-light { background-color: #fed7aa; }
    .bg-gray-900 { background-color: #111827; }
    .bg-gray-400 { background-color: #9ca3af; }
    .bg-red-500 { background-color: #ef4444; }
    .bg-white { background-color: #ffffff; }
    .bg-gradient-to-r { background-image: linear-gradient(to right, var(--tw-gradient-stops)); }
    .from-oathed { --tw-gradient-from: #10b981; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0)); }
    .to-oathed-dark { --tw-gradient-to: #059669; }
    
    .text-white { color: #ffffff; }
    .text-oathed-dark { color: #059669; }
    .text-oathed-light { color: #d1fae5; }
    .text-notOathed-light { color: #fed7aa; }
    .text-gray-300 { color: #d1d5db; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-medium { font-weight: 500; }
    
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    
    .mt-2 { margin-top: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-1\\.5 { gap: 0.375rem; }
    .gap-4 { gap: 1rem; }
    .space-y-2 > * + * { margin-top: 0.5rem; }
    
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    
    .flex { display: flex; }
    .inline-block { display: inline-block; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-col { flex-direction: column; }
    
    .relative { position: relative; }
    .absolute { position: absolute; }
    .top-full { top: 100%; }
    .left-1\\/2 { left: 50%; }
    .bottom-full { bottom: 100%; }
    .transform { transform: var(--tw-transform); }
    .-translate-x-1\\/2 { transform: translateX(-50%); }
    
    .cursor-pointer { cursor: pointer; }
    .whitespace-nowrap { white-space: nowrap; }
    .text-center { text-align: center; }
    
    .min-w-\\[200px\\] { min-width: 200px; }
    .w-full { width: 100%; }
    
    .z-50 { z-index: 50; }
    .z-9999 { z-index: 9999; }
    
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-transform { transition-property: transform; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-200 { transition-duration: 200ms; }
    .duration-300 { transition-duration: 300ms; }
    
    .hover\\:scale-105:hover { transform: scale(1.05); }
    .hover\\:scale-\\[1\\.02\\]:hover { transform: scale(1.02); }
    .hover\\:bg-oathed-light:hover { background-color: #d1fae5; }
    
    .oath-shadow { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); }
    .oath-shadow-lg { box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2); }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
      50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
    }
    
    .oath-fade-in { animation: fadeIn 0.3s ease-out; }
    .oath-pulse { animation: pulse-glow 2s ease-in-out infinite; }
  `;
}

/**
 * Cleanup function (called when navigating away)
 */
function cleanup(): void {
  console.log('[Oath Tracker] Cleaning up...');

  // Unmount all React components
  reactRoots.forEach((root) => {
    root.unmount();
  });
  reactRoots.clear();
}

// Handle page unload
window.addEventListener('beforeunload', cleanup);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

