# Getting Started

Welcome to ToolEasy! This guide will help you get up and running quickly.

## What is ToolEasy?

ToolEasy is a privacy-first online toolkit that runs **entirely in your browser**. Your files never leave your device—all processing happens locally using WebAssembly (WASM) technology.

## Quick Start

### Option 1: Use the Hosted Version

Visit [usetooleasy.com](https://usetooleasy.com) to use ToolEasy instantly—no installation required.

### Option 2: Self-Host with Docker

> [!IMPORTANT]
> Office file conversion requires `SharedArrayBuffer`, which needs both:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - a secure context
>
> `http://localhost` works for local testing because browsers treat loopback as trustworthy. `http://192.168.x.x` or other LAN IPs usually do not, so Word/Excel/PowerPoint conversions will require HTTPS when accessed from other devices on your network.

```bash
# Clone and run (builds image tooleasy:latest locally)
git clone https://github.com/castgem/easytool.git
cd easytool
docker compose up -d --build
```

> [!TIP]
> Use `SIMPLE_MODE=true` at build time to hide the marketing homepage and show tools only. Same image name: `tooleasy:latest`. See [SIMPLE_MODE.md](https://github.com/castgem/easytool/blob/main/SIMPLE_MODE.md).

Then open `http://localhost:8080` in your browser.

> [!NOTE]
> If you are preparing an air-gapped OCR deployment, you must host the OCR text-layer fonts internally in addition to the Tesseract worker, core runtime, and traineddata files. The full setup is documented in [Self-Hosting](/self-hosting/), including `VITE_OCR_FONT_BASE_URL` and the bundled `ocr-fonts/` directory.

### Option 3: Build from Source

```bash
# Clone the repository
git clone https://github.com/castgem/easytool.git
cd easytool

# Install dependencies (requires Node.js 20+ and pnpm via corepack)
corepack enable pnpm
pnpm install

# Start development server
pnpm run dev
```

## Features at a Glance

| Category             | Tools                                                           |
| -------------------- | --------------------------------------------------------------- |
| **Convert to PDF**   | Word, Excel, PowerPoint, Images, Markdown, EPUB, MOBI, and more |
| **Convert from PDF** | JPG, PNG, Text, Excel, SVG, and more                            |
| **Edit & Annotate**  | Sign, Highlight, Redact, Fill Forms, Add Stamps                 |
| **Organize**         | Merge, Split, Rotate, Delete Pages, Reorder                     |
| **Optimize**         | Compress, Repair, Flatten, OCR                                  |
| **Security**         | Encrypt, Decrypt, Remove Restrictions                           |

## Browser Support

ToolEasy works best on modern browsers:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Next Steps

- [Explore all tools](/tools/)
- [Self-host ToolEasy](/self-hosting/)
