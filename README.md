# AEL Code Analyzer v5.0

> Professional static analysis tool with smart duplicate detection, AI-style suggestions, and multi-language support.
> Built by Ayman Elmasry — AEL Digital Studio.

---

## Features

- **Smart Duplicate Filter** — detects duplicate lines ignoring structural syntax (`{};`, comments, whitespace)
- **Multi-Language** — Auto, HTML, CSS, JavaScript, Python, JSON
- **Code Metrics** — Lines of Code, Quality Score, Issues, Duplicates
- **Real-Time Analysis** — 800ms debounce, updates as you type
- **File Drag & Drop** — drop any code file to load instantly
- **Keyboard Shortcuts** — `Ctrl+Enter` to analyze, `Ctrl+L` to clear, `Tab` for indentation
- **Sandboxed Execution** — safe HTML/JS execution via iframe
- **Zero Dependencies** — pure HTML/CSS/JS, no libraries

---

## Usage

1. Open `index.html` in any modern browser
2. Paste or type your code
3. Select language (or use Auto-detection)
4. View metrics, issues, duplicates, and suggestions

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl+Enter` | Analyze code |
| `Ctrl+L` | Clear editor |
| `Tab` | Insert 4-space indent |

---

## Project Structure

```
ael-code-analyzer/
├── index.html       # Main application (HTML structure)
├── styles.css       # All styles and theming
├── app.js           # Analysis logic and UI interactions
├── screenshot.svg   # Preview image
└── README.md        # Documentation
```

---

## Technical Details

| Aspect | Detail |
|--------|--------|
| Architecture | Single-page app (HTML5 + CSS3 + JS) |
| Editor | Native `<textarea>` with synced line numbers |
| Duplicate detection | Normalized whitespace comparison (ignores structural lines) |
| Language detection | Regex-based heuristics per language |
| Issue detection | Language-specific linting rules |
| Quality scoring | Deductions for issues (5pts) and duplicates (3pts) |
| Drag & drop | FileReader API with text file loading |
| Browser support | Chrome, Firefox, Safari, Edge |

---

## Credits

**Created by:** Ayman Elmasry — AEL Digital Studio
**Website:** [aymanelmasry.com](https://www.aymanelmasry.com)
**License:** © 2026 Ayman Elmasry — AEL Digital Studio. All rights reserved.

### Connect

[LinkedIn](https://linkedin.com/in/aymanelmasryael) · [GitHub](https://github.com/aymanelmasryael) · [X](https://x.com/aymanelmasryael)
