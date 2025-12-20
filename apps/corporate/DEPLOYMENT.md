# Corporate Site Deployment Guide

This document outlines the deployment process for the Employment Networks corporate marketing site.

## Overview

The corporate site (`apps/corporate`) follows the same deployment architecture as the portal and candidate applications:

- **Multi-stage Docker build** with pnpm workspace support
- **Kubernetes deployment** with 3 replicas for high availability
- **Ingress routing** for employment-networks.com (with and without www)
- **TLS termination** via cert-manager and Let's Encrypt

## Prerequisites

- Access to Azure Container Registry (ACR)
- Kubernetes cluster access
- cert-manager installed in cluster
- nginx-ingress-controller configured

## Build & Deploy Process

### 1. Build Docker Image

From the monorepo root:

```bash
# Build the image
docker build -f apps/corporate/Dockerfile -t corporate:${VERSION} .

# Tag for ACR
docker tag corporate:${VERSION} ${ACR_SERVER}/corporate:${VERSION}

# Push to ACR
docker push ${ACR_SERVER}/corporate:${VERSION}
```

### 2. Deploy to Kubernetes

Update the deployment with the new image tag:

```bash
# Set environment variables
export ACR_SERVER="your-acr.azurecr.io"
export IMAGE_TAG="v1.0.0"

# Apply with substitution (or use envsubst/sed)
cat infra/k8s/corporate/deployment.yaml | \
  sed "s|\${ACR_SERVER}|${ACR_SERVER}|g" | \
  sed "s|\${IMAGE_TAG}|${IMAGE_TAG}|g" | \
  kubectl apply -f -

# Verify deployment
kubectl get pods -n splits-network -l app=corporate
kubectl get svc -n splits-network corporate
```

### 3. Verify Ingress

The corporate site ingress rules are defined in `infra/k8s/ingress.yaml`:

```bash
# Check ingress configuration
kubectl get ingress splits-network-ingress -n splits-network -o yaml

# Verify TLS certificate
kubectl get certificate splits-network-tls -n splits-network
```

Expected routes:
- `https://employment-networks.com` → corporate service
- `https://www.employment-networks.com` → corporate service

### 4. DNS Configuration

Ensure DNS A/CNAME records point to the ingress controller's external IP:

```bash
# Get ingress external IP
kubectl get svc -n ingress-nginx ingress-nginx-controller

# Configure DNS:
# employment-networks.com      A      <EXTERNAL-IP>
# www.employment-networks.com  CNAME  employment-networks.com
```

## Deployment Checklist

- [ ] Docker image built and pushed to ACR
- [ ] Deployment manifest updated with correct image tag
- [ ] Kubernetes deployment applied and pods running
- [ ] Service created and endpoints available
- [ ] Ingress rules configured for employment-networks.com
- [ ] TLS certificate issued by cert-manager
- [ ] DNS records pointing to ingress controller
- [ ] Site accessible via HTTPS with valid certificate

## Monitoring

Check deployment status:

```bash
# Pod status
kubectl get pods -n splits-network -l app=corporate

# Pod logs
kubectl logs -n splits-network -l app=corporate --tail=100

# Service endpoints
kubectl get endpoints -n splits-network corporate

# Ingress status
kubectl describe ingress splits-network-ingress -n splits-network
```

## Rollback

If a deployment fails, rollback to the previous version:

```bash
# Rollback to previous deployment
kubectl rollout undo deployment/corporate -n splits-network

# Check rollout status
kubectl rollout status deployment/corporate -n splits-network

# View revision history
kubectl rollout history deployment/corporate -n splits-network
```

## Environment Variables

The corporate site requires minimal configuration:

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Yes | HTTP server port | `3102` |
| `NEXT_PUBLIC_APP_URL` | No | Public URL | `https://employment-networks.com` |

**No secrets required** - this site has no authentication or API integrations.

## Differences from Portal/Candidate Apps

Unlike the portal and candidate apps, the corporate site:

- **No Clerk integration** - no authentication needed
- **No API gateway calls** - purely static content
- **No environment secrets** - all configuration is public
- **Simpler Dockerfile** - no workspace packages to copy
- **Minimal resources** - can run with lower CPU/memory limits

## Production Considerations

1. **CDN**: Consider placing behind Cloudflare or Azure CDN for:
   - Global distribution
   - DDoS protection
   - Additional caching

2. **SEO**: Add meta tags, sitemap.xml, robots.txt

3. **Analytics**: Consider adding analytics tracking (Google Analytics, Plausible, etc.)

4. **Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom, etc.)

5. **Performance**: 
   - Enable Next.js image optimization
   - Configure appropriate cache headers
   - Consider static export if no dynamic content needed

## Related Files

- Dockerfile: `apps/corporate/Dockerfile`
- Kubernetes deployment: `infra/k8s/corporate/deployment.yaml`
- Ingress configuration: `infra/k8s/ingress.yaml`
- Package config: `apps/corporate/package.json`
- Environment example: `apps/corporate/.env.example`
