# Health Check Standardization - Migration Examples

## Example 1: Basic Service Migration (Network Service)

### Before (Current)

```typescript
// services/network-service/src/index.ts
app.get("/health", async (request, reply) => {
    return reply.send({
        status: "healthy",
        service: "network-service",
        timestamp: new Date().toISOString(),
    });
});
```

### After (Standardized)

```typescript
// services/network-service/src/index.ts
import { registerBasicHealthCheck } from "@splits-network/shared-fastify";

// Replace the manual health check with:
registerBasicHealthCheck(app, "network-service", logger);
```

**Benefits**:

- ✅ Consistent response format
- ✅ Automatic uptime tracking
- ✅ Silent logging (reduces noise)
- ✅ Proper HTTP status codes

---

## Example 2: Advanced Service Migration (AI Service)

### Before (Original)

```typescript
// services/ai-service/src/index.ts
app.get("/health", async (request, reply) => {
    return reply.send({
        status: "healthy",
        service: "ai-service",
        timestamp: new Date().toISOString(),
    });
});
```

### After (Enhanced with Dependencies)

```typescript
// services/ai-service/src/index.ts
import {
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";

registerHealthCheck(app, {
    serviceName: "ai-service",
    logger,
    checkers: {
        database: HealthCheckers.database(
            dbConfig.supabaseUrl,
            dbConfig.supabaseServiceRoleKey || dbConfig.supabaseAnonKey,
        ),
        ...(eventPublisher && {
            rabbitmq_publisher:
                HealthCheckers.rabbitMqPublisher(eventPublisher),
        }),
        ...(domainConsumer && {
            rabbitmq_consumer: HealthCheckers.rabbitMqConsumer(domainConsumer),
        }),
    },
});
```

**Benefits**:

- ✅ Database connectivity monitoring
- ✅ RabbitMQ publisher status
- ✅ RabbitMQ consumer status
- ✅ Automatic dependency health aggregation
- ✅ Detailed failure diagnostics

---

## Example 3: Complex Service Migration (Billing Service)

### Before (Custom Implementation)

```typescript
// services/billing-service/src/index.ts
app.get("/health", async (request, reply) => {
    try {
        // Check database connectivity
        await repository.healthCheck();
        return reply.status(200).send({
            status: billingEventConsumerConnected ? "healthy" : "degraded",
            service: "billing-service",
            timestamp: new Date().toISOString(),
            event_consumer: billingEventConsumerConnected
                ? "connected"
                : "disconnected",
        });
    } catch (error) {
        logger.error({ err: error }, "Health check failed");
        return reply.status(503).send({
            status: "unhealthy",
            service: "billing-service",
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : "Unknown error",
            event_consumer: billingEventConsumerConnected
                ? "connected"
                : "disconnected",
        });
    }
});
```

### After (Standardized)

```typescript
// services/billing-service/src/index.ts
import {
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";

registerHealthCheck(app, {
    serviceName: "billing-service",
    logger,
    checkers: {
        database: HealthCheckers.database(
            dbConfig.supabaseUrl,
            dbConfig.supabaseKey,
        ),
        stripe: HealthCheckers.custom(
            "stripe",
            async () => {
                // Custom Stripe connectivity check
                const stripe = require("stripe")(stripeConfig.secretKey);
                await stripe.accounts.retrieve(); // Test API call
                return true;
            },
            { provider: "stripe" },
        ),
        rabbitmq_publisher: HealthCheckers.rabbitMqPublisher(v2EventPublisher),
        rabbitmq_consumer: HealthCheckers.custom(
            "billing_consumer",
            async () => {
                return billingEventConsumerConnected;
            },
            { connected: billingEventConsumerConnected },
        ),
    },
});
```

**Benefits**:

- ✅ Database connectivity monitoring
- ✅ Stripe API connectivity checking
- ✅ RabbitMQ publisher/consumer status
- ✅ Automatic timeout protection
- ✅ Parallel health check execution
- ✅ Consistent error handling and logging

---

## Response Comparison

### Before (Inconsistent)

Each service had different response formats:

**Network Service:**

```json
{
    "status": "healthy",
    "service": "network-service",
    "timestamp": "2026-01-13T10:30:00.000Z"
}
```

**Billing Service:**

```json
{
    "status": "degraded",
    "service": "billing-service",
    "timestamp": "2026-01-13T10:30:00.000Z",
    "event_consumer": "disconnected"
}
```

### After (Standardized)

All services return the same format:

```json
{
    "status": "healthy",
    "service": "ai-service",
    "timestamp": "2026-01-13T10:30:00.000Z",
    "uptime": 3600,
    "checks": {
        "database": {
            "status": "healthy",
            "name": "database",
            "details": { "provider": "supabase" }
        },
        "rabbitmq_publisher": {
            "status": "healthy",
            "name": "rabbitmq_publisher",
            "details": { "connected": true, "channel_open": true }
        },
        "rabbitmq_consumer": {
            "status": "degraded",
            "name": "rabbitmq_consumer",
            "details": { "connected": true, "channel_open": false }
        }
    }
}
```

## Migration Checklist

For each service:

- [ ] Import health check utilities from `@splits-network/shared-fastify`
- [ ] Identify existing dependencies (database, RabbitMQ, Redis, external APIs)
- [ ] Remove existing manual health check route
- [ ] Register standardized health check with appropriate checkers
- [ ] Test health check endpoint
- [ ] Update monitoring/alerting to use new response format
- [ ] Document service-specific health check configuration
