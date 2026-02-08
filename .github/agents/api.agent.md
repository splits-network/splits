---
description: 'Implement backend services following V2 architecture. Repositories, services, routes, migrations, events.'
tools: ['search/codebase', 'edit/editFiles', 'read/problems', 'search', 'execute/runInTerminal', 'execute/getTerminalOutput']
---
# API Implementation Agent

Implement backend services following V2 architecture patterns. Repositories with access context, services with validation, 5-route endpoints.

## Core Responsibility

Build backend APIs from architect's design. V2 patterns mandatory, access context enforced, events published.

## Implementation Process

### 1. Review Architecture

**Extract from architect:**
- Database migrations
- Service and repository specifications
- Access control logic
- Event definitions
- Integration patterns

### 2. Create Database Migration

**Location**: `services/{service-name}/migrations/`

```sql
-- 001_create_feature_table.sql
CREATE TABLE feature_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_user ON feature_data(user_id);
CREATE INDEX idx_feature_company ON feature_data(company_id);
```

### 3. Implement Repository

**Location**: `services/{service-name}/src/v2/{domain}/repository.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export class FeatureRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(
        clerkUserId: string,
        params: StandardListParams
    ): Promise<StandardListResponse<Feature>> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const { page = 1, limit = 25, search, filters = {}, sort_by, sort_order } = params;
        const offset = (page - 1) * limit;
        
        let query = this.supabase
            .from('feature_data')
            .select('*', { count: 'exact' });
        
        // Role-based filtering
        if (context.role === 'candidate') {
            query = query.eq('user_id', context.userId);
        } else if (context.isCompanyUser) {
            query = query.in('company_id', context.accessibleCompanyIds);
        }
        
        // Apply filters
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        
        // Sorting
        if (sort_by) {
            query = query.order(sort_by, { ascending: sort_order === 'asc' });
        }
        
        // Pagination
        query = query.range(offset, offset + limit - 1);
        
        const { data, error, count } = await query;
        if (error) throw error;
        
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

    async getById(id: string, clerkUserId: string): Promise<Feature | null> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        let query = this.supabase
            .from('feature_data')
            .select('*')
            .eq('id', id);
        
        // Apply same role-based filtering
        if (context.role === 'candidate') {
            query = query.eq('user_id', context.userId);
        } else if (context.isCompanyUser) {
            query = query.in('company_id', context.accessibleCompanyIds);
        }
        
        const { data, error } = await query.single();
        if (error) throw error;
        return data;
    }

    async create(clerkUserId: string, data: FeatureCreate): Promise<Feature> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const { data: created, error } = await this.supabase
            .from('feature_data')
            .insert({
                ...data,
                user_id: context.userId
            })
            .select()
            .single();
        
        if (error) throw error;
        return created;
    }

    async update(
        id: string,
        clerkUserId: string,
        data: FeatureUpdate
    ): Promise<Feature> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        let query = this.supabase
            .from('feature_data')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);
        
        // Apply access filtering
        if (context.role === 'candidate') {
            query = query.eq('user_id', context.userId);
        } else if (context.isCompanyUser) {
            query = query.in('company_id', context.accessibleCompanyIds);
        }
        
        const { data: updated, error } = await query.select().single();
        if (error) throw error;
        return updated;
    }

    async delete(id: string, clerkUserId: string): Promise<void> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        let query = this.supabase
            .from('feature_data')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id);
        
        // Apply access filtering
        if (context.isCompanyUser) {
            query = query.in('company_id', context.accessibleCompanyIds);
        }
        
        const { error } = await query;
        if (error) throw error;
    }
}
```

### 4. Implement Service Layer

**Location**: `services/{service-name}/src/v2/{domain}/service.ts`

```typescript
import { EventPublisher } from '../shared/events';
import { FeatureRepository } from './repository';

export class FeatureServiceV2 {
    constructor(
        private repository: FeatureRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async list(clerkUserId: string, params: StandardListParams) {
        return await this.repository.list(clerkUserId, params);
    }

    async getById(id: string, clerkUserId: string) {
        const feature = await this.repository.getById(id, clerkUserId);
        if (!feature) {
            throw new Error('Feature not found');
        }
        return feature;
    }

    async create(clerkUserId: string, data: FeatureCreate) {
        // Validation
        this.validateCreate(data);
        
        const feature = await this.repository.create(clerkUserId, data);
        
        // Publish event
        await this.eventPublisher?.publish('feature.created', {
            featureId: feature.id,
            userId: feature.user_id,
            createdBy: clerkUserId
        });
        
        return feature;
    }

    async update(id: string, clerkUserId: string, data: FeatureUpdate) {
        // Smart validation based on what's being updated
        if (data.status) {
            this.validateStatus(data.status);
        }
        
        const feature = await this.repository.update(id, clerkUserId, data);
        
        // Publish event
        await this.eventPublisher?.publish('feature.updated', {
            featureId: id,
            changes: Object.keys(data),
            updatedBy: clerkUserId
        });
        
        return feature;
    }

    async delete(id: string, clerkUserId: string) {
        await this.repository.delete(id, clerkUserId);
        
        // Publish event
        await this.eventPublisher?.publish('feature.deleted', {
            featureId: id,
            deletedBy: clerkUserId
        });
    }

    private validateCreate(data: FeatureCreate) {
        if (!data.name || data.name.trim() === '') {
            throw new Error('Name is required');
        }
    }

    private validateStatus(status: string) {
        const valid = ['active', 'inactive', 'archived'];
        if (!valid.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${valid.join(', ')}`);
        }
    }
}
```

### 5. Create Routes (5-Route Pattern)

**Location**: `services/{service-name}/src/v2/{domain}/routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { FeatureServiceV2 } from './service';

export async function featureRoutes(app: FastifyInstance) {
    const service = new FeatureServiceV2(/* dependencies */);

    // LIST - Role-scoped collection
    app.get('/api/v2/features', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const params = {
            page: Number(request.query.page) || 1,
            limit: Number(request.query.limit) || 25,
            search: request.query.search as string,
            filters: request.query.filters || {},
            sort_by: request.query.sort_by as string,
            sort_order: request.query.sort_order as 'asc' | 'desc'
        };
        
        const result = await service.list(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // GET BY ID - Single resource
    app.get('/api/v2/features/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        
        const feature = await service.getById(id, clerkUserId);
        return reply.send({ data: feature });
    });

    // CREATE - New resource
    app.post('/api/v2/features', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const data = request.body as FeatureCreate;
        
        const feature = await service.create(clerkUserId, data);
        return reply.code(201).send({ data: feature });
    });

    // UPDATE - Single method handles all updates
    app.patch('/api/v2/features/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        const data = request.body as FeatureUpdate;
        
        const feature = await service.update(id, clerkUserId, data);
        return reply.send({ data: feature });
    });

    // DELETE - Soft delete
    app.delete('/api/v2/features/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        
        await service.delete(id, clerkUserId);
        return reply.send({ data: { message: 'Deleted successfully' } });
    });
}
```

### 6. Register Routes

**Location**: `services/{service-name}/src/v2/routes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { featureRoutes } from './features/routes';

export async function registerV2Routes(app: FastifyInstance) {
    await app.register(featureRoutes);
    // ... other domain routes
}
```

## Critical Rules

### V2 Architecture
- ✅ 5-route pattern (LIST, GET, CREATE, PATCH, DELETE)
- ✅ Response envelope: `{ data, pagination }`
- ✅ Access context in all repository methods
- ✅ Single update method with smart validation
- ✅ Events published after state changes

### Access Control
- ✅ Use `resolveAccessContext` from `@splits-network/shared-access-context`
- ✅ Apply role-based filtering in repository layer
- ✅ Never bypass access checks
- ✅ Trust x-clerk-user-id header from gateway

### Database Patterns
- ✅ All tables in public schema
- ✅ Use JOINs for enriched data (no N+1)
- ✅ Add indexes for common queries
- ✅ Use transactions for multi-table updates

### Event Publishing
- ✅ Publish after successful commits
- ✅ Minimal payload (IDs primarily)
- ✅ Past tense naming: `domain.action`
- ✅ Handle publish failures gracefully

## Testing

Run service locally:
```bash
cd services/{service-name}
pnpm dev
```

Test endpoints with curl:
```bash
# LIST
curl http://localhost:3002/v2/features?page=1&limit=25

# GET BY ID
curl http://localhost:3002/v2/features/{id}

# CREATE
curl -X POST http://localhost:3002/v2/features \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# UPDATE
curl -X PATCH http://localhost:3002/v2/features/{id} \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# DELETE
curl -X DELETE http://localhost:3002/v2/features/{id}
```

## Handoff to Reviewer

Provide for review:
- Database migration applied
- Repository with access context
- Service with validation and events
- Routes following 5-route pattern
- All endpoints returning `{ data }` envelope

Reviewer agent will validate V2 compliance.
