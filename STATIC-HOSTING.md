# Hosting ToolEasy as a static website

As an alternative to running ToolEasy locally or in a Docker container, you can host it as a set of static web pages.

## Netlify

### Static deployment (upload a build)

1. Build locally (`pnpm run build`) or use a `dist-{version}.zip` from your ToolEasy distribution.
2. Create a [Netlify](https://www.netlify.com/) account and log in.
3. Add a new project → **Deploy manually**.
4. Upload the `dist` output (or zip).
5. Your deployment should be live. Optionally rename the project in settings.

When you receive a newer build, repeat the upload from **Deploys**.

### CI deployment (private Git)

1. Add a new Netlify project → **Import an existing project**.
2. Connect your private Git provider and select the ToolEasy repository.
3. Build command: `pnpm run build`, publish directory: `dist`, Node 20+.
4. Deploy.

To enable Simple Mode, add environment variable `SIMPLE_MODE=true` and redeploy.

See [Netlify self-hosting guide](docs/self-hosting/netlify.md) for required security headers.

## Vercel

1. Import your private ToolEasy repository at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite**, build: `pnpm run build`, output: `dist`.
3. Deploy.

For Simple Mode, add `SIMPLE_MODE=true` in project environment variables and redeploy.

See [Vercel self-hosting guide](docs/self-hosting/vercel.md) for COOP/COEP headers.

## Any static host

You can upload the `dist` folder to S3, Cloudflare Pages, Apache, nginx, or any static file server. Ensure:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp` (or `credentialless` if your host uses it)

Office conversions require `SharedArrayBuffer` (secure context + those headers).

## SEO and search engine indexing

By default, every self-hosted ToolEasy build emits canonical URLs and an
hreflang/`x-default` set that point back to `https://www.usetooleasy.com`. This
is intentional for two reasons:

1. **It consolidates SEO signals to the official site** so your instance
   doesn't compete with usetooleasy.com on brand searches like "tooleasy".
2. **It keeps your instance off public search results.** If you self-host
   on a small VPS, a home server, or anywhere with limited bandwidth, you
   probably don't want strangers from Google landing on it. With the
   default canonical pointing back to the official site, search engines
   treat your instance as a copy and won't surface it for organic traffic
   and your bandwidth is reserved for the people you actually share the URL
   with.

You have two clean overrides depending on what you want.

### Run your own SEO instance (claim canonical for yourself)

If you operate a public deployment and want it to be the indexed copy for
your audience, set `SITE_URL` at build time to your origin. The build will
emit canonicals, hreflang, and structured data pointing at your domain.

- Docker:
  ```sh
  docker build --build-arg SITE_URL=https://pdf.example.com -t tooleasy-self .
  ```
- Netlify, Vercel, or any other static host: set `SITE_URL`
  in your project's environment variables and re-deploy. The build script
  reads it during `pnpm run build`.

### Stay invisible to search engines (no SEO competition either way)

Set the runtime environment variable `ROBOTS_NOINDEX=true`. The container
injects `<meta name="robots" content="noindex, follow">` into every served
HTML file at startup. The canonical link still points at the official site
by default, so when crawlers do follow internal links they still see
usetooleasy.com as the authoritative source.

```sh
docker run -d -p 8080:8080 -e ROBOTS_NOINDEX=true tooleasy:latest
```

You can combine the two: build with your own `SITE_URL` and run with
`ROBOTS_NOINDEX=true` for a private deployment that's neither competing
with usetooleasy.com nor advertising itself.

### Note on Simple Mode

Simple Mode (`SIMPLE_MODE=true`) controls the **UI** — it ships a stripped-down
homepage suitable for company intranets and single-purpose deployments. It
does **not** by itself control whether your instance is indexed by search
engines. A public-facing simple-mode deployment is fully indexable by default,
just like the full-mode build. If you want a simple-mode deployment hidden
from search engines, combine `SIMPLE_MODE=true` at build time with
`ROBOTS_NOINDEX=true` at runtime.
