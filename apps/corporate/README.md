# Employment Networks Corporate Site

The marketing website for Employment Networks, showcasing the **Splits** recruiting platform and **Applicant** candidate portal.

**Domain**: employment-networks.com

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: DaisyUI 5.5.8 + Tailwind CSS 4.1.17
- **React**: 19.2.1
- **TypeScript**: 5.9.3

## Theme

Uses the shared `splits-light` and `splits-dark` themes defined in `/src/app/themes/`, matching the design system across all Employment Networks properties (Portal and Candidate apps).

## Development

```bash
# Install dependencies (from monorepo root)
pnpm install

# Run dev server
pnpm --filter @splits-network/corporate dev
# Runs on http://localhost:3102

# Build for production
pnpm --filter @splits-network/corporate build

# Start production server locally
pnpm --filter @splits-network/corporate start
```

## Structure

```
src/
├── app/
│   ├── layout.tsx         # Root layout with theme setup
│   ├── page.tsx           # Homepage (marketing)
│   ├── globals.css        # Global styles + DaisyUI config
│   └── themes/
│       ├── light.css      # Splits light theme
│       └── dark.css       # Splits dark theme
└── ...
```

## Deployment

### Docker Build

The corporate site follows the same multi-stage build pattern as the portal and candidate apps:

```bash
# From monorepo root
docker build -f apps/corporate/Dockerfile -t corporate:latest .

# Run container
docker run -p 3102:3102 corporate:latest
```

### Kubernetes Deployment

Kubernetes manifests are located in `infra/k8s/corporate/`:

```bash
# Apply deployment
kubectl apply -f infra/k8s/corporate/deployment.yaml

# Check status
kubectl get pods -n splits-network -l app=corporate
kubectl get svc -n splits-network -l app=corporate
```

### Ingress Configuration

The corporate site is configured in `infra/k8s/ingress.yaml` with routes for:
- `employment-networks.com`
- `www.employment-networks.com`

Both domains route to the corporate service with TLS termination via cert-manager.

### Environment Variables

The corporate site requires minimal configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public URL of the site | `https://employment-networks.com` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `3102` |

**No secrets required** - this is a public marketing site with no authentication or backend integration.

### CI/CD

The corporate site follows the same deployment pipeline as other frontend apps:

1. Build Docker image with tag
2. Push to Azure Container Registry (ACR)
3. Update Kubernetes deployment with new image tag
4. Apply via `kubectl`

## Purpose

This is a **pure marketing site** with:
- ✅ Product showcase (Splits & Applicant)
- ✅ Company information
- ✅ Contact information
- ✅ Links to platform logins

This site has:
- ❌ No authentication
- ❌ No user accounts
- ❌ No payment processing
- ❌ No backend logic

All interactive features are handled by the Splits Platform and Applicant Portal.
