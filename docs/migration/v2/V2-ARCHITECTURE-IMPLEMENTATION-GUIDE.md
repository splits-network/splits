# V2 Architecture Implementation Guide

**Status**: 🚀 Ready for Implementation  
**Created**: December 29, 2025  
**Target**: Complete service simplification and standardization  
**Approach**: Incremental v2/ folder migration

---

## Executive Summary

This document provides complete guidance for implementing the V2 architecture - a dramatically simplified, standardized approach that reduces complexity by 70-80% while improving performance 10-25x.

**Core Principles**:
1. **Standardized 5-Route Pattern** - Every resource has exactly 5 routes
2. **Single-Method Services** - One update method with smart validation
3. **Direct Supabase Queries** - No service-to-service calls, no SQL functions
4. **Role-Based Scoping** - Backend determines data access via database JOINs  
   - Always start from `users` using the Clerk user ID passed from API Gateway  
   - Join `memberships` for company roles (company_admin, hiring_manager, platform_admin)  
   - Join `recruiters` for recruiter identities  
   - Join `candidates` for candidate identities  
   - Apply filters based on the roles discovered so `/api/v2/*` returns only records the caller owns (candidates see their own applications, recruiters see their placements, company users see org data, platform admins see everything)
5. **Incremental Migration** - v2/ folder approach, route-by-route rollout

**Why V2**:
- ❌ Current: 80% time fixing breaks, fragmented methods, complex routing
- ✅ V2: Predictable patterns, single update methods, easy maintenance

---

## Services Requiring V2 Implementation

This V2 architecture pattern **MUST be applied to ALL backend services** in the Splits Network platform:

### Backend Services (All Require V2)

1. **services/api-gateway**
   - V2 route proxies
   - Centralized RBAC with requireRoles
   - Simplified header forwarding (x-clerk-user-id only)

2. **services/ats-service**
   - Jobs, Companies, Candidates, Applications, Placements
   - Document attachments integration
   - Stage management and transitions

3. **services/network-service**
   - Recruiters, Assignments, Recruiter-Candidates
   - Reputation/ratings
   - Marketplace visibility

4. **services/billing-service**
   - Plans, Subscriptions, Payouts
   - Stripe integration
   - Payment processing

5. **services/identity-service**
   - Users, Organizations, Memberships
   - Clerk synchronization
   - Invitations and onboarding

6. **services/notification-service**
   - Email notifications (Resend integration)
   - Event-driven messaging
   - Template management

7. **services/automation-service**
   - AI matching
   - Fraud detection
   - Metrics aggregation

8. **services/document-service**
   - File storage (Supabase Storage)
   - Resume/document uploads
   - Pre-signed URL generation

### Implementation Priority

**Phase 1 (Week 1-2)**: Core ATS
- ✅ ats-service (Jobs, Companies, Candidates, Applications, Placements)

**Phase 2 (Week 3)**: Network & Marketplace
- ⏳ network-service (Recruiters, Assignments, Reputation)

**Phase 3 (Week 4)**: Billing & Supporting Services
- ⏳ billing-service (Plans, Subscriptions, Payouts)
- ⏳ identity-service (if CRUD endpoints exist)
- ⏳ document-service

**Phase 4 (Week 5)**: Gateway & Frontend
- ⏳ api-gateway (V2 route registration)
- ⏳ Frontend migration to V2 endpoints

**Phase 5 (Week 6)**: Testing & Cleanup
- ⏳ End-to-end testing
- ⏳ Performance validation
- ⏳ V1 code removal

---

## Table of Contents

1. [V2 Folder Structure](#v2-folder-structure)
2. [The Standardized 5-Route Pattern](#the-standardized-5-route-pattern)
3. [Repository Layer - V2](#repository-layer-v2)
4. [Service Layer - V2](#service-layer-v2)
5. [Routes Layer - V2](#routes-layer-v2)
6. [Gateway Layer - V2](#gateway-layer-v2)
7. [Implementation Checklist](#implementation-checklist)
8. [Migration Strategy](#migration-strategy)
9. [Testing Approach](#testing-approach)
10. [Cleanup Plan](#cleanup-plan)

---

## V2 Folder Structure

### Per-Service Structure

```
services/ats-service/
├── src/
│   ├── types.ts                    # Shared types (v1 and v2)
│   ├── index.ts                    # Entry point (routes to v1/v2)
│   ├── v1/                         # Legacy (gradually remove)
│   │   ├── repository.ts
│   │   ├── service.ts
│   │   ├── services/
│   │   │   ├── jobs/
│   │   │   ├── companies/
│   │   │   └── ...
│   │   └── routes/
│   │       ├── jobs/
│   │       ├── companies/
│   │       └── ...
│   └── v2/                         # New domain-based architecture
│       ├── shared/                 # Shared V2 utilities
│       │   ├── events.ts           # EventPublisher class
│       │   ├── helpers.ts          # requireUserContext, validation
│       │   └── pagination.ts       # PaginationParams, PaginationResponse
│       ├── jobs/                   # Jobs domain
│       │   ├── types.ts            # JobFilters, JobUpdate
│       │   ├── repository.ts       # Job CRUD methods (~100-150 lines)
│       │   └── service.ts          # JobServiceV2 with validation
│       ├── companies/              # Companies domain
│       │   ├── types.ts            # CompanyFilters, CompanyUpdate
│       │   ├── repository.ts       # Company CRUD methods
│       │   └── service.ts          # CompanyServiceV2
│       ├── candidates/             # Candidates domain
│       │   ├── types.ts            # CandidateFilters, CandidateUpdate
│       │   ├── repository.ts       # Candidate CRUD methods
│       │   └── service.ts          # CandidateServiceV2
│       ├── applications/           # Applications domain
│       │   ├── types.ts            # ApplicationFilters, ApplicationUpdate
│       │   ├── repository.ts       # Application CRUD methods
│       │   └── service.ts          # ApplicationServiceV2
│       ├── placements/             # Placements domain
│       │   ├── types.ts            # PlacementFilters, PlacementUpdate
│       │   ├── repository.ts       # Placement CRUD methods
│       │   └── service.ts          # PlacementServiceV2
│       └── routes.ts               # All routes (imports from domains)
├── migrations/                     # Shared
├── package.json
└── Dockerfile
```

### Why This Structure?

**Domain-Based Organization**:
- Each domain (jobs, companies, candidates, etc.) is self-contained
- Domain folder contains its own types, repository, and service
- Easy to find all code related to a specific domain
- Repository files stay small (~100-150 lines vs 600+ lines monolithic)

**Shared Utilities Folder**:
- Common helpers (requireUserContext, validation)
- Event publishing logic
- Pagination types and utilities
- No domain-specific logic in shared/

**Single Routes File**:
- All API endpoints visible at a glance
- Imports service classes from domain folders
- Consistent routing patterns
- Easy to add new routes following pattern

---

## The Standardized 5-Route Pattern

**Every resource** (Jobs, Companies, Candidates, Applications, Placements, Recruiters, etc.) follows this **exact pattern**:

```typescript
// 1. LIST - Role-scoped collection
GET /api/:resource
Query: ?search=X&status=Y&sort_by=Z&sort_order=asc&page=1&limit=25
Response: { data: [...], pagination: { total, page, limit, total_pages } }

// 2. GET BY ID - Single resource
GET /api/:resource/:id
Response: { data: {...} }

// 3. CREATE - New resource
POST /api/:resource
Body: { field1: value1, field2: value2, ... }
Response: { data: {...} }

// 4. UPDATE - Partial update (handles ALL updates)
PATCH /api/:resource/:id
Body: { field1: newValue1, status: newStatus, ... }
Response: { data: {...} }

// 5. DELETE - Remove/archive (soft delete)
DELETE /api/:resource/:id
Response: { data: { message: 'Deleted successfully' } }
```

### Critical Rules

1. **PATCH handles ALL updates**:
   - State/status changes: `{ status: 'active' }`
   - Stage transitions: `{ stage: 'interview_scheduled' }`
   - Field updates: `{ notes: 'updated notes' }`
   - Complex updates: `{ stage: 'rejected', rejection_reason: 'not qualified' }`

2. **No separate action endpoints**:
   - ❌ `POST /applications/:id/advance-stage`
   - ❌ `POST /proposals/:id/accept`
   - ✅ `PATCH /applications/:id` with `{ stage: 'new_stage' }`
   - ✅ `PATCH /proposals/:id` with `{ state: 'accepted' }`

3. **Service layer validates based on what's changing**:
   - Stage transition → validate state machine rules
   - Status change → validate user permissions
   - Required fields → validate based on state

4. **Consistent response format**:
   - Success: `{ data: {...} }`
   - Error: `{ error: { code: 'ERROR_CODE', message: 'Description' } }`

---

## Repository Layer - V2

**File**: `services/[service-name]/src/v2/repository.ts`

### Pattern: One Class, All Resources

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class RepositoryV2 {
    private supabase: SupabaseClient;

    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // ============================================
    // JOBS
    // ============================================

    /**
     * Find jobs with role-based scoping
     * NO service calls - resolves role via database JOINs
     * Gets organization from membership query, not from parameters
     */
    async findJobs(
        clerkUserId: string,
        filters: {
            search?: string;
            status?: string;
            location?: string;
            employment_type?: string;
            sort_by?: string;
            sort_order?: 'ASC' | 'DESC';
            page?: number;
            limit?: number;
        } = {}
    ): Promise<{ data: any[]; total: number }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        const offset = (page - 1) * limit;

        // Role resolution via parallel queries
        const [recruiterResult, membershipResult, adminResult] = await Promise.all([
            this.supabase
                
                .from('recruiters')
                .select('id, status')
                .eq('clerk_user_id', clerkUserId)
                .eq('status', 'active')
                .maybeSingle(),
            this.supabase
                
                .from('memberships')
                .select('organization_id, role')
                .eq('clerk_user_id', clerkUserId)
                .maybeSingle(),
            this.supabase
                
                .from('memberships')
                .select('role')
                .eq('clerk_user_id', clerkUserId)
                .eq('role', 'platform_admin')
                .maybeSingle(),
        ]);

        // Build query with role-based filtering
        let query = this.supabase
            
            .from('jobs')
            .select('*, company:companies(*)');

        // Apply role-based scoping
        if (adminResult.data) {
            // Platform Admin: All jobs
        } else if (membershipResult.data) {
            // Company User: Only their company's jobs
            query = query.eq('company.identity_organization_id', membershipResult.data.organization_id);
        } else if (recruiterResult.data) {
            // Recruiter: Active marketplace jobs or jobs they're assigned to
            query = query.eq('status', 'active');
        } else {
            // No valid role
            return { data: [], total: 0 };
        }

        // Apply filters
        if (filters.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.employment_type) {
            query = query.eq('employment_type', filters.employment_type);
        }

        // Sorting
        const sortBy = filters.sort_by || 'created_at';
        const sortOrder = filters.sort_order || 'DESC';
        query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

        // Pagination
        query = query.range(offset, offset + limit - 1);

        // Count query (same filters, no pagination)
        let countQuery = this.supabase
            
            .from('jobs')
            .select('*', { count: 'exact', head: true });

        // Apply same role-based filtering to count
        if (adminResult.data) {
            // All jobs
        } else if (membershipResult.data) {
            countQuery = countQuery.eq('company.identity_organization_id', membershipResult.data.organization_id);
        } else if (recruiterResult.data) {
            countQuery = countQuery.eq('status', 'active');
        }

        // Apply same filters to count
        if (filters.search) {
            countQuery = countQuery.ilike('title', `%${filters.search}%`);
        }
        if (filters.status) {
            countQuery = countQuery.eq('status', filters.status);
        }
        if (filters.location) {
            countQuery = countQuery.ilike('location', `%${filters.location}%`);
        }
        if (filters.employment_type) {
            countQuery = countQuery.eq('employment_type', filters.employment_type);
        }

        // Execute both queries in parallel
        const [{ data, error }, { count, error: countError }] = await Promise.all([
            query,
            countQuery,
        ]);

        if (error) throw error;
        if (countError) throw countError;

        return {
            data: data || [],
            total: count || 0,
        };
    }

    async findJob(id: string): Promise<any | null> {
        const { data, error } = await this.supabase
            
            .from('jobs')
            .select('*, company:companies(*)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    async createJob(job: any): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('jobs')
            .insert(job)
            .select('*, company:companies(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async updateJob(id: string, updates: any): Promise<any> {
        const { data, error } = await this.supabase
            
            .from('jobs')
            .update(updates)
            .eq('id', id)
            .select('*, company:companies(*)')
            .single();

        if (error) throw error;
        return data;
    }

    async deleteJob(id: string): Promise<void> {
        // Soft delete by default
        const { error } = await this.supabase
            
            .from('jobs')
            .update({ status: 'deleted', deleted_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw error;
    }

    // ============================================
    // COMPANIES (repeat pattern)
    // ============================================
    
    // ... Similar methods for companies ...

    // ============================================
    // APPLICATIONS (repeat pattern)
    // ============================================
    
    // ... Similar methods for applications ...
}
```

### Repository Principles

1. **Direct Supabase queries** - No SQL functions, no service calls
2. **Role resolution in TypeScript** - Parallel queries with Promise.all, organization ID from membership query
3. **One method per CRUD operation** - find, findById, create, update, delete
4. **Consistent return types** - `{ data, total }` for lists, single object for findById
5. **Soft delete by default** - Update status/deleted_at, don't hard delete
6. **Enriched queries** - Prefer additive query parameters (for example `?include=candidate,job`) to request optional relations. Services should load the base resource first, then execute follow-up queries for each requested include (never cross schemas inside a single Supabase select). Standard include keys for applications are `candidate`, `job`, `recruiter`, `documents`, `pre_screen_answers`, `audit_log`, and `job_requirements`.

---

## Service Layer - V2

**Files**: `services/[service-name]/src/v2/services/*.ts`

### Pattern: One Service Per Resource

```typescript
// services/ats-service/src/v2/services/jobs.ts

import { RepositoryV2 } from '../repository';
import { EventPublisher } from '../../events';

export class JobServiceV2 {
    constructor(
        private repository: RepositoryV2,
        private eventPublisher?: EventPublisher
    ) {}

    /**
     * Get jobs with role-based scoping and pagination
     */
    async getJobs(
        clerkUserId: string,
        filters: {
            search?: string;
            status?: string;
            location?: string;
            employment_type?: string;
            sort_by?: string;
            sort_order?: 'asc' | 'desc';
            page?: number;
            limit?: number;
        }
    ): Promise<{
        data: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            total_pages: number;
        };
    }> {
        const page = filters.page || 1;
        const limit = filters.limit || 25;

        const { data, total } = await this.repository.findJobs(
            clerkUserId,
            {
                ...filters,
                sort_order: filters.sort_order?.toUpperCase() as 'ASC' | 'DESC',
            }
        );

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                total_pages: Math.ceil(total / limit),
            },
        };
    }

    async getJob(id: string): Promise<any> {
        const job = await this.repository.findJob(id);
        if (!job) {
            throw new Error(`Job ${id} not found`);
        }
        return job;
    }

    async createJob(data: any): Promise<any> {
        // Validation
        if (!data.title) {
            throw new Error('Job title is required');
        }
        if (!data.company_id) {
            throw new Error('Company ID is required');
        }

        const job = await this.repository.createJob({
            ...data,
            status: data.status || 'draft',
        });

        // Emit event
        if (this.eventPublisher) {
            await this.eventPublisher.publish('job.created', {
                jobId: job.id,
                companyId: job.company_id,
                status: job.status,
            });
        }

        return job;
    }

    /**
     * Update job - handles ALL updates with smart validation
     * This single method replaces multiple specific update methods
     */
    async updateJob(
        id: string,
        updates: any,
        clerkUserId?: string,
        userRole?: string
    ): Promise<any> {
        // 1. Get current job state
        const currentJob = await this.repository.findJob(id);
        if (!currentJob) {
            throw new Error(`Job ${id} not found`);
        }

        // 2. Smart validation based on what's changing
        
        // Status change validation
        if (updates.status && updates.status !== currentJob.status) {
            await this.validateStatusTransition(
                currentJob.status,
                updates.status,
                userRole
            );
        }

        // If closing job, require reason
        if (updates.status === 'closed' && !updates.closed_reason) {
            throw new Error('closed_reason is required when closing a job');
        }

        // If reopening, clear closed fields
        if (updates.status === 'active' && currentJob.status === 'closed') {
            updates.closed_reason = null;
            updates.closed_at = null;
        }

        // Salary validation
        if (updates.salary_min && updates.salary_max) {
            if (updates.salary_min > updates.salary_max) {
                throw new Error('salary_min cannot exceed salary_max');
            }
        }

        const userContext = await this.accessResolver.resolve(clerkUserId);
        // 3. Apply updates
        const updatedJob = await this.repository.updateJob(id, updates);

        // 4. Emit events based on what changed
        if (this.eventPublisher) {
            if (updates.status && updates.status !== currentJob.status) {
                await this.eventPublisher.publish('job.status_changed', {
                    jobId: id,
                    previousStatus: currentJob.status,
                    newStatus: updates.status,
                    changedBy: userContext.identityUserId,
                });
            }

            // Generic update event
            await this.eventPublisher.publish('job.updated', {
                jobId: id,
                updatedFields: Object.keys(updates),
                updatedBy: userContext.identityUserId,
            });
        }

        return updatedJob;
    }

    async deleteJob(id: string): Promise<void> {
        await this.repository.deleteJob(id);

        if (this.eventPublisher) {
            await this.eventPublisher.publish('job.deleted', {
                jobId: id,
            });
        }
    }

    // Private helper for validation
    private async validateStatusTransition(
        fromStatus: string,
        toStatus: string,
        userRole?: string
    ): Promise<void> {
        // Define allowed transitions
        const allowedTransitions: Record<string, string[]> = {
            draft: ['active', 'closed'],
            active: ['paused', 'closed'],
            paused: ['active', 'closed'],
            closed: ['active'], // Can reopen
        };

        if (!allowedTransitions[fromStatus]?.includes(toStatus)) {
            throw new Error(
                `Invalid status transition: ${fromStatus} -> ${toStatus}`
            );
        }

        // Role-based restrictions
        if (toStatus === 'closed' && userRole === 'hiring_manager') {
            throw new Error('Only admins can close jobs');
        }
    }
}
```

### Service Principles

1. **One file per resource domain** - Clear separation, easy to find
2. **Single update method** - Handles ALL updates with smart validation
3. **Validation based on what's changing** - Inspect updates object, validate accordingly
4. **Event emission** - Publish domain events after successful operations
5. **Private helpers** - Validation logic as private methods
6. **Minimal dependencies** - Repository + EventPublisher only

---

## Routes Layer - V2

**File**: `services/[service-name]/src/v2/routes.ts`

### Endpoint Naming Rules

- **No `/me` endpoints.** V2 services expose the canonical REST collection (`/v2/candidates`) and rely on `resolveAccessContext` in the repository/service layers to scope the data. If a caller needs “my data”, they still hit `/v2/<resource>` with whatever filters they need and the backend enforces access based on their Clerk user → identity → membership resolution.
- **Exactly the five standard routes** (list, get by id, create, patch, delete). Any specialized behavior (stats, status transitions, etc.) lives under `/v2/<resource>/<domain>/...` but still avoids “current user” shortcuts.
- **Gateway/frontends never special-case `/me`.** To check the current user’s record, request `/api/v2/<resource>` (optionally with `limit=1`) and let the backend handle filtering.

### Pattern: Single File, All Routes

```typescript
// services/ats-service/src/v2/routes.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { JobServiceV2 } from './services/jobs';
import { CompanyServiceV2 } from './services/companies';
import { CandidateServiceV2 } from './services/candidates';
import { ApplicationServiceV2 } from './services/applications';
import { requireUserContext } from './helpers';

export function registerV2Routes(
    app: FastifyInstance,
    services: {
        jobs: JobServiceV2;
        companies: CompanyServiceV2;
        candidates: CandidateServiceV2;
        applications: ApplicationServiceV2;
    }
) {
    // ============================================
    // JOBS - Standardized 5-Route Pattern
    // ============================================

    // 1. LIST
    app.get(
        '/v2/jobs',
        async (
            request: FastifyRequest<{
                Querystring: {
                    search?: string;
                    status?: string;
                    location?: string;
                    employment_type?: string;
                    sort_by?: string;
                    sort_order?: 'asc' | 'desc';
                    page?: number;
                    limit?: number;
                };
            }>,
            reply: FastifyReply
        ) => {
            const { clerkUserId } = requireUserContext(request);

            const result = await services.jobs.getJobs(
                clerkUserId,
                request.query
            );

            return reply.send({
                data: result.data,
                pagination: result.pagination,
            });
        }
    );

    // 2. GET BY ID
    app.get(
        '/v2/jobs/:id',
        async (
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ) => {
            const job = await services.jobs.getJob(request.params.id);
            return reply.send({ data: job });
        }
    );

    // 3. CREATE
    app.post(
        '/v2/jobs',
        async (
            request: FastifyRequest<{ Body: any }>,
            reply: FastifyReply
        ) => {
            const job = await services.jobs.createJob(request.body);
            return reply.status(201).send({ data: job });
        }
    );

    // 4. UPDATE (handles ALL updates)
    app.patch(
        '/v2/jobs/:id',
        async (
            request: FastifyRequest<{
                Params: { id: string };
                Body: any;
            }>,
            reply: FastifyReply
        ) => {
            const { clerkUserId } = requireUserContext(request);
            const userRole = request.headers['x-user-role'] as string;

            const job = await services.jobs.updateJob(
                request.params.id,
                request.body,
                clerkUserId,
                userRole
            );

            return reply.send({ data: job });
        }
    );

    // 5. DELETE
    app.delete(
        '/v2/jobs/:id',
        async (
            request: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ) => {
            await services.jobs.deleteJob(request.params.id);
            return reply.send({
                data: { message: 'Job deleted successfully' },
            });
        }
    );

    // ============================================
    // COMPANIES - Same 5-Route Pattern
    // ============================================

    app.get('/v2/companies', async (request, reply) => {
        /* ... */
    });
    app.get('/v2/companies/:id', async (request, reply) => {
        /* ... */
    });
    app.post('/v2/companies', async (request, reply) => {
        /* ... */
    });
    app.patch('/v2/companies/:id', async (request, reply) => {
        /* ... */
    });
    app.delete('/v2/companies/:id', async (request, reply) => {
        /* ... */
    });

    // ============================================
    // APPLICATIONS - Same 5-Route Pattern
    // ============================================

    // ... Repeat pattern for all resources ...
}
```

### Helper Function

```typescript
// services/ats-service/src/v2/helpers.ts

import { FastifyRequest } from 'fastify';

export function requireUserContext(request: FastifyRequest): {
    clerkUserId: string;
} {
    const clerkUserId = request.headers['x-clerk-user-id'] as string;

    if (!clerkUserId) {
        throw new Error('Missing x-clerk-user-id header');
    }

    return { clerkUserId };
}
```

### Routes Principles

1. **Single file** - All routes visible at a glance
2. **Consistent pattern** - Every resource follows 5-route pattern
3. **Clear sections** - Comment blocks separate each resource
4. **Versioned paths** - `/v2/*` prefix for clarity during migration
5. **Helper extraction** - Common logic in helpers.ts

---

## Gateway Layer - V2

**File**: `services/api-gateway/src/routes/v2/routes.ts`

### Pattern: Single Proxy File

```typescript
// services/api-gateway/src/routes/v2/routes.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ServiceRegistry } from '../../clients';
import { requireRoles } from '../../rbac';
import { buildAuthHeaders } from '../../helpers/auth-headers';

export function registerV2GatewayRoutes(
    app: FastifyInstance,
    services: ServiceRegistry
) {
    const atsService = () => services.get('ats');
    const networkService = () => services.get('network');
    const getCorrelationId = (request: FastifyRequest) =>
        (request as any).correlationId;

    // ============================================
    // JOBS - Standardized 5-Route Pattern
    // ============================================

    // 1. LIST
    app.get(
        '/api/v2/jobs',
        {
            preHandler: requireRoles(
                ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
                services
            ),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);
            const queryString = new URLSearchParams(
                request.query as any
            ).toString();
            const path = queryString ? `/v2/jobs?${queryString}` : '/v2/jobs';

            const data = await atsService().get(
                path,
                undefined,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    // 2. GET BY ID
    app.get(
        '/api/v2/jobs/:id',
        {
            preHandler: requireRoles(
                ['recruiter', 'company_admin', 'hiring_manager', 'platform_admin'],
                services
            ),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);

            const data = await atsService().get(
                `/v2/jobs/${id}`,
                undefined,
                correlationId
            );
            return reply.send(data);
        }
    );

    // 3. CREATE
    app.post(
        '/api/v2/jobs',
        {
            preHandler: requireRoles(['company_admin', 'hiring_manager'], services),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            const data = await atsService().post(
                '/v2/jobs',
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    // 4. UPDATE
    app.patch(
        '/api/v2/jobs/:id',
        {
            preHandler: requireRoles(['company_admin', 'hiring_manager'], services),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);
            const authHeaders = buildAuthHeaders(request);

            const data = await atsService().patch(
                `/v2/jobs/${id}`,
                request.body,
                correlationId,
                authHeaders
            );
            return reply.send(data);
        }
    );

    // 5. DELETE
    app.delete(
        '/api/v2/jobs/:id',
        {
            preHandler: requireRoles(['company_admin', 'platform_admin'], services),
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            const { id } = request.params as { id: string };
            const correlationId = getCorrelationId(request);

            const data = await atsService().delete(
                `/v2/jobs/${id}`,
                correlationId
            );
            return reply.send(data);
        }
    );

    // ============================================
    // Repeat for all other resources
    // ============================================
}
```

### Gateway Principles

1. **Simple proxies** - Gateway just routes, doesn't add logic
2. **Authorization via requireRoles** - Centralized RBAC
3. **Headers via buildAuthHeaders** - Only sends x-clerk-user-id (backend resolves org from memberships)
4. **Correlation IDs** - Request tracing
5. **Consistent patterns** - Same structure for every resource

---

## Implementation Checklist

### Phase 0: Setup (Per Service)

**Duration**: 30 minutes per service

- [ ] Create `src/v2/` folder
- [ ] Create `src/v2/types.ts` (copy core types)
- [ ] Create `src/v2/helpers.ts` (requireUserContext)
- [ ] Create `src/v2/repository.ts` (empty class)
- [ ] Create `src/v2/services/` folder
- [ ] Create `src/v2/routes.ts` (empty registration function)
- [ ] Update `src/index.ts` to support v2 routing

### Phase 1: Migrate Completed Routes (ATS Service)

**Duration**: 2 hours

Already completed in v1, copy to v2 with improvements:

- [ ] Jobs
  - [ ] Copy `findJobs` to v2/repository.ts
  - [ ] Create `JobServiceV2` in v2/services/jobs.ts
  - [ ] Add 5 routes to v2/routes.ts
  - [ ] Test v2 routes
  
- [ ] Companies
  - [ ] Copy `findCompanies` to v2/repository.ts
  - [ ] Create `CompanyServiceV2`
  - [ ] Add 5 routes
  - [ ] Test

- [ ] Candidates
  - [ ] Copy `findCandidates` to v2/repository.ts
  - [ ] Create `CandidateServiceV2`
  - [ ] Add 5 routes
  - [ ] Test

- [ ] Applications
  - [ ] Copy `findApplications` to v2/repository.ts
  - [ ] Create `ApplicationServiceV2`
  - [ ] Add 5 routes
  - [ ] Test

- [ ] Proposals
  - [ ] Copy `findProposals` to v2/repository.ts
  - [ ] Create `ProposalServiceV2`
  - [ ] Add 5 routes
  - [ ] Test

### Phase 2: Add Remaining ATS Routes

**Duration**: 4-6 hours

- [ ] Placements (5 routes)
- [ ] Documents (5 routes)
- [ ] Any other ATS resources

### Phase 3: Network Service V2

**Duration**: 4-6 hours

- [ ] Setup v2 folder structure
- [ ] Recruiters (5 routes)
- [ ] Assignments (5 routes)
- [ ] Recruiter-Candidates (5 routes)
- [ ] Reputation (5 routes)
- [ ] Proposals (5 routes - if not in ATS)

### Phase 4: Billing Service V2

**Duration**: 2-3 hours

- [ ] Setup v2 folder structure
- [ ] Plans (5 routes)
- [ ] Subscriptions (5 routes)
- [ ] Payouts (5 routes)

### Phase 5: Gateway V2

**Duration**: 3-4 hours

- [ ] Create `src/routes/v2/` folder
- [ ] Create gateway v2 routes file
- [ ] Add all proxies following pattern
- [ ] Test end-to-end

### Phase 6: Notification Service (If Needed)

**Duration**: 1-2 hours

- [ ] Notifications (5 routes)

### Phase 7: Frontend Migration

**Duration**: Variable

- [ ] Update API client to use `/api/v2/*` endpoints
- [ ] Update all `POST /*/action` calls to `PATCH`
- [ ] Test all user workflows

### Phase 8: Cleanup

**Duration**: 2-3 hours

- [ ] Delete `v1/` folders from all services
- [ ] Remove `/v2/` prefix from routes (optional)
- [ ] Update documentation
- [ ] Remove legacy endpoints from gateway

---

## Migration Strategy

### Critical: Dual Route Support

**The API Gateway and all backend services MUST support both v1 and v2 routes simultaneously during migration.**

This enables:
- ✅ Zero-downtime migration
- ✅ Incremental frontend updates (page-by-page)
- ✅ Rollback capability if issues arise
- ✅ A/B testing between v1 and v2

**Gateway Dual Support Pattern**:

```typescript
// services/api-gateway/src/index.ts

import { registerLegacyRoutes } from './routes/legacy';
import { registerV2GatewayRoutes } from './routes/v2/routes';

// Register BOTH route sets
app.log.info('Registering legacy routes (v1)...');
registerLegacyRoutes(app, services);  // /api/jobs, /api/companies, etc.

app.log.info('Registering V2 routes...');
registerV2GatewayRoutes(app, services);  // /api/v2/jobs, /api/v2/companies, etc.

app.log.info('Gateway supports both v1 and v2 endpoints');
```

**Backend Service Dual Support Pattern**:

```typescript
// services/ats-service/src/index.ts

import { registerV1Routes } from './v1/routes';
import { registerV2Routes } from './v2/routes';

// Initialize BOTH v1 and v2 services
const repositoryV1 = new AtsRepository(supabaseUrl, supabaseKey);
const repositoryV2 = new RepositoryV2(supabaseUrl, supabaseKey);

const serviceV1 = new AtsService(repositoryV1, eventPublisher);

// V2 services
const jobServiceV2 = new JobServiceV2(repositoryV2, eventPublisher);
const companyServiceV2 = new CompanyServiceV2(repositoryV2, eventPublisher);
const candidateServiceV2 = new CandidateServiceV2(repositoryV2, eventPublisher);
const applicationServiceV2 = new ApplicationServiceV2(repositoryV2, eventPublisher);

// Register BOTH route sets
app.log.info('Registering legacy routes (v1)...');
registerV1Routes(app, serviceV1);  // /jobs, /companies, etc.

app.log.info('Registering V2 routes...');
registerV2Routes(app, {
    jobs: jobServiceV2,
    companies: companyServiceV2,
    candidates: candidateServiceV2,
    applications: applicationServiceV2,
});  // /v2/jobs, /v2/companies, etc.

app.log.info('Service supports both v1 and v2 endpoints');
```

**Frontend Incremental Migration**:

```typescript
// apps/portal/src/lib/api-client.ts

// Create separate clients
const apiV1 = createApiClient('/api');      // Legacy routes
const apiV2 = createApiClient('/api/v2');   // New routes

// Migrate page-by-page:
// - Jobs page → use apiV2.jobs
// - Companies page → use apiV2.companies
// - Candidates page (not migrated yet) → use apiV1.candidates
```

**Migration Flow**:
1. Backend service implements v2 routes alongside v1
2. Gateway adds v2 proxies alongside existing proxies
3. Frontend updates one feature at a time to use v2
4. Monitor both v1 and v2 traffic
5. Once all frontend migrated, remove v1 code

### Entry Point Routing (Alternative: Toggle-Based)

```typescript
// services/ats-service/src/index.ts
// Option: Environment variable toggle (NOT RECOMMENDED during migration)

const useV2Only = process.env.USE_V2_ONLY === 'true';

if (useV2Only) {
    app.log.info('Using V2 routes only');
    registerV2Routes(app, v2Services);
} else {
    app.log.info('Using both V1 and V2 routes');
    registerV1Routes(app, v1Service);   // Legacy
    registerV2Routes(app, v2Services);  // New
}
```

**⚠️ Recommendation**: Always run both route sets during migration. Only switch to v2-only after ALL frontend code is migrated and tested.

### Gradual Rollout

1. **Week 1-2**: Build v2 for ATS service (5 completed routes + remaining)
2. **Week 3**: Build v2 for Network service
3. **Week 4**: Build v2 for Billing service
4. **Week 5**: Gateway v2 + Frontend migration
5. **Week 6**: Testing, bug fixes, cleanup

### Rollback Strategy

If v2 has issues:
```bash
# Revert to v1
USE_V2_ROUTES=false docker-compose up -d
```

Or in code:
```typescript
// services/ats-service/src/index.ts
const useV2 = false;  // Quick toggle
```

---

## Testing Approach

### Unit Tests

```typescript
// services/ats-service/src/v2/__tests__/services/jobs.test.ts

describe('JobServiceV2', () => {
    let service: JobServiceV2;
    let mockRepository: jest.Mocked<RepositoryV2>;

    beforeEach(() => {
        mockRepository = {
            findJobsForUser: jest.fn(),
            findJobById: jest.fn(),
            createJob: jest.fn(),
            updateJob: jest.fn(),
            deleteJob: jest.fn(),
        } as any;

        service = new JobServiceV2(mockRepository);
    });

    describe('updateJob', () => {
        it('should handle status transition', async () => {
            mockRepository.findJobById.mockResolvedValue({
                id: '123',
                status: 'draft',
            });
            mockRepository.updateJob.mockResolvedValue({
                id: '123',
                status: 'active',
            });

            const result = await service.updateJob('123', {
                status: 'active',
            });

            expect(result.status).toBe('active');
            expect(mockRepository.updateJob).toHaveBeenCalledWith('123', {
                status: 'active',
            });
        });

        it('should require closed_reason when closing job', async () => {
            mockRepository.findJobById.mockResolvedValue({
                id: '123',
                status: 'active',
            });

            await expect(
                service.updateJob('123', { status: 'closed' })
            ).rejects.toThrow('closed_reason is required');
        });
    });
});
```

### Integration Tests

```typescript
// services/ats-service/src/v2/__tests__/integration/jobs.test.ts

describe('Jobs V2 Integration', () => {
    let app: FastifyInstance;

    beforeAll(async () => {
        app = await buildServer();
    });

    it('should list jobs with role-based scoping', async () => {
        const response = await app.inject({
            method: 'GET',
            url: '/v2/jobs?page=1&limit=10',
            headers: {
                'x-clerk-user-id': 'user_123',
                'x-organization-id': 'org_456',
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json()).toMatchObject({
            data: expect.any(Array),
            pagination: {
                total: expect.any(Number),
                page: 1,
                limit: 10,
            },
        });
    });

    it('should update job status', async () => {
        const response = await app.inject({
            method: 'PATCH',
            url: '/v2/jobs/job_123',
            headers: {
                'x-clerk-user-id': 'user_123',
            },
            payload: {
                status: 'active',
            },
        });

        expect(response.statusCode).toBe(200);
        expect(response.json().data.status).toBe('active');
    });
});
```

### Performance Tests

```typescript
// scripts/benchmark-v2.ts

async function benchmarkV2() {
    const v1Time = await measureEndpoint('GET', '/jobs?page=1&limit=25');
    const v2Time = await measureEndpoint('GET', '/v2/jobs?page=1&limit=25');

    console.log(`V1: ${v1Time}ms`);
    console.log(`V2: ${v2Time}ms`);
    console.log(`Improvement: ${(v1Time / v2Time).toFixed(2)}x faster`);
}
```

---

## Cleanup Plan

### Week 6: Final Cleanup

1. **Verify V2 Stability**
   - [ ] All tests passing
   - [ ] Performance benchmarks met (10-25x improvement)
   - [ ] No critical bugs in production

2. **Delete V1 Code**
   ```bash
   # Per service
   rm -rf services/ats-service/src/v1/
   rm -rf services/network-service/src/v1/
   rm -rf services/billing-service/src/v1/
   ```

3. **Optional: Remove v2 Prefix**
   - If you want `/api/jobs` instead of `/api/v2/jobs`
   - Update all route paths
   - Update frontend API client
   - Update documentation

4. **Update Documentation**
   - [ ] Update API documentation
   - [ ] Update architecture diagrams
   - [ ] Mark v1 documentation as obsolete

5. **Celebrate** 🎉
   - 70-80% less code
   - 10-25x performance improvement
   - Standardized patterns
   - Easy maintenance going forward

---

## Success Criteria

### Performance
- ✅ List endpoints: 10-50ms (vs 200-500ms+ in v1)
- ✅ Single resource: 5-20ms
- ✅ Updates: 20-50ms

### Code Quality
- ✅ 70-80% reduction in lines of code
- ✅ Single update method per resource (vs 5+ methods)
- ✅ Consistent 5-route pattern across all resources
- ✅ All tests passing

### Developer Experience
- ✅ Easy to find any route/method
- ✅ Consistent patterns = less thinking required
- ✅ Clear validation = fewer bugs
- ✅ Less time fixing breaks, more time building features

---

## Questions or Issues?

Refer to:
- [API Role-Based Scoping Migration Plan](../api-role-based-scoping-migration-plan.md)
- [Database Join Pattern](../DATABASE-JOIN-PATTERN.md)
- [Migration Progress](../MIGRATION-PROGRESS.md)

**Next Steps**: Start with Phase 0 setup for ATS service, then migrate the 5 completed routes to v2.
