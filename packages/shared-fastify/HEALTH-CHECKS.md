# Health Check Standardization

This package provides standardized health check utilities for all Splits Network services. The health check system provides:

- ✅ **Consistent response format** across all services
- ✅ **Built-in dependency checkers** for common integrations (Supabase, RabbitMQ, Redis)
- ✅ **Flexible configuration** - from basic to comprehensive health monitoring
- ✅ **Timeout protection** and error handling
- ✅ **Appropriate HTTP status codes** (200 for healthy/degraded, 503 for unhealthy)
- ✅ **Silent logging** for health checks to reduce noise

## Quick Start

### Basic Health Check (No Dependencies)

For services with minimal dependencies:

```typescript
import { registerBasicHealthCheck } from "@splits-network/shared-fastify";

// Simple health check - just reports service status
registerBasicHealthCheck(app, "my-service", logger);
```

### Advanced Health Check (With Dependencies)

For services with databases, RabbitMQ, Redis, etc.:

```typescript
import {
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";

registerHealthCheck(app, {
    serviceName: "my-service",
    logger,
    checkers: {
        // Database connectivity
        database: HealthCheckers.database(
            dbConfig.supabaseUrl,
            dbConfig.supabaseKey,
        ),

        // RabbitMQ publisher status
        rabbitmq_publisher: HealthCheckers.rabbitMqPublisher(eventPublisher),

        // RabbitMQ consumer status
        rabbitmq_consumer: HealthCheckers.rabbitMqConsumer(domainConsumer),

        // Redis connectivity
        redis: HealthCheckers.redis(redisClient),

        // Custom health checks
        external_api: HealthCheckers.custom(
            "external_api",
            async () => {
                const response = await fetch("https://api.example.com/health");
                return response.ok;
            },
            { provider: "example.com" },
        ),
    },

    // Optional configuration
    path: "/health", // Custom endpoint path
    timeout: 5000, // Health check timeout ms
    disableLogging: true, // Reduce health check noise
});
```

## Response Format

All health checks return a standardized response:

```typescript
{
    "status": "healthy" | "degraded" | "unhealthy",
    "service": "service-name",
    "timestamp": "2026-01-13T10:30:00.000Z",
    "uptime": 3600,  // seconds since service started
    "checks": {
        "database": {
            "status": "healthy",
            "name": "database",
            "details": { "provider": "supabase" }
        },
        "rabbitmq_publisher": {
            "status": "degraded",
            "name": "rabbitmq_publisher",
            "details": {
                "connected": true,
                "channel_open": false
            }
        },
        "external_api": {
            "status": "unhealthy",
            "name": "external_api",
            "error": "Connection timeout"
        }
    }
}
```

## Health Status Levels

- **healthy** (200): All dependencies operational
- **degraded** (200): Service functional but some non-critical dependencies have issues
- **unhealthy** (503): Critical dependencies failed, service may not function properly

## Built-in Checkers

### Database (Supabase)

```typescript
HealthCheckers.database(supabaseUrl, supabaseKey);
```

Tests database connectivity with a simple query.

### RabbitMQ Publisher

```typescript
HealthCheckers.rabbitMqPublisher(eventPublisher);
```

Checks if EventPublisher connection and channel are healthy.

### RabbitMQ Consumer

```typescript
HealthCheckers.rabbitMqConsumer(domainConsumer);
```

Checks if DomainConsumer connection and channel are healthy.

### Redis

```typescript
HealthCheckers.redis(redisClient);
```

Tests Redis connectivity with a PING command.

### Custom Checker

```typescript
HealthCheckers.custom(name, checkFunction, details?)
```

Create custom health checks for any dependency.

## Migration Guide

### From Basic Health Check

**Before:**

```typescript
app.get("/health", async (request, reply) => {
    return reply.send({
        status: "healthy",
        service: "my-service",
        timestamp: new Date().toISOString(),
    });
});
```

**After:**

```typescript
import { registerBasicHealthCheck } from "@splits-network/shared-fastify";

registerBasicHealthCheck(app, "my-service", logger);
```

### From Custom Health Check

**Before:**

```typescript
app.get("/health", async (request, reply) => {
    try {
        // Check database
        await repository.healthCheck();

        // Check RabbitMQ
        const rabbitOk = eventPublisher?.isConnected();

        return reply.status(200).send({
            status: rabbitOk ? "healthy" : "degraded",
            service: "my-service",
            timestamp: new Date().toISOString(),
            rabbitmq: rabbitOk ? "connected" : "disconnected",
        });
    } catch (error) {
        return reply.status(503).send({
            status: "unhealthy",
            service: "my-service",
            error: error.message,
        });
    }
});
```

**After:**

```typescript
import {
    registerHealthCheck,
    HealthCheckers,
} from "@splits-network/shared-fastify";

registerHealthCheck(app, {
    serviceName: "my-service",
    logger,
    checkers: {
        database: HealthCheckers.database(
            dbConfig.supabaseUrl,
            dbConfig.supabaseKey,
        ),
        rabbitmq_publisher: HealthCheckers.rabbitMqPublisher(eventPublisher),
    },
});
```

## Benefits

### For Operations Teams

- **Consistent monitoring** - Same response format across all services
- **Detailed dependency status** - Know exactly what's failing
- **Appropriate HTTP codes** - Easy integration with load balancers and monitoring tools
- **Uptime tracking** - See how long each service has been running

### For Developers

- **Less boilerplate** - No more custom health check implementations
- **Built-in best practices** - Timeout handling, error catching, status determination
- **Easy testing** - Standard format makes automated testing simple
- **Reduced maintenance** - Update health check logic in one place

### For Infrastructure

- **Reduced log noise** - Health checks don't flood logs by default
- **Performance optimized** - Parallel execution with timeouts
- **Kubernetes ready** - Works well with readiness/liveness probes

## Service Migration Status

- ✅ **AI Service** - Migrated to standardized health checks with database + RabbitMQ monitoring
- ✅ **ATS Service** - Enhanced health check with comprehensive dependency monitoring
- 🔄 **Network Service** - Basic health check (candidate for upgrade)
- 🔄 **Billing Service** - Custom health check (candidate for migration)
- ⏳ **Other Services** - Pending migration

## Next Steps

1. **Migrate remaining services** to use standardized health checks
2. **Add monitoring dashboards** that consume the standardized format
3. **Integrate with Kubernetes** readiness/liveness probes
4. **Add alerting rules** based on health status and dependency failures
