# Deploy with Kubernetes

Kubernetes may be overkill for a static site, but it can be a great fit if you already standardize on Helm + GitOps.

> [!IMPORTANT]
> **Required Headers for Office File Conversion**
>
> LibreOffice-based tools (Word, Excel, PowerPoint conversion) require these HTTP headers for `SharedArrayBuffer` support:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> The official ToolEasy nginx images include these headers. In Kubernetes, **Ingress/Gateway controllers are also reverse proxies**, so ensure these headers are preserved (or add them at the edge).

## Prereqs

- Kubernetes cluster
- Helm v3
- A ToolEasy nginx image (e.g. `tooleasy:latest`) that serves on **port 8080**

## Deploy with Helm

```bash
docker build -t tooleasy:latest .   # on a node or in CI

kubectl create namespace tooleasy

helm upgrade --install tooleasy ./chart \
  --namespace tooleasy \
  --set image.repository=tooleasy \
  --set image.tag=latest
```

## Expose it

### Port-forward (quick test)

```bash
kubectl -n tooleasy port-forward deploy/tooleasy 8080:8080
```

### Ingress (optional)

Enable Ingress (example for nginx-ingress):

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: pdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Gateway API (optional)

This chart supports Gateway API `Gateway` + `HTTPRoute`.

Example (Cloudflare Gateway API operator):

```yaml
gateway:
  enabled: true
  name: tooleasy-tunnel
  namespace: tooleasy
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: tooleasy-tunnel
      namespace: tooleasy
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Ensuring the SharedArrayBuffer headers still work (Ingress/Gateway)

### What "should" happen

ToolEasy’s nginx config sets the required response headers. Most Ingress/Gateway controllers **pass upstream response headers through unchanged**.

### What can break it

- A controller/edge policy that **overrides** or **strips** response headers
- A "security headers" middleware that sets different COOP/COEP values

### How to verify

Run this against your public endpoint:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

You should see:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### If your Ingress controller does not preserve them

Add the headers at the edge (controller-specific). Example for **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME-type errors (Sign PDF / Form Filler iframe blank)

If the browser console shows `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` on a `.mjs` request, an Ingress/Gateway controller in front of the ToolEasy nginx is replacing the upstream `Content-Type` header with `application/octet-stream`.

The ToolEasy image's nginx already serves `.mjs` as `application/javascript`. The fix is to stop the controller from stripping/replacing it. For nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Or use a `ResponseHeaderModifier` filter in Gateway API to set `Content-Type: application/javascript` for `.mjs` paths. Verify with DevTools → Network tab: the failed `.mjs` request should now show `content-type: application/javascript`.

### If you’re using Gateway API and want to force-add headers

Gateway API supports a `ResponseHeaderModifier` filter. You can attach it in `httpRoute.rules[*].filters`:

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: tooleasy-tunnel
      namespace: misc
      sectionName: http
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      filters:
        - type: ResponseHeaderModifier
          responseHeaderModifier:
            set:
              - name: Cross-Origin-Opener-Policy
                value: same-origin
              - name: Cross-Origin-Embedder-Policy
                value: require-corp
```

Support for specific filters depends on your Gateway controller; if a filter is ignored, add headers at the edge/controller layer instead.

## Disabling Specific Tools

Use a ConfigMap to disable tools at runtime without rebuilding the image:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: tooleasy-config
  namespace: tooleasy
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Mount it into the served directory:

```yaml
spec:
  containers:
    - name: tooleasy
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: tooleasy-config
```

Tool IDs are the page URL without `.html` — open any tool and look at the URL (e.g., `edit-pdf`, `merge-pdf`, `compress-pdf`). Disabled tools are hidden from the homepage, search, shortcuts, workflow builder, and direct URL access. See the [Docker guide](/self-hosting/docker#disabling-specific-tools) for the full list of options.
