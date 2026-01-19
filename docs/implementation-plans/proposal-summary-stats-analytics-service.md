# Proposal Summary Statistics - Analytics Service Implementation

**Date**: January 17, 2026  
**Status**: 🟡 PLANNING  
**Architecture**: V2 Analytics Service

## Problem

Frontend portal (`apps/portal/src/app/portal/proposals/page.tsx` line 105) calls:
```typescript
const summary = await client.get('/proposals/summary');
```

Expected response:
```typescript
interface ProposalSummary {
    actionable_count: number;   // Proposals requiring recruiter action
    waiting_count: number;       // Awaiting response from other party
    urgent_count: number;        // Expiring in < 24 hours
    overdue_count: number;       // Expired/timed out
}
```

**Current issue**: Endpoint doesn't exist. 500 error when loading proposals dashboard.

**Architecture decision**: This is aggregated **metrics**, not CRUD operations on proposals themselves, so it belongs in **analytics-service** (not network-service).

---

## Architecture Pattern

Following V2 analytics service patterns (see `services/analytics-service/README.md`):

- **Event-driven metrics**: Use RabbitMQ events to update proposal counts
- **Redis caching**: Cache computed stats with 1-minute TTL
- **Role-based filtering**: Recruiters see their own proposal stats only
- **Pre-computed aggregation**: Background workers maintain counts

---

## Implementation Plan

### Step 1: Create Proposals Stats Domain

**Location**: `services/analytics-service/src/v2/proposal-stats/`

**Files to create**:
```
services/analytics-service/src/v2/proposal-stats/
├── types.ts              # ProposalSummary, ProposalStatsFilters
├── repository.ts         # Direct Supabase queries to candidate_role_assignments
├── service.ts            # Business logic + Redis caching
└── routes.ts             # GET /v2/proposal-stats/summary
```

#### types.ts
```typescript
export interface ProposalSummary {
    actionable_count: number;
    waiting_count: number;
    urgent_count: number;
    overdue_count: number;
}

export interface ProposalStatsFilters {
    recruiter_id?: string;
    // Future: company_id, date_range, etc.
}
```

#### repository.ts
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { ProposalSummary, ProposalStatsFilters } from './types';

export class ProposalStatsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getSummary(clerkUserId: string, filters: ProposalStatsFilters): Promise<ProposalSummary> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);

        // Query candidate_role_assignments (proposals) table
        const query = this.supabase
            
            .from('candidate_role_assignments')
            .select('id, state, expires_at, candidate_recruiter_id, company_recruiter_id');

        // Apply role-based filtering (recruiters see own proposals only)
        if (context.role === 'recruiter') {
            // Recruiter sees proposals where they're candidate OR company recruiter
            query.or(`candidate_recruiter_id.eq.${context.userId},company_recruiter_id.eq.${context.userId}`);
        } else if (context.isCompanyUser) {
            // Company users see proposals for their company's jobs (via company_recruiter_id)
            // TODO: Need to join jobs table or filter by accessible company IDs
            query.in('company_recruiter_id', context.accessibleRecruiterIds || []);
        }
        // Platform admins see everything (no filter)

        const { data: proposals, error } = await query;

        if (error) {
            throw new Error(`Failed to fetch proposals: ${error.message}`);
        }

        // Compute counts
        const now = new Date();
        const urgent_threshold = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

        return {
            actionable_count: proposals.filter(p => 
                p.state === 'proposed' && 
                // Actionable means recruiter is the recipient (not the proposer)
                (p.company_recruiter_id === context.userId || p.candidate_recruiter_id === context.userId)
            ).length,
            
            waiting_count: proposals.filter(p => 
                p.state === 'proposed' && 
                // Waiting means recruiter is the proposer (awaiting response)
                // TODO: Need proposed_by field to determine who initiated
                false // Placeholder - need proposed_by logic
            ).length,
            
            urgent_count: proposals.filter(p => 
                p.state === 'proposed' && 
                p.expires_at && 
                new Date(p.expires_at) <= urgent_threshold && 
                new Date(p.expires_at) > now
            ).length,
            
            overdue_count: proposals.filter(p => 
                p.state === 'timed_out'
            ).length,
        };
    }
}
```

#### service.ts
```typescript
import Redis from 'ioredis';
import { ProposalStatsRepository } from './repository';
import { ProposalSummary, ProposalStatsFilters } from './types';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { SupabaseClient } from '@supabase/supabase-js';

export class ProposalStatsService {
    constructor(
        private repository: ProposalStatsRepository,
        private redis: Redis,
        private supabase: SupabaseClient
    ) {}

    async getSummary(clerkUserId: string, filters: ProposalStatsFilters): Promise<ProposalSummary> {
        // Get access context for cache key
        const context = await resolveAccessContext(clerkUserId, this.supabase);

        // Cache key based on user role and filters
        const cacheKey = `proposal-stats:summary:${context.userId}:${JSON.stringify(filters)}`;

        // Try Redis cache first (1-minute TTL)
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // Fetch from database
        const summary = await this.repository.getSummary(clerkUserId, filters);

        // Cache for 1 minute (stats refresh frequently)
        await this.redis.setex(cacheKey, 60, JSON.stringify(summary));

        return summary;
    }
}
```

#### routes.ts
```typescript
import { FastifyInstance } from 'fastify';
import { ProposalStatsService } from './service';

export function registerProposalStatsRoutes(app: FastifyInstance, service: ProposalStatsService) {
    app.get('/v2/proposal-stats/summary', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;

        if (!clerkUserId) {
            return reply.code(401).send({ error: 'Unauthorized: Missing user ID' });
        }

        try {
            const summary = await service.getSummary(clerkUserId, {});
            return reply.send({ data: summary });
        } catch (error) {
            request.log.error({ error }, 'Failed to fetch proposal summary');
            return reply.code(500).send({ 
                error: 'Internal server error fetching proposal summary' 
            });
        }
    });
}
```

---

### Step 2: Register Routes in Analytics Service

**File**: `services/analytics-service/src/v2/routes.ts`

```typescript
import { registerProposalStatsRoutes } from './proposal-stats/routes';

export function registerV2Routes(app: FastifyInstance) {
    // Existing routes...
    registerStatsRoutes(app, services.stats);
    registerMarketplaceMetricsRoutes(app, services.marketplaceMetrics);
    registerChartRoutes(app, services.charts);
    
    // NEW: Register proposal stats routes
    registerProposalStatsRoutes(app, services.proposalStats);
}
```

**File**: `services/analytics-service/src/index.ts`

```typescript
import { ProposalStatsRepository } from './v2/proposal-stats/repository';
import { ProposalStatsService } from './v2/proposal-stats/service';

// In service initialization
const proposalStatsRepository = new ProposalStatsRepository(supabase);
const proposalStatsService = new ProposalStatsService(proposalStatsRepository, redis, supabase);

const services = {
    stats: statsService,
    charts: chartsService,
    marketplaceMetrics: marketplaceMetricsService,
    proposalStats: proposalStatsService, // NEW
};
```

---

### Step 3: API Gateway Proxy

**File**: `services/api-gateway/src/routes/analytics/routes.ts`

Add new proxy route:
```typescript
app.get('/api/v2/proposal-stats/summary', {
    preHandler: requireRoles(['recruiter', 'company_admin', 'platform_admin'], services),
}, async (request, reply) => {
    try {
        const response = await analyticsService.get('/v2/proposal-stats/summary', {
            headers: buildAuthHeaders(request),
        });
        return reply.send(response.data);
    } catch (error) {
        request.log.error({ error }, 'Analytics service error');
        return reply.code(500).send({ error: 'Failed to fetch proposal summary' });
    }
});
```

---

### Step 4: Frontend Update

**File**: `apps/portal/src/app/portal/proposals/page.tsx`

Update API call:
```typescript
// ✅ NEW - Call analytics service endpoint
const summary = await client.get('/proposal-stats/summary');

// ❌ OLD - Was calling non-existent network service endpoint
// const summary = await client.get('/proposals/summary');
```

---

## Event-Driven Updates (Future Enhancement)

**Phase 2**: Implement RabbitMQ event consumers to invalidate cache:

```typescript
// services/analytics-service/src/consumers/proposal-events.ts
import { EventConsumer } from '@splits-network/shared-job-queue';

export class ProposalEventsConsumer {
    constructor(private redis: Redis) {}

    async onProposalCreated(event: ProposalCreatedEvent) {
        // Invalidate cache for both recruiters involved
        await this.redis.del(`proposal-stats:summary:${event.candidateRecruiterId}:*`);
        await this.redis.del(`proposal-stats:summary:${event.companyRecruiterId}:*`);
    }

    async onProposalAccepted(event: ProposalAcceptedEvent) {
        // Invalidate cache for both recruiters
        await this.redis.del(`proposal-stats:summary:${event.candidateRecruiterId}:*`);
        await this.redis.del(`proposal-stats:summary:${event.companyRecruiterId}:*`);
    }

    // onProposalDeclined, onProposalTimedOut, etc.
}
```

---

## Database Schema Notes

**No new tables needed!** Query existing `candidate_role_assignments` table.

**Potential schema enhancement** (optional):
- Add `proposed_by` column to `candidate_role_assignments` to distinguish proposer from recipient
  - This would enable accurate "actionable" vs "waiting" counts
  - Currently only `candidate_recruiter_id` and `company_recruiter_id` exist

---

## Testing Plan

1. **Unit tests** for repository queries (mock Supabase)
2. **Integration tests** for service caching (test Redis TTL)
3. **Route tests** for API Gateway proxy
4. **Frontend tests** for `/proposals/summary` call

---

## Rollout Steps

1. ✅ Create proposal-stats domain in analytics-service
2. ✅ Register routes in analytics service
3. ✅ Add API Gateway proxy endpoint
4. ✅ Update frontend to call new endpoint
5. ✅ Test with different user roles (recruiter, company_admin, platform_admin)
6. ⏸️ (Phase 2) Implement event-driven cache invalidation

---

## References

- **Analytics Service README**: `services/analytics-service/README.md`
- **V2 Architecture**: `docs/migration/v2/V2-ARCHITECTURE-IMPLEMENTATION-GUIDE.md`
- **Frontend Code**: `apps/portal/src/app/portal/proposals/page.tsx`
- **CRA Schema**: `AGENTS.md` (CRA Schema Specifications section)

---

**Decision**: Proposal summary statistics belong in **analytics-service**, not network-service. Analytics service owns all aggregated metrics per V2 architecture.
