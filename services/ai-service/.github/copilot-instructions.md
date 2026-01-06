# AI Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - No V1 legacy code remains

## Service Overview

The AI Service is a **V2-only service** that provides AI-powered features including candidate-job fit analysis, matching, and fraud detection.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/reviews`, not `/api/v2/reviews`
- 5-route CRUD pattern where applicable
- Repository pattern with Supabase
- Event-driven architecture with RabbitMQ

### 🚫 NO V1 Code
- No legacy route handlers outside `src/v2/`
- No `/me` endpoints or user-specific routes
- No V1 service patterns
- All routes follow `/v2/` prefix conventions

## Current Domains

### AI Reviews (`src/v2/reviews/`)
- **Repository**: `AIReviewRepository` - Direct Supabase queries with access context
- **Service**: `AIReviewServiceV2` - Business logic, OpenAI integration, validation
- **Routes**: Standard V2 5-route pattern
  - `GET /v2/reviews` - List reviews with filtering
  - `GET /v2/reviews/:id` - Get review by ID
  - `POST /v2/reviews` - Create new review
  - `PATCH /v2/reviews/:id` - Update review
  - `DELETE /v2/reviews/:id` - Soft delete review

### Event Processing
- **Domain Consumer**: `DomainEventConsumer` - Listens for application events
- **Event Publisher**: `EventPublisher` - Publishes AI review completion events
- **Trigger Events**: 
  - `application.stage_changed` → AI review stage
  - `application.created` → Auto-trigger reviews if enabled

## Development Guidelines

### Adding New Features
1. **Use V2 patterns exclusively** - Follow existing domain structure
2. **Create new domains** in `src/v2/<domain>/` with repository, service, routes
3. **Follow 5-route pattern** for CRUD operations
4. **Use access context** from `@splits-network/shared-access-context`
5. **Publish events** for significant state changes

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

### Integration Points
- **Database**: `ai.ai_reviews` table (V2 schema)
- **Events**: RabbitMQ for application lifecycle events
- **External APIs**: OpenAI for text analysis and scoring
- **Access Control**: Role-based via shared access context

### File Structure
```
src/
├── index.ts                    # Main server entry point
├── domain-consumer.ts          # RabbitMQ event consumer
└── v2/                         # ALL V2 implementations
    ├── routes.ts               # V2 route registration
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher
    │   ├── helpers.ts         # Validation, context helpers  
    │   └── pagination.ts      # Pagination utilities
    └── reviews/               # AI reviews domain
        ├── types.ts           # Domain types and interfaces
        ├── repository.ts      # Supabase data access
        ├── service.ts         # Business logic
        └── routes.ts          # HTTP routes
```

## Key Rules

### ✅ Always Do
- Use shared access context for authorization
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for AI review lifecycle
- Use direct Supabase queries (no HTTP service calls)
- Validate OpenAI responses and handle failures gracefully

### ❌ Never Do
- Create routes outside `src/v2/` structure
- Implement `/me` endpoints or user shortcuts
- Make HTTP calls to other services (use database queries)
- Skip access context in repository methods
- Hard-code OpenAI prompts (use configurable templates)

## Testing & Debugging

### Local Development
- Service runs on port 3009 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for application events
- Use domain consumer logs to verify event processing
- Test AI review generation with real application data

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - Service was already V2-only