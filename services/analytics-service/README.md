# Analytics Service

**Status**: ✅ V2 only

Event-driven analytics, chart data, and marketplace health metrics. Exposes REST endpoints for stats, charts, marketplace metrics, and proposal summaries, and consumes domain events to update aggregates and invalidate cache.

## Responsibilities

- **Stats API**: Recruiter, candidate, company, and platform metrics.
- **Charts API**: Chart.js-ready time series datasets.
- **Marketplace metrics**: Admin CRUD for daily health snapshots.
- **Proposal stats**: Recruiter-facing proposal summary counts.
- **Event processing**: Consume domain events, store raw analytics events, update aggregates, and invalidate cache.
- **Background rollups**: Hourly/daily/monthly aggregation and daily marketplace health computation.

## Architecture

- V2 domain structure under `src/v2/`
- Fastify API with Swagger at `/docs`
- Supabase for analytics tables and RPCs
- Redis cache with event-driven invalidation
- RabbitMQ consumer for domain events

## Environment Variables

Required:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RABBITMQ_URL`
- `REDIS_HOST`
- `REDIS_PORT`

Optional:
- `REDIS_PASSWORD`
- `PORT` (default `3010`)

## Authentication

All API endpoints require `x-clerk-user-id`. Marketplace metrics endpoints additionally require platform-admin access.

## API

- `GET /api/v2/stats`
  - Query: `scope` (`recruiter|candidate|company|platform`), `range` (`7d|30d|90d|ytd|mtd|all` or `Nd|Nw|Nm`)
- `GET /api/v2/charts/:type`
  - Types: `recruiter-activity`, `application-trends`, `placement-trends`, `role-trends`, `candidate-trends`, `time-to-hire-trends`
  - Query: `months`, `start_date`, `end_date`, `recruiter_id`, `company_id`, `scope`
- `GET /api/v2/marketplace-metrics`
- `GET /api/v2/marketplace-metrics/:id`
- `POST /api/v2/marketplace-metrics`
- `PATCH /api/v2/marketplace-metrics/:id`
- `DELETE /api/v2/marketplace-metrics/:id`
- `GET /api/v2/proposal-stats/summary`

Other:
- `GET /health`
- `GET /docs`

## Events

Consumed from RabbitMQ exchange `splits-network-events` (queue `analytics-service-queue`):
- `application.*`
- `placement.*`
- `job.*`
- `candidate.*`
- `recruiter.*`
- `proposal.*`

The consumer expects events shaped like:
```json
{ "eventType": "application.created", "data": { ... }, "timestamp": "..." }
```

## Data Storage

- `analytics.events` (raw event log)
- `analytics.metrics_hourly`, `analytics.metrics_daily`, `analytics.metrics_monthly`
- `analytics.marketplace_health_daily`
- `marketplace_metrics_daily` (public schema) is used for platform stats
- `analytics.get_chart_metrics` RPC is used for chart datasets

Note: company stats currently fall back to real-time queries against ATS tables if pre-aggregated metrics are not available.

## Background Jobs

- Hourly rollup (every hour at :05)
- Daily rollup (01:00 UTC, clears analytics cache)
- Monthly rollup (02:00 UTC on the 1st)
- Marketplace health computation (03:00 UTC daily)

## Development

```bash
# Install dependencies (from repo root)
pnpm install

# Run in dev mode
pnpm --filter @splits-network/analytics-service dev

# Build
pnpm --filter @splits-network/analytics-service build

# Run production
pnpm --filter @splits-network/analytics-service start
```

## Docker

```bash
docker-compose build analytics-service
docker-compose up -d analytics-service
```
