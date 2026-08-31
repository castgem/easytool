#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  base64Decode,
  base64Encode,
  extractPages,
  formatJson,
  hashText,
  mergePdf,
  pdfPageCount,
  rotatePdf,
  splitPdf,
  urlDecode,
  urlEncode,
} from './operations.js';

const server = new McpServer({
  name: 'tooleasy',
  version: '0.1.0',
});

// --- Discovery ---

server.tool(
  'list_tools',
  'List all ToolEasy tools. Returns id, name, category, description, and whether each tool is executable via MCP or web-only.',
  {},
  async () => {
    const toolCatalog = (
      await import('../../shared/tool-catalog.json', { with: { type: 'json' } })
    ).default;
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              project: 'ToolEasy',
              description:
                'Privacy-first toolkit: PDF processing + common utilities. MCP executes a subset server-side; advanced tools run in the browser.',
              tools: toolCatalog.map((t) => ({
                id: t.id,
                name: t.name,
                category: t.category,
                description: t.description,
                kind: t.kind,
                webPath: t.webPath,
                mcpExecutable: t.mcpExecutable ?? false,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

server.tool(
  'get_tool_schema',
  'Get the input JSON schema for an MCP-executable tool by id.',
  { toolId: z.string().describe('Tool id, e.g. merge-pdf') },
  async ({ toolId }) => {
    const toolCatalog = (
      await import('../../shared/tool-catalog.json', { with: { type: 'json' } })
    ).default as Array<{
      id: string;
      mcpExecutable?: boolean;
      webPath?: string;
      inputSchema?: unknown;
    }>;
    const tool = toolCatalog.find((t) => t.id === toolId);
    if (!tool) {
      return {
        content: [{ type: 'text', text: `Unknown tool: ${toolId}` }],
        isError: true,
      };
    }
    if (!tool.mcpExecutable) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                id: tool.id,
                mcpExecutable: false,
                webPath: tool.webPath,
                hint: 'Open the web UI for this tool, or use list_tools for MCP-executable alternatives.',
              },
              null,
              2
            ),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            { id: tool.id, inputSchema: tool.inputSchema },
            null,
            2
          ),
        },
      ],
    };
  }
);

// --- PDF ---

server.tool(
  'merge_pdf',
  'Merge multiple PDFs (base64) into one PDF. Returns base64 PDF.',
  {
    files: z
      .array(z.string())
      .min(2)
      .describe('Array of base64-encoded PDF files'),
  },
  async ({ files }) => {
    const result = await mergePdf(files);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ pdfBase64: result, pageCount: 'use pdf_page_count' }),
        },
      ],
    };
  }
);

server.tool(
  'split_pdf',
  'Extract a page range from a PDF. Pages are 1-indexed. Returns base64 PDF.',
  {
    file: z.string().describe('Base64-encoded PDF'),
    startPage: z.number().int().min(1),
    endPage: z.number().int().min(1),
  },
  async ({ file, startPage, endPage }) => {
    const result = await splitPdf(file, startPage, endPage);
    return { content: [{ type: 'text', text: JSON.stringify({ pdfBase64: result }) }] };
  }
);

server.tool(
  'rotate_pdf',
  'Rotate all pages in a PDF. Returns base64 PDF.',
  {
    file: z.string(),
    degrees: z.union([z.literal(90), z.literal(180), z.literal(270)]),
  },
  async ({ file, degrees: deg }) => {
    const result = await rotatePdf(file, deg);
    return { content: [{ type: 'text', text: JSON.stringify({ pdfBase64: result }) }] };
  }
);

server.tool(
  'extract_pages',
  'Extract specific pages from a PDF by page number (1-indexed). Returns base64 PDF.',
  {
    file: z.string(),
    pages: z.array(z.number().int().min(1)).min(1),
  },
  async ({ file, pages }) => {
    const result = await extractPages(file, pages);
    return { content: [{ type: 'text', text: JSON.stringify({ pdfBase64: result }) }] };
  }
);

server.tool(
  'pdf_page_count',
  'Return the number of pages in a base64-encoded PDF.',
  { file: z.string() },
  async ({ file }) => {
    const count = await pdfPageCount(file);
    return { content: [{ type: 'text', text: JSON.stringify({ pageCount: count }) }] };
  }
);

// --- Utilities ---

server.tool(
  'base64_encode',
  'Encode UTF-8 text to Base64.',
  { text: z.string() },
  async ({ text }) => ({
    content: [{ type: 'text', text: base64Encode(text) }],
  })
);

server.tool(
  'base64_decode',
  'Decode Base64 to UTF-8 text.',
  { text: z.string() },
  async ({ text }) => ({
    content: [{ type: 'text', text: base64Decode(text) }],
  })
);

server.tool(
  'json_format',
  'Validate and pretty-print JSON.',
  {
    text: z.string(),
    indent: z.number().int().min(0).max(8).optional(),
  },
  async ({ text, indent }) => ({
    content: [{ type: 'text', text: formatJson(text, indent ?? 2) }],
  })
);

server.tool(
  'hash_text',
  'Compute SHA-256 hash of UTF-8 text.',
  { text: z.string() },
  async ({ text }) => ({
    content: [{ type: 'text', text: hashText(text) }],
  })
);

server.tool(
  'url_encode',
  'Percent-encode a string for URLs.',
  { text: z.string() },
  async ({ text }) => ({
    content: [{ type: 'text', text: urlEncode(text) }],
  })
);

server.tool(
  'url_decode',
  'Decode a percent-encoded URL string.',
  { text: z.string() },
  async ({ text }) => ({
    content: [{ type: 'text', text: urlDecode(text) }],
  })
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ToolEasy MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
