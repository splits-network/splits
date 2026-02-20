---
name: event
description: Scaffold RabbitMQ event publishers and consumers following established domain event patterns.
---

# /event - Domain Event Management

Spawn the `event` agent (`.claude/agents/event.md`) to scaffold event flows.

## Sub-Commands

- `/event:scaffold <domain> <action>` — Scaffold publisher + consumer for a new event

## Architecture

- **Broker**: RabbitMQ
- **Exchange type**: Topic exchange per service
- **Queue abstraction**: `packages/shared-job-queue/`
- **Publishers**: `services/*/src/v2/shared/events.ts`
- **Consumers**: `services/notification-service/src/consumers/`

## Event Naming

Format: `<domain>.<action>` (e.g., `application.created`, `job.published`)

## Existing Events

| Domain | Events |
|--------|--------|
| application | created, stage_changed, status_changed, withdrawn |
| job | created, published, closed, updated |
| candidate | created, updated, submitted_for_review |
| placement | created, confirmed, completed |
| proposal | submitted, accepted, rejected, countered |
| invitation | sent, accepted, declined |
| billing | subscription_created, payment_succeeded, payout_initiated |
| chat | message_sent |
| health | service_unhealthy, service_recovered |
