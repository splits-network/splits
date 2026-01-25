# Staging Environment Setup Guide

This document outlines the steps to complete the staging environment setup for Splits Network.

## Overview

The staging environment is designed to be **as identical to production as possible**. The only differences are:
- **Branch**: `staging` (triggers `deploy-staging.yml`)
- **AKS Cluster**: Separate staging cluster (completely isolated from production)
- **ACR**: Separate staging container registry
- **Secrets**: Staging-specific secrets (Clerk, Stripe test mode, etc.)
- **Ingress hosts**: Staging domains instead of production domains

**Same as production:**
- **Namespace**: `splits-network` (same name in different cluster)
- **Deployment YAMLs**: Identical (only ACR server and image tag differ via envsubst)
- **Infrastructure**: Same nginx-ingress, cert-manager, Redis, RabbitMQ setup

## Domains

| App | Production | Staging |
|-----|------------|---------|
| Portal | `splits.network` | `staging.splits.network` |
| API Gateway | `api.splits.network` | `api.staging.splits.network` |
| Candidate | `applicant.network` | `staging.applicant.network` |
| Corporate | `employment-networks.com` | `staging.employment-networks.com` |

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Staging Environment                            │
├──────────────────────────────────────────────────────────────────┤
│  Branch: staging → Workflow: deploy-staging.yml                   │
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │  Staging    │    │  Staging    │    │  Staging    │          │
│  │    ACR      │───▶│    AKS      │◀───│  Supabase   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                            │                                      │
│                     splits-network                                │
│                     (same namespace name, different cluster)      │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   Production Environment                          │
├──────────────────────────────────────────────────────────────────┤
│  Branch: main → Workflow: deploy-aks.yml                          │
│                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │ Production  │    │ Production  │    │ Production  │          │
│  │    ACR      │───▶│    AKS      │◀───│  Supabase   │          │
│  └─────────────┘    └─────────────┘    └─────────────┘          │
│                            │                                      │
│                     splits-network                                │
│                     (namespace)                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Infrastructure Files

| Purpose | Production | Staging |
|---------|------------|---------|
| Ingress | `infra/k8s/ingress.yaml` | `infra/k8s/staging-ingress.yaml` |
| All other K8s resources | `infra/k8s/<service>/` | Same (reused) |

The **only** infrastructure file that differs between environments is the ingress file, which specifies different hostnames.

## Cluster Prerequisites

The staging AKS cluster requires nginx-ingress controller and cert-manager to be installed **before** the first deployment. These are cluster-level components, not installed by the workflow.

### nginx-ingress Controller
- Install nginx-ingress controller on the staging AKS cluster (same method as production)
- Creates Azure Load Balancer automatically

### cert-manager
- Install cert-manager on the staging AKS cluster (same method as production)
- The workflow applies `infra/k8s/cert-manager/cluster-issuer.yaml` for Let's Encrypt

## GitHub Secrets Required

Add these secrets to your GitHub repository settings:

### Azure/AKS Staging Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AZURE_CREDENTIALS_STAGING` | Azure service principal credentials (JSON) | `{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}` |
| `ACR_NAME_STAGING` | Staging ACR name | `splitsnetworkstaging` |
| `ACR_LOGIN_SERVER_STAGING` | Staging ACR login server | `splitsnetworkstaging.azurecr.io` |
| `AKS_RESOURCE_GROUP_STAGING` | Staging AKS resource group | `splits-staging-rg` |
| `AKS_CLUSTER_NAME_STAGING` | Staging AKS cluster name | `splits-staging-aks` |

### Supabase Staging Secrets

| Secret Name | Description | Notes |
|------------|-------------|-------|
| `SUPABASE_URL_STAGING` | Staging Supabase URL | Can share with prod or separate |
| `SUPABASE_ANON_KEY_STAGING` | Staging anon key | |
| `SUPABASE_SERVICE_ROLE_KEY_STAGING` | Staging service role key | |

### Clerk Staging Secrets (Recommended: Separate Application)

| Secret Name | Description | Notes |
|------------|-------------|-------|
| `CLERK_PUBLISHABLE_KEY_STAGING` | Staging Clerk publishable key | Create separate Clerk app |
| `CLERK_SECRET_KEY_STAGING` | Staging Clerk secret key | |
| `CLERK_JWKS_URL_STAGING` | Staging Clerk JWKS URL | |

### Stripe Staging Secrets (Recommended: Test Mode)

| Secret Name | Description | Notes |
|------------|-------------|-------|
| `STRIPE_SECRET_KEY_STAGING` | Stripe test secret key | Use `sk_test_...` keys |
| `STRIPE_WEBHOOK_SECRET_STAGING` | Stripe test webhook secret | |
| `STRIPE_PUBLISHABLE_KEY_STAGING` | Stripe test publishable key | Use `pk_test_...` keys |

### Other Staging Secrets

| Secret Name | Description | Notes |
|------------|-------------|-------|
| `RESEND_API_KEY_STAGING` | Resend API key for staging | Can share with prod or use separate |
| `INTERNAL_SERVICE_KEY_STAGING` | Internal service auth key | Generate unique for staging |

## DNS Configuration

Add these DNS records pointing to your staging AKS cluster's ingress IP:

| Record Type | Name | Value |
|-------------|------|-------|
| A | `staging.splits.network` | `<staging-ingress-ip>` |
| A | `api.staging.splits.network` | `<staging-ingress-ip>` |
| A | `staging.applicant.network` | `<staging-ingress-ip>` |
| A | `staging.employment-networks.com` | `<staging-ingress-ip>` |

## Infrastructure Setup Checklist

### 1. Azure Resources
- [ ] Create staging resource group
- [ ] Create staging AKS cluster
- [ ] Create staging ACR
- [ ] Configure AKS to pull from staging ACR
- [ ] Install NGINX Ingress Controller on staging cluster
- [ ] Install cert-manager on staging cluster

### 2. GitHub Configuration
- [ ] Add all staging secrets to repository
- [ ] Create `staging` branch from `main`
- [ ] Verify workflow triggers on staging branch

### 3. External Services
- [ ] Create staging Clerk application (or configure existing for staging domains)
- [ ] Configure Stripe test mode webhooks for staging domains
- [ ] Create staging Supabase project (or use branch database)
- [ ] Update Resend for staging email domains (optional)

### 4. DNS & SSL
- [ ] Add DNS records for staging domains
- [ ] Verify Let's Encrypt certificates are issued

## Deployment Workflow

### Automatic Deployment
Push to `staging` branch triggers automatic deployment:
```bash
git checkout staging
git merge feature/my-feature
git push origin staging
```

### Manual Deployment
Trigger via GitHub Actions UI:
1. Go to Actions tab
2. Select "Deploy to Staging AKS"
3. Click "Run workflow"

## Resource Differences: Staging vs Production

| Resource | Production | Staging |
|----------|------------|---------|
| Replicas (frontend) | 3 | 1 |
| Replicas (backend) | 2 | 1 |
| Replicas (infra) | 1 | 1 |
| CPU requests | 100-200m | 100m |
| Memory requests | 128-256Mi | 128Mi |
| CPU limits | 500-1000m | 500m |
| Memory limits | 512Mi-1Gi | 512Mi |

## Monitoring & Debugging

### View staging logs
```bash
# Get credentials
az aks get-credentials --resource-group <staging-rg> --name <staging-cluster>

# View logs
kubectl logs -f deployment/api-gateway -n splits-network
kubectl logs -f deployment/portal -n splits-network
```

### Check deployment status
```bash
kubectl get all -n splits-network
kubectl get ingress -n splits-network
```

### Describe resources for debugging
```bash
kubectl describe deployment/api-gateway -n splits-network
kubectl describe pod -l app=api-gateway -n splits-network
```

## Rollback

To rollback a staging deployment:
```bash
# View revision history
kubectl rollout history deployment/api-gateway -n splits-network

# Rollback to previous revision
kubectl rollout undo deployment/api-gateway -n splits-network-staging

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n splits-network-staging
```

## Cost Optimization

Staging environment is configured with reduced resources to minimize costs:
- Single replica for all services
- Lower CPU/memory limits
- Consider scaling down during off-hours using:
  - Azure AKS cluster auto-stop
  - Kubernetes CronJobs to scale down

```bash
# Manual scale down (after hours)
kubectl scale deployment --all --replicas=0 -n splits-network-staging

# Manual scale up (morning)
kubectl scale deployment --all --replicas=1 -n splits-network-staging
```

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod -l app=<service-name> -n splits-network-staging
kubectl logs -l app=<service-name> -n splits-network-staging --previous
```

### Ingress not working
```bash
kubectl get ingress -n splits-network-staging
kubectl describe ingress splits-network-ingress -n splits-network-staging
```

### Certificate issues
```bash
kubectl get certificates -n splits-network-staging
kubectl describe certificate splits-network-staging-tls -n splits-network-staging
```
