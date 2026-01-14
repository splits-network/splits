# Analytics Service

**Status**: ✅ V2 ONLY SERVICE - Event-driven analytics and metrics

## Service Overview

The Analytics Service provides event-driven metrics aggregation, chart data endpoints, and marketplace health statistics using **V2-only architecture**. Replaces expensive real-time aggregations from data services.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- Event-driven aggregation via RabbitMQ consumers
- Redis caching with smart invalidation
- Pre-computed metrics in plain Postgres tables

## Core Responsibilities

### Event Processing
- **RabbitMQ Consumers**: Listen to application.*, placement.*, job.*, candidate.* events
- **Incremental Updates**: Update metrics tables on every relevant event
- **Event Replay**: Dead-letter queue + manual backfill for missed events

### Metrics Aggregation
- **Real-time Stats**: User-scoped metrics (replaces ATS `/v2/stats`)
- **Hourly Rollups**: Background job aggregates events into hourly metrics
- **Daily Rollups**: Aggregates hourly metrics into daily snapshots
- **Monthly Rollups**: Aggregates daily metrics for long-term trends

### Chart Data
- **Pre-computed Datasets**: Return chart-ready JSON (labels + datasets)
- **Multiple Periods**: Support 3M, 6M, 12M, 24M period filters
- **Chart Types**: Recruiter activity, application trends, placement trends, role trends, candidate trends

### Marketplace Health
- **Daily Snapshots**: Platform-wide health metrics (admin dashboard)
- **Computed Fields**: hire_rate, avg_time_to_hire, placement_completion_rate
- **Trend Analysis**: Compare current vs previous period

## Current Domains

### Events (`src/v2/events/`)
- **Repository**: Raw event ingestion to `analytics.events` table
- **Service**: Event validation and enrichment
- **Routes**: POST /v2/analytics/events (internal only, not exposed to API gateway)

### Metrics (`src/v2/metrics/`)
- **Repository**: Read from `analytics.metrics_*` tables with access context
- **Service**: Migrated stats logic from ATS service
- **Routes**: GET /v2/analytics/stats (replaces ATS /v2/stats)

### Charts (`src/v2/charts/`)
- **Repository**: Query metrics_monthly for trend data
- **Service**: Format data for Chart.js consumption
- **Routes**: GET /v2/analytics/charts/:type (recruiter-activity, application-trends, etc.)

### Marketplace Health (`src/v2/marketplace-health/`)
- **Repository**: Daily marketplace metrics (migrated from automation service)
- **Service**: Compute platform-wide health indicators
- **Routes**: GET /v2/analytics/marketplace-health (admin-only)

## Database Schema

### Analytics Schema (`analytics.*`)
- `events` - Raw event stream with BRIN indexes on timestamp
- `metrics_hourly` - Hourly aggregated metrics
- `metrics_daily` - Daily aggregated metrics
- `metrics_monthly` - Monthly aggregated metrics
- `marketplace_health_daily` - Platform-wide daily snapshots

## Development Guidelines

### Adding New Metrics
1. Define metric type in `src/v2/metrics/types.ts`
2. Add consumer logic in `src/consumers/<domain>/` to update metrics on events
3. Add aggregation logic in `src/jobs/<period>-rollup.ts` for background jobs
4. Expose via `/v2/analytics/stats` or `/v2/analytics/charts/:type` endpoints

### Cache Strategy
- **1-minute TTL**: Real-time stats (dashboard widgets)
- **5-minute TTL**: Chart data endpoints
- **1-hour TTL**: Historical reports and exports
- **Invalidation**: Clear relevant cache keys on domain events

### Background Jobs
- **Hourly Rollup**: Every hour at :05 (aggregate last hour's events)
- **Daily Rollup**: Every day at 1:00 AM UTC (aggregate yesterday's hourly metrics)
- **Monthly Rollup**: Every 1st day of month at 2:00 AM UTC
- **Marketplace Health**: Every day at 3:00 AM UTC (compute platform metrics)

## Testing & Debugging

### Local Development
- Service runs on port 3007 by default
- Requires RabbitMQ connection for event consumers
- Requires Redis connection for caching
- Swagger docs available at `/docs` endpoint

### Event Testing
- Monitor RabbitMQ for domain events
- Check `analytics.events` table for raw event storage
- Verify metrics tables update incrementally
- Test cache invalidation on new events

### Database Testing
- Test role-based filtering with different user contexts
- Verify aggregation accuracy (sum events = aggregated metric)
- Test chart data format matches Chart.js expectations

---

**Last Updated**: January 13, 2026  
**Version**: 1.0.0 - Initial implementation
