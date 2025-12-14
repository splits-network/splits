# Kubernetes Deployment Guide

This guide covers deploying the Splits Network platform to a Kubernetes cluster (Azure AKS or any K8s).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Cluster Setup](#cluster-setup)
3. [Secrets Configuration](#secrets-configuration)
4. [Infrastructure Services](#infrastructure-services)
5. [Application Deployment](#application-deployment)
6. [Ingress & TLS](#ingress--tls)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)
9. [CI/CD Integration](#cicd-integration)

---

## Prerequisites

### Required Tools

- `kubectl` (v1.28+) - [Install](https://kubernetes.io/docs/tasks/tools/)
- `helm` (v3.12+) - [Install](https://helm.sh/docs/intro/install/)
- Azure CLI (`az`) - [Install](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Docker - [Install](https://docs.docker.com/get-docker/)

### Required Services

- **Azure Container Registry (ACR)** or other container registry
- **Kubernetes Cluster** (AKS recommended, but any K8s works)
- **Supabase** project for database
- **Clerk** tenant for authentication
- **Stripe** account for billing
- **Resend** account for email

### Verify Prerequisites

```bash
# Check kubectl
kubectl version --client

# Check helm
helm version

# Check Azure CLI (if using AKS)
az version

# Check Docker
docker --version
```

---

## Cluster Setup

### Option A: Azure AKS

#### 1. Create Resource Group

```bash
az group create \
  --name splits-network-rg \
  --location eastus
```

#### 2. Create AKS Cluster

```bash
az aks create \
  --resource-group splits-network-rg \
  --name splits-network-aks \
  --node-count 3 \
  --node-vm-size Standard_D2s_v3 \
  --enable-managed-identity \
  --generate-ssh-keys
```

#### 3. Get Credentials

```bash
az aks get-credentials \
  --resource-group splits-network-rg \
  --name splits-network-aks
```

#### 4. Create Container Registry

```bash
az acr create \
  --resource-group splits-network-rg \
  --name splitsnetworkacr \
  --sku Basic

# Attach ACR to AKS
az aks update \
  --resource-group splits-network-rg \
  --name splits-network-aks \
  --attach-acr splitsnetworkacr
```

### Option B: Other Kubernetes Providers

For GKE, EKS, or self-hosted K8s, follow your provider's setup guide, then ensure:

1. `kubectl` is configured to access the cluster
2. Container registry is accessible from cluster
3. Cluster has sufficient resources (3+ nodes, 2GB+ RAM per node)

---

## Secrets Configuration

### 1. Create Namespace

```bash
kubectl create namespace splits-network
```

### 2. Create Supabase Secret

```bash
kubectl create secret generic supabase-secrets \
  --from-literal=supabase-url=https://YOUR-PROJECT.supabase.co \
  --from-literal=supabase-service-role-key=YOUR-SERVICE-ROLE-KEY \
  --namespace=splits-network
```

### 3. Create Clerk Secret

```bash
kubectl create secret generic clerk-secrets \
  --from-literal=clerk-publishable-key=pk_live_xxxxx \
  --from-literal=clerk-secret-key=sk_live_xxxxx \
  --from-literal=clerk-webhook-secret=whsec_xxxxx \
  --namespace=splits-network
```

### 4. Create Stripe Secret

```bash
kubectl create secret generic stripe-secrets \
  --from-literal=stripe-secret-key=sk_live_xxxxx \
  --from-literal=stripe-publishable-key=pk_live_xxxxx \
  --from-literal=stripe-webhook-secret=whsec_xxxxx \
  --namespace=splits-network
```

### 5. Create Resend Secret

```bash
kubectl create secret generic resend-secrets \
  --from-literal=resend-api-key=re_xxxxx \
  --namespace=splits-network
```

### 6. Create Database Connection Secret

```bash
kubectl create secret generic database-secrets \
  --from-literal=database-url=postgresql://postgres:PASSWORD@db.YOUR-PROJECT.supabase.co:5432/postgres \
  --namespace=splits-network
```

### Verify Secrets

```bash
kubectl get secrets -n splits-network
```

---

## Infrastructure Services

### 1. Deploy Redis

```bash
kubectl apply -f infra/k8s/redis/ --namespace=splits-network
```

**Wait for Redis to be ready:**

```bash
kubectl rollout status deployment/redis --timeout=120s --namespace=splits-network
```

### 2. Deploy RabbitMQ

```bash
kubectl apply -f infra/k8s/rabbitmq/ --namespace=splits-network
```

**Wait for RabbitMQ to be ready:**

```bash
kubectl rollout status deployment/rabbitmq --timeout=120s --namespace=splits-network
```

### Verify Infrastructure

```bash
kubectl get pods -n splits-network

# You should see:
# redis-xxxx         1/1   Running
# rabbitmq-xxxx      1/1   Running
```

---

## Application Deployment

### 1. Build and Push Images

#### Option A: Local Build

```bash
# Set variables
export ACR_LOGIN_SERVER=splitsnetworkacr.azurecr.io
export VERSION=$(cat VERSION)

# Login to ACR
az acr login --name splitsnetworkacr

# Build and push each service
services=("api-gateway" "identity-service" "ats-service" "network-service" "billing-service" "notification-service")

for service in "${services[@]}"; do
  docker build \
    -f services/$service/Dockerfile \
    -t $ACR_LOGIN_SERVER/$service:$VERSION \
    --target production \
    .
  
  docker push $ACR_LOGIN_SERVER/$service:$VERSION
done

# Build and push portal
docker build \
  -f apps/portal/Dockerfile \
  -t $ACR_LOGIN_SERVER/portal:$VERSION \
  --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.splits.network/api \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$CLERK_PUBLISHABLE_KEY \
  .

docker push $ACR_LOGIN_SERVER/portal:$VERSION
```

#### Option B: GitHub Actions (Recommended)

Push to `main` branch to trigger automated build and deploy:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

### 2. Deploy Backend Services

Deploy in order to respect dependencies:

```bash
# Identity Service (no dependencies)
kubectl apply -f infra/k8s/identity-service/ --namespace=splits-network
kubectl rollout status deployment/identity-service --timeout=180s --namespace=splits-network

# ATS Service (depends on RabbitMQ)
kubectl apply -f infra/k8s/ats-service/ --namespace=splits-network
kubectl rollout status deployment/ats-service --timeout=180s --namespace=splits-network

# Network Service
kubectl apply -f infra/k8s/network-service/ --namespace=splits-network
kubectl rollout status deployment/network-service --timeout=180s --namespace=splits-network

# Billing Service
kubectl apply -f infra/k8s/billing-service/ --namespace=splits-network
kubectl rollout status deployment/billing-service --timeout=180s --namespace=splits-network

# Notification Service (depends on RabbitMQ)
kubectl apply -f infra/k8s/notification-service/ --namespace=splits-network
kubectl rollout status deployment/notification-service --timeout=180s --namespace=splits-network
```

### 3. Deploy API Gateway

```bash
kubectl apply -f infra/k8s/api-gateway/ --namespace=splits-network
kubectl rollout status deployment/api-gateway --timeout=180s --namespace=splits-network
```

### 4. Deploy Portal

```bash
kubectl apply -f infra/k8s/portal/ --namespace=splits-network
kubectl rollout status deployment/portal --timeout=180s --namespace=splits-network
```

### Verify All Services

```bash
kubectl get pods -n splits-network

# All pods should be Running
kubectl get services -n splits-network

# You should see ClusterIP services for each microservice
```

---

## Ingress & TLS

### 1. Install cert-manager

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

Wait for cert-manager to be ready:

```bash
kubectl wait --for=condition=Ready pods --all -n cert-manager --timeout=180s
```

### 2. Create ClusterIssuer

```bash
kubectl apply -f infra/k8s/cert-manager/cluster-issuer.yaml
```

### 3. Deploy Ingress

```bash
kubectl apply -f infra/k8s/ingress.yaml --namespace=splits-network
```

### 4. Get External IP

```bash
kubectl get ingress -n splits-network

# Note the EXTERNAL-IP
```

### 5. Configure DNS

Point your domain DNS to the ingress external IP:

```
A record: splits.network → <EXTERNAL-IP>
A record: api.splits.network → <EXTERNAL-IP>
```

### 6. Verify TLS

Once DNS propagates (5-30 minutes):

```bash
# Check certificate
kubectl get certificate -n splits-network

# Should show Ready: True
```

Visit https://splits.network - you should see a valid TLS certificate.

---

## Monitoring & Logging

### Option A: Azure Monitor (AKS)

Enable Container Insights:

```bash
az aks enable-addons \
  --resource-group splits-network-rg \
  --name splits-network-aks \
  --addons monitoring
```

View logs in Azure Portal:
- Go to AKS cluster
- Select "Logs" in left menu
- Query container logs

### Option B: Prometheus + Grafana

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin

# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

Visit http://localhost:3000 (admin/admin)

### View Application Logs

```bash
# Tail logs for a service
kubectl logs -f deployment/api-gateway -n splits-network

# View all recent logs
kubectl logs --tail=100 -l app=api-gateway -n splits-network

# Follow logs from all pods in namespace
kubectl logs -f -l app.kubernetes.io/name=splits-network -n splits-network
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n splits-network

# Describe pod to see events
kubectl describe pod <pod-name> -n splits-network

# Check logs
kubectl logs <pod-name> -n splits-network

# Check if previous pod crashed
kubectl logs <pod-name> -n splits-network --previous
```

Common issues:
- **ImagePullBackOff**: Check ACR authentication, image name/tag
- **CrashLoopBackOff**: Check environment variables, secrets, dependencies
- **Pending**: Check node resources, storage claims

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n splits-network

# Test service from within cluster
kubectl run -it --rm debug --image=busybox --restart=Never -- sh
# Inside pod:
wget -O- http://api-gateway.splits-network.svc.cluster.local:3000/health
```

### Database Connection Issues

```bash
# Verify database secret
kubectl get secret database-secrets -n splits-network -o jsonpath='{.data.database-url}' | base64 -d

# Check if service can reach Supabase
kubectl run -it --rm debug --image=postgres --restart=Never -- psql $DATABASE_URL -c "SELECT 1"
```

### Certificate Not Issuing

```bash
# Check certificate status
kubectl describe certificate splits-network-tls -n splits-network

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager

# Check certificate request
kubectl describe certificaterequest -n splits-network
```

Common issues:
- DNS not propagated yet (wait 5-30 min)
- ClusterIssuer not ready
- Rate limit hit (Let's Encrypt has limits)

### Memory/CPU Issues

```bash
# Check resource usage
kubectl top pods -n splits-network
kubectl top nodes

# Describe node to see pressure
kubectl describe node <node-name>

# Check resource requests vs limits
kubectl describe pod <pod-name> -n splits-network | grep -A 5 "Limits"
```

---

## CI/CD Integration

### GitHub Actions Setup

The repository includes `.github/workflows/deploy-aks.yml` for automated deployments.

#### 1. Configure GitHub Secrets

In your GitHub repository, go to Settings > Secrets and add:

- `AZURE_CREDENTIALS` - Azure service principal JSON
- `ACR_NAME` - Container registry name (e.g., `splitsnetworkacr`)
- `ACR_LOGIN_SERVER` - Registry server (e.g., `splitsnetworkacr.azurecr.io`)
- `AKS_RESOURCE_GROUP` - Resource group name
- `AKS_CLUSTER_NAME` - Cluster name
- `CLERK_PUBLISHABLE_KEY` - Clerk public key
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `RESEND_API_KEY` - Resend API key

#### 2. Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name splits-network-sp \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/splits-network-rg \
  --sdk-auth

# Copy the JSON output to AZURE_CREDENTIALS secret
```

#### 3. Trigger Deployment

```bash
# Push to main branch
git push origin main

# Or manually trigger
gh workflow run deploy-aks.yml
```

#### 4. Monitor Deployment

```bash
# View workflow in GitHub UI
# Or use GitHub CLI:
gh run watch
```

---

## Scaling

### Horizontal Pod Autoscaling

```bash
# Enable HPA for a deployment
kubectl autoscale deployment api-gateway \
  --cpu-percent=70 \
  --min=2 \
  --max=10 \
  -n splits-network

# Check HPA status
kubectl get hpa -n splits-network
```

### Manual Scaling

```bash
# Scale a deployment
kubectl scale deployment api-gateway --replicas=3 -n splits-network

# Scale all services
for service in api-gateway identity-service ats-service network-service billing-service notification-service; do
  kubectl scale deployment $service --replicas=3 -n splits-network
done
```

---

## Maintenance

### Rolling Updates

```bash
# Update image tag
kubectl set image deployment/api-gateway api-gateway=splitsnetworkacr.azurecr.io/api-gateway:v0.2.0 -n splits-network

# Rollout restart (reload env vars, etc.)
kubectl rollout restart deployment/api-gateway -n splits-network

# Check rollout status
kubectl rollout status deployment/api-gateway -n splits-network

# Rollback if needed
kubectl rollout undo deployment/api-gateway -n splits-network
```

### Database Migrations

```bash
# Run migrations from local machine
psql $DATABASE_URL -f infra/migrations/004_new_migration.sql

# Or create a Job in K8s
kubectl apply -f infra/k8s/jobs/run-migration.yaml -n splits-network
kubectl logs job/run-migration -n splits-network
```

### Backup & Restore

Supabase handles automatic backups. To restore:

1. Go to Supabase Dashboard > Database > Backups
2. Select backup to restore
3. Restore to new project or existing

For manual backup:

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20250114.sql
```

---

## Security Best Practices

1. **Network Policies**: Restrict pod-to-pod communication
2. **RBAC**: Use least-privilege service accounts
3. **Secrets**: Rotate secrets regularly, use external secret managers (Azure Key Vault, etc.)
4. **Image Scanning**: Scan images for vulnerabilities before deploy
5. **TLS**: Enforce HTTPS only, use strong TLS versions
6. **Audit Logs**: Enable K8s audit logging
7. **Resource Limits**: Set memory/CPU limits on all pods

---

## Health Checks

All services expose `/health` endpoints. Configure liveness and readiness probes in deployment manifests:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Azure AKS Documentation](https://docs.microsoft.com/en-us/azure/aks/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

**Last Updated:** December 14, 2025  
**Maintained By:** Platform Team
