# Development Guide

This document provides in-depth technical documentation for developers working on the Pump.fun Pledge Tracker extension.

---

## 📐 Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         pump.fun                            │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐              │
│  │ Meme Card │  │ Meme Card │  │ Meme Card │  ...         │
│  └───────────┘  └───────────┘  └───────────┘              │
└─────────────────────────────────────────────────────────────┘
         │                  │                  │
         └──────────────────┴──────────────────┘
                            │
                    ┌───────▼───────┐
                    │ Content Script│
                    │  (index.tsx)  │
                    └───────┬───────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼─────┐ ┌────▼────┐ ┌─────▼─────┐
        │ DOM Scanner│ │   API   │ │  React    │
        │            │ │ Client  │ │ Components│
        └────────────┘ └─────────┘ └───────────┘
              │             │             │
              └─────────────┴─────────────┘
                            │
                   ┌────────▼────────┐
                   │  Shadow DOM     │
                   │  UI Injection   │
                   └─────────────────┘
```

### Core Modules

#### 1. Content Script (`src/content/index.tsx`)
**Purpose**: Main orchestrator that coordinates all functionality

**Key Responsibilities**:
- Initialize the extension when page loads
- Set up periodic scanning (every 5 seconds)
- Coordinate between DOM scanner, API client, and UI injection
- Manage React component lifecycle
- Handle cleanup on page unload

**Important Functions**:
- `initialize()`: Entry point, sets up timers and observers
- `performScan()`: Executes one scan cycle
- `injectPledgeTag()`: Injects a badge component into a meme card
- `injectMainBanner()`: Injects the promotional banner
- `observeDOMChanges()`: Watches for dynamic content loading

#### 2. DOM Scanner (`src/content/dom-scanner.ts`)
**Purpose**: Extract meme coin information from pump.fun's DOM

**Key Responsibilities**:
- Use CSS selectors to find meme card elements
- Extract unique IDs from DOM attributes or URLs
- Cache processed cards to avoid redundant work
- Find optimal injection points for badges

**Important Functions**:
- `scanMemeCards()`: Main scanning function, returns array of `MemeCardInfo`
- `extractMemeId()`: Multiple strategies to extract coin ID
- `findInjectionPoint()`: Determines where to place the badge
- `markCardAsInjected()`: Tracks which cards have badges

**Selector Strategy**:
The selectors are designed to be flexible and adapt to pump.fun's structure:

```typescript
const SELECTORS = {
  memeCard: '[data-coin-id], .coin-card, .token-card, a[href*="/coin/"]',
  idAttribute: 'data-coin-id',
  hrefPattern: /\/coin\/([a-zA-Z0-9]+)/,
};
```

**Why multiple strategies?**
- Websites change their DOM structure frequently
- Multiple fallbacks ensure robustness
- Easy to add new strategies without breaking existing ones

**How to update selectors**:
1. Open pump.fun in Chrome DevTools
2. Inspect a meme card element
3. Find stable attributes (data-*, id, class)
4. Update `SELECTORS` object
5. Use `updateSelectors()` function for runtime updates

#### 3. API Client (`src/api/client.ts`)
**Purpose**: Communicate with backend pledge checking service

**Key Responsibilities**:
- Batch multiple meme IDs into single request
- Handle API timeouts and errors gracefully
- Return structured data for UI components

**API Specification**:

**Request**:
```typescript
POST https://api.your-backend.com/v1/memes/check-pledge
Content-Type: application/json

{
  "memeIds": ["id1", "id2", "id3"]
}
```

**Success Response** (200 OK):
```typescript
{
  "data": {
    "id1": {
      "status": "PLEDGED"
    },
    "id2": {
      "status": "NOT_PLEDGED",
      "centralizationRisk": 0.85  // 0-1 scale
    }
    // id3 not present = unknown
  }
}
```

**Error Handling**:
- Network timeout → Returns `ERROR` status for all IDs
- HTTP error (4xx, 5xx) → Returns `ERROR` status
- Invalid response format → Returns `ERROR` status
- Missing IDs in response → Returns `UNKNOWN` status

**Configuration**:
```typescript
const API_CONFIG = {
  endpoint: 'https://api.your-backend.com/v1/memes/check-pledge',
  timeout: 10000, // 10 seconds
};
```

#### 4. React Components

##### PledgeTag (`src/components/PledgeTag.tsx`)
**Purpose**: Display pledge status badge with tooltip

**Props**:
```typescript
interface PledgeTagProps {
  status: 'PLEDGED' | 'NOT_PLEDGED' | 'UNKNOWN' | 'ERROR';
  centralizationRisk?: number; // 0-1 scale, optional
}
```

**Visual Design**:
- **PLEDGED**: Green badge with shield icon, pulse animation
- **NOT_PLEDGED**: Orange badge with warning icon
- **UNKNOWN**: Gray badge with question mark
- **ERROR**: Red badge with X icon

**Tooltip Content**:
- Shows on hover
- Displays detailed pledge information
- Risk percentage for non-pledged coins
- Investment recommendations

##### MainBanner (`src/components/MainBanner.tsx`)
**Purpose**: Promotional banner with CTA button

**Props**:
```typescript
interface MainBannerProps {
  websiteUrl: string;
}
```

**Design**:
- Sticky positioning at top of page
- Gradient background (green theme)
- Shield icon with descriptive text
- Call-to-action button that opens website in new tab

---

## 🔍 Shadow DOM Implementation

### Why Shadow DOM?

Shadow DOM is crucial for this extension to avoid conflicts with pump.fun's existing styles and scripts.

**Benefits**:
- ✅ Complete style isolation
- ✅ No CSS specificity wars
- ✅ Prevents accidental JS interference
- ✅ Maintains clean separation of concerns

### How It's Implemented

```typescript
// Create container
const container = document.createElement('div');

// Attach Shadow DOM
const shadowRoot = container.attachShadow({ mode: 'open' });

// Create React root inside shadow
const reactContainer = document.createElement('div');
shadowRoot.appendChild(reactContainer);

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = getTailwindStyles();
shadowRoot.appendChild(styleSheet);

// Render React
const root = createRoot(reactContainer);
root.render(<PledgeTag {...props} />);
```

### Style Injection

Since Tailwind CSS utilities can't penetrate Shadow DOM, we:
1. Extract compiled CSS from the build
2. Inject it directly into each Shadow DOM
3. Use the `getTailwindStyles()` function to provide essential utilities

---

## 🎯 Performance Considerations

### Efficient DOM Scanning

**Problem**: Scanning the entire DOM every 5 seconds could be slow

**Solutions**:
1. **Caching**: Store already-processed cards in a `Map`
   ```typescript
   const processedCards = new Map<string, MemeCardInfo>();
   ```

2. **Selective Processing**: Only inject tags for new cards
   ```typescript
   const cardsToProcess = cards.filter(card => !card.hasInjectedTag);
   ```

3. **Debouncing**: Avoid rapid scans on DOM mutations
   ```typescript
   debounce(() => performScan(), 1000)
   ```

### API Request Optimization

**Problem**: Making API calls for every card individually is inefficient

**Solutions**:
1. **Batching**: Send all IDs in single request
   ```typescript
   const memeIds = cardsToProcess.map(card => card.id);
   const pledgeData = await checkPledgeStatus(memeIds);
   ```

2. **Deduplication**: Remove duplicate IDs before sending
   ```typescript
   const uniqueIds = Array.from(new Set(memeIds));
   ```

3. **Timeout Protection**: Abort long-running requests
   ```typescript
   const controller = new AbortController();
   setTimeout(() => controller.abort(), timeout);
   ```

---

## 🛠️ Extending the Extension

### Adding New Badge Types

1. **Update types** (`src/types/index.ts`):
   ```typescript
   export type PledgeStatus = 'PLEDGED' | 'NOT_PLEDGED' | 'UNKNOWN' | 'ERROR' | 'NEW_TYPE';
   ```

2. **Update component** (`src/components/PledgeTag.tsx`):
   ```typescript
   case 'NEW_TYPE':
     return {
       bg: 'bg-blue-500',
       text: 'text-white',
       label: '新状态',
       icon: '🆕',
     };
   ```

3. **Update API client** to handle new status from backend

### Adding New Selectors

If pump.fun changes their DOM structure:

```typescript
import { updateSelectors } from './dom-scanner';

// Runtime update
updateSelectors({
  memeCard: '.new-card-class',
  idAttribute: 'data-new-id-attr',
});
```

Or edit `src/content/dom-scanner.ts` directly:
```typescript
const SELECTORS = {
  memeCard: '.new-selector, .another-selector',
  // ...
};
```

### Adding New API Endpoints

1. **Update config** (`src/api/client.ts`):
   ```typescript
   const API_CONFIG = {
     endpoint: 'https://new-api.example.com/endpoint',
   };
   ```

2. **Or use setter**:
   ```typescript
   import { setApiEndpoint } from '@/api/client';
   setApiEndpoint('https://new-api.example.com/endpoint');
   ```

### Adding New Features

**Example: Add a "Report Project" button**

1. **Create component** (`src/components/ReportButton.tsx`):
   ```typescript
   export const ReportButton: React.FC<{ memeId: string }> = ({ memeId }) => {
     const handleReport = () => {
       // Send report to backend
     };
     return <button onClick={handleReport}>Report</button>;
   };
   ```

2. **Inject in content script** (`src/content/index.tsx`):
   ```typescript
   root.render(
     <>
       <PledgeTag {...pledgeProps} />
       <ReportButton memeId={card.id} />
     </>
   );
   ```

---

## 🧪 Testing Strategy

### Manual Testing

1. **Visual Testing**
   - Load extension in Chrome
   - Navigate to pump.fun
   - Verify badges appear correctly
   - Check tooltip interactions
   - Test banner button clicks

2. **API Testing**
   - Use browser DevTools Network tab
   - Verify API requests are batched
   - Check request/response format
   - Test error handling (disconnect network)

3. **Performance Testing**
   - Open Performance tab in DevTools
   - Record while browsing pump.fun
   - Check for:
     - Long tasks (should be < 50ms)
     - Excessive reflows
     - Memory leaks

### Automated Testing (Future)

Consider adding:
- **Unit tests**: Jest for utility functions
- **Integration tests**: Testing Library for React components
- **E2E tests**: Playwright for full user flows

---

## 🔐 Security Considerations

### Content Security Policy

Manifest V3 has strict CSP rules:
- No inline scripts
- No eval()
- No remote code execution

**Our approach**:
- All code bundled at build time
- React rendered from compiled bundle
- Styles injected as strings (pre-processed)

### API Communication

**Best Practices**:
1. Always use HTTPS for API endpoints
2. Validate all API responses before use
3. Sanitize any user input (if added in future)
4. Never expose API keys in client-side code

**Current Implementation**:
```typescript
// Validate response structure
if (!data || typeof data.data !== 'object') {
  throw new Error('Invalid API response format');
}
```

### XSS Prevention

**Protection measures**:
1. React automatically escapes content
2. Shadow DOM provides isolation
3. No `dangerouslySetInnerHTML` used
4. All dynamic content is props-based

---

## 📊 Data Flow Diagram

```
User visits pump.fun
         │
         ▼
Extension initializes
         │
         ├─→ Inject banner (once)
         │
         ▼
Start periodic scan (every 5s)
         │
         ▼
Scan DOM for meme cards
         │
         ├─→ Extract IDs
         │
         ▼
Query API (batch request)
         │
         ├─→ Success: Get pledge data
         ├─→ Error: Return ERROR status
         │
         ▼
For each card:
         │
         ├─→ Create Shadow DOM
         ├─→ Inject styles
         ├─→ Render React component
         └─→ Mark as processed
```

---

## 🚀 Deployment Checklist

Before releasing a new version:

- [ ] Update version in `package.json` and `manifest.json`
- [ ] Run full lint check: `npm run lint`
- [ ] Build production bundle: `npm run build`
- [ ] Test in Chrome with unpacked extension
- [ ] Test on real pump.fun site (not localhost)
- [ ] Verify API endpoints are correct
- [ ] Check all links open correctly
- [ ] Test on different screen sizes
- [ ] Create changelog entry
- [ ] Tag release in git
- [ ] Package for Chrome Web Store
- [ ] Submit for review (if applicable)

---

## 🐛 Common Issues and Solutions

### Issue: Badges don't appear

**Possible causes**:
1. DOM selectors are outdated
2. Page hasn't finished loading
3. API is unreachable

**Debug steps**:
```javascript
// Open browser console and check:
[Pledge Tracker] Extension initialized on pump.fun
[Pledge Tracker] Found X meme cards  // Should be > 0

// If found 0 cards, selectors need updating
```

**Solution**: Update selectors in `dom-scanner.ts`

### Issue: Styles look broken

**Possible causes**:
1. Shadow DOM not properly initialized
2. Tailwind styles not injected
3. Conflict with pump.fun styles (rare)

**Debug steps**:
```javascript
// Inspect a badge element
// Check if it's inside a shadow-root
// Verify <style> tag exists in shadow-root
```

**Solution**: Check `getTailwindStyles()` function

### Issue: API requests fail

**Possible causes**:
1. Backend is down
2. CORS misconfigured
3. Request timeout too short
4. Wrong endpoint URL

**Debug steps**:
```javascript
// Check Network tab in DevTools
// Look for failed requests to API
// Check CORS headers in response
```

**Solution**: Update endpoint or increase timeout

---

## 📚 Additional Resources

### Technologies Used

- **React**: UI component library → [react.dev](https://react.dev)
- **TypeScript**: Type-safe JavaScript → [typescriptlang.org](https://www.typescriptlang.org)
- **Vite**: Build tool → [vitejs.dev](https://vitejs.dev)
- **Tailwind CSS**: Utility-first CSS → [tailwindcss.com](https://tailwindcss.com)
- **Chrome Extensions**: Manifest V3 → [developer.chrome.com](https://developer.chrome.com/docs/extensions/mv3/)

### Useful Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix

# Format code
npm run format

# Preview build
npm run preview
```

### File Watchers

When developing, Vite watches these directories:
- `src/` - All source code
- `public/` - Static assets

Changes trigger automatic rebuilds.

---

## 🤝 Code Review Guidelines

When reviewing PRs, check:

1. **TypeScript**: No `any` types without justification
2. **React**: Use functional components and hooks
3. **Performance**: No unnecessary re-renders
4. **Comments**: JSDoc for all exported functions
5. **Testing**: Manual test checklist completed
6. **Security**: No hardcoded secrets or API keys
7. **Accessibility**: Proper ARIA labels on interactive elements

---

## 📞 Getting Help

- **Documentation**: This file and README.md
- **Code**: Check inline comments and JSDoc
- **Issues**: GitHub Issues for bug reports
- **Questions**: Open a discussion on GitHub

---

<div align="center">

**Happy Coding! 🚀**

</div>

