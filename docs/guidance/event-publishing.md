# Event Publishing Standard

## Architecture

All domain events flow through RabbitMQ via the `splits-network-events` topic exchange. Services use `ResilientPublisher` from `@splits-network/shared-job-queue` — it publishes directly to RabbitMQ when healthy, and falls back to the `outbox_events` database table when RabbitMQ is unavailable.

```
Service code
  → ResilientPublisher.publish()
    → Try: EventPublisher (direct RabbitMQ) ← fast path, no DB write
    → Catch: OutboxPublisher (write to outbox_events table) ← fallback path
                ↓
          outbox-service drains pending rows → RabbitMQ
```

## The Three Publishers

| Class | Role | Use directly? |
|-------|------|---------------|
| `ResilientPublisher` | RabbitMQ-first with outbox fallback | **Yes** — this is what services pass to routes/services/repos |
| `EventPublisher` | Direct RabbitMQ connection with reconnect | **No** — only as input to `ResilientPublisher` and for SIGTERM cleanup |
| `OutboxPublisher` | Writes to `outbox_events` DB table | **No** — only as input to `ResilientPublisher` |

All three implement `IEventPublisher`. Downstream code (routes, services, repositories) should always type the publisher as `IEventPublisher`.

## Standard Wiring in `index.ts`

```typescript
import { EventPublisher, OutboxPublisher, ResilientPublisher } from './v2/shared/events.js';

// 1. Create the direct RabbitMQ publisher
const eventPublisher = new EventPublisher(rabbitConfig.url, logger, baseConfig.serviceName);
try {
    await eventPublisher.connect();
    logger.info('RabbitMQ EventPublisher connected');
} catch (error) {
    logger.warn({ err: error }, 'RabbitMQ EventPublisher failed to connect — will use outbox fallback');
}

// 2. Create the outbox fallback publisher
const outboxPublisher = new OutboxPublisher(supabase, baseConfig.serviceName, logger);

// 3. Create the resilient publisher (this is what routes/services receive)
const resilientPublisher = new ResilientPublisher(eventPublisher, outboxPublisher, logger);

// 4. Pass resilientPublisher to routes
registerV2Routes(app, { eventPublisher: resilientPublisher, ... });
registerV3Routes(app, { eventPublisher: resilientPublisher, ... });
```

## Rules

1. **Always use `ResilientPublisher`** — never pass `OutboxPublisher` or `EventPublisher` directly to routes, services, or repositories.

2. **Always create all three publishers** — even if RabbitMQ fails to connect at startup, create all three. `ResilientPublisher` handles the fallback automatically.

3. **Make `EventPublisher.connect()` non-fatal** — wrap in try/catch with a `logger.warn`. The service should start even if RabbitMQ is down; events will flow through the outbox until RabbitMQ reconnects.

4. **Never hand-roll a local EventPublisher** — always import from `@splits-network/shared-job-queue` (or the service's `v2/shared/events.ts` re-export). The shared implementation has reconnect logic, health tracking, and proper error propagation.

5. **`outbox-service` must always be running** — it is the only process that drains `outbox_events` rows to RabbitMQ. Without it, fallback events are written to the DB but never delivered.

6. **Type as `IEventPublisher`** — all downstream consumers (route configs, service constructors, repository constructors) should accept `IEventPublisher`, not a concrete class.

## Re-export Pattern

Each service re-exports from its `v2/shared/events.ts` (or `shared/events.ts`):

```typescript
export { EventPublisher, OutboxPublisher, ResilientPublisher, IEventPublisher } from '@splits-network/shared-job-queue';
export type { DomainEvent } from '@splits-network/shared-job-queue';
```

## Exceptions

- **support-service** — uses `SupportEventPublisher` (Redis Pub/Sub) for real-time WebSocket fan-out, not domain events. This is appropriate for its use case.
- **search-service** — read-only, no events published.
- **outbox-service** — infrastructure service that drains the outbox table. Uses `EventPublisher` directly (it IS the delivery mechanism).
