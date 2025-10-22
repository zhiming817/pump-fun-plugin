# Contributing to Pump.fun Pledge Tracker

Thank you for your interest in contributing! 🎉

We welcome contributions of all kinds: bug reports, feature suggestions, documentation improvements, and code contributions.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Code Standards](#code-standards)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

---

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers and help them learn
- ✅ Focus on what's best for the community
- ✅ Show empathy towards others

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Chrome browser
- Code editor (VS Code recommended)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/pumpfun-pledge-tracker.git
   cd pumpfun-pledge-tracker
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-org/pumpfun-pledge-tracker.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Build and test**:
   ```bash
   npm run build
   ```

---

## 🤝 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports
Found a bug? [Open an issue](https://github.com/your-org/pumpfun-pledge-tracker/issues/new) with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (Chrome version, OS)

#### ✨ Feature Suggestions
Have an idea? [Start a discussion](https://github.com/your-org/pumpfun-pledge-tracker/discussions) with:
- Use case and motivation
- Proposed solution
- Alternative approaches
- Mockups or examples (if applicable)

#### 📖 Documentation
Improve docs by:
- Fixing typos or unclear explanations
- Adding examples
- Translating to other languages
- Creating tutorials or guides

#### 💻 Code Contributions
Fix bugs or add features by:
- Following the development process below
- Adhering to code standards
- Adding tests (when applicable)
- Updating documentation

---

## 🛠️ Development Process

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Keep commits focused and atomic

### 3. Test Your Changes

```bash
# Build the extension
npm run build

# Load in Chrome and test
# - Go to chrome://extensions/
# - Enable developer mode
# - Load unpacked from dist/

# Run linter
npm run lint

# Format code
npm run format
```

### 4. Commit Your Changes

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add centralization risk tooltip"
git commit -m "Fix badge positioning on mobile"
git commit -m "Update API endpoint documentation"

# Bad commit messages (avoid these)
git commit -m "fix stuff"
git commit -m "WIP"
git commit -m "asdf"
```

### 5. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Go to GitHub and create a Pull Request
```

---

## 📏 Code Standards

### TypeScript

- ✅ Use strict mode
- ✅ Avoid `any` type (use `unknown` if needed)
- ✅ Define proper interfaces and types
- ✅ Export types from `src/types/index.ts`

```typescript
// Good
interface UserData {
  id: string;
  name: string;
}

function getUser(id: string): UserData {
  // ...
}

// Bad
function getUser(id: any): any {
  // ...
}
```

### React

- ✅ Use functional components
- ✅ Use React hooks (not class components)
- ✅ Properly type props and state
- ✅ Extract reusable logic to custom hooks

```typescript
// Good
interface Props {
  memeId: string;
  onClose: () => void;
}

export const MyComponent: React.FC<Props> = ({ memeId, onClose }) => {
  // ...
};

// Bad
export function MyComponent(props: any) {
  // ...
}
```

### Code Style

- ✅ Use Prettier for formatting (automatic)
- ✅ Use ESLint rules (automatic)
- ✅ 2 spaces for indentation
- ✅ Single quotes for strings
- ✅ Semicolons required

```typescript
// Prettier will auto-format to:
const message = 'Hello world';

if (condition) {
  doSomething();
}
```

### Documentation

- ✅ Add JSDoc comments to all exported functions
- ✅ Explain "why", not just "what"
- ✅ Include examples for complex functions

```typescript
/**
 * Extract the unique meme coin ID from a card element
 *
 * This function tries multiple strategies to find the ID:
 * 1. Check for data-coin-id attribute
 * 2. Extract from href attribute if element is a link
 *
 * @param element - The DOM element representing a meme card
 * @returns The extracted ID, or null if not found
 *
 * @example
 * ```typescript
 * const card = document.querySelector('.coin-card');
 * const id = extractMemeId(card);
 * console.log(id); // "ABC123..."
 * ```
 */
function extractMemeId(element: HTMLElement): string | null {
  // ...
}
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code builds successfully (`npm run build`)
- [ ] Linter passes (`npm run lint`)
- [ ] Tested manually in Chrome
- [ ] Updated relevant documentation
- [ ] Added/updated comments in code
- [ ] Commit messages are clear

### PR Description

Include in your PR:

1. **What** - Describe the changes
2. **Why** - Explain the motivation
3. **How** - Outline the approach
4. **Testing** - How you tested it
5. **Screenshots** - For UI changes

Example:
```markdown
## What
Adds tooltip to display centralization risk percentage

## Why
Users requested more detailed risk information without cluttering the UI

## How
- Added hover state to PledgeTag component
- Created Tooltip subcomponent with risk details
- Used Shadow DOM for style isolation

## Testing
- Tested on pump.fun with various meme cards
- Verified tooltip positioning on different screen sizes
- Checked for style conflicts

## Screenshots
[Attach screenshots here]
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, maintainers will merge
4. Your contribution will be in the next release! 🎉

---

## 🐛 Reporting Bugs

### Before Reporting

1. **Search existing issues** - Maybe it's already reported
2. **Test in latest version** - Bug might be fixed
3. **Reproduce consistently** - Ensure it's not a one-time glitch

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to pump.fun
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Actual Behavior**
What actually happened

**Screenshots**
If applicable

**Environment**
- Chrome Version: [e.g. 120.0.6099.109]
- Extension Version: [e.g. 1.0.0]
- OS: [e.g. Windows 11, macOS 14]

**Console Errors**
Any errors from browser console
```

---

## ✨ Suggesting Features

### Before Suggesting

1. **Check existing suggestions** - Maybe it's already proposed
2. **Consider scope** - Is it aligned with project goals?
3. **Think about implementation** - Is it feasible?

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Other approaches you thought about

**Additional context**
Mockups, examples, use cases

**Would you be willing to implement this?**
Yes/No/Maybe with guidance
```

---

## 💬 Questions?

- **Documentation**: Check [DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/pumpfun-pledge-tracker/discussions)
- **Issues**: [GitHub Issues](https://github.com/your-org/pumpfun-pledge-tracker/issues)

---

## 🙏 Thank You!

Every contribution, no matter how small, makes this project better. We appreciate your time and effort! ❤️

---

**Happy Contributing! 🚀**

