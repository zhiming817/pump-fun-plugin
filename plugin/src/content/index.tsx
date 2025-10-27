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

// Import polyfills FIRST
import '../polyfills';

import { createRoot, Root } from 'react-dom/client';
import { OathTag } from '@/components/OathTag';
import { RacePanel } from '@/components/RacePanel';
import { CompactControlPanel } from '@/components/CompactControlPanel';
import { CompactRaceBar } from '@/components/CompactRaceBar';
import {
  scanMemeCards,
  markCardAsInjected,
  findInjectionPoint,
} from './dom-scanner';
import { checkOathStatus } from '@/api/client';
import type { MemeCardInfo, MemeData } from '@/types';
import { injectPhantomBridge } from './phantom-injector';
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
 * Flag to track if compact bar has been injected
 */
let compactBarInjected = false;

/**
 * Scroll state
 */
let isScrolled = false;

/**
 * Main initialization function
 * Called when the content script loads
 */
function initialize(): void {
  console.log('[Oath Tracker] Extension initialized on pump.fun');

  // 立即注入 Phantom 桥接脚本（必须尽早执行）
  injectPhantomBridge();

  // Inject main banner after a short delay to ensure page is loaded
  setTimeout(() => {
    injectWalletAdapterStyles();
    injectPortalTooltipStyles();
    injectMainBanner();
    injectCompactBar();
    setupScrollDetection();
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
      background: transparent;
      margin-bottom: 16px;
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

    // Render React component - 新的布局：跑马面板 + 控制面板
    const root = createRoot(reactContainer);
    root.render(
      <div className="oath-main-banner">
        <RacePanel websiteUrl={CONFIG.officialWebsite} />
        <CompactControlPanel websiteUrl={CONFIG.officialWebsite} />
      </div>
    );

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
 * Inject Wallet Adapter and Portal styles into document head
 */
function injectWalletAdapterStyles(): void {
  // 检查是否已经注入过
  if (document.getElementById('wallet-adapter-styles-injected')) {
    return;
  }

  // 创建标记元素
  const marker = document.createElement('meta');
  marker.id = 'wallet-adapter-styles-injected';
  document.head.appendChild(marker);

  // 注入样式到 document.head
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Wallet Adapter Global Styles */
    .wallet-adapter-modal-wrapper {
      align-items: center !important;
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(8px) !important;
      bottom: 0 !important;
      display: flex !important;
      justify-content: center !important;
      left: 0 !important;
      position: fixed !important;
      right: 0 !important;
      top: 0 !important;
      z-index: 2147483647 !important;
    }
    
    .wallet-adapter-modal {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%) !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      max-width: 420px !important;
      padding: 28px !important;
      position: relative !important;
      width: 90% !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .wallet-adapter-modal-title {
      color: #fff !important;
      font-size: 22px !important;
      font-weight: 700 !important;
      margin: 0 0 24px 0 !important;
      text-align: center !important;
    }
    
    .wallet-adapter-modal-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      list-style: none !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .wallet-adapter-modal-list li {
      margin: 0 !important;
      padding: 0 !important;
    }
    
    .wallet-adapter-button {
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      color: #fff !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      gap: 14px !important;
      justify-content: flex-start !important;
      padding: 16px 20px !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
      height: auto !important;
      line-height: 1.5 !important;
      box-sizing: border-box !important;
    }
    
    .wallet-adapter-button:hover:not([disabled]) {
      background: linear-gradient(135deg, #673ab7, #9c27b0) !important;
      border-color: rgba(123, 31, 162, 0.5) !important;
      transform: translateX(6px) !important;
      box-shadow: 0 4px 20px rgba(123, 31, 162, 0.5) !important;
    }
    
    .wallet-adapter-button-start-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 32px !important;
      height: 32px !important;
      flex-shrink: 0 !important;
    }
    
    .wallet-adapter-button-start-icon img {
      width: 100% !important;
      height: 100% !important;
      border-radius: 6px !important;
    }
    
    .wallet-adapter-button-end-icon {
      margin-left: auto !important;
      display: flex !important;
      align-items: center !important;
      opacity: 0.6 !important;
    }
    
    .wallet-adapter-modal-button-close {
      background: rgba(255, 255, 255, 0.05) !important;
      border: none !important;
      color: rgba(255, 255, 255, 0.6) !important;
      cursor: pointer !important;
      font-size: 28px !important;
      line-height: 1 !important;
      padding: 0 !important;
      position: absolute !important;
      right: 24px !important;
      top: 24px !important;
      width: 36px !important;
      height: 36px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }
    
    .wallet-adapter-modal-button-close:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
    }
    
    /* Portal Modal Styles - 完全独立的层 */
    #oath-wallet-modal-portal {
      position: fixed !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
      isolation: isolate !important;
      contain: layout style paint !important;
    }
    
    .wallet-modal-overlay-portal {
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.85) !important;
      backdrop-filter: blur(12px) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: fadeIn 0.2s ease-out !important;
      pointer-events: auto !important;
      isolation: isolate !important;
      will-change: opacity !important;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .wallet-modal-content-portal {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%) !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      max-width: 480px !important;
      width: 90% !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
      animation: slideInUp 0.3s ease-out !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      position: relative !important;
    }
    
    .wallet-modal-header-portal {
      padding: 20px 24px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
    
    .wallet-modal-title-portal {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #fff !important;
      margin: 0 !important;
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    .wallet-modal-close-portal {
      background: none !important;
      border: none !important;
      color: rgba(255, 255, 255, 0.6) !important;
      cursor: pointer !important;
      font-size: 32px !important;
      line-height: 1 !important;
      padding: 0 !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
      border-radius: 8px !important;
    }
    
    .wallet-modal-close-portal:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
    }
    
    .wallet-modal-body-portal {
      padding: 24px !important;
    }
    
    /* Wallet Connect Container in Portal */
    .wallet-modal-body-portal .wallet-connect-container {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }
    
    .wallet-modal-body-portal .wallet-info {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      padding: 16px !important;
      background: rgba(31, 41, 55, 0.5) !important;
      border-radius: 12px !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .wallet-modal-body-portal .wallet-status {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      padding: 8px !important;
      border-radius: 8px !important;
    }
    
    .wallet-modal-body-portal .wallet-status-signing {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      color: #f59e0b !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    
    .wallet-modal-body-portal .wallet-status-success {
      color: #10b981 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    
    .wallet-modal-body-portal .wallet-status-error {
      color: #ef4444 !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    
    .wallet-modal-body-portal .spinner {
      width: 16px !important;
      height: 16px !important;
      border: 2px solid rgba(245, 158, 11, 0.3) !important;
      border-top-color: #f59e0b !important;
      border-radius: 50% !important;
      animation: spin 0.8s linear infinite !important;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .wallet-modal-body-portal .wallet-address {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      padding: 10px 12px !important;
      background: rgba(16, 185, 129, 0.1) !important;
      border-radius: 8px !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
    }
    
    .wallet-modal-body-portal .wallet-address-label {
      color: rgba(255, 255, 255, 0.6) !important;
      font-size: 12px !important;
    }
    
    .wallet-modal-body-portal .wallet-address-value {
      color: #10b981 !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      font-family: monospace !important;
    }
    
    .wallet-modal-body-portal .wallet-retry-button {
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
      border: none !important;
      border-radius: 8px !important;
      color: #fff !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      padding: 10px 16px !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
    }
    
    .wallet-modal-body-portal .wallet-retry-button:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4) !important;
    }
    
    .wallet-modal-body-portal .wallet-disconnect-button {
      background: rgba(239, 68, 68, 0.1) !important;
      border: 1px solid rgba(239, 68, 68, 0.3) !important;
      border-radius: 8px !important;
      color: #ef4444 !important;
      cursor: pointer !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      padding: 10px 16px !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
    }
    
    .wallet-modal-body-portal .wallet-disconnect-button:hover {
      background: rgba(239, 68, 68, 0.2) !important;
      border-color: rgba(239, 68, 68, 0.5) !important;
    }
    
    /* Custom Wallet List */
    .wallet-modal-body-portal .wallet-list-title {
      font-size: 16px !important;
      font-weight: 600 !important;
      color: #fff !important;
      margin-bottom: 16px !important;
      text-align: center !important;
    }
    
    .wallet-modal-body-portal .wallet-list {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
    }
    
    .wallet-modal-body-portal .wallet-list-item {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 14px 18px !important;
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      color: #fff !important;
      font-size: 15px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
    }
    
    .wallet-modal-body-portal .wallet-list-item:hover:not(:disabled) {
      background: linear-gradient(135deg, #673ab7, #9c27b0) !important;
      border-color: rgba(123, 31, 162, 0.5) !important;
      transform: translateX(6px) !important;
      box-shadow: 0 4px 20px rgba(123, 31, 162, 0.5) !important;
    }
    
    .wallet-modal-body-portal .wallet-list-item:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
    }
    
    .wallet-modal-body-portal .wallet-icon {
      width: 32px !important;
      height: 32px !important;
      border-radius: 8px !important;
    }
    
    .wallet-modal-body-portal .wallet-name {
      flex: 1 !important;
      text-align: left !important;
    }
    
    .wallet-modal-body-portal .wallet-connecting {
      font-size: 13px !important;
      color: rgba(255, 255, 255, 0.7) !important;
    }
    
    .wallet-modal-body-portal .wallet-badge {
      font-size: 11px !important;
      color: rgba(255, 255, 255, 0.6) !important;
      padding: 2px 8px !important;
      background: rgba(255, 255, 255, 0.1) !important;
      border-radius: 4px !important;
    }
    
    .wallet-modal-body-portal .wallet-list-empty {
      padding: 32px 16px !important;
      text-align: center !important;
      color: rgba(255, 255, 255, 0.6) !important;
    }
    
    .wallet-modal-body-portal .wallet-list-empty p {
      margin: 8px 0 !important;
    }
    
    .wallet-modal-body-portal .wallet-list-hint {
      font-size: 13px !important;
      color: rgba(255, 255, 255, 0.4) !important;
    }
    
    .wallet-modal-body-portal .wallet-install-link {
      display: inline-block !important;
      margin-top: 16px !important;
      padding: 10px 20px !important;
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      color: #fff !important;
      text-decoration: none !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      transition: all 0.2s ease !important;
    }
    
    .wallet-modal-body-portal .wallet-install-link:hover {
      background: linear-gradient(135deg, #673ab7, #9c27b0) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 16px rgba(123, 31, 162, 0.4) !important;
    }
    
    .wallet-modal-body-portal .wallet-connecting-status {
      padding: 24px !important;
      text-align: center !important;
      color: #f59e0b !important;
      font-size: 15px !important;
      font-weight: 600 !important;
    }
  `;
  document.head.appendChild(styleElement);
  
  console.log('[Oath Tracker] Wallet Adapter styles injected');
}

/**
 * Inject Portal Tooltip styles into document head
 */
function injectPortalTooltipStyles(): void {
  // 检查是否已经注入过
  if (document.getElementById('portal-tooltip-styles-injected')) {
    return;
  }

  // 创建标记元素
  const marker = document.createElement('meta');
  marker.id = 'portal-tooltip-styles-injected';
  document.head.appendChild(marker);

  // 注入样式到 document.head
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Portal Tooltip - 渲染到 body 的 tooltip */
    .race-tooltip-portal {
      background: rgba(17, 24, 39, 0.98) !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
      border-radius: 12px !important;
      padding: 12px 16px !important;
      min-width: 240px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      animation: fadeInUp 0.2s ease-out !important;
      pointer-events: auto !important;
      backdrop-filter: blur(8px) !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .race-tooltip-portal .race-tooltip-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 12px !important;
      padding-bottom: 8px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .race-tooltip-portal .race-tooltip-header strong {
      color: #fff !important;
      font-size: 14px !important;
      font-weight: 600 !important;
    }
    
    .race-tooltip-portal .race-tooltip-symbol {
      color: #10b981 !important;
      font-size: 12px !important;
      font-weight: 600 !important;
    }
    
    .race-tooltip-portal .race-tooltip-stats {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
      margin-bottom: 12px !important;
    }
    
    .race-tooltip-portal .race-stat {
      display: flex !important;
      justify-content: space-between !important;
      font-size: 12px !important;
    }
    
    .race-tooltip-portal .race-stat-label {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    
    .race-tooltip-portal .race-stat-value {
      color: #fff !important;
      font-weight: 600 !important;
    }
    
    .race-tooltip-portal .race-bet-button {
      width: 100% !important;
      padding: 8px 16px !important;
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .race-tooltip-portal .race-bet-button:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
      background: linear-gradient(135deg, #059669, #047857) !important;
    }
  `;
  document.head.appendChild(styleElement);
  
  console.log('[Oath Tracker] Portal Tooltip styles injected');
}

/**
 * Inject the compact race bar (shown when scrolled)
 */
function injectCompactBar(): void {
  if (compactBarInjected) return;

  try {
    // 查找顶部导航栏或创建固定位置容器
    const container = document.createElement('div');
    container.className = 'oath-compact-bar-root';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      background: rgba(17, 24, 39, 0.98);
      backdrop-filter: blur(20px);
      padding: 12px 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      transform: translateY(-100%);
      transition: transform 0.3s ease;
      display: none;
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
    root.render(<CompactRaceBar websiteUrl={CONFIG.officialWebsite} />);

    // Store root
    reactRoots.set('compact-bar', root);

    // Inject into DOM
    document.body.appendChild(container);

    compactBarInjected = true;
    console.log('[Oath Tracker] Compact race bar injected');
  } catch (error) {
    console.error('[Oath Tracker] Error injecting compact bar:', error);
  }
}

/**
 * Setup scroll detection to toggle between main panel and compact bar
 */
function setupScrollDetection(): void {
  const mainBannerContainer = document.querySelector('.oath-banner-root') as HTMLElement;
  const compactBarContainer = document.querySelector('.oath-compact-bar-root') as HTMLElement;

  if (!mainBannerContainer || !compactBarContainer) {
    console.warn('[Oath Tracker] Could not find banner or compact bar containers');
    return;
  }

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShowCompact = scrollTop > 200; // 滚动超过200px时显示紧凑版

    if (shouldShowCompact !== isScrolled) {
      isScrolled = shouldShowCompact;

      if (shouldShowCompact) {
        // 隐藏主面板，显示紧凑条
        mainBannerContainer.style.opacity = '0';
        mainBannerContainer.style.pointerEvents = 'none';
        compactBarContainer.style.display = 'block';
        setTimeout(() => {
          compactBarContainer.style.transform = 'translateY(0)';
        }, 10);
      } else {
        // 显示主面板，隐藏紧凑条
        mainBannerContainer.style.opacity = '1';
        mainBannerContainer.style.pointerEvents = 'auto';
        compactBarContainer.style.transform = 'translateY(-100%)';
        setTimeout(() => {
          compactBarContainer.style.display = 'none';
        }, 300);
      }
    }
  };

  // 添加滚动事件监听，使用节流
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  console.log('[Oath Tracker] Scroll detection setup complete');
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
    
    /* Race Panel Styles */
    .race-panel-container {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
      flex: 1;
      margin-right: 16px;
    }
    
    .race-header {
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .race-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .race-icon {
      font-size: 32px;
      animation: bounce-slow 2s ease-in-out infinite;
    }
    
    @keyframes bounce-slow {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    
    .race-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      background: linear-gradient(135deg, #10b981, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .race-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }
    
    .race-tracks {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .race-track {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      background: rgba(31, 41, 55, 0.5);
      border-radius: 12px;
      transition: all 0.3s ease;
      animation: slideIn 0.5s ease-out;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .race-track:hover {
      background: rgba(31, 41, 55, 0.8);
      transform: translateX(4px);
      border-color: rgba(16, 185, 129, 0.3);
    }
    
    .race-track.fastest {
      animation: pulse-glow-race 2s ease-in-out infinite;
      border-color: rgba(16, 185, 129, 0.5);
    }
    
    @keyframes pulse-glow-race {
      0%, 100% {
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.3), 0 0 20px rgba(16, 185, 129, 0.1);
      }
      50% {
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.3);
      }
    }
    
    .race-track.near-graduation {
      animation: pulse-glow-race-fast 0.8s ease-in-out infinite;
    }
    
    @keyframes pulse-glow-race-fast {
      0%, 100% {
        box-shadow: 0 0 15px rgba(251, 146, 60, 0.5), 0 0 30px rgba(251, 146, 60, 0.2);
      }
      50% {
        box-shadow: 0 0 25px rgba(251, 146, 60, 0.8), 0 0 50px rgba(251, 146, 60, 0.4);
      }
    }
    
    .race-meme-name {
      min-width: 120px;
      max-width: 120px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-right: 12px;
    }
    
    .race-name-text {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .race-symbol-text {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .race-avatar-moving {
      position: absolute;
      top: -36px;
      transform: translateX(-50%);
      transition: left 0.5s ease;
      z-index: 10;
    }
    
    .race-avatar-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .race-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(16, 185, 129, 0.5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s ease;
      cursor: pointer;
    }
    
    .race-avatar-wrapper.hovered .race-avatar {
      transform: scale(1.3);
      border-color: rgba(16, 185, 129, 0.8);
      box-shadow: 0 6px 24px rgba(16, 185, 129, 0.6);
    }
    
    .race-rank {
      position: absolute;
      top: -6px;
      right: -6px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
    
    .race-progress-text {
      font-size: 13px;
      font-weight: 700;
      color: #10b981;
      white-space: nowrap;
      text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
      background: rgba(17, 24, 39, 0.95);
      padding: 2px 8px;
      border-radius: 6px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .race-tooltip {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.98);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 12px 16px;
      min-width: 240px;
      z-index: 2147483647 !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 0.2s ease-out;
      pointer-events: auto;
    }
    
    /* Portal Tooltip - 渲染到 body 的 tooltip */
    .race-tooltip-portal {
      background: rgba(17, 24, 39, 0.98) !important;
      border: 1px solid rgba(16, 185, 129, 0.3) !important;
      border-radius: 12px !important;
      padding: 12px 16px !important;
      min-width: 240px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      animation: fadeInUp 0.2s ease-out !important;
      pointer-events: auto !important;
      backdrop-filter: blur(8px) !important;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .race-tooltip-header,
    .race-tooltip-portal .race-tooltip-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      margin-bottom: 12px !important;
      padding-bottom: 8px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
    
    .race-tooltip-header strong,
    .race-tooltip-portal .race-tooltip-header strong {
      color: #fff !important;
      font-size: 14px !important;
    }
    
    .race-tooltip-symbol,
    .race-tooltip-portal .race-tooltip-symbol {
      color: #10b981 !important;
      font-size: 12px !important;
      font-weight: 600 !important;
    }
    
    .race-tooltip-stats,
    .race-tooltip-portal .race-tooltip-stats {
      display: flex !important;
      flex-direction: column !important;
      gap: 6px !important;
      margin-bottom: 12px !important;
    }
    
    .race-stat,
    .race-tooltip-portal .race-stat {
      display: flex !important;
      justify-content: space-between !important;
      font-size: 12px !important;
    }
    
    .race-stat-label,
    .race-tooltip-portal .race-stat-label {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    
    .race-stat-value,
    .race-tooltip-portal .race-stat-value {
      color: #fff !important;
      font-weight: 600 !important;
    }
    
    .race-bet-button,
    .race-tooltip-portal .race-bet-button {
      width: 100% !important;
      padding: 8px 16px !important;
      background: linear-gradient(135deg, #10b981, #059669) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      transition: all 0.2s ease !important;
    }
    
    .race-bet-button:hover,
    .race-tooltip-portal .race-bet-button:hover {
      transform: scale(1.05) !important;
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4) !important;
    }
    
    .race-progress-container {
      position: relative;
      flex: 1;
    }
    
    .race-progress-bar {
      display: flex;
      gap: 4px;
      flex: 1;
    }
    
    .race-segment {
      flex: 1;
      height: 6px;
      border-radius: 3px;
      overflow: hidden;
      background: rgba(75, 85, 99, 0.3);
      position: relative;
    }
    
    .segment-inner {
      width: 100%;
      height: 100%;
      transition: all 0.5s ease;
    }
    
    .segment-gray .segment-inner {
      background: rgba(75, 85, 99, 0.5);
    }
    
    .segment-green .segment-inner {
      background: linear-gradient(90deg, #10b981, #34d399);
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }
    
    .segment-orange .segment-inner {
      background: linear-gradient(90deg, #f59e0b, #fb923c);
      animation: pulse-segment 1s ease-in-out infinite;
    }
    
    @keyframes pulse-segment {
      0%, 100% {
        opacity: 1;
        box-shadow: 0 0 8px rgba(251, 146, 60, 0.5);
      }
      50% {
        opacity: 0.7;
        box-shadow: 0 0 16px rgba(251, 146, 60, 0.8);
      }
    }
    
    
    .race-footer {
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    
    .race-track-switcher {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .track-dot {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      width: 32px;
      height: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }
    
    .track-dot:hover {
      transform: scale(1.1);
    }
    
    .dot-inner {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transition: all 0.3s ease;
      display: block;
    }
    
    .track-dot.active .dot-inner {
      width: 24px;
      height: 8px;
      border-radius: 4px;
      background: linear-gradient(90deg, #10b981, #34d399);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
    }
    
    .race-footer-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }
    
    /* Compact Control Panel */
    .compact-control-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 180px;
    }
    
    .control-btn {
      background: rgba(31, 41, 55, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      color: #fff;
    }
    
    .control-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      border-color: rgba(16, 185, 129, 0.5);
    }
    
    .control-btn-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      padding: 16px 20px;
    }
    
    .control-btn-primary:hover {
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }
    
    .control-btn-secondary {
      justify-content: center;
      padding: 10px 12px;
    }
    
    .control-btn-secondary:hover {
      background: rgba(31, 41, 55, 1);
    }
    
    .control-btn-wallet {
      background: linear-gradient(135deg, #512da8, #7b1fa2);
      border: none;
    }
    
    .control-btn-wallet.connected {
      background: linear-gradient(135deg, #10b981, #059669);
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .control-btn-wallet:hover {
      background: linear-gradient(135deg, #673ab7, #9c27b0);
      box-shadow: 0 8px 24px rgba(123, 31, 162, 0.4);
    }
    
    .control-btn-wallet.connected:hover {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }
    
    .btn-icon {
      font-size: 24px;
      line-height: 1;
    }
    
    .btn-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .btn-title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
    }
    
    .btn-subtitle {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .btn-text-small {
      font-size: 12px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
    }
    
    /* Main Banner Container */
    .oath-main-banner {
      display: flex;
      gap: 16px;
      align-items: stretch;
      padding: 16px;
      animation: fadeInDown 0.5s ease-out;
      transition: opacity 0.3s ease;
    }
    
    @keyframes fadeInDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Compact Race Bar */
    .compact-race-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .compact-race-header {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }
    
    .compact-race-icon {
      font-size: 24px;
      animation: bounce-slow 2s ease-in-out infinite;
    }
    
    .compact-race-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, #10b981, #34d399);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .compact-progress-container {
      flex: 1;
      position: relative;
      height: 40px;
      display: flex;
      align-items: center;
    }
    
    .compact-progress-track {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 100%;
      z-index: 2;
    }
    
    .compact-progress-bg {
      width: 100%;
      height: 8px;
      background: rgba(75, 85, 99, 0.3);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .compact-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 4px;
      transition: width 0.5s ease;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
    }
    
    .compact-avatar-pos {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: left 0.5s ease;
      z-index: 10;
    }
    
    .compact-avatar-pos.fastest {
      animation: pulse-glow-compact 2s ease-in-out infinite;
    }
    
    @keyframes pulse-glow-compact {
      0%, 100% {
        filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
      }
      50% {
        filter: drop-shadow(0 0 16px rgba(16, 185, 129, 0.9));
      }
    }
    
    .compact-avatar-pos.flashing .compact-avatar {
      animation: flash-avatar 0.5s ease-in-out 4;
    }
    
    @keyframes flash-avatar {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.2);
      }
    }
    
    .compact-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid rgba(16, 185, 129, 0.5);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .compact-avatar:hover {
      transform: scale(1.3);
      border-color: rgba(16, 185, 129, 0.8);
      box-shadow: 0 6px 24px rgba(16, 185, 129, 0.6);
    }
    
    .compact-rank {
      position: absolute;
      top: -6px;
      right: -6px;
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    
    .compact-tooltip {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%);
      background: rgba(17, 24, 39, 0.98);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 12px 16px;
      min-width: 200px;
      z-index: 999999;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      animation: fadeInUp 0.2s ease-out;
      pointer-events: auto;
    }
    
    .compact-tooltip-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .compact-tooltip-header strong {
      color: #fff;
      font-size: 13px;
    }
    
    .compact-tooltip-symbol {
      color: #10b981;
      font-size: 11px;
      font-weight: 600;
    }
    
    .compact-tooltip-progress {
      font-size: 16px;
      font-weight: 700;
      color: #10b981;
      text-align: center;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }
    
    .compact-tooltip-stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    
    .compact-stat {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
    }
    
    .compact-stat-label {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .compact-stat-value {
      color: #fff;
      font-weight: 600;
    }
    
    .compact-view-button {
      width: 100%;
      padding: 6px 12px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .compact-view-button:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
    }
    
    /* Wallet Modal (in Shadow DOM) */
    .wallet-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease-out;
    }
    
    .wallet-modal-content {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      max-width: 480px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      animation: slideInUp 0.3s ease-out;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    /* Wallet Modal Portal Styles (in document.body) - HIGHEST z-index */
    .wallet-modal-overlay-portal {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0, 0, 0, 0.8) !important;
      backdrop-filter: blur(12px) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      animation: fadeIn 0.2s ease-out !important;
    }
    
    .wallet-modal-content-portal {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%) !important;
      border-radius: 16px !important;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
      max-width: 480px !important;
      width: 90% !important;
      max-height: 80vh !important;
      overflow-y: auto !important;
      animation: slideInUp 0.3s ease-out !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      position: relative !important;
    }
    
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .wallet-modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .wallet-modal-title {
      font-size: 20px;
      font-weight: 700;
      color: #fff;
      margin: 0;
      background: linear-gradient(135deg, #512da8, #7b1fa2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .wallet-modal-close {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 32px;
      line-height: 1;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border-radius: 8px;
    }
    
    .wallet-modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    
    .wallet-modal-body {
      padding: 24px;
    }
    
    /* Portal Modal Styles */
    .wallet-modal-header-portal {
      padding: 20px 24px !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
    }
    
    .wallet-modal-title-portal {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #fff !important;
      margin: 0 !important;
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
    }
    
    .wallet-modal-close-portal {
      background: none !important;
      border: none !important;
      color: rgba(255, 255, 255, 0.6) !important;
      cursor: pointer !important;
      font-size: 32px !important;
      line-height: 1 !important;
      padding: 0 !important;
      width: 32px !important;
      height: 32px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      transition: all 0.2s ease !important;
      border-radius: 8px !important;
    }
    
    .wallet-modal-close-portal:hover {
      background: rgba(255, 255, 255, 0.1) !important;
      color: #fff !important;
    }
    
    .wallet-modal-body-portal {
      padding: 24px !important;
    }
    
    /* Wallet Connect Content */
    .wallet-connect-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .wallet-adapter-button {
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      border: none !important;
      border-radius: 12px !important;
      color: white !important;
      cursor: pointer !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      padding: 12px 20px !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
      text-align: center !important;
    }
    
    .wallet-adapter-button:hover:not(:disabled) {
      background: linear-gradient(135deg, #673ab7, #9c27b0) !important;
      box-shadow: 0 4px 16px rgba(123, 31, 162, 0.4) !important;
      transform: translateY(-2px) !important;
    }
    
    .wallet-adapter-button:disabled {
      opacity: 0.6 !important;
      cursor: not-allowed !important;
    }
    
    .wallet-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      background: rgba(31, 41, 55, 0.5);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wallet-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px;
      border-radius: 8px;
    }
    
    .wallet-status-signing {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f59e0b;
      font-size: 14px;
      font-weight: 600;
    }
    
    .wallet-status-success {
      color: #10b981;
      font-size: 14px;
      font-weight: 600;
    }
    
    .wallet-status-error {
      color: #ef4444;
      font-size: 14px;
      font-weight: 600;
    }
    
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(245, 158, 11, 0.3);
      border-top-color: #f59e0b;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .wallet-address {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .wallet-address-label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }
    
    .wallet-address-value {
      color: #10b981;
      font-size: 13px;
      font-weight: 600;
      font-family: monospace;
    }
    
    .wallet-retry-button {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      border: none;
      border-radius: 8px;
      color: #fff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 16px;
      transition: all 0.2s ease;
      width: 100%;
    }
    
    .wallet-retry-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.4);
    }
    
    .wallet-disconnect-button {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #ef4444;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      padding: 10px 16px;
      transition: all 0.2s ease;
      width: 100%;
    }
    
    .wallet-disconnect-button:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
    }
    
    /* Wallet Adapter Modal Styles */
    .wallet-adapter-modal-wrapper {
      align-items: center;
      background: rgba(0, 0, 0, 0.8);
      bottom: 0;
      display: flex;
      justify-content: center;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      z-index: 9999999 !important;
    }
    
    .wallet-adapter-modal {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      max-width: 400px;
      padding: 24px;
      position: relative;
      width: 90%;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .wallet-adapter-modal-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .wallet-adapter-modal-title {
      color: #fff;
      font-size: 20px;
      font-weight: 700;
      margin: 0 0 20px 0;
      text-align: center;
      background: linear-gradient(135deg, #512da8, #7b1fa2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .wallet-adapter-modal-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    
    .wallet-adapter-modal-list li {
      margin: 0;
      padding: 0;
    }
    
    .wallet-adapter-button {
      background: linear-gradient(135deg, #512da8, #7b1fa2) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      color: #fff !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      font-family: inherit !important;
      font-size: 14px !important;
      font-weight: 600 !important;
      gap: 12px !important;
      justify-content: flex-start !important;
      padding: 14px 18px !important;
      transition: all 0.2s ease !important;
      width: 100% !important;
      height: auto !important;
      line-height: 1.5 !important;
    }
    
    .wallet-adapter-button:hover:not([disabled]) {
      background: linear-gradient(135deg, #673ab7, #9c27b0) !important;
      border-color: rgba(123, 31, 162, 0.5) !important;
      transform: translateX(4px) !important;
      box-shadow: 0 4px 16px rgba(123, 31, 162, 0.4) !important;
    }
    
    .wallet-adapter-button-start-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px !important;
      height: 28px !important;
    }
    
    .wallet-adapter-button-start-icon img {
      width: 100%;
      height: 100%;
      border-radius: 4px;
    }
    
    .wallet-adapter-button-end-icon {
      margin-left: auto !important;
      display: flex;
      align-items: center;
    }
    
    .wallet-adapter-modal-button-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      cursor: pointer;
      font-size: 28px;
      line-height: 1;
      padding: 0;
      position: absolute;
      right: 20px;
      top: 20px;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .wallet-adapter-modal-button-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
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
