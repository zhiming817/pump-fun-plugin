/**
 * DOM Scanner for extracting meme coin information from pump.fun pages
 *
 * This module is responsible for:
 * 1. Scanning the page DOM to find all meme coin cards
 * 2. Extracting unique identifiers (IDs or contract addresses) from each card
 * 3. Tracking which cards have already been processed
 *
 * NOTE: The selectors used here are based on pump.fun's current DOM structure
 * and may need to be updated if the website changes its layout.
 */

import type { MemeCardInfo } from '@/types';

/**
 * CSS selectors for identifying meme cards and their IDs on pump.fun
 *
 * IMPORTANT: These selectors need to be updated based on the actual DOM structure
 * of pump.fun. The current selectors are educated guesses and will need refinement.
 *
 * To find the correct selectors:
 * 1. Open pump.fun in Chrome DevTools
 * 2. Inspect a meme coin card element
 * 3. Look for unique attributes or data attributes containing the coin ID
 * 4. Common patterns to look for:
 *    - data-id, data-token, data-contract attributes
 *    - href attributes in links (e.g., /coin/[ID])
 *    - class names containing identifiers
 */
const SELECTORS = {
  // Selector for individual meme card containers
  // Examples of possible selectors:
  // - '.coin-card'
  // - '[data-coin-id]'
  // - '.token-item'
  memeCard: '[data-coin-id], .coin-card, .token-card, a[href*="/coin/"]',

  // Attribute or element containing the unique ID
  // This could be:
  // - A data attribute: 'data-coin-id'
  // - Part of a link href: extract from 'href'
  // - A child element with specific class
  idAttribute: 'data-coin-id',

  // Alternative: extract from href pattern like "/coin/ABC123"
  hrefPattern: /\/coin\/([a-zA-Z0-9]+)/,
};

/**
 * Cache to store already processed meme cards to avoid redundant processing
 * Key: meme ID, Value: MemeCardInfo
 */
const processedCards = new Map<string, MemeCardInfo>();

/**
 * Scan the current page and extract all meme coin cards with their IDs
 *
 * @returns Array of MemeCardInfo objects representing found meme coins
 *
 * @example
 * ```typescript
 * const cards = scanMemeCards();
 * console.log(`Found ${cards.length} meme coins on the page`);
 * ```
 */
export function scanMemeCards(): MemeCardInfo[] {
  const cards: MemeCardInfo[] = [];

  try {
    // Find all potential meme card elements
    const cardElements = document.querySelectorAll(SELECTORS.memeCard);

    cardElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      // Extract the unique ID from the element
      const id = extractMemeId(element);

      if (id) {
        // Check if we've already processed this card
        if (processedCards.has(id)) {
          const existingCard = processedCards.get(id)!;
          // Update element reference in case DOM was re-rendered
          existingCard.element = element;
          cards.push(existingCard);
        } else {
          // New card found
          const cardInfo: MemeCardInfo = {
            id,
            element,
            hasInjectedTag: false,
          };
          processedCards.set(id, cardInfo);
          cards.push(cardInfo);
        }
      }
    });
  } catch (error) {
    console.error('[Oath Tracker] Error scanning meme cards:', error);
  }

  return cards;
}

/**
 * Extract the unique meme coin ID from a card element
 *
 * This function tries multiple strategies to find the ID:
 * 1. Check for data-coin-id attribute
 * 2. Extract from href attribute if element is a link
 * 3. Check child elements for ID information
 *
 * @param element - The DOM element representing a meme card
 * @returns The extracted ID, or null if not found
 */
function extractMemeId(element: HTMLElement): string | null {
  try {
    // Strategy 1: Check for direct data attribute
    const dataId = element.getAttribute(SELECTORS.idAttribute);
    if (dataId) {
      return dataId;
    }

    // Strategy 2: Extract from href if element is a link
    if (element instanceof HTMLAnchorElement && element.href) {
      const match = element.href.match(SELECTORS.hrefPattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Strategy 3: Check for link child element
    const linkChild = element.querySelector('a[href*="/coin/"]');
    if (linkChild instanceof HTMLAnchorElement && linkChild.href) {
      const match = linkChild.href.match(SELECTORS.hrefPattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // Strategy 4: Check for any data-* attribute that might contain an ID
    const dataAttributes = Array.from(element.attributes).filter((attr) =>
      attr.name.startsWith('data-')
    );
    for (const attr of dataAttributes) {
      // Look for attributes that seem to contain an ID (alphanumeric string)
      if (attr.value && /^[a-zA-Z0-9]{8,}$/.test(attr.value)) {
        return attr.value;
      }
    }

    return null;
  } catch (error) {
    console.error('[Oath Tracker] Error extracting meme ID:', error);
    return null;
  }
}

/**
 * Mark a meme card as having an injected oath tag
 *
 * @param memeId - The ID of the meme coin
 */
export function markCardAsInjected(memeId: string): void {
  const card = processedCards.get(memeId);
  if (card) {
    card.hasInjectedTag = true;
  }
}

/**
 * Get a meme card info by ID
 *
 * @param memeId - The ID of the meme coin
 * @returns The MemeCardInfo or undefined if not found
 */
export function getCardInfo(memeId: string): MemeCardInfo | undefined {
  return processedCards.get(memeId);
}

/**
 * Clear the processed cards cache
 * Useful for testing or when navigating to a new page
 */
export function clearCache(): void {
  processedCards.clear();
}

/**
 * Find the optimal injection point for an oath tag on a meme card
 *
 * This function determines the best place to inject the oath status tag
 * based on the card's structure.
 *
 * @param cardElement - The meme card DOM element
 * @returns The element where the tag should be injected, or null if not found
 */
export function findInjectionPoint(cardElement: HTMLElement): HTMLElement | null {
  // Strategy 1: Look for an image container (common in card layouts)
  const imageContainer = cardElement.querySelector('.coin-image, .token-image, img');
  if (imageContainer?.parentElement) {
    return imageContainer.parentElement;
  }

  // Strategy 2: Look for a header or title section
  const header = cardElement.querySelector('.coin-header, .token-header, h2, h3');
  if (header?.parentElement) {
    return header.parentElement;
  }

  // Strategy 3: Use the card element itself
  return cardElement;
}

/**
 * Update selectors configuration
 * Useful for adapting to changes in pump.fun's DOM structure
 *
 * @param newSelectors - Partial selector configuration to update
 */
export function updateSelectors(newSelectors: Partial<typeof SELECTORS>): void {
  Object.assign(SELECTORS, newSelectors);
}

/**
 * Get current selectors configuration
 *
 * @returns Current selector configuration
 */
export function getSelectors(): typeof SELECTORS {
  return { ...SELECTORS };
}

