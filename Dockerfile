# Global variable declaration:
# Build to serve under Subdirectory BASE_URL if provided, eg: "ARG BASE_URL=/pdf/", otherwise leave blank: "ARG BASE_URL="
ARG BASE_URL=

# Build stage
FROM public.ecr.aws/docker/library/node:24-alpine AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY mcp-server/package.json ./mcp-server/
COPY vendor ./vendor
ENV HUSKY=0
RUN set -eux; \
    for f in \
      vendor/tooleasy-pymupdf-wasm/tooleasy-pymupdf-wasm-0.11.16.tgz \
      vendor/tooleasy-gs-wasm/tooleasy-gs-wasm-0.1.1.tgz \
      vendor/tooleasy-pdfium/tooleasy-pdfium-8ff5002c6cd5.tgz \
      vendor/tooleasy-viewer/tooleasy-viewer-8ff5002c6cd5.tgz; \
    do \
      test -s "$f" || (echo "Missing vendor tarball: $f (ensure vendor/*.tgz are committed)" >&2; exit 1); \
    done
RUN pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 60000 && \
    pnpm config set fetch-retry-maxtimeout 300000 && \
    pnpm config set fetch-timeout 600000 && \
    pnpm install --frozen-lockfile
COPY . .

# Build without type checking (vite build only)
# Pass SIMPLE_MODE environment variable if provided
ARG SIMPLE_MODE=false
ENV SIMPLE_MODE=$SIMPLE_MODE
ARG COMPRESSION_MODE=all
ENV COMPRESSION_MODE=$COMPRESSION_MODE

# global arg to local arg - BASE_URL is read from env by vite.config.ts
ARG BASE_URL
ENV BASE_URL=$BASE_URL

# WASM module URLs (pre-configured defaults)
# Override these for air-gapped or self-hosted WASM deployments
ARG VITE_WASM_PYMUPDF_URL
ARG VITE_WASM_GS_URL
ARG VITE_WASM_CPDF_URL
ENV VITE_WASM_PYMUPDF_URL=$VITE_WASM_PYMUPDF_URL
ENV VITE_WASM_GS_URL=$VITE_WASM_GS_URL
ENV VITE_WASM_CPDF_URL=$VITE_WASM_CPDF_URL

# OCR asset URLs (optional, used for self-hosted or air-gapped OCR)
ARG VITE_TESSERACT_WORKER_URL
ARG VITE_TESSERACT_CORE_URL
ARG VITE_TESSERACT_LANG_URL
ARG VITE_TESSERACT_AVAILABLE_LANGUAGES
ARG VITE_OCR_FONT_BASE_URL
ENV VITE_TESSERACT_WORKER_URL=$VITE_TESSERACT_WORKER_URL
ENV VITE_TESSERACT_CORE_URL=$VITE_TESSERACT_CORE_URL
ENV VITE_TESSERACT_LANG_URL=$VITE_TESSERACT_LANG_URL
ENV VITE_TESSERACT_AVAILABLE_LANGUAGES=$VITE_TESSERACT_AVAILABLE_LANGUAGES
ENV VITE_OCR_FONT_BASE_URL=$VITE_OCR_FONT_BASE_URL

# Default UI language (e.g. en, fr, de, es, zh, ar)
ARG VITE_DEFAULT_LANGUAGE
ENV VITE_DEFAULT_LANGUAGE=$VITE_DEFAULT_LANGUAGE

# Custom branding (e.g. VITE_BRAND_NAME=MyCompany VITE_BRAND_LOGO=my-logo.svg)
ARG VITE_BRAND_NAME
ARG VITE_BRAND_LOGO
ARG VITE_FOOTER_TEXT
ENV VITE_BRAND_NAME=$VITE_BRAND_NAME
ENV VITE_BRAND_LOGO=$VITE_BRAND_LOGO
ENV VITE_FOOTER_TEXT=$VITE_FOOTER_TEXT

ARG DISABLE_TOOLS
ENV DISABLE_TOOLS=$DISABLE_TOOLS

# Public-facing canonical site URL. Defaults to the official site so self-hosters
# consolidate SEO signals back to your deployment domain. Override with --build-arg
# SITE_URL=https://your-domain.example
ARG SITE_URL=http://localhost:8080
ENV SITE_URL=$SITE_URL

ENV NODE_OPTIONS="--max-old-space-size=3072"

RUN --mount=type=secret,id=VITE_CORS_PROXY_URL,required=false \
    --mount=type=secret,id=VITE_CORS_PROXY_SECRET,required=false \
    VITE_CORS_PROXY_URL=$(cat /run/secrets/VITE_CORS_PROXY_URL 2>/dev/null || echo "") \
    VITE_CORS_PROXY_SECRET=$(cat /run/secrets/VITE_CORS_PROXY_SECRET 2>/dev/null || echo "") \
    pnpm run build:with-docs

# Production stage
FROM quay.io/nginx/nginx-unprivileged:alpine-slim

LABEL org.opencontainers.image.source="https://www.usetooleasy.com"
LABEL org.opencontainers.image.url="https://www.usetooleasy.com"

# global arg to local arg
ARG BASE_URL

# Set this to "true" to disable Nginx listening on IPv6
ENV DISABLE_IPV6=false
ENV PORT=8080

USER root
RUN apk upgrade --no-cache
USER nginx

COPY --chown=nginx:nginx --from=builder /app/dist /usr/share/nginx/html${BASE_URL%/}
COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx --from=builder /app/security-headers.conf /etc/nginx/security-headers.conf
COPY --chown=nginx:nginx --from=builder /app/security-headers-docs.conf /etc/nginx/security-headers-docs.conf
COPY --chown=nginx:nginx --chmod=755 nginx-ipv6.sh /docker-entrypoint.d/99-disable-ipv6.sh
COPY --chown=nginx:nginx --chmod=755 nginx-noindex.sh /docker-entrypoint.d/98-noindex.sh
USER root
RUN mkdir -p /etc/nginx/tmp \
    && rm -f /usr/share/nginx/html/50x.html \
    && chown -R nginx:nginx /etc/nginx/tmp /usr/share/nginx/html
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
