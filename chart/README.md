# ToolEasy Helm Chart

Deploys **ToolEasy** as a **single NGINX container** serving the static frontend.

## Quickstart

### Option 1: Port-forward (testing)

```bash
helm install tooleasy ./chart
kubectl port-forward deploy/tooleasy 8080:8080
# open http://127.0.0.1:8080
```

### Option 2: Ingress

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: tooleasy.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Option 3: Gateway API (Gateway + HTTPRoute)

```yaml
gateway:
  enabled: true
  gatewayClassName: 'cloudflare' # or your gateway class

httpRoute:
  enabled: true
  hostnames:
    - pdfs.example.com
```

**Note:** Both Gateway and HTTPRoute default to the release namespace. Omit `namespace` fields to use the release namespace automatically.

If you have an existing Gateway, set `gateway.enabled=false` and configure `httpRoute.parentRefs`:

```yaml
gateway:
  enabled: false

httpRoute:
  enabled: true
  parentRefs:
    - name: existing-gateway
      namespace: gateway-namespace
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## Configuration

### Image

- **`image.repository`**: local image name (default: `tooleasy`)
- **`image.tag`**: image tag (default: `latest`)
- **`image.pullPolicy`**: default `IfNotPresent`

### Ports

- **`containerPort`**: container listen port (**8080** for the ToolEasy nginx image)
- **`service.port`**: Service port exposed in-cluster (default **80**)

### Environment Variables

```yaml
env:
  - name: DISABLE_IPV6
    value: 'true'
```

## Deploy

Build the image on your cluster nodes or in CI (`docker build -t tooleasy:latest .`), then:

```bash
docker build -t tooleasy:latest .
helm upgrade --install tooleasy ./chart
```
