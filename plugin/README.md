# Pump.fun Pledge Tracker

<div align="center">

🛡️ **Chrome Extension for Tracking Meme Coin Pledge Status**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)
![React](https://img.shields.io/badge/React-18.2-61dafb.svg)

[Features](#-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Pump.fun Pledge Tracker** is a professional-grade Chrome browser extension that enhances safety and transparency when trading meme coins on [pump.fun](https://pump.fun). 

The extension automatically monitors all listed meme coins and displays whether they've participated in the "Graduation Pledge" program — a commitment against rug pulls and malicious activities.

### Key Benefits

✅ **Real-time Risk Assessment** - Know before you invest  
✅ **Visual Safety Indicators** - Instant status at a glance  
✅ **Detailed Risk Metrics** - Centralization risk percentages  
✅ **Non-intrusive Design** - Seamlessly integrated UI  

---

## ✨ Features

### 🔍 Automated Monitoring
- Scans pump.fun pages every 5 seconds
- Extracts meme coin IDs automatically
- Batch queries backend API for efficiency

### 🎨 Visual Indicators
- **Green Badge** (🛡️ 已保障) - Pledged & Safe
- **Orange Badge** (⚠️ 高风险) - Not Pledged
- **Gray Badge** (❓ 未知) - Unknown Status
- **Red Badge** (✗ 查询失败) - Query Error

### 💡 Interactive Details
- Hover tooltips with detailed information
- Risk percentages for non-pledged coins
- Investment recommendations

### 🌐 Website Integration
- Promotional banner with CTA button
- Direct link to pledge tracker website
- Sticky positioning for visibility

---

## 🚀 Installation

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/pumpfun-pledge-tracker.git
cd pumpfun-pledge-tracker

# 2. Install dependencies
npm install

# 3. Build the extension
npm run build

# 4. Load in Chrome
# - Open chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the dist/ folder
```

📚 **Detailed Instructions**: See [Quick Start Guide](./docs/QUICK_START.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](./docs/README.md) | Complete user guide and feature overview |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | Technical architecture and API documentation |
| [QUICK_START.md](./docs/QUICK_START.md) | Get started in 5 minutes |
| [CHANGELOG.md](./CHANGELOG.md) | Version history and updates |

---

## 🛠️ Tech Stack

- **Framework**: React 18.2 + TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Styling**: Tailwind CSS 3.3
- **Extension**: Chrome Manifest V3
- **Plugin**: @crxjs/vite-plugin for seamless development

---

## 💻 Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Chrome browser

### Available Scripts

```bash
npm run dev      # Start dev mode with hot reload
npm run build    # Build for production
npm run lint     # Check code quality
npm run format   # Format code with Prettier
```

### Project Structure

```
pumpfun-pledge-tracker/
├── docs/                 # Documentation
│   ├── README.md         # User guide
│   ├── DEVELOPMENT.md    # Technical docs
│   └── QUICK_START.md    # Quick start guide
├── public/               # Static assets
│   └── icons/            # Extension icons
├── src/                  # Source code
│   ├── manifest.json     # Extension manifest
│   ├── content/          # Content scripts
│   ├── components/       # React components
│   ├── api/              # API client
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration
│   └── styles/           # CSS styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🧪 Testing

### Manual Testing

1. Load extension in Chrome
2. Navigate to https://pump.fun
3. Verify badges appear on meme cards
4. Test tooltip interactions
5. Click banner CTA button

### Console Logging

Open DevTools (F12) and look for:
```
[Pledge Tracker] Extension initialized on pump.fun
[Pledge Tracker] Found X meme cards
[Pledge Tracker] Querying API for X memes
[Pledge Tracker] Injected tag for meme: [ID]
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier formatting
- ✅ JSDoc comments for all functions
- ✅ Functional React components

---

## 📝 Configuration

### API Endpoint

Edit `src/api/client.ts`:
```typescript
const API_CONFIG = {
  endpoint: 'https://your-backend.com/v1/memes/check-pledge',
};
```

### Website URL

Edit `src/content/index.tsx`:
```typescript
const CONFIG = {
  officialWebsite: 'https://your-website.com',
};
```

### Scan Interval

Edit `src/content/index.tsx`:
```typescript
const CONFIG = {
  scanInterval: 5000, // milliseconds
};
```

---

## 🐛 Troubleshooting

### Badges Not Appearing
- Check browser console for errors
- Verify pump.fun selectors in `dom-scanner.ts`
- Ensure page has finished loading

### API Errors
- Verify backend endpoint is correct
- Check CORS configuration
- Inspect Network tab in DevTools

### Build Failures
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

📖 **More Solutions**: See [QUICK_START.md](./docs/QUICK_START.md#troubleshooting)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🔗 Links

- **GitHub**: [your-org/pumpfun-pledge-tracker](https://github.com/your-org/pumpfun-pledge-tracker)
- **Issues**: [Report a bug](https://github.com/your-org/pumpfun-pledge-tracker/issues)
- **Website**: [your-website.com](https://your-website.com)

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [@crxjs/vite-plugin](https://github.com/crxjs/chrome-extension-tools) - Chrome extension tooling

---

<div align="center">

**Made with ❤️ by the Pledge Tracker Team**

⭐ **Star us on GitHub** if this extension helped you stay safe!

[Report Bug](https://github.com/your-org/pumpfun-pledge-tracker/issues) • [Request Feature](https://github.com/your-org/pumpfun-pledge-tracker/issues)

</div>

