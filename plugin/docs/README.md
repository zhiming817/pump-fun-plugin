# Pump.fun Pledge Tracker

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-yellow.svg)

**A Chrome extension to track pledge status and centralization risk of meme coins on pump.fun**

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Contributing](#contributing)

</div>

---

## 📖 Overview

Pump.fun Pledge Tracker is a sophisticated Chrome browser extension designed to enhance the safety and transparency of meme coin trading on pump.fun. The extension monitors meme coins listed on the platform and displays whether they have participated in the "Graduation Pledge" program, helping investors make more informed decisions.

### What is the Graduation Pledge?

The Graduation Pledge is a commitment by meme coin projects to avoid "rug pulls" and other malicious activities. This extension helps you identify:

- ✅ **Pledged Projects**: Coins that have committed to the pledge
- ⚠️ **High-Risk Projects**: Coins without pledge commitment
- 📊 **Risk Metrics**: Centralization risk percentages for non-pledged coins

---

## ✨ Features

### 🛡️ Real-time Pledge Tracking
- Automatically scans pump.fun pages every 5 seconds
- Queries backend API for up-to-date pledge status
- Visual badges injected next to each meme coin

### 🎨 Beautiful UI Components
- **Color-coded badges**: Green for pledged, orange for high-risk
- **Interactive tooltips**: Hover for detailed risk information
- **Smooth animations**: Professional fade-in and pulse effects

### 🔒 Non-invasive Integration
- **Shadow DOM isolation**: Zero conflicts with pump.fun's existing styles
- **Optimized performance**: Efficient DOM scanning and API batching
- **Responsive design**: Works seamlessly on all screen sizes

### 🌐 Website Promotion
- Prominent banner with call-to-action button
- Direct link to official pledge tracker website
- Sticky positioning for maximum visibility

---

## 🚀 Installation

### From Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pumpfun-pledge-tracker.git
   cd pumpfun-pledge-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the project directory

### From Chrome Web Store

> Coming soon! The extension will be available on the Chrome Web Store.

---

## 💻 Usage

### First Time Setup

1. After installation, navigate to [pump.fun](https://pump.fun)
2. The extension will automatically initialize
3. Look for:
   - Colored badges on meme coin cards
   - A promotional banner at the top of the page

### Understanding the Badges

| Badge | Meaning | Description |
|-------|---------|-------------|
| 🛡️ **已保障** (Pledged) | Safe | Project has committed to the pledge |
| ⚠️ **高风险** (High Risk) | Caution | Project has NOT made the pledge |
| ❓ **未知** (Unknown) | Unknown | Information unavailable |
| ✗ **查询失败** (Error) | Error | API query failed |

### Getting Detailed Information

- **Hover** over any badge to see a tooltip with:
  - Pledge status explanation
  - Centralization risk percentage (for non-pledged coins)
  - Investment recommendations

### Visiting the Official Website

- Click the **"查看所有誓言项目"** button in the banner
- Opens the official pledge tracker website in a new tab

---

## 🛠️ Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Chrome browser

### Project Structure

```
pumpfun-pledge-tracker/
├── docs/                      # Documentation
│   ├── README.md              # This file
│   └── DEVELOPMENT.md         # Technical documentation
├── public/                    # Static assets
│   └── icons/                 # Extension icons
├── src/                       # Source code
│   ├── manifest.json          # Extension manifest (V3)
│   ├── content/               # Content scripts
│   │   ├── index.tsx          # Main entry point
│   │   └── dom-scanner.ts     # DOM scanning logic
│   ├── components/            # React components
│   │   ├── PledgeTag.tsx      # Badge component
│   │   └── MainBanner.tsx     # Banner component
│   ├── api/                   # API client
│   │   └── client.ts          # Backend communication
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Type definitions
│   └── styles/                # Styles
│       └── index.css          # Global CSS + Tailwind
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite config
└── tailwind.config.js         # Tailwind config
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production-ready extension |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint on all files |
| `npm run lint:fix` | Auto-fix ESLint errors |
| `npm run format` | Format code with Prettier |

### Development Workflow

1. **Start development mode**
   ```bash
   npm run dev
   ```

2. **Make your changes**
   - Edit files in `src/`
   - Vite will automatically rebuild

3. **Reload extension in Chrome**
   - Go to `chrome://extensions/`
   - Click the reload icon on your extension

4. **Test on pump.fun**
   - Open or refresh pump.fun
   - Verify your changes work as expected

5. **Check for errors**
   ```bash
   npm run lint
   ```

### Building for Production

```bash
# Clean build
npm run build

# The built extension will be in the dist/ folder
# Ready to be packaged and uploaded to Chrome Web Store
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Badges appear on meme coin cards
- [ ] Tooltips show on hover
- [ ] Banner appears at top of page
- [ ] Banner button opens correct URL
- [ ] No style conflicts with pump.fun
- [ ] API calls succeed and handle failures
- [ ] Performance is smooth (no lag)

### Browser Console

Check the console for log messages:
```
[Pledge Tracker] Extension initialized on pump.fun
[Pledge Tracker] Found X meme cards
[Pledge Tracker] Querying API for X memes
[Pledge Tracker] Injected tag for meme: [ID]
```

---

## 🔧 Configuration

### API Endpoint

To change the backend API endpoint, edit `src/api/client.ts`:

```typescript
const API_CONFIG = {
  endpoint: 'https://your-backend-api.com/v1/memes/check-pledge',
  timeout: 10000,
};
```

### Official Website URL

To change the promotional website URL, edit `src/content/index.tsx`:

```typescript
const CONFIG = {
  officialWebsite: 'https://your-official-website.com',
};
```

### Scan Interval

To adjust how often the page is scanned, edit `src/content/index.tsx`:

```typescript
const CONFIG = {
  scanInterval: 5000, // milliseconds (5 seconds)
};
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use functional components in React
- Add JSDoc comments for all functions
- Run `npm run lint:fix` before committing

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🐛 Troubleshooting

### Extension not loading
- Ensure you're loading the `dist` folder, not the root folder
- Check Chrome DevTools console for errors
- Try rebuilding: `npm run build`

### Badges not appearing
- Check if you're on a supported pump.fun page
- Open browser console and look for error messages
- The DOM selectors may need updating if pump.fun changed their layout

### API errors
- Verify the backend API is running and accessible
- Check network tab in DevTools
- Ensure CORS is properly configured on backend

### Style conflicts
- Verify Shadow DOM is being used correctly
- Check that Tailwind styles are isolated

---

## 📞 Support

- **Documentation**: [DEVELOPMENT.md](./DEVELOPMENT.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/pumpfun-pledge-tracker/issues)
- **Website**: https://your-website.com

---

<div align="center">

**Made with ❤️ by the Pledge Tracker Team**

⭐ Star us on GitHub if this project helped you!

</div>

