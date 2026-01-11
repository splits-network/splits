# Billing Service - Copilot Instructions

**Status**: 🔄 MOSTLY V2 - V2 complete for core domains, webhooks pending migration

## Service Overview

The Billing Service manages subscription billing and Stripe integration with **mostly V2 architecture**. Core domains (plans, subscriptions, payouts) use V2 patterns. Legacy V1 webhook handling remains until migration is complete.

## Architecture Guidelines

### ✅ V2 Patterns (Core Domains)
- V2 standardized patterns for main billing operations
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/subscriptions`, not `/api/v2/subscriptions`
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
4. **Use access context** - Import from local shared/access.ts (billing-specific)
5. **Publish events** for significant state changes
6. **Never make HTTP calls** to other services - use database queries

### Standardized List Functionality
- **Use shared types** from `@splits-network/shared-types`:
  - `StandardListParams` for query parameters: `{ page?: number; limit?: number; search?: string; filters?: Record<string, any>; include?: string; sort_by?: string; sort_order?: 'asc' | 'desc' }`
  - `StandardListResponse<T>` for responses: `{ data: T[]; pagination: PaginationResponse }`
- **Repository pattern** for list methods:
  ```typescript
  async list(clerkUserId: string, params: StandardListParams): Promise<StandardListResponse<T>>
  ```
- **Server-side filtering** - never rely on client-side filtering for performance
- **Enriched data** - use JOINs to include related data in single queries
- **Consistent pagination** - always return total count and page information

### Database Integration
- **Schema**: All tables in `*` schema
- **Access Control**: Role-based filtering in repository methods
- **Stripe Integration**: Direct API calls for subscription management
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
    │   └── access.ts          # Billing-specific access context
    ├── plans/                 # Plans domain
    ├── subscriptions/         # Subscriptions domain
    └── payouts/               # Payouts domain
```

## Key Rules

### ✅ Always Do
- Use V2 services for all core billing operations (plans, subscriptions, payouts)
- Use billing-specific access context from `./shared/access.ts`
- Follow V2 repository patterns with role-based filtering
- Integrate with Stripe for subscription management
- Publish events for all significant state changes
- Handle Stripe webhooks for external events
- Use direct Supabase queries with proper JOINs

### ❌ Never Do
- Create new V1 billing logic outside webhooks
- Skip access context in repository methods
- Make HTTP calls to other services (ATS, network, etc.)
- Bypass Stripe integration for payments
- Create routes outside V2 structure (except webhook migration)

## Common Patterns

### Repository Method Structure
```typescript
async list(clerkUserId: string, filters: SubscriptionFilters) {
    const context = await this.accessResolver(clerkUserId);
    
    const query = this.supabase
        
        .from('subscriptions')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'recruiter') {
        query.eq('user_id', context.userId);
    } else if (context.isCompanyUser) {
        query.in('user_id', context.accessibleUserIds);
    }
    
    return query;
}
```

### Service Method with Events and Stripe
```typescript
async update(id: string, clerkUserId: string, data: SubscriptionUpdate) {
    // Validate and update in Stripe first
    if (data.plan_id) {
        await this.updateStripeSubscription(id, data.plan_id);
    }
    
        const userContext = await this.accessResolver.resolve(clerkUserId);
    // Update via repository
    const subscription = await this.repository.update(id, clerkUserId, data);
    
    // Publish event
    await this.eventPublisher?.publish('subscription.updated', {
        subscriptionId: id,
        changes: Object.keys(data),
        updatedBy: userContext.identityUserId,
    });
    
    return subscription;
}
```

### Webhook Pattern (V1 - TODO: Migrate)
```typescript
// Current V1 pattern in webhooks/routes.ts
await service.handleStripeWebhook(event);

// TODO: Migrate to V2 pattern
// Should become direct domain service calls based on event type
```

## Testing & Debugging

### Local Development
- Service runs on port 3004 by default
- Swagger docs available at `/docs` endpoint
- Use Stripe test mode for development
- Webhook testing requires Stripe CLI: `stripe listen --forward-to localhost:3004/webhooks/stripe`

### Event Testing
- Monitor RabbitMQ for billing domain events
- Test Stripe webhook event handling with CLI
- Verify subscription lifecycle events

### Database Testing
- Test role-based filtering with different user contexts
- Verify Stripe data synchronization
- Test payout calculations and fee tracking

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: 🔄 MOSTLY COMPLETE - Core domains V2, webhooks pending migration