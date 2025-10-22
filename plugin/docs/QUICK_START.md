# Quick Start Guide

Get up and running with the Pump.fun Pledge Tracker extension in 5 minutes! 🚀

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** version 18 or higher
- ✅ **npm** version 9 or higher
- ✅ **Chrome browser** (latest version recommended)
- ✅ **Git** (for cloning the repository)

Check your versions:
```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/pumpfun-pledge-tracker.git

# Navigate to project directory
cd pumpfun-pledge-tracker

# Install dependencies
npm install
```

⏱️ **Installation takes ~2 minutes**

---

## Step 2: Build the Extension

```bash
# Build for development (with source maps)
npm run build

# Or for development with auto-rebuild
npm run dev
```

📦 The built extension will be in the `dist/` folder.

---

## Step 3: Load in Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in address bar
   - Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle switch in top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the `dist` folder from your project

4. **Verify Installation**
   - You should see "Pump.fun Pledge Tracker" in your extensions list
   - Extension icon should appear in toolbar (if applicable)

---

## Step 4: Test It Out

1. **Navigate to pump.fun**
   ```
   https://pump.fun
   ```

2. **Look for the Extension Features**
   - 🛡️ Green/Orange badges on meme coin cards
   - 📊 Promotional banner at top of page
   - 💬 Tooltips when hovering over badges

3. **Check Browser Console**
   - Press F12 to open DevTools
   - Look for messages like:
     ```
     [Pledge Tracker] Extension initialized on pump.fun
     [Pledge Tracker] Found X meme cards
     ```

---

## Step 5: Start Developing

### Make Changes

Edit any file in the `src/` directory:
```typescript
// Example: Change scan interval
// File: src/content/index.tsx

const CONFIG = {
  scanInterval: 3000, // Changed from 5000 to 3000ms
  // ...
};
```

### Rebuild

```bash
# If using npm run dev, changes auto-rebuild
# Otherwise, manually rebuild:
npm run build
```

### Reload Extension

1. Go to `chrome://extensions/`
2. Click the reload icon ↻ on your extension
3. Refresh pump.fun page

---

## Common Tasks

### Change API Endpoint

**File**: `src/api/client.ts`
```typescript
const API_CONFIG = {
  endpoint: 'https://your-actual-backend.com/api/v1/memes/check-pledge',
  // ...
};
```

### Change Website URL

**File**: `src/content/index.tsx`
```typescript
const CONFIG = {
  officialWebsite: 'https://your-actual-website.com',
  // ...
};
```

### Update Selectors (if pump.fun changes)

**File**: `src/content/dom-scanner.ts`
```typescript
const SELECTORS = {
  memeCard: '.new-card-selector',
  idAttribute: 'data-new-id',
  // ...
};
```

---

## Troubleshooting

### Extension Doesn't Load

**Problem**: "Manifest file is missing or unreadable"

**Solution**:
- Make sure you selected the `dist` folder, not the root folder
- Rebuild the project: `npm run build`

### No Badges Appear

**Problem**: Extension loads but no badges show on pump.fun

**Solution**:
1. Open browser console (F12)
2. Look for error messages
3. If you see `Found 0 meme cards`, the selectors need updating
4. Inspect pump.fun's DOM structure and update selectors

### API Errors

**Problem**: All badges show "Error" status

**Solution**:
1. Check if backend API is running
2. Verify API endpoint URL in `src/api/client.ts`
3. Check Network tab in DevTools for failed requests
4. Ensure CORS is configured on backend

### Build Errors

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force

# Try again
npm run build
```

---

## Next Steps

### Learn More
- 📖 Read [README.md](./README.md) for full documentation
- 🛠️ Check [DEVELOPMENT.md](./DEVELOPMENT.md) for architecture details
- 📝 Review [CHANGELOG.md](../CHANGELOG.md) for version history

### Customize
- 🎨 Modify badge colors in `src/components/PledgeTag.tsx`
- 🌐 Add translations for internationalization
- ⚙️ Create settings panel for user preferences

### Contribute
- 🐛 Report bugs on GitHub Issues
- 💡 Suggest features via discussions
- 🤝 Submit pull requests

---

## Development Workflow Cheatsheet

```bash
# Install dependencies
npm install

# Start development mode (auto-rebuild)
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check TypeScript errors
npx tsc --noEmit
```

---

## Getting Help

If you're stuck, try these resources:

1. **Documentation**
   - [README.md](./README.md) - Overview and features
   - [DEVELOPMENT.md](./DEVELOPMENT.md) - Technical deep dive

2. **Browser Console**
   - Press F12 in Chrome
   - Look for `[Pledge Tracker]` messages
   - Check Network tab for API calls

3. **Community**
   - GitHub Issues for bugs
   - GitHub Discussions for questions

---

**Happy Hacking! 🎉**

Now you're ready to customize and extend the Pump.fun Pledge Tracker!

