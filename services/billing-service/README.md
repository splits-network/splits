# Billing Service

**Status**: 🔄 MOSTLY V2 - V2 complete for core domains, webhooks pending migration

## Service Overview

The Billing Service manages subscription billing and Stripe integration with **mostly V2 architecture**. Core domains (plans, subscriptions, payouts) use V2 patterns. Legacy V1 webhook handling remains until migration is complete.

## Architecture

### ✅ V2 Patterns (Core Domains)
- V2 standardized patterns for main billing operations
- Domain-based folder structure under `src/v2/`
- 5-route CRUD pattern for all resources
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event-driven coordination via RabbitMQ

### 🔄 V1 Remaining (Webhooks Only)
- Stripe webhook handling still uses V1 patterns
- Minimal V1 BillingService and BillingRepository kept for webhook compatibility
- TODO: Migrate webhooks to V2 architecture

## Current Domains

### V2 Domains (Complete)

#### Plans (`src/v2/plans/`)
- **Repository**: `PlanRepository` - Direct Supabase queries with access context
- **Service**: `PlanServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with role-based filtering

#### Subscriptions (`src/v2/subscriptions/`)
- **Repository**: `SubscriptionRepository` - Role-scoped subscription management
- **Service**: `SubscriptionServiceV2` - Subscription lifecycle, Stripe integration
- **Routes**: Complete subscription CRUD with Stripe integration

#### Payouts (`src/v2/payouts/`)
- **Repository**: `PayoutRepository` - Recruiter payment tracking
- **Service**: `PayoutServiceV2` - Payout processing and tracking
- **Routes**: Payout management with fee calculations

### V1 Domains (Legacy - Pending Migration)

#### Webhooks (`src/routes/webhooks/`, `src/services/webhooks/`)
- **Status**: V1 only - needs V2 migration
- **Purpose**: Stripe webhook event handling
- **Dependencies**: V1 BillingService, V1 BillingRepository
- **TODO**: Create V2 webhook domain with direct event handling

## Development Guidelines

### Adding New Features
1. **Use V2 patterns for all new billing features** - Follow existing V2 domain structure
2. **Avoid adding to V1 webhook code** - Plan for V2 webhook migration
3. **Follow 5-route pattern** for CRUD operations
4. **Use access context** from `@splits-network/shared-access-context`
5. **Publish events** for significant state changes
6. **Never make HTTP calls** to other services - use database queries

### Database Integration
- **Schema**: All tables in `billing.*` schema
- **Access Control**: Role-based filtering in repository methods
- **Cross-Schema Queries**: Allowed for data enrichment
- **Event Publishing**: Use V2 EventPublisher for domain events

### File Structure
```
src/
├── index.ts                    # Mixed V1/V2 initialization
├── service.ts                  # V1 - Webhook compatibility only
├── repository.ts               # V1 - Webhook compatibility only
├── routes/                     # V1 webhooks only
│   └── webhooks/
├── services/                   # V1 webhooks only
│   └── webhooks/
└── v2/                         # ALL V2 implementations
    ├── routes.ts               # V2 route registration
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher
    │   └── access.ts          # Access context
    ├── plans/                 # Plans domain
    ├── subscriptions/         # Subscriptions domain
    └── payouts/               # Payouts domain
```

## Migration Roadmap

### ✅ Completed
- Plans V2 implementation
- Subscriptions V2 implementation  
- Payouts V2 implementation
- V2 event publishing
- V2 access control

### 🔄 Pending
- [ ] Webhook V2 migration
- [ ] Remove V1 BillingService dependency
- [ ] Remove V1 BillingRepository dependency
- [ ] Full V2-only service structure

## Key Rules

### ✅ Always Do
- Use V2 services for all core billing operations
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs
- Integrate with Stripe for subscription management

### ❌ Never Do
- Create new V1 billing logic outside webhooks
- Skip access context in repository methods
- Make HTTP calls to other services
- Bypass Stripe integration for payments

## Testing & Debugging

### Local Development
- Service runs on port 3004 by default
- Swagger docs available at `/docs` endpoint
- Webhook testing requires Stripe CLI for event forwarding

### Event Testing
- Monitor RabbitMQ for billing domain events
- Test Stripe webhook event handling
- Verify subscription lifecycle events

### Database Testing
- Test role-based filtering with different user contexts
- Verify Stripe data synchronization
- Test payout calculations and tracking

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: 🔄 MOSTLY COMPLETE - Core domains V2, webhooks pending migration