# Analytics Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - Event-driven analytics and metrics

## Service Overview

The Analytics Service provides event-driven metrics aggregation, chart data endpoints, and marketplace health statistics using **V2-only architecture**. Replaces expensive real-time aggregations from data services with pre-computed metrics.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests**
- 5-route CRUD pattern where applicable
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event-driven coordination via RabbitMQ

### Core Principles
- **No expensive real-time queries** - all metrics pre-aggregated
- **Event-driven updates** - metrics update incrementally on domain events
- **Redis caching** - smart cache with TTL strategies and invalidation
- **Background jobs** - node-cron schedules hourly/daily/monthly rollups
- **Chart-ready responses** - return data formatted for Chart.js

## Current Domains

### Events (`src/v2/events/`)
- **Repository**: `EventRepository` - Write events to `analytics.events` table
- **Service**: `EventServiceV2` - Validate and enrich events
- **Routes**: Internal only (not exposed via API Gateway)
- **Purpose**: Raw event stream for all user/system activity

### Metrics (`src/v2/metrics/`)
- **Repository**: `MetricsRepository` - Read from `analytics.metrics_*` tables
- **Service**: `MetricsServiceV2` - User/company/recruiter stats (migrated from ATS)
- **Routes**: GET /v2/analytics/stats (replaces ATS /v2/stats)
- **Caching**: 1-minute TTL for real-time dashboard widgets

### Charts (`src/v2/charts/`)
- **Repository**: `ChartRepository` - Query metrics_monthly for trends
- **Service**: `ChartServiceV2` - Format data for Chart.js
- **Routes**: GET /v2/analytics/charts/:type (recruiter-activity, application-trends, etc.)
- **Caching**: 5-minute TTL for chart endpoints

### Marketplace Health (`src/v2/marketplace-health/`)
- **Repository**: `MarketplaceHealthRepository` - Daily platform metrics
- **Service**: `MarketplaceHealthServiceV2` - Compute health indicators
- **Routes**: GET /v2/analytics/marketplace-health (admin-only)
- **Caching**: 1-hour TTL for admin reports

## Development Guidelines

### Adding New Event Consumers
1. **Create consumer** in `src/consumers/<domain>/`
2. **Register in domain-consumer** - add to event routing logic
3. **Update metrics** - increment relevant counters in `analytics.metrics_*` tables
4. **Invalidate cache** - clear affected cache keys

### Adding New Metrics
1. **Define metric type** in `src/v2/metrics/types.ts`
2. **Add to aggregation jobs** - update hourly/daily/monthly rollup logic
3. **Add to stats response** - include in relevant scope (recruiter/company/candidate)
4. **Document in README** - add to metrics catalog

### Standardized List Functionality
- **Use shared types** from `@splits-network/shared-types`:
  - `StandardListParams` for query parameters
  - `StandardListResponse<T>` for responses
- **Server-side filtering** - never rely on client-side filtering
- **Role-based access** - use `resolveAccessContext` for user scoping
- **Redis caching** - cache frequently accessed data

### Database Integration
- **Schema**: All tables in `analytics` schema
- **Access Control**: Role-based filtering in repository methods
- **Cross-Schema Queries**: Allowed for data enrichment (join with ats, network, identity)
- **Event Publishing**: Minimal - mostly a consumer service
- **BRIN Indexes**: All timestamp columns use BRIN indexes for range queries

### Cache Management
```typescript
// Cache key pattern
const cacheKey = `analytics:${metric_type}:${user_id}:${period}`;

// Set with TTL
await redis.setex(cacheKey, 60, JSON.stringify(data)); // 1-minute TTL

// Invalidate on events
await redis.del(`analytics:recruiter_stats:${recruiter_id}:*`);
```

### Background Job Pattern
```typescript
import cron from 'node-cron';

// Hourly rollup at :05 past every hour
cron.schedule('5 * * * *', async () => {
  await rollupHourlyMetrics();
});

// Daily rollup at 1:00 AM UTC
cron.schedule('0 1 * * *', async () => {
  await rollupDailyMetrics();
});
```

## File Structure
```
src/
├── index.ts                    # Main server entry point
├── cache/                      # Redis cache manager
│   ├── cache-manager.ts       # Cache operations with TTL
│   └── invalidation.ts        # Cache invalidation logic
├── consumers/                  # RabbitMQ event consumers
│   ├── domain-consumer.ts     # Main event router
│   ├── applications/          # Application event handlers
│   ├── placements/            # Placement event handlers
│   ├── jobs/                  # Job event handlers
│   └── candidates/            # Candidate event handlers
├── jobs/                       # Background aggregation jobs
│   ├── hourly-rollup.ts       # Hourly metrics aggregation
│   ├── daily-rollup.ts        # Daily metrics aggregation
│   ├── monthly-rollup.ts      # Monthly metrics aggregation
│   ├── marketplace-health.ts  # Daily marketplace health job
│   └── backfill.ts            # Manual backfill for historical data
└── v2/                         # ALL V2 implementations
    ├── routes.ts               # V2 route registration
    ├── helpers.ts              # V2 validation, context helpers
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher (minimal)
    │   └── access.ts          # Analytics-specific access context
    ├── events/                # Events domain
    ├── metrics/               # Metrics domain (migrated from ATS)
    ├── charts/                # Chart data domain
    └── marketplace-health/    # Marketplace health domain
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Cache aggressively with appropriate TTL
- Invalidate cache on relevant domain events
- Use BRIN indexes for timestamp range queries
- Publish minimal events (analytics is primarily a consumer)
- Return chart-ready data formats (labels + datasets)
- Use node-cron for background aggregation jobs

### ❌ Never Do
- Make expensive real-time aggregation queries
- Skip caching for frequently accessed endpoints
- Make HTTP calls to other services (use database queries)
- Expose internal event ingestion endpoints via API Gateway
- Use TimescaleDB or other time-series databases (plain Postgres only)
- Create routes outside `src/v2/` structure

## Common Patterns

### Event Consumer Pattern
```typescript
export class ApplicationsEventConsumer {
  constructor(
    private supabase: SupabaseClient,
    private cache: CacheManager
  ) {}

  async handleApplicationCreated(event: ApplicationCreatedEvent) {
    // 1. Store raw event
    await this.supabase.from('analytics.events').insert({
      event_type: 'application.created',
      entity_type: 'application',
      entity_id: event.applicationId,
      user_id: event.userId,
      metadata: event,
      created_at: event.timestamp,
    });

    // 2. Update hourly metrics
    await this.incrementMetric('applications_submitted', event.recruiterId, 'hour');

    // 3. Invalidate cache
    await this.cache.invalidatePattern(`analytics:recruiter_stats:${event.recruiterId}:*`);
  }
}
```

### Chart Endpoint Pattern
```typescript
async getRecruiterActivityChart(
  clerkUserId: string,
  period: '3m' | '6m' | '12m' | '24m'
) {
  const cacheKey = `analytics:chart:recruiter_activity:${clerkUserId}:${period}`;
  
  // Check cache first
  const cached = await this.cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  // Query pre-aggregated monthly metrics
  const data = await this.repository.getMonthlyTrends(clerkUserId, period);
  
  // Format for Chart.js
  const chartData = {
    labels: data.months,
    datasets: [
      {
        label: 'Active Recruiters',
        data: data.activeRecruiters,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
      },
      // ... more datasets
    ],
  };

  // Cache for 5 minutes
  await this.cache.set(cacheKey, JSON.stringify(chartData), 300);
  
  return chartData;
}
```

## Testing & Debugging

### Local Development
- Service runs on port 3007 by default
- Swagger docs available at `/docs` endpoint
- RabbitMQ required for event consumers
- Redis required for caching

### Event Testing
- Monitor RabbitMQ for domain events
- Check `analytics.events` table for raw storage
- Verify metrics tables update correctly
- Test cache invalidation triggers

### Database Testing
- Test role-based filtering with different contexts
- Verify aggregation accuracy (events sum = metrics)
- Test BRIN index performance on large datasets

---

**Last Updated**: January 13, 2026  
**Version**: 1.0.0 - Initial implementation
