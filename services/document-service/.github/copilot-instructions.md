# Document Service - Copilot Instructions

**Status**: ✅ V2 ONLY SERVICE - All V1 legacy code removed

## Service Overview

The Document Service manages universal document storage with a **V2-only architecture**. All legacy V1 implementations have been removed as of January 2, 2026.

## Architecture Guidelines

### ✅ V2 Patterns ONLY
- All implementations use V2 standardized patterns
- Domain-based folder structure under `src/v2/`
- **shared-api-client automatically prepends `/api/v2` to all requests** - frontend calls use simple paths like `/documents`, not `/api/v2/documents`
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

### Documents (`src/v2/documents/`)
- **Repository**: `DocumentRepositoryV2` - Direct Supabase queries with access context
- **Service**: `DocumentServiceV2` - Business logic, validation, event publishing
- **Routes**: Standard 5-route pattern with role-based filtering

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
- **Storage**: Supabase Storage for file storage with pre-signed URLs

### File Structure
```
src/
├── index.ts                    # Main server entry point (V2-only)
├── storage.ts                  # Supabase Storage client
└── v2/                         # ALL V2 implementations
    ├── routes.ts               # V2 route registration
    ├── shared/                 # V2 shared utilities
    │   ├── events.ts          # Event publisher
    │   └── helpers.ts         # V2 validation, context helpers
    └── documents/             # Documents domain
        ├── types.ts           # Document types
        ├── repository.ts      # Document CRUD methods
        ├── service.ts         # DocumentServiceV2
        └── routes.ts          # 5-route pattern
```

## Key Rules

### ✅ Always Do
- Use shared access context for all data access
- Follow V2 repository patterns with role-based filtering
- Implement single update methods with smart validation
- Publish events for all significant state changes
- Use direct Supabase queries with proper JOINs for enriched data
- Handle file uploads via Supabase Storage
- Generate pre-signed URLs for secure file access
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
async list(clerkUserId: string, filters: DocumentFilters) {
    const context = await resolveAccessContext(clerkUserId, this.supabase);
    
    const query = this.supabase
        
        .from('documents')
        .select('*');
        
    // Apply role-based filtering
    if (context.role === 'candidate') {
        // Candidates see their own documents
        query.eq('uploaded_by', context.userId);
    } else if (context.role === 'recruiter') {
        // Recruiters see assigned entity documents
        const assignments = await this.getRecruiterAssignments(context.userId);
        query.or(`entity_id.in.(${assignments.join(',')})`);
    } else if (context.isCompanyUser) {
        // Company users see their organization's documents
        query.in('entity_id', context.accessibleEntityIds);
    }
    // Platform admins see everything (no filter)
    
    // Apply search/filter criteria
    if (filters.search) {
        query.ilike('filename', `%${filters.search}%`);
    }
    
    return query;
}
```

### Service Method with Events
```typescript
async createDocument(clerkUserId: string, data: DocumentCreate) {
    // Upload file to storage
    const storagePath = await this.storage.uploadFile(data.file, data.originalFileName);
    
    // Create document record
    const document = await this.repository.create(clerkUserId, {
        ...data,
        storage_path: storagePath
    });
    
    // Publish event
    await this.eventPublisher?.publish('document.created', {
        documentId: document.id,
        entityType: document.entity_type,
        entityId: document.entity_id,
        uploadedBy: clerkUserId
    });
    
    return document;
}
```

### File Upload Handling
```typescript
// Multi-entity attachments
export interface DocumentCreate {
    file: Buffer;
    originalFileName: string;
    entity_type: 'candidate' | 'job' | 'application' | 'company';
    entity_id: string;
    document_type: 'resume' | 'cover_letter' | 'job_description' | 'contract';
    metadata?: Record<string, any>;
}
```

## Testing & Debugging

### Local Development
- Service runs on port 3007 by default
- Swagger docs available at `/docs` endpoint
- Uses shared config packages for environment setup

### Event Testing
- Monitor RabbitMQ for domain events
- Test cross-service coordination via events
- Verify document processing workflows

### Storage Testing
- Test file uploads with various types (PDF, DOCX, etc.)
- Verify pre-signed URL generation and expiration
- Test file size limits and validation

---

**Last Updated**: January 2, 2026  
**V1 Cleanup Status**: ✅ COMPLETE - All legacy code removed