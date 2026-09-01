# ToolEasy — Agent Integration Guide

ToolEasy is an **AI-agent-callable online toolkit**: browser-based PDF tools plus utilities (JSON, Base64, hashing) and more on the way — discoverable and partially executable via **MCP** (Model Context Protocol).

Product site: https://www.usetooleasy.com (中文品牌名：**好易用**)

## Quick start (MCP)

### 1. Build the MCP server

```bash
pnpm run mcp:install
pnpm run mcp:build
```

### 2. Register in Cursor / Claude Desktop

Add to your MCP config (e.g. `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "tooleasy": {
      "command": "node",
      "args": ["/absolute/path/to/easytool/mcp-server/dist/index.js"]
    }
  }
}
```

For development without building:

```json
{
  "mcpServers": {
    "tooleasy": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/easytool/mcp-server/src/index.ts"]
    }
  }
}
```

## MCP tools

| Tool                              | Description                                        |
| --------------------------------- | -------------------------------------------------- |
| `list_tools`                      | Full catalog: PDF + utility tools, MCP vs web-only |
| `get_tool_schema`                 | Input schema for an MCP-executable tool            |
| `merge_pdf`                       | Merge base64 PDFs                                  |
| `split_pdf`                       | Extract page range                                 |
| `rotate_pdf`                      | Rotate all pages (90/180/270°)                     |
| `extract_pages`                   | Extract pages by number                            |
| `pdf_page_count`                  | Count pages                                        |
| `base64_encode` / `base64_decode` | Text ↔ Base64                                      |
| `json_format`                     | Pretty-print JSON                                  |
| `hash_text`                       | SHA-256 hash                                       |
| `url_encode` / `url_decode`       | URL encoding                                       |

**PDF inputs/outputs** use **base64** strings (no `data:` prefix required).

Advanced PDF features (compress, OCR, encrypt, convert to Word, etc.) run in the **web UI** with WASM. Use `list_tools` — entries with `mcpExecutable: false` include a `webPath` for human or browser automation workflows.

## Tool catalog source of truth

`shared/tool-catalog.json` — extend this file when adding new tools, then wire handlers in `mcp-server/src/`.

## Web UI

- Dev: `pnpm run dev`
- Production build: `pnpm run build`
- Docker: `docker compose up` (service name: `tooleasy`, image: `tooleasy:local`)

Utility tools appear under **Utility Tools** on the home page. PDF tools are unchanged from the original toolkit.

## Design principles for agents

1. **Discover first** — call `list_tools` before assuming capabilities.
2. **Prefer MCP** for merge/split/rotate/extract and text utilities.
3. **Fall back to web** for WASM-heavy operations (compress, OCR, signatures).
4. **Privacy** — MCP server processes files in memory on your machine; nothing is sent to ToolEasy servers.
