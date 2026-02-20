# /event:scaffold - Scaffold Domain Event

**Description:** Scaffold a RabbitMQ event publisher and notification consumer

## Usage

```bash
/event:scaffold <domain> <action>
```

## Parameters

- `<domain>` — Event domain (e.g., `interview`, `assessment`)
- `<action>` — Event action (e.g., `scheduled`, `completed`, `cancelled`)

## Examples

```bash
/event:scaffold interview scheduled
/event:scaffold assessment completed
/event:scaffold payout failed
```

## What Gets Created/Updated

1. Publisher call in the relevant service's `service.ts`
2. Consumer in `services/notification-service/src/consumers/`
3. Email template in `services/notification-service/src/templates/` (if notification needed)
4. Event type definition

## Execution

Spawn the `event` agent. It will:
1. Read existing event patterns in the target service
2. Add the publish call in the service layer (after successful mutation)
3. Create or update the notification consumer
4. Follow the event payload convention (include all entity IDs needed by consumers)
