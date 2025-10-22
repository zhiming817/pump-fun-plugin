# Getting Started with Pump.fun Pledge Tracker

Welcome! This guide will help you get the extension up and running in minutes.

---

## 🎯 What You Have

This is a **complete, production-ready Chrome extension project** with:

✅ Full TypeScript + React codebase  
✅ Vite build system with hot reload  
✅ Tailwind CSS styling with Shadow DOM  
✅ Comprehensive documentation  
✅ ESLint + Prettier configuration  
✅ Chrome Manifest V3 compliance  

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

This will install all required packages (~5 minutes on first install).

### Step 2: Build the Extension

```bash
npm run build
```

This creates a production build in the `dist/` folder.

### Step 3: Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `dist/` folder from this project
5. ✅ Extension is now installed!

### Step 4: Test It

1. Navigate to https://pump.fun
2. You should see:
   - 🛡️ Badges on meme coin cards
   - 📢 Banner at the top of the page
3. Hover over badges to see tooltips

---

## 🛠️ Development Mode

For active development with hot reload:

```bash
npm run dev
```

This starts Vite in watch mode. Changes to files in `src/` will automatically rebuild.

**Important**: After each rebuild, you need to:
1. Go to `chrome://extensions/`
2. Click the reload button ↻ on your extension
3. Refresh the pump.fun page

---

## ⚙️ Configuration

### 🔗 Change API Endpoint

Edit `src/api/client.ts`:

```typescript
const API_CONFIG = {
  endpoint: 'https://YOUR-ACTUAL-BACKEND.com/v1/memes/check-pledge',
  timeout: 10000,
};
```

### 🌐 Change Website URL

Edit `src/content/index.tsx`:

```typescript
const CONFIG = {
  officialWebsite: 'https://YOUR-ACTUAL-WEBSITE.com',
  // ...
};
```

### 🎯 Update DOM Selectors

If pump.fun changes their HTML structure, update `src/content/dom-scanner.ts`:

```typescript
const SELECTORS = {
  memeCard: '.new-card-selector',  // Update this
  idAttribute: 'data-new-id',      // And this
  hrefPattern: /\/coin\/([a-zA-Z0-9]+)/,
};
```

---

## 📂 Project Structure

```
pumpfun-pledge-tracker/
├── src/
│   ├── manifest.json         # Extension configuration
│   ├── content/
│   │   ├── index.tsx         # Main entry point ⭐
│   │   └── dom-scanner.ts    # Page scanning logic
│   ├── components/
│   │   ├── PledgeTag.tsx     # Badge component
│   │   └── MainBanner.tsx    # Banner component
│   ├── api/
│   │   └── client.ts         # API communication
│   └── types/
│       └── index.ts          # TypeScript types
├── docs/
│   ├── README.md             # User guide
│   ├── DEVELOPMENT.md        # Technical docs
│   └── QUICK_START.md        # 5-min guide
└── dist/                     # Built extension (after npm run build)
```

---

## 🧪 Testing Your Changes

### Manual Testing Checklist

After making changes:

- [ ] Extension loads without errors (`chrome://extensions/`)
- [ ] Badges appear on meme cards
- [ ] Tooltips show correct information
- [ ] Banner displays at top of page
- [ ] Banner button opens correct URL
- [ ] Console shows no errors (F12)
- [ ] Lint passes (`npm run lint`)

### Browser Console

Check for these messages (F12 → Console):

```
[Pledge Tracker] Extension initialized on pump.fun
[Pledge Tracker] Found X meme cards
[Pledge Tracker] Querying API for X memes
[Pledge Tracker] Injected tag for meme: [ID]
```

---

## 🐛 Troubleshooting

### Problem: Extension won't load

**Error**: "Manifest file is missing or unreadable"

**Solution**: Make sure you're loading the `dist/` folder, not the root folder. Run `npm run build` first.

---

### Problem: No badges appearing

**Symptoms**: Extension loads but nothing shows on pump.fun

**Solutions**:
1. Open console (F12) and check for errors
2. Verify you're on https://pump.fun (not a different URL)
3. Check console logs - if it says "Found 0 meme cards", the selectors need updating
4. The page might still be loading - wait a few seconds

---

### Problem: API errors (red badges)

**Symptoms**: All badges show "✗ 查询失败"

**Solutions**:
1. Check if your backend API is running
2. Verify the API endpoint in `src/api/client.ts`
3. Check Network tab (F12) for failed requests
4. Ensure CORS is configured on your backend

---

### Problem: Styles look broken

**Symptoms**: Badges have no styling or look wrong

**Solutions**:
1. Rebuild the extension: `npm run build`
2. Hard refresh pump.fun (Ctrl+Shift+R)
3. Check console for CSS loading errors
4. Verify Shadow DOM is working (inspect badge element)

---

## 📚 Learn More

### Essential Documentation

| Document | Purpose |
|----------|---------|
| [README.md](./README.md) | Project overview |
| [docs/README.md](./docs/README.md) | Complete user guide |
| [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Technical architecture |
| [docs/QUICK_START.md](./docs/QUICK_START.md) | Detailed setup guide |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |

### Key Concepts

#### Shadow DOM
The extension uses Shadow DOM to isolate styles and prevent conflicts with pump.fun. This means:
- Our CSS won't affect pump.fun's styles
- pump.fun's CSS won't affect our components
- Each badge is a completely isolated UI element

#### Content Scripts
The extension runs as a content script on pump.fun pages:
- Has access to the page's DOM
- Can inject UI elements
- Runs in an isolated JavaScript context
- Communicates with backend APIs

#### Batch API Requests
For performance, the extension:
- Scans all meme cards on the page
- Extracts all IDs
- Sends them in ONE API request
- Distributes responses back to badges

---

## 🚀 Next Steps

### For Users
1. Configure your API endpoint
2. Update the website URL
3. Build and test: `npm run build`
4. Load in Chrome and use on pump.fun

### For Developers
1. Read [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
2. Explore the source code in `src/`
3. Make your changes
4. Run `npm run lint` before committing
5. Submit a PR!

### For Deployment
1. Build production version: `npm run build`
2. Test thoroughly
3. Update version in `package.json` and `manifest.json`
4. Zip the `dist/` folder
5. Upload to Chrome Web Store

---

## 📞 Need Help?

### Resources
- **Documentation**: Check `docs/` folder
- **Issues**: [GitHub Issues](https://github.com/your-org/pumpfun-pledge-tracker/issues)
- **Code Examples**: Look at existing components in `src/components/`

### Common Questions

**Q: Can I use this with other websites?**  
A: Yes! Update the `matches` field in `src/manifest.json` to target different URLs.

**Q: How do I add new badge types?**  
A: Update the `PledgeStatus` type in `src/types/index.ts` and add cases in `PledgeTag.tsx`.

**Q: Can I customize the colors?**  
A: Yes! Edit `tailwind.config.js` to change the color scheme.

**Q: How do I test without a backend API?**  
A: Mock the API response in `src/api/client.ts` for development.

---

## ✅ Success Checklist

You're ready to use the extension when:

- [x] `npm install` completed successfully
- [x] `npm run build` created a `dist/` folder
- [x] Extension loaded in Chrome without errors
- [x] Badges appear on pump.fun
- [x] Console shows initialization messages
- [x] No red errors in browser console

---

## 🎉 You're All Set!

The extension is now ready to use. Start customizing it for your needs or deploy it as-is.

**Happy coding!** 🚀

---

<div align="center">

Made with ❤️ using React, TypeScript, and Vite

[Report Issue](https://github.com/your-org/pumpfun-pledge-tracker/issues) • [View Docs](./docs/README.md) • [Contribute](./CONTRIBUTING.md)

</div>

