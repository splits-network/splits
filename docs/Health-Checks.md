# Health Checks Implementation

## Overview

Health check endpoints have been added to all backend services to enable Kubernetes readiness and liveness probes, improving deployment reliability and monitoring.

## Endpoints

All services expose a `GET /health` endpoint that returns:

### Healthy Response (200 OK)
```json
{
  "status": "healthy",
  "service": "service-name",
  "timestamp": "2025-12-13T10:30:00.000Z"
}
```

### Unhealthy Response (503 Service Unavailable)
```json
{
  "status": "unhealthy",
  "service": "service-name",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "error": "Error description"
}
```

## Health Check Details by Service

### Identity Service (`/health`)
**Checks:**
- Database connectivity (simple query to `identity.users` table)

**Dependencies:**
- Supabase Postgres

---

### ATS Service (`/health`)
**Checks:**
- Database connectivity (simple query to `ats.jobs` table)
- RabbitMQ connection status

**Dependencies:**
- Supabase Postgres
- RabbitMQ

---

### Network Service (`/health`)
**Checks:**
- Database connectivity (simple query to `network.recruiters` table)

**Dependencies:**
- Supabase Postgres

---

### Billing Service (`/health`)
**Checks:**
- Database connectivity (simple query to `billing.plans` table)

**Dependencies:**
- Supabase Postgres

---

### Notification Service (`/health`)
**Checks:**
- Database connectivity (simple query to `notifications.notification_logs` table)
- RabbitMQ connection status

**Dependencies:**
- Supabase Postgres
- RabbitMQ

---

### API Gateway (`/health`)
**Checks:**
- Redis connectivity (ping command)
- Auth configuration status

**Dependencies:**
- Redis

**Note:** This endpoint does NOT require authentication.

---

## Implementation Details

### Repository Health Checks

Each repository class includes a `healthCheck()` method that performs a lightweight database query:

```typescript
async healthCheck(): Promise<void> {
    const { error } = await this.supabase
        .schema('schema_name')
        .from('table_name')
        .select('id')
        .limit(1);
    
    if (error) {
        throw new Error(`Database health check failed: ${error.message}`);
    }
}
```

### RabbitMQ Health Checks

Services that use RabbitMQ (ATS and Notification services) check connection status:

```typescript
isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
}
```

### Redis Health Check

API Gateway checks Redis connectivity:

```typescript
await redis.ping();  // Throws error if not connected
```

## Kubernetes Integration

### Liveness Probe
Determines if the service is running. If this fails, Kubernetes will restart the pod.

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe
Determines if the service is ready to accept traffic. If this fails, Kubernetes will stop sending traffic to the pod.

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

### Recommended Configuration by Service

#### Services with RabbitMQ (ATS, Notification)
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3002  # or service port
  initialDelaySeconds: 45  # Allow time for RabbitMQ connection
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3002
  initialDelaySeconds: 15
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### Database-only Services (Identity, Network, Billing)
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001  # or service port
  initialDelaySeconds: 20
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

#### API Gateway
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 15
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## Testing Health Checks

### Local Testing

```bash
# Identity Service
curl http://localhost:3001/health

# ATS Service
curl http://localhost:3002/health

# Network Service
curl http://localhost:3003/health

# Billing Service
curl http://localhost:3004/health

# Notification Service
curl http://localhost:3005/health

# API Gateway
curl http://localhost:3000/health
```

### Docker Compose Testing

```bash
# Start all services
docker-compose up -d

# Check health of each service
docker-compose ps

# Test health endpoints
curl http://localhost:3000/health  # API Gateway
curl http://localhost:3001/health  # Identity
curl http://localhost:3002/health  # ATS
curl http://localhost:3003/health  # Network
curl http://localhost:3004/health  # Billing
curl http://localhost:3005/health  # Notification
```

### Kubernetes Testing

```bash
# Check pod health
kubectl get pods -n splits-network

# Describe pod to see probe results
kubectl describe pod <pod-name> -n splits-network

# Check logs if unhealthy
kubectl logs <pod-name> -n splits-network

# Port-forward and test directly
kubectl port-forward <pod-name> 3000:3000 -n splits-network
curl http://localhost:3000/health
```

## Monitoring Integration

### Prometheus Metrics (Future Enhancement)

Health check endpoints can be scraped by Prometheus:

```yaml
scrape_configs:
  - job_name: 'splits-network-services'
    metrics_path: '/health'
    static_configs:
      - targets:
        - 'api-gateway:3000'
        - 'identity-service:3001'
        - 'ats-service:3002'
        - 'network-service:3003'
        - 'billing-service:3004'
        - 'notification-service:3005'
```

### Alerting Rules (Future Enhancement)

Example Prometheus alert rules:

```yaml
groups:
  - name: service_health
    rules:
      - alert: ServiceUnhealthy
        expr: up{job="splits-network-services"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.instance }} is unhealthy"
          description: "Service has been unhealthy for more than 2 minutes"
```

## Troubleshooting

### Common Issues

#### Database Connection Failures
**Symptom:** Health check returns 503 with "Database health check failed"

**Causes:**
- Supabase credentials incorrect
- Network connectivity to Supabase
- Database schema not created
- Insufficient permissions

**Resolution:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Test database connectivity
curl -X GET "$SUPABASE_URL/rest/v1/schema.table?limit=1" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY"
```

#### RabbitMQ Connection Failures
**Symptom:** Health check returns 503 with "RabbitMQ not connected"

**Causes:**
- RabbitMQ service not running
- Incorrect connection URL
- Network connectivity issues

**Resolution:**
```bash
# Check RabbitMQ is running
docker-compose ps rabbitmq

# Test connection
curl http://localhost:15672/api/healthchecks/node  # Management UI

# Check service logs
docker-compose logs ats-service | grep -i rabbitmq
```

#### Redis Connection Failures (API Gateway)
**Symptom:** Health check returns 503 with Redis error

**Causes:**
- Redis service not running
- Incorrect host/port/password

**Resolution:**
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check API Gateway logs
docker-compose logs api-gateway | grep -i redis
```

## Best Practices

1. **Don't Make Health Checks Too Heavy**
   - Use lightweight queries (LIMIT 1)
   - Don't run expensive aggregations
   - Cache results if needed (with short TTL)

2. **Set Appropriate Timeouts**
   - Health checks should complete quickly (< 3 seconds)
   - Set realistic `initialDelaySeconds` based on startup time
   - Use `failureThreshold` to avoid flapping

3. **Monitor Health Check Success Rates**
   - Track health check failures
   - Alert on sustained failures
   - Correlate with service performance

4. **Test During Deployment**
   - Verify health checks pass after deployment
   - Test with various failure scenarios
   - Ensure graceful degradation

5. **Document Dependencies**
   - Clearly state what each health check verifies
   - Update docs when adding new checks
   - Include troubleshooting steps

## Next Steps

1. **Update Kubernetes Manifests**
   - Add liveness and readiness probes to all deployments
   - Tune probe parameters based on testing
   - Deploy and verify in staging

2. **Add Startup Probes (Optional)**
   - For slow-starting services
   - Prevents premature liveness failures
   - Useful for services with long initialization

3. **Implement Metrics Endpoint**
   - Add `/metrics` for Prometheus
   - Expose service-specific metrics
   - Track health check performance

4. **Add Deep Health Checks (Optional)**
   - `/health/live` - basic liveness
   - `/health/ready` - readiness with dependency checks
   - `/health/deep` - comprehensive checks (admin only)
