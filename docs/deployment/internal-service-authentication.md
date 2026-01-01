# Internal Service Authentication

This document describes the internal service-to-service authentication mechanism used for trusted backend services to communicate without user context.

## Overview

Services like `automation-service` and `notification-service` need to call other backend services (e.g., `ai-service`) in automated workflows where no user session exists. Internal service authentication allows these trusted services to bypass user authentication using a shared secret key.

## Architecture

```
┌─────────────────────┐         x-internal-service-key          ┌─────────────┐
│ automation-service  │ ──────────────────────────────────────> │ ai-service  │
│                     │         (trusted internal call)          │             │
└─────────────────────┘                                          └─────────────┘
         │                                                              │
         │                                                              │
         │ Uses INTERNAL_SERVICE_KEY env var                           │ Validates key
         │ Sends header: x-internal-service-key                        │ Allows bypass of user auth
```

## How It Works

### 1. Service Key Configuration

Both the calling service and the receiving service must have the same `INTERNAL_SERVICE_KEY` environment variable configured.

**Calling Service (automation-service):**
```typescript
const internalServiceKey = process.env.INTERNAL_SERVICE_KEY;

const response = await fetch(`${aiServiceUrl}/v2/ai-reviews`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'x-internal-service-key': internalServiceKey,
    },
    body: JSON.stringify({ application_id }),
});
```

**Receiving Service (ai-service):**
```typescript
export function validateInternalService(request: FastifyRequest): boolean {
    const serviceKey = request.headers['x-internal-service-key'] as string | undefined;
    const expectedKey = process.env.INTERNAL_SERVICE_KEY;
    
    if (!expectedKey) {
        return false; // If not configured, don't allow internal auth
    }
    
    return serviceKey === expectedKey;
}

export function requireUserContext(clerkUserId: string | undefined, reply: FastifyReply, request?: FastifyRequest) {
    // Allow internal services to bypass user auth
    if (request && validateInternalService(request)) {
        return true;
    }
    
    // Otherwise require user auth
    if (!clerkUserId) {
        reply.status(401).send({
            error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
        });
        return false;
    }
    return true;
}
```

### 2. Header Format

Internal service calls include the header:
```
x-internal-service-key: <secret-key-value>
```

This header is checked before requiring user authentication (`x-clerk-user-id`).

### 3. Security Model

- **Shared Secret**: All trusted internal services share the same `INTERNAL_SERVICE_KEY`
- **Environment-Based**: Key is configured via environment variables, never hardcoded
- **Production-Only Check**: If `INTERNAL_SERVICE_KEY` is not set, internal auth is disabled
- **Header Validation**: Exact match required between sent and expected key

## Configuration

### Local Development (docker-compose.yml)

```yaml
automation-service:
  environment:
    INTERNAL_SERVICE_KEY: ${INTERNAL_SERVICE_KEY:-dev_internal_service_key_change_in_production}

ai-service:
  environment:
    INTERNAL_SERVICE_KEY: ${INTERNAL_SERVICE_KEY:-dev_internal_service_key_change_in_production}
```

**Default Development Key:**
```
dev_internal_service_key_change_in_production
```

⚠️ **This default key is ONLY for local development. Change it in production.**

### Production (Kubernetes)

#### 1. Create Kubernetes Secret

First, generate a strong random key:

```bash
# Generate a secure random key (32 bytes, base64 encoded)
openssl rand -base64 32
```

Example output:
```
dJ8Kx2mP9vQ4nR7sT1wY6zA3bC5eF8gH
```

#### 2. Add to GitHub Secrets

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `INTERNAL_SERVICE_KEY`
4. Value: `<your-generated-key>`
5. Click **Add secret**

#### 3. Update Deployment Workflow

The deployment workflow (`.github/workflows/deploy-aks.yml`) should create the Kubernetes secret:

```yaml
- name: Create Internal Service Secret
  run: |
    kubectl create secret generic internal-service-secrets \
      --from-literal=internal-service-key=${{ secrets.INTERNAL_SERVICE_KEY }} \
      --namespace=splits-network \
      --dry-run=client -o yaml | kubectl apply -f -
```

#### 4. Reference in Deployments

Each service that needs internal auth references the secret:

**automation-service/deployment.yaml:**
```yaml
env:
  - name: INTERNAL_SERVICE_KEY
    valueFrom:
      secretKeyRef:
        name: internal-service-secrets
        key: internal-service-key
```

**ai-service/deployment.yaml:**
```yaml
env:
  - name: INTERNAL_SERVICE_KEY
    valueFrom:
      secretKeyRef:
        name: internal-service-secrets
        key: internal-service-key
```

## Services Using Internal Auth

### Calling Services (Clients)
Services that make internal authenticated calls:
- ✅ `automation-service` → calls AI service for automated reviews
- ⚠️ `notification-service` (future) → may call other services for user lookups

### Receiving Services (Servers)
Services that accept internal authenticated calls:
- ✅ `ai-service` → accepts calls from automation service

## Security Considerations

### ✅ Good Practices
- Use a strong random key (32+ bytes)
- Store in Kubernetes Secrets, never in code
- Rotate key periodically (recommended: quarterly)
- Different keys per environment (dev/staging/prod)
- Validate key on every request
- Log internal service calls for auditing

### ⚠️ Risks to Avoid
- **Never commit keys to git**
- **Don't use default dev key in production**
- **Don't expose key in logs or error messages**
- **Don't share key outside trusted services**
- **Don't use the same key as other secrets** (e.g., Supabase service key)

### 🔐 Key Rotation Procedure

When rotating the internal service key:

1. Generate new key: `openssl rand -base64 32`
2. Update GitHub secret `INTERNAL_SERVICE_KEY`
3. Re-run deployment workflow to update Kubernetes secret
4. Services will pick up new key on next pod restart
5. Monitor logs for auth failures during transition

## Troubleshooting

### Error: "Missing x-clerk-user-id header"
**Cause**: Internal service is not sending `x-internal-service-key` header, or key is incorrect.

**Fix**:
1. Verify `INTERNAL_SERVICE_KEY` is set in environment
2. Check that header is being sent in fetch request
3. Verify key matches between services

### Error: "INTERNAL_SERVICE_KEY not configured"
**Cause**: Calling service doesn't have the environment variable set.

**Fix**:
1. Add `INTERNAL_SERVICE_KEY` to docker-compose.yml (dev)
2. Add to Kubernetes secret reference (prod)
3. Restart service

### Error: "HTTP 401: Unauthorized"
**Cause**: Key mismatch or receiving service rejecting internal auth.

**Fix**:
1. Check both services have same `INTERNAL_SERVICE_KEY` value
2. Verify receiving service is checking `validateInternalService()`
3. Check receiving service passes `request` parameter to `requireUserContext()`

## Testing

### Local Testing
```bash
# 1. Ensure both services have the key
docker-compose exec automation-service env | grep INTERNAL_SERVICE_KEY
docker-compose exec ai-service env | grep INTERNAL_SERVICE_KEY

# 2. Trigger an event that uses internal auth
# (e.g., submit application via candidate portal)

# 3. Check automation service logs
docker logs splits-automation-service --tail 50

# 4. Check AI service logs
docker logs splits-ai-service --tail 50
```

### Production Verification
```bash
# 1. Verify secret exists
kubectl get secret internal-service-secrets -n splits-network

# 2. Check secret has correct key
kubectl get secret internal-service-secrets -n splits-network -o jsonpath='{.data.internal-service-key}' | base64 -d

# 3. Verify pod has environment variable
kubectl exec -n splits-network deployment/automation-service -- env | grep INTERNAL_SERVICE_KEY
kubectl exec -n splits-network deployment/ai-service -- env | grep INTERNAL_SERVICE_KEY

# 4. Check logs for auth failures
kubectl logs -n splits-network deployment/automation-service --tail=50
kubectl logs -n splits-network deployment/ai-service --tail=50
```

## Related Documentation

- [User Authentication Guide](./user-authentication.md) - For user-facing auth (Clerk)
- [API Gateway RBAC](./api-gateway-rbac.md) - For role-based access control
- [Service Architecture](../splits-network-architecture.md) - Overall service design
- [Deployment Guide](../infra/README.md) - Kubernetes deployment procedures

## Future Enhancements

Potential improvements to internal service auth:

1. **Service-Specific Keys**: Each service pair could have unique keys
2. **JWT-Based Tokens**: Use signed tokens with expiration instead of static keys
3. **mTLS**: Mutual TLS for service-to-service encryption
4. **Service Mesh**: Integrate with Istio/Linkerd for automatic service auth
5. **Audit Logging**: Centralized logging of all internal service calls

---

**Last Updated**: January 1, 2026  
**Version**: 1.0  
**Owner**: Platform Team
