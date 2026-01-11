# Automation Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The Automation Service manages AI-powered automation and marketplace intelligence with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/matches`, not `/api/v2/matches`
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

### Matches (`src/v2/matches/`)
- **Repository**: `CandidateMatchRepository` - Direct Supabase queries with access context
- **Service**: `CandidateMatchServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with AI-powered matching features
  - `GET /v2/matches` - List candidate-job matches with filters
  - `GET /v2/matches/:id` - Get single match with details
  - `POST /v2/matches` - Create new match suggestion
  - `PATCH /v2/matches/:id` - Update match status, review decisions
  - `DELETE /v2/matches/:id` - Remove match suggestion

### Fraud Signals (`src/v2/fraud-signals/`)
- **Repository**: `FraudSignalRepository` - Fraud detection and anomaly tracking
- **Service**: `FraudSignalServiceV2` - Fraud analysis and reporting
- **Routes**: Standard 5-route pattern for fraud management

### Automation Rules (`src/v2/rules/`)
- **Repository**: `AutomationRuleRepository` - Rule definition and execution
- **Service**: `AutomationRuleServiceV2` - Rule management and triggering
- **Routes**: Standard 5-route pattern for automation rules

### Marketplace Metrics (`src/v2/metrics/`)
- **Repository**: `MarketplaceMetricsRepository` - Metrics CRUD and aggregation operations
- **Service**: `MarketplaceMetricsServiceV2` - Metrics calculation and management
- **Routes**: Standard 5-route pattern for metrics viewing

### Background Event Processing (`src/v2/shared/domain-consumer.ts`)
- **Status**: V2 implementation
- **Purpose**: Listen to RabbitMQ domain events and trigger automated workflows
- **Events**: `application.created`, `application.stage_changed`
- **Integration**: Triggers AI review processes via AI service

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
- **Schema**: All tables in `automation.*` schema
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
    │   └── domain-consumer.ts # Event consumer for automation triggers
    ├── matches/               # Candidate-job matching domain
    ├── fraud-signals/         # Fraud detection domain
    ├── rules/                 # Automation rules domain
    └── metrics/               # Marketplace metrics domain
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs for enriched data
- Validate all input data and handle edge cases gracefully
- Use event-driven architecture for automation triggers

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
async list(clerkUserId: string, filters: MatchFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        
        .from('candidate_matches')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'recruiter') {
        // Recruiters see matches for their assigned candidates/jobs
        const assignments = await this.getRecruiterAssignments(context.userId);
        query.in('job_id', assignments.map(a => a.job_id));
    } else if (context.isCompanyUser) {
        // Company users see matches for their organization's jobs
        query.in('company_id', context.accessibleCompanyIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply search/filter criteria
    if (filters.search) {
        query.ilike('candidate_name', `%${filters.search}%`);
    }
    
    return query;
}
```

### Service Method with Events
```typescript
async create(clerkUserId: string, data: MatchCreate) {
    // Validate input
    this.validateMatchData(data);
    
        const userContext = await this.accessResolver.resolve(clerkUserId);
    // Create via repository
    const match = await this.repository.create(clerkUserId, data);
    
    // Publish event
    await this.eventPublisher?.publish('match.created', {
        matchId: match.id,
        candidateId: match.candidate_id,
        jobId: match.job_id,
        createdBy: userContext.identityUserId,
    });
    
    return match;
}
```

### Event-Driven Automation
```typescript
// Domain event consumer triggers automation
async function handleApplicationCreated(event: ApplicationCreatedEvent) {
    // Trigger AI matching for new applications
    await matchService.generateMatches(event.candidateId, event.jobId);
    
    // Run fraud detection analysis
    await fraudService.analyzeApplication(event.applicationId);
    
    // Execute applicable automation rules
    await rulesService.executeRules('application_created', event);
}
```

## Testing & Debugging

### Local Development
- Service runs on port 3007 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for domain events
- Test automation triggers with application events
- Verify AI integration and fraud detection

### Database Testing
- Test role-based filtering with different user contexts
- Verify cross-schema JOINs work correctly (automation + identity + ats)
- Test automation rule execution and metrics aggregation

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - All legacy code removed