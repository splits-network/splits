# Troubleshooting Identity Service Crashloop

If the identity service (or other services) are crashlooping during deployment, follow these steps to diagnose and fix the issue.

## Quick Checks

### 1. Verify Kubernetes Secrets Exist

```bash
# Check that all required secrets are created
kubectl get secrets -n splits-network

# Should see:
# - supabase-secrets
# - clerk-secrets
# - stripe-secrets
# - etc.

# Verify secret contents (test in namespace)
kubectl get secret supabase-secrets -n splits-network -o jsonpath='{.data.supabase-url}' | base64 -d
```

### 2. Check Pod Logs

```bash
# Get the latest pod for identity-service
IDENTITY_POD=$(kubectl get pods -n splits-network -l app=identity-service -o jsonpath='{.items[-1].metadata.name}')

# Check the logs
kubectl logs $IDENTITY_POD -n splits-network --tail=100

# For more detailed error output
kubectl logs $IDENTITY_POD -n splits-network --previous  # View previous crashed container logs
```

### 3. Check Pod Status

```bash
# Get detailed pod information
kubectl describe pod $IDENTITY_POD -n splits-network

# Check the Events section for failure reasons
# Common patterns:
# - CrashLoopBackOff: Container exiting immediately
# - ImagePullBackOff: Docker image not found
# - Pending: Waiting for resources/node
# - Failed Health Check: Liveness probe timeout
```

### 4. Check Service Dependencies

```bash
# Verify RabbitMQ is running
kubectl get pods -n splits-network -l app=rabbitmq

# Verify Redis is running
kubectl get pods -n splits-network -l app=redis

# Check connectivity from a test pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- \
  sh -c "curl -v http://rabbitmq:5672 2>&1 | head -20"
```

## Common Issues and Solutions

### Issue: Database Connection Failed

**Symptoms:**

```
Error: connect ECONNREFUSED supabase-host:5432
Database health check failed
```

**Solution:**

1. Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are correct
2. Check that the Supabase instance is accessible from the cluster
3. Verify network policies aren't blocking access

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql -h SUPABASE_HOST -U postgres -d postgres -c "SELECT 1"
```

### Issue: Missing Clerk Webhook Secret

**Symptoms:**

```
Error: Cannot read property 'splits-clerk-webhook-secret' of undefined
```

**Solution:**

```bash
# Create missing clerk webhook secret
kubectl create secret generic clerk-secrets \
  --from-literal=splits-clerk-webhook-secret="your-webhook-secret" \
  -n splits-network --dry-run=client -o yaml | kubectl apply -f -
```

### Issue: Health Check Timeout

**Symptoms:**

```
Readiness probe failed: HTTP probe failed with statuscode: 503
Liveness probe failed after 3 attempts
```

**Solutions:**

1. Increase initialDelaySeconds in deployment if service startup is slow:

    ```yaml
    livenessProbe:
        initialDelaySeconds: 60 # Increase from 30
        periodSeconds: 10
    ```

2. Check if database is accessible:
    ```bash
    kubectl exec $IDENTITY_POD -n splits-network -- \
      curl -v http://localhost:3001/health
    ```

### Issue: ImagePullBackOff

**Symptoms:**

```
Failed to pull image: rpc error: code = Unknown desc = Error response from daemon
```

**Solutions:**

1. Verify ACR login:

    ```bash
    az acr login --name myacr
    ```

2. Check image exists:
    ```bash
    az acr repository show --name myacr --repository identity-service
    ```

## Manual Secret Setup

If the workflow wasn't able to create secrets, create them manually:

```bash
# Source your .env file
export $(cat .env | grep -v '^#' | xargs)

# Create all secrets
bash infra/k8s/setup-secrets.sh splits-network
```

## Deployment Recovery

If services are stuck in crashloop:

### 1. Restart the deployment

```bash
kubectl rollout restart deployment/identity-service -n splits-network

# Monitor the rollout
kubectl rollout status deployment/identity-service -n splits-network --timeout=5m
```

### 2. Scale down unhealthy replicas

```bash
# Scale to 0 to stop crashlooping
kubectl scale deployment identity-service -n splits-network --replicas=0

# Check logs of failed pods before they're deleted
kubectl get pods -n splits-network -l app=identity-service

# Once issues are fixed, scale back up
kubectl scale deployment identity-service -n splits-network --replicas=2
```

### 3. Check recent events

```bash
# Get events for the namespace
kubectl get events -n splits-network --sort-by='.lastTimestamp' | tail -20
```

## Debugging with Port-Forward

```bash
# Forward local port to service pod
kubectl port-forward svc/identity-service 3001:3001 -n splits-network &

# Test the health endpoint
curl http://localhost:3001/health | jq .

# Hit the API endpoint
curl http://localhost:3001/api/v2/users | jq .
```

## If All Else Fails

Reset and redeploy:

```bash
# Delete the entire namespace and redeploy
kubectl delete namespace splits-network

# Then re-run the deploy workflow or manually apply manifests
```
