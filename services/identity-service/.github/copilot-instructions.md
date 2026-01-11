# Identity Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The Identity Service manages user authentication and organization data with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests**
- 5-route CRUD pattern for all resources
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event-driven coordination via RabbitMQ

### 🚫 NO V1 Code
- No legacy route handlers outside `src/v2/`
- No V1 repository or service classes
- No HTTP calls to other services (use database queries)
- No `/me` endpoints or user shortcuts
- No Phase 1/2/3 legacy patterns

## Current Domains

### Users (`src/users/`)
- **Repository**: `UserRepository` - Direct Supabase queries with access context
- **Service**: `UserServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with role-based filtering

### Organizations (`src/v2/organizations/`)
- **Repository**: `OrganizationRepository` - Organization management with access context
- **Service**: `OrganizationServiceV2` - Organization lifecycle management
- **Routes**: Organization CRUD with membership integration

### Memberships (`src/v2/memberships/`)
- **Repository**: `MembershipRepository` - User-organization relationship management
- **Service**: `MembershipServiceV2` - Membership lifecycle with role validation
- **Routes**: Membership management with role-based access control

### Invitations (`src/v2/invitations/`)
- **Repository**: `InvitationRepository` - Organization invitation management
- **Service**: `InvitationServiceV2` - Invitation workflow and validation
- **Routes**: Invitation lifecycle with email integration

### Consent (`src/v2/consent/`)
- **Repository**: `ConsentRepository` - User consent tracking
- **Service**: `ConsentServiceV2` - Privacy consent management
- **Routes**: Consent recording and retrieval

### Webhooks (`src/v2/webhooks/`)
- **Repository**: `WebhookRepositoryV2` - User data synchronization
- **Service**: `WebhooksServiceV2` - Clerk webhook processing
- **Routes**: POST /v2/webhooks/clerk with Svix verification
- **Purpose**: Sync user data from Clerk lifecycle events

## Development Guidelines

### Adding New Features
1. **Use V2 patterns exclusively** - Follow existing domain structure
2. **Create new domains** in `src/v2/<domain>/` with repository, service, routes
3. **Follow 5-route pattern** for CRUD operations
4. **Use access context** from `@splits-network/shared-access-context`
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
- **Cross-Schema Queries**: Allowed for data enrichment (e.g., JOIN with `*`, `*`)
- **Event Publishing**: Use V2 EventPublisher for domain events

### File Structure
```
src/
├── index.ts                    # Main server entry point (V2-only)
└── v2/                         # ALL V2 implementations
    ├── routes.ts               # V2 route registration
    ├── helpers.ts              # V2 validation, context helpers
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher
    │   └── access.ts          # Identity-specific access context
    ├── users/                 # Users domain
    ├── organizations/         # Organizations domain
    ├── memberships/           # Memberships domain
    ├── invitations/           # Invitations domain
    ├── consent/               # Consent tracking domain
    └── webhooks/              # Clerk webhook integration
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs for enriched data
- Handle Clerk webhooks for user synchronization
- Validate all input data and handle edge cases gracefully

### ❌ Never Do
- Create routes outside `src/v2/` structure
- Implement `/me` endpoints or user shortcuts
- Make HTTP calls to other services (ATS, network, etc.)
- Skip access context in repository methods
- Create duplicate functionality that exists in V2
- Use V1 patterns, classes, or helper functions

## Common Patterns

### Repository Method Structure
```typescript
async list(clerkUserId: string, filters: UserFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        
        .from('users')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'platform_admin') {
        // Platform admins see all users (no filter)
    } else {
        // Regular users see only themselves
        query.eq('id', context.userId);
    }
    
    // Apply search/filter criteria
    if (filters.search) {
        query.ilike('name', `%${filters.search}%`);
    }
    
    return query;
}
```

### Service Method with Events
```typescript
async update(id: string, clerkUserId: string, data: UserUpdate) {
    // Validate input
    this.validateUserData(data);
    
    const userContext = await this.accessResolver.resolve(clerkUserId);
    // Update via repository
    const user = await this.repository.update(id, clerkUserId, data);
    
    // Publish event
    await this.eventPublisher?.publish('user.updated', {
        userId: id,
        changes: Object.keys(data),
        updatedBy: userContext.identityUserId,
    });
    
    return user;
}
```

### Webhook Integration
```typescript
// POST /v2/webhooks/clerk
async function handleClerkWebhook(event: ClerkWebhookEvent) {
    switch (event.type) {
        case 'user.created':
        case 'user.updated':
            return await this.service.syncClerkUser(event.data);
        case 'user.deleted':
            return await this.service.deleteUser(event.data.id);
    }
}
```

## Testing & Debugging

### Local Development
- Service runs on port 3001 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for identity domain events
- Test webhook integration with Clerk Dashboard webhooks
- Verify user synchronization and access control

### Database Testing
- Test role-based filtering with different user contexts
- Verify cross-schema JOINs work correctly
- Test membership and organization relationships

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - All legacy code removed