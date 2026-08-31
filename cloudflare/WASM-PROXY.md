# WASM Proxy Setup Guide

ToolEasy uses a Cloudflare Worker to proxy WASM library requests, bypassing CORS restrictions when loading optional processing modules (PyMuPDF, Ghostscript, CoherentPDF) from external sources.

## Quick Start

### 1. Deploy the Worker

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy -c wasm-wrangler.toml
```

### 2. Configure Source URLs

Set environment secrets with the base URLs for your WASM files:

```bash
# Option A: Interactive prompts
npx wrangler secret put PYMUPDF_SOURCE -c wasm-wrangler.toml
npx wrangler secret put GS_SOURCE -c wasm-wrangler.toml
npx wrangler secret put CPDF_SOURCE -c wasm-wrangler.toml

# Option B: Set via Cloudflare Dashboard
# Go to Workers & Pages > tooleasy-wasm-proxy > Settings > Variables
```

**Recommended Source URLs:**

- PYMUPDF_SOURCE: `https://cdn.jsdelivr.net/npm/@tooleasy/pymupdf-wasm@0.11.16/`
- GS_SOURCE: `https://cdn.jsdelivr.net/npm/@tooleasy/gs-wasm/assets/`
- CPDF_SOURCE: `https://cdn.jsdelivr.net/npm/coherentpdf/dist/`

> **Note:** You can use your own hosted WASM files instead of the recommended URLs. Just ensure your files match the expected directory structure and file names that ToolEasy expects for each module.

### 3. Configure ToolEasy

**Option A: Environment variables (recommended — zero-config for users)**

Set these in `.env.production` or pass as Docker build args:

```bash
VITE_WASM_PYMUPDF_URL=https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/pymupdf/
VITE_WASM_GS_URL=https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/gs/
VITE_WASM_CPDF_URL=https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/cpdf/
```

**Option B: Manual per-user configuration**

In ToolEasy's Advanced Settings (wasm-settings.html), enter:

| Module      | URL                                                                 |
| ----------- | ------------------------------------------------------------------- |
| PyMuPDF     | `https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/pymupdf/` |
| Ghostscript | `https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/gs/`      |
| CoherentPDF | `https://tooleasy-wasm-proxy.<your-subdomain>.workers.dev/cpdf/`    |

## Custom Domain (Optional)

To use a custom domain like `wasm.usetooleasy.com`:

1. Add route in `wasm-wrangler.toml`:

```toml
routes = [
  { pattern = "wasm.usetooleasy.com/*", zone_name = "usetooleasy.com" }
]
```

2. Add DNS record in Cloudflare:
   - Type: AAAA
   - Name: wasm
   - Content: 100::
   - Proxied: Yes

3. Redeploy:

```bash
npx wrangler deploy -c wasm-wrangler.toml
```

## Security Features

- **Origin validation**: Only allows requests from configured origins
- **Rate limiting**: 100 requests/minute per IP (requires KV namespace)
- **File type restrictions**: Only WASM-related files (.js, .wasm, .data, etc.)
- **Size limits**: Max 100MB per file
- **Caching**: Reduces origin requests and improves performance

## Self-Hosting Notes

1. Update `ALLOWED_ORIGINS` in `wasm-proxy-worker.js` to include your domain
2. Host your WASM files on any origin (R2, S3, or any CDN)
3. Set source URLs as secrets in your worker

## Endpoints

| Endpoint     | Description                            |
| ------------ | -------------------------------------- |
| `/`          | Health check, shows configured modules |
| `/pymupdf/*` | PyMuPDF WASM files                     |
| `/gs/*`      | Ghostscript WASM files                 |
| `/cpdf/*`    | CoherentPDF files                      |
