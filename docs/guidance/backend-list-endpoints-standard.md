# Backend List Endpoints - StandardListParams Guidance

This document outlines how to implement standardized list endpoints in V2 backend services using the `StandardListParams` pattern.

## Overview

All V2 services should implement consistent list endpoints that accept standardized parameters for pagination, filtering, searching, and sorting. This document covers the repository and service patterns for handling these parameters.

## Technology Stack

- **Types**: `StandardListParams` from `@splits-network/shared-types`
- **Access Control**: `resolveAccessContext` from `@splits-network/shared-access-context`
- **Database**: Direct Supabase client with role-based filtering
- **Response Format**: `StandardListResponse<T>` wrapper

---

## Core Implementation Pattern

### Repository Method Structure

```typescript
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';
import { resolveAccessContext } from '@splits-network/shared-access-context';

export class ExampleRepository {
    async findItems(
        clerkUserId: string,
        params: StandardListParams = {}
    ): Promise<StandardListResponse<any>> {
        // 1. Parse and validate parameters
        const page = params.page || 1;
        const limit = Math.min(params.limit || 25, 100); // Enforce max limit
        const offset = (page - 1) * limit;

        // 2. Parse filters from JSON string
        let filters: Record<string, any> = {};
        if (params.filters) {
            try {
                if (typeof params.filters === 'string') {
                    filters = JSON.parse(params.filters);
                } else {
                    filters = params.filters;
                }
            } catch (error) {
                console.error('Error parsing filters:', error);
                filters = {};
            }
        }

        // 3. Resolve access context for role-based filtering
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);

        // 4. Build base query with role-based access control
        let query = this.supabase
            
            .from('items')
            .select('*', { count: 'exact' });

        // 5. Apply role-based filtering
        if (accessContext.role === 'candidate') {
            query = query.eq('user_id', accessContext.userId);
        } else if (accessContext.role === 'recruiter') {
            // Filter to assigned items
            const assignments = await this.getRecruiterAssignments(accessContext.userId);
            query = query.in('id', assignments.map(a => a.item_id));
        } else if (accessContext.isCompanyUser) {
            query = query.in('company_id', accessContext.accessibleCompanyIds);
        }
        // Platform admins see everything (no filter)

        // 6. Apply generic filters first (equality matches)
        const specialFilters = ['search', 'scope', 'created_after', 'created_before', 'location'];
        for (const key of Object.keys(filters)) {
            const value = filters[key];
            if (value !== undefined && value !== null && !specialFilters.includes(key)) {
                query = query.eq(key, value);
            }
        }

        // 7. Apply special filters that need custom logic
        if (params.search) {
            query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
        }

        // 8. Apply field-specific filters that need special handling
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        // 9. Apply sorting
        const sortBy = params.sort_by || 'created_at';
        const sortOrder = params.sort_order?.toLowerCase() === 'asc' ? true : false;
        query = query.order(sortBy, { ascending: sortOrder });

        // 10. Apply pagination
        query = query.range(offset, offset + limit - 1);

        // 11. Execute query
        const { data, error, count } = await query;
        
        if (error) {
            throw error;
        }

        // 12. Return standardized response
        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page,
                limit,
                total_pages: Math.ceil((count || 0) / limit)
            }
        };
    }
}
```

## Parameter Handling

### JSON Filter Parsing

The frontend API client JSON-stringifies the `filters` object, so backend services must parse it:

```typescript
// Parse filters from JSON query parameter
let filters: Record<string, any> = {};
if (params.filters) {
    try {
        if (typeof params.filters === 'string') {
            filters = JSON.parse(params.filters);
        } else {
            // Already an object (e.g., from tests)
            filters = params.filters;
        }
    } catch (error) {
        console.error('Error parsing filters:', error);
        filters = {};
    }
}

console.log('Parsed filters:', filters);
// Example: { email: 'user@example.com', status: 'active', scope: 'mine' }
```

### Parameter Validation

```typescript
function validateListParams(params: StandardListParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 25));
    
    const validSortOrders = ['asc', 'desc'];
    const sortOrder = validSortOrders.includes(params.sort_order?.toLowerCase()) 
        ? params.sort_order.toLowerCase() as 'asc' | 'desc'
        : 'desc';

    return { page, limit, sortOrder };
}
```

## Role-Based Access Control

### Access Context Resolution

```typescript
import { resolveAccessContext } from '@splits-network/shared-access-context';

async findCandidates(clerkUserId: string, params: StandardListParams) {
    const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
    
    let query = this.supabase
        
        .from('candidates')
        .select('*', { count: 'exact' });

    // Apply role-based filtering
    switch (accessContext.role) {
        case 'candidate':
            // Candidates see only their own data
            query = query.eq('user_id', accessContext.userId);
            break;
            
        case 'recruiter':
            // Recruiters see assigned candidates
            if (filters.scope === 'mine') {
                const assignments = await this.getRecruiterAssignments(accessContext.userId);
                query = query.in('id', assignments.map(a => a.candidate_id));
            } else {
                // Broader access based on org membership + assignments
                const allowedIds = await this.getRecruiterAccessibleIds(accessContext);
                query = query.in('id', allowedIds);
            }
            break;
            
        case 'company_admin':
        case 'hiring_manager':
            // Company users see org-related data
            query = query.in('company_id', accessContext.accessibleCompanyIds);
            break;
            
        case 'platform_admin':
            // Platform admins see everything (no filter)
            break;
            
        default:
            // No access
            return { data: [], pagination: { total: 0, page: 1, limit: 25, total_pages: 0 } };
    }

    return query;
}
```

### Cross-Schema Access Patterns

```typescript
// Example: Recruiters with organization memberships + individual assignments
async getRecruiterAccessibleCandidateIds(accessContext: AccessContext): Promise<string[]> {
    const allowedIds = new Set<string>();

    // 1. Organization candidates (if recruiter is part of orgs)
    if (accessContext.organizationIds.length > 0) {
        const { data: orgCandidates, error } = await this.supabase
            
            .from('candidates')
            .select(`
                id,
                applications:applications(
                    job:jobs(
                        company:companies(identity_organization_id)
                    )
                )
            `);
        
        if (!error) {
            orgCandidates?.forEach((candidate: any) => {
                const hasOrgApp = candidate.applications?.some((app: any) => 
                    accessContext.organizationIds.includes(app.job?.company?.identity_organization_id)
                );
                if (hasOrgApp) {
                    allowedIds.add(candidate.id);
                }
            });
        }
    }

    // 2. Individual recruiter assignments
    const { data: assignments, error: relError } = await this.supabase
        
        .from('recruiter_candidates')
        .select('candidate_id')
        .eq('recruiter_id', accessContext.recruiterId)
        .eq('status', 'active');
    
    if (!relError) {
        assignments?.forEach(rel => allowedIds.add(rel.candidate_id));
    }

    return Array.from(allowedIds);
}
```

## Search Implementation

### Multi-Field Text Search

```typescript
// Search across multiple text fields
if (params.search) {
    const searchTerm = params.search.trim();
    if (searchTerm) {
        query = query.or(`
            full_name.ilike.%${searchTerm}%,
            email.ilike.%${searchTerm}%,
            location.ilike.%${searchTerm}%
        `);
    }
}
```

### Advanced Search Patterns

```typescript
// Support quoted phrases and multiple terms
function buildSearchFilter(searchTerm: string): string {
    const terms = searchTerm.match(/"[^"]+"|\S+/g) || [];
    const conditions: string[] = [];

    terms.forEach(term => {
        const cleanTerm = term.replace(/"/g, '');
        conditions.push(`full_name.ilike.%${cleanTerm}%`);
        conditions.push(`email.ilike.%${cleanTerm}%`);
    });

    return conditions.join(',');
}

if (params.search) {
    const searchFilter = buildSearchFilter(params.search);
    query = query.or(searchFilter);
}
```

## Filter Implementation

### Common Filter Patterns

#### Generic Filter Application

```typescript
// Generic approach - automatically apply all simple equality filters
for (const key of Object.keys(filters)) {
    const value = filters[key];
    if (value !== undefined && value !== null) {
        // Skip special filters that need custom handling
        if (['search', 'scope', 'created_after', 'created_before'].includes(key)) {
            continue;
        }
        
        // Apply direct equality filter
        query = query.eq(key, value);
    }
}
```

#### Special Filter Handling

```typescript
// Handle special filters that need custom logic
if (filters.search) {
    query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
}

// Array/multiple value filters  
if (filters.statuses && Array.isArray(filters.statuses)) {
    query = query.in('status', filters.statuses);
}

// Text/partial match filters
if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
}

// Date range filters
if (filters.created_after) {
    query = query.gte('created_at', filters.created_after);
}
if (filters.created_before) {
    query = query.lt('created_at', filters.created_before);
}

// Special logic filters
if (filters.scope === 'mine' && accessContext.recruiterId) {
    // Apply recruiter-specific filtering
    query = await this.applyRecruiterScopeFilter(query, accessContext.recruiterId);
}
```

#### Validated Generic Filtering

```typescript
// More secure approach with field validation
const allowedFilterFields = [
    'status', 'verification_status', 'employment_type', 
    'company_id', 'user_id', 'experience_level'
];

for (const key of Object.keys(filters)) {
    const value = filters[key];
    if (value !== undefined && value !== null) {
        // Only apply filters for allowed fields to prevent injection
        if (allowedFilterFields.includes(key)) {
            query = query.eq(key, value);
        }
    }
}
```

### Domain-Specific Filters

```typescript
// Example: Candidate-specific filters
private applyCandidateFilters(query: any, filters: Record<string, any>) {
    if (filters.verification_status) {
        query = query.eq('verification_status', filters.verification_status);
    }
    
    if (filters.has_resume !== undefined) {
        if (filters.has_resume) {
            query = query.not('resume_url', 'is', null);
        } else {
            query = query.is('resume_url', null);
        }
    }
    
    if (filters.experience_level) {
        query = query.eq('experience_level', filters.experience_level);
    }
    
    return query;
}
```

## Sorting Implementation

### Standard Sorting

```typescript
// Apply sorting with defaults
const sortBy = params.sort_by || 'created_at';
const sortOrder = params.sort_order?.toLowerCase() === 'asc' ? true : false;

// Validate sort field to prevent SQL injection
const allowedSortFields = [
    'created_at', 'updated_at', 'full_name', 'email', 
    'verification_status', 'location'
];

if (allowedSortFields.includes(sortBy)) {
    query = query.order(sortBy, { ascending: sortOrder });
} else {
    // Fall back to default
    query = query.order('created_at', { ascending: false });
}
```

### Multi-Field Sorting

```typescript
// Support secondary sort fields
const primarySort = params.sort_by || 'created_at';
const primaryOrder = params.sort_order?.toLowerCase() === 'asc' ? true : false;

query = query.order(primarySort, { ascending: primaryOrder });

// Always add a consistent secondary sort for pagination stability
if (primarySort !== 'created_at') {
    query = query.order('created_at', { ascending: false });
}
```

## Service Layer Pattern

```typescript
import { EventPublisher } from '../shared/events';

export class ExampleServiceV2 {
    constructor(
        private repository: ExampleRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async list(clerkUserId: string, params: StandardListParams) {
        // Validate parameters
        const validatedParams = this.validateListParams(params);
        
        // Delegate to repository
        const result = await this.repository.findItems(clerkUserId, validatedParams);
        
        // Optional: Enrich data or apply business logic
        result.data = await this.enrichListData(result.data, clerkUserId);
        
        // Optional: Publish analytics event
        await this.eventPublisher?.publish('items.listed', {
            userId: clerkUserId,
            count: result.data.length,
            filters: params.filters
        });
        
        return result;
    }

    private validateListParams(params: StandardListParams): StandardListParams {
        return {
            ...params,
            page: Math.max(1, params.page || 1),
            limit: Math.min(100, Math.max(1, params.limit || 25))
        };
    }

    private async enrichListData(items: any[], clerkUserId: string): Promise<any[]> {
        // Add computed fields, relationships, etc.
        return items.map(item => ({
            ...item,
            is_new: this.isRecentItem(item.created_at),
            // Add other computed fields
        }));
    }
}
```

## Route Handler Pattern

```typescript
// Fastify route handler
export async function itemsRoutes(app: FastifyInstance) {
    app.get('/v2/items', {
        preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin'], services),
        schema: {
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'integer', minimum: 1 },
                    limit: { type: 'integer', minimum: 1, maximum: 100 },
                    search: { type: 'string' },
                    sort_by: { type: 'string' },
                    sort_order: { type: 'string', enum: ['asc', 'desc'] },
                    filters: { type: 'string' } // JSON string
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        data: {
                            type: 'array',
                            items: { type: 'object' }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                total: { type: 'integer' },
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                total_pages: { type: 'integer' }
                            }
                        }
                    }
                }
            }
        }
    }, async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const params = request.query as StandardListParams;

        const result = await itemService.list(clerkUserId, params);
        
        return reply.send(result);
    });
}
```

## Error Handling

```typescript
async findItems(clerkUserId: string, params: StandardListParams) {
    try {
        // Validate access context first
        const accessContext = await resolveAccessContext(this.supabase, clerkUserId);
        if (!accessContext.userId) {
            throw new Error('Invalid user context');
        }

        // Parse and validate filters
        let filters: Record<string, any> = {};
        if (params.filters) {
            try {
                filters = typeof params.filters === 'string' 
                    ? JSON.parse(params.filters) 
                    : params.filters;
            } catch (parseError) {
                console.error('Filter parsing error:', parseError);
                throw new Error('Invalid filter format');
            }
        }

        // Execute query with error handling
        const { data, error, count } = await query;
        
        if (error) {
            console.error('Database query error:', error);
            throw new Error('Failed to fetch items');
        }

        return {
            data: data || [],
            pagination: {
                total: count || 0,
                page: params.page || 1,
                limit: params.limit || 25,
                total_pages: Math.ceil((count || 0) / (params.limit || 25))
            }
        };
    } catch (error) {
        console.error('Repository error:', error);
        throw error;
    }
}
```

## Performance Considerations

### Database Indexes

```sql
-- Essential indexes for list endpoints
CREATE INDEX idx_candidates_created_at ON candidates(created_at DESC);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_verification_status ON candidates(verification_status);
CREATE INDEX idx_candidates_location ON candidates(location);

-- Composite indexes for common filter combinations
CREATE INDEX idx_candidates_status_created_at ON candidates(status, created_at DESC);

-- Text search indexes
CREATE INDEX idx_candidates_search ON candidates USING gin(
    (setweight(to_tsvector('english', full_name), 'A') ||
     setweight(to_tsvector('english', coalesce(email, '')), 'B'))
);
```

### Query Optimization

```typescript
// Use selective loading for large datasets
if (params.include) {
    const includes = params.include.split(',');
    
    // Conditionally include related data
    let selectClause = '*';
    if (includes.includes('applications')) {
        selectClause += ', applications:applications(*)';
    }
    if (includes.includes('recruiter_relationships')) {
        selectClause += ', recruiter_relationships:recruiter_candidates(*)';
    }
    
    query = query.select(selectClause, { count: 'exact' });
} else {
    // Default minimal selection
    query = query.select('*', { count: 'exact' });
}
```

## Testing Patterns

### Repository Unit Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('CandidateRepository.findCandidates', () => {
    let repository: CandidateRepository;

    beforeEach(() => {
        repository = new CandidateRepository(supabaseUrl, supabaseKey);
    });

    it('should return paginated results', async () => {
        const result = await repository.findCandidates('clerk_user_123', {
            page: 1,
            limit: 10
        });

        expect(result.data).toBeArray();
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.limit).toBe(10);
        expect(result.pagination.total).toBeGreaterThanOrEqual(0);
    });

    it('should apply search filters', async () => {
        const result = await repository.findCandidates('clerk_user_123', {
            search: 'john',
            filters: {
                location: 'San Francisco'
            }
        });

        result.data.forEach(candidate => {
            const matchesSearch = 
                candidate.full_name.toLowerCase().includes('john') ||
                candidate.email.toLowerCase().includes('john');
            expect(matchesSearch).toBe(true);
        });
    });

    it('should enforce role-based access', async () => {
        const candidateResult = await repository.findCandidates('candidate_clerk_id', {});
        const recruiterResult = await repository.findCandidates('recruiter_clerk_id', {});
        
        // Candidates should see only their own data
        expect(candidateResult.data.every(c => c.user_id === 'candidate_user_id')).toBe(true);
        
        // Recruiters should see assigned candidates
        expect(recruiterResult.data.length).toBeGreaterThanOrEqual(0);
    });
});
```

## Best Practices

### ✅ Do

- Always use `StandardListParams` and `StandardListResponse` types
- Parse JSON filters with try-catch error handling
- Apply role-based filtering using access context
- Validate and sanitize sort fields to prevent injection
- Use database indexes for commonly filtered/sorted fields
- Implement pagination limits (max 100 items)
- Include `count: 'exact'` for accurate pagination
- Handle cross-schema relationships carefully
- Log filter parsing errors for debugging

### ❌ Don't

- Skip access context resolution for list endpoints
- Trust sort field parameters without validation
- Ignore filter parsing errors silently
- Return unlimited results without pagination
- Use string concatenation for search queries
- Make separate queries for each filter (combine in one query)
- Forget to handle empty result sets gracefully
- Expose internal database errors to clients

---

## Related Documentation

- [Frontend List Calls Standard](./frontend-list-calls-standard.md)
- [V2 Architecture Implementation Guide](../migration/v2/V2-ARCHITECTURE-IMPLEMENTATION-GUIDE.md)
- [API Response Format](./api-response-format.md)

---

**Last Updated**: January 5, 2026  
**Version**: 1.0