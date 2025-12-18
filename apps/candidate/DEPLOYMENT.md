# Candidate Website Deployment

## Overview
The candidate website is deployed at https://applicant.network and provides job seekers with access to:
- Browse open jobs
- Manage their profile
- Track applications
- Upload/manage documents

## Deployment Architecture

### Local Development
```bash
# From project root
pnpm install
pnpm --filter @splits-network/candidate dev
# Runs on http://localhost:3101
```

### Docker Compose
```bash
# From project root
docker-compose up -d candidate
# Accessible at http://localhost:3101
```

### Kubernetes Production

#### Prerequisites
- Kubernetes cluster configured
- Clerk secrets created in cluster
- DNS configured for applicant.network
- TLS certificate (via cert-manager)

#### Deployment
```bash
# Set environment variables
export ACR_SERVER=your-registry.azurecr.io
export IMAGE_TAG=v1.0.0

# Build and push image
docker build -t ${ACR_SERVER}/candidate:${IMAGE_TAG} -f apps/candidate/Dockerfile .
docker push ${ACR_SERVER}/candidate:${IMAGE_TAG}

# Deploy to Kubernetes
envsubst < infra/k8s/candidate/deployment.yaml | kubectl apply -f -
```

## Environment Variables

### Required
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key
- `NEXT_PUBLIC_API_URL` - API Gateway URL
- `NEXT_PUBLIC_APP_URL` - Application URL (https://applicant.network)

### Clerk Routes
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - `/dashboard`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - `/onboarding`

## Kubernetes Resources

### Deployment
- **Replicas**: 3 (for high availability)
- **Resources**: 
  - Requests: 200m CPU, 256Mi memory
  - Limits: 1000m CPU, 1Gi memory
- **Port**: 3101
- **Health Checks**: Liveness and readiness probes on `/`

### Service
- **Type**: LoadBalancer
- **Port**: 80 → 3101

### Ingress
- **Host**: applicant.network
- **TLS**: Enabled via Let's Encrypt
- **Backend**: candidate service

## CI/CD Pipeline

Add to `.github/workflows/deploy.yml`:

```yaml
build-candidate:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    - name: Build and push candidate
      run: |
        docker build -t ${ACR_SERVER}/candidate:${GITHUB_SHA} -f apps/candidate/Dockerfile .
        docker push ${ACR_SERVER}/candidate:${GITHUB_SHA}
    - name: Deploy to Kubernetes
      run: |
        export IMAGE_TAG=${GITHUB_SHA}
        envsubst < infra/k8s/candidate/deployment.yaml | kubectl apply -f -
```

## Monitoring

- Application logs available via `kubectl logs`
- Health status: `https://applicant.network/`
- Metrics via Kubernetes dashboard

## DNS Configuration

Ensure DNS A record or CNAME for `applicant.network` points to:
- Load balancer IP (in Kubernetes)
- Ingress controller external IP

## Scaling

```bash
# Scale horizontally
kubectl scale deployment candidate -n splits-network --replicas=5

# Auto-scaling (optional)
kubectl autoscale deployment candidate -n splits-network --min=3 --max=10 --cpu-percent=70
```
