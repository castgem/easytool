# @tooleasy/mcp-server

MCP (Model Context Protocol) server exposing ToolEasy tools to AI agents.

## Install & run

```bash
pnpm install
pnpm run build
node dist/index.js
```

## Cursor configuration

```json
{
  "mcpServers": {
    "tooleasy": {
      "command": "node",
      "args": ["/path/to/easytool/mcp-server/dist/index.js"]
    }
  }
}
```

See [../AGENTS.md](../AGENTS.md) for the full tool list and usage patterns.
