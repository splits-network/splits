# ATS Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The ATS Service manages core recruiting data with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/candidates`, not `/api/v2/candidates`
- 5-route CRUD pattern for all resources
- Repository pattern with direct Supabase access
- Service layer with business logic and validation
- Event-driven coordination via RabbitMQ

### 🚫 NO V1 Code
- No legacy route handlers outside `src/v2/`
- No V1 repository or service classes
- No HTTP calls to other services (use database queries)
- No Phase 1/2/3 legacy patterns

## Current Domains

### Companies (`src/v2/companies/`)
- **Repository**: `CompanyRepository` - Direct Supabase queries with access context
- **Service**: `CompanyServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with role-based filtering

### Jobs (`src/v2/jobs/`)
- **Repository**: `JobRepository` - Advanced filtering, search, includes support
- **Service**: `JobServiceV2` - Job lifecycle management, validation
- **Routes**: Comprehensive job management with requirements, pre-screen questions

### Candidates (`src/v2/candidates/`)
- **Repository**: `CandidateRepository` - Role-scoped access (candidates see own, recruiters see assigned)
- **Service**: `CandidateServiceV2` - Profile management, document integration
- **Routes**: Full candidate lifecycle with document attachments
  - ✅ **`GET /v2/candidates/me`** - Get current user's candidate profile (direct lookup)
  - `GET /v2/candidates` - List candidates (role-filtered)
  - `GET /v2/candidates/:id` - Get candidate by ID
  - `POST /v2/candidates` - Create candidate
  - `PATCH /v2/candidates/:id` - Update candidate
  - `DELETE /v2/candidates/:id` - Delete candidate

### Applications (`src/v2/applications/`)
- **Repository**: `ApplicationRepository` - Complex joins for enriched data
- **Service**: `ApplicationServiceV2` - Stage transitions, AI review integration
- **Routes**: Application management with includes (candidate, job, documents, ai_review)

### Placements (`src/v2/placements/`)
- **Repository**: `PlacementRepository` - Recruiter assignment tracking
- **Service**: `PlacementServiceV2` - Successful placement records
- **Routes**: Placement management with fee tracking

### Supporting Domains
- **Job Requirements** (`src/v2/job-requirements/`) - Skill/experience requirements
- **Pre-Screen Questions** (`src/v2/job-pre-screen-questions/`) - Job questionnaires
- **Pre-Screen Answers** (`src/v2/job-pre-screen-answers/`) - Candidate responses
- **AI Reviews** (`src/v2/ai-review/`) - AI-powered fit analysis
- **Statistics** (`src/v2/stats/`) - Dashboard metrics and analytics

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
    ├── types.ts                # V2 shared types
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher
    │   ├── domain-consumer.ts # Event consumer
    │   └── pagination.ts      # Pagination utilities
    ├── companies/             # Companies domain
    ├── jobs/                  # Jobs domain  
    ├── candidates/            # Candidates domain
    ├── applications/          # Applications domain
    ├── placements/            # Placements domain
    ├── job-requirements/      # Job requirements domain
    ├── job-pre-screen-questions/ # Pre-screen questions
    ├── job-pre-screen-answers/   # Pre-screen answers
    ├── ai-review/             # AI reviews integration
    └── stats/                 # Statistics and analytics
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs for enriched data
- Validate all input data and handle edge cases gracefully
- Support include parameters for related data fetching

### ❌ Never Do
- Create routes outside `src/v2/` structure
- Implement `/me` endpoints or user shortcuts
- Make HTTP calls to other services (network, billing, etc.)
- Skip access context in repository methods
- Create duplicate functionality that exists in V2
- Use V1 patterns, classes, or helper functions

## Common Patterns

### Repository Method Structure
```typescript
async list(clerkUserId: string, filters: JobFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        
        .from('jobs')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'recruiter') {
        // Recruiters see assigned jobs
        const assignments = await this.getRecruiterAssignments(context.userId);
        query.in('id', assignments.map(a => a.job_id));
    } else if (context.isCompanyUser) {
        // Company users see their organization's jobs
        query.in('company_id', context.accessibleCompanyIds);
    }
    
    // Apply search/filter criteria
    if (filters.search) {
        query.ilike('title', `%${filters.search}%`);
    }
    
    return query;
}
```

### Service Method with Events
```typescript
async create(clerkUserId: string, data: JobCreate) {
    // Validate input
    this.validateJobData(data);
    
        const userContext = await this.accessResolver.resolve(clerkUserId);
    // Create via repository
    const job = await this.repository.create(clerkUserId, data);
    
    // Publish event
    await this.eventPublisher?.publish('job.created', {
        jobId: job.id,
        companyId: job.company_id,
        createdBy: userContext.identityUserId,
    });
    
    return job;
}
```

### Include Parameters
```typescript
// GET /v2/applications/:id?include=candidate,job,ai_review
if (includes.includes('candidate')) {
    application.candidate = await this.getCandidateData(application.candidate_id);
}
```

## Testing & Debugging

### Local Development
- Service runs on port 3002 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for domain events
- Use domain consumer logs to verify event processing
- Test cross-service coordination via events

### Database Testing
- Test role-based filtering with different user contexts
- Verify cross-schema JOINs work correctly
- Test pagination and search functionality

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - All legacy code removed