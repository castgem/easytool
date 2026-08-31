<p align="center"><img src="public/images/favicon-no-bg.svg" width="80"></p>
<h1 align="center">ToolEasy</h1>

# ToolEasy

**ToolEasy** (usetooleasy.com) is an **AI-agent-callable** online toolkit: 100+ privacy-first tools in the browser — starting with PDF, plus JSON, Base64, hashing, and more — with an **MCP server** for Cursor, Claude, and custom agents.

Website: [usetooleasy.com](https://www.usetooleasy.com)

---

## Features

- **PDF** — merge, split, compress, convert, edit, sign, OCR, and more (client-side WASM)
- **Utilities** — JSON formatter, Base64 encode/decode, SHA-256 hash generator
- **MCP** — Model Context Protocol server for AI agents (`list_tools`, `merge_pdf`, etc.)
- **Self-hostable** — Docker, static hosting, custom branding via env vars
- **Private** — no upload to third-party servers for browser tools

See [AGENTS.md](./AGENTS.md) for MCP setup and agent workflows.

---

## Quick start

### Web UI (development)

```bash
pnpm install
pnpm run dev
```

Open http://localhost:5173

### Docker

```bash
docker compose up -d --build
```

Builds and runs **`tooleasy:latest`** locally (no registry pull).

### MCP server (for AI agents)

```bash
pnpm run mcp:install
pnpm run mcp:build
```

Register `mcp-server/dist/index.js` in your MCP client — details in [AGENTS.md](./AGENTS.md).

---

## Custom branding

| Variable           | Description                  |
| ------------------ | ---------------------------- |
| `VITE_BRAND_NAME`  | App name (default: ToolEasy) |
| `VITE_BRAND_LOGO`  | Logo path under `public/`    |
| `VITE_FOOTER_TEXT` | Footer HTML/text             |
| `SITE_URL`         | Canonical URL for SEO builds |

---

## Project layout

```
├── src/                 # Web UI (Vite + TypeScript)
├── mcp-server/          # MCP server for agents
├── shared/              # tool-catalog.json (agent + UI metadata)
├── docs/                # VitePress documentation
└── Dockerfile           # Production nginx image
```

---

## Adding tools

1. **Web tool** — add page under `src/pages/`, logic under `src/js/logic/`, entry in `src/js/config/tools.ts` and `vite.config.ts`.
2. **Agent tool** — add entry to `shared/tool-catalog.json`, implement handler in `mcp-server/src/`.
3. **Both** — do both; set `mcpExecutable: true` when server-side logic exists.

---

## License

Proprietary — see [LICENSE](./LICENSE). Third-party components retain their own licenses.
