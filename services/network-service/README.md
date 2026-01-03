# Network Service

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The Network Service manages recruiter marketplace data with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
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

### Database Integration
- **Schema**: All tables in `network.*` schema
- **Access Control**: Role-based filtering in repository methods
- **Cross-Schema Queries**: Allowed for data enrichment (e.g., JOIN with `identity.*`, `ats.*`)
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
- Support cross-schema queries for data enrichment
- Validate all input data and handle edge cases gracefully

### ❌ Never Do
- Create routes outside `src/v2/` structure
- Implement `/me` endpoints or user shortcuts
- Make HTTP calls to other services (ATS, billing, etc.)
- Skip access context in repository methods
- Create duplicate functionality that exists in V2
- Use V1 patterns, classes, or helper functions

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