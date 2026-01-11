# Network Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The Network Service manages recruiter marketplace data with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/recruiters`, not `/api/v2/recruiters`
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

### Recruiters (`src/v2/recruiters/`)
- **Repository**: `RecruiterRepository` - Direct Supabase queries with access context
- **Service**: `RecruiterServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with role-based filtering

### Assignments (`src/v2/assignments/`)
- **Repository**: `AssignmentRepository` - Role assignments to jobs
- **Service**: `AssignmentServiceV2` - Assignment lifecycle management
- **Routes**: Job role assignment management

### Recruiter-Candidates (`src/v2/recruiter-candidates/`)
- **Repository**: `RecruiterCandidateRepository` - Enriched recruiter metadata
- **Service**: `RecruiterCandidateServiceV2` - Relationship management
- **Routes**: Recruiter-candidate relationship management with invitation actions

### Reputation (`src/v2/reputation/`)
- **Repository**: `ReputationRepository` - Recruiter performance tracking
- **Service**: `ReputationServiceV2` - Reputation scoring and management
- **Routes**: Performance metrics and reputation scoring

### Proposals (`src/v2/proposals/`)
- **Repository**: `ProposalRepository` - Candidate role assignment proposals
- **Service**: `ProposalServiceV2` - Proposal lifecycle management
- **Routes**: Proposal creation and management

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
    │   └── events.ts          # Event publisher
    ├── recruiters/            # Recruiters domain
    ├── assignments/           # Role assignments domain
    ├── recruiter-candidates/  # Recruiter-candidate relationships
    ├── reputation/            # Recruiter reputation management
    └── proposals/             # Candidate role assignment proposals
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs for enriched data
- Support cross-schema queries for data enrichment (network + identity + ats)
- Validate all input data and handle edge cases gracefully

### ❌ Never Do
- Create routes outside `src/v2/` structure
- Implement `/me` endpoints or user shortcuts
- Make HTTP calls to other services (ATS, billing, etc.)
- Skip access context in repository methods
- Create duplicate functionality that exists in V2
- Use V1 patterns, classes, or helper functions

## Common Patterns

### Repository Method Structure
```typescript
async list(clerkUserId: string, filters: RecruiterFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        
        .from('recruiters')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'recruiter') {
        // Recruiters see only their own profile
        query.eq('user_id', context.userId);
    } else if (context.isCompanyUser) {
        // Company users see recruiters they've worked with
        query.in('id', context.accessibleRecruiterIds || []);
    }
    // Platform admins see everything (no filter)
    
    // Apply search/filter criteria
    if (filters.search) {
        query.ilike('name', `%${filters.search}%`);
    }
    
    return query;
}
```

### Service Method with Events
```typescript
async update(id: string, clerkUserId: string, data: RecruiterUpdate) {
    // Validate input
    this.validateRecruiterData(data);
    
        const userContext = await this.accessResolver.resolve(clerkUserId);
    // Update via repository
    const recruiter = await this.repository.update(id, clerkUserId, data);
    
    // Publish event
    await this.eventPublisher?.publish('recruiter.updated', {
        recruiterId: id,
        changes: Object.keys(data),
        updatedBy: userContext.identityUserId,
    });
    
    return recruiter;
}
```

### Cross-Schema Data Enrichment
```typescript
// Enrich recruiter-candidate relationships with identity data
const enrichedRelationships = await this.supabase
    
    .from('recruiter_candidates')
    .select(`
        *,
        recruiter:recruiters(
            *,
            user:users(name, email)
        )
    `);
```

## Testing & Debugging

### Local Development
- Service runs on port 3003 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for domain events
- Test cross-service coordination via events
- Verify recruiter-candidate relationship management

### Database Testing
- Test role-based filtering with different user contexts
- Verify cross-schema JOINs work correctly (network + identity + ats)
- Test enriched recruiter metadata in responses

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - All legacy code removed