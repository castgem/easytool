# Simple Mode

Simple Mode hides the marketing homepage (hero, features, FAQ, testimonials, footer) and shows the tools grid first. **All PDF and utility tools work the same** — only the surrounding UI changes.

## Enable at build time

```bash
# docker compose (edit docker-compose.dev.yml or pass build-arg)
docker build --build-arg SIMPLE_MODE=true -t tooleasy:latest .
docker run -d -p 8080:8080 --name tooleasy tooleasy:latest
```

Or in `docker-compose.yml`:

```yaml
services:
  tooleasy:
    build:
      context: .
      args:
        SIMPLE_MODE: 'true'
    image: tooleasy:latest
```

## Default (full marketing site)

```bash
docker compose up -d --build
```

Uses `SIMPLE_MODE=false` (default). Image name is always **`tooleasy:latest`** — there is no separate registry image or commercial/self-hosted split.

## Local dev without Docker

```bash
SIMPLE_MODE=true pnpm run serve:simple
# or
pnpm run serve
```
