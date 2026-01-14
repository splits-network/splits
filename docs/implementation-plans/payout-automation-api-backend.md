# Payout Automation - API/Backend Implementation Tracker

**Feature**: Payout Automation & Guarantees  
**Priority**: 🔥 HIGH  
**Status**: Manual Processing - Automation Needed  
**Created**: January 14, 2026  
**Last Updated**: January 14, 2026

---

## Overview

Automate payout processing with scheduled payments, escrow holds, and comprehensive audit logging. Currently all payouts are processed manually which is unreliable and doesn't scale.

**Related Documents**:
- Feature Plan: `docs/plan-databaseTableIntegration2.prompt.md` (Feature 2)
- UI Tracker: `docs/implementation-plans/payout-automation-ui-frontend.md`

---

## Backend Status Summary

### ✅ Complete (V2 Implementation)
- [x] `payouts` table and V2 domain in billing-service
- [x] Payout CRUD operations with role-based access
- [x] Stripe integration for basic payouts
- [x] Event publishing for payout lifecycle
- [x] Email notifications for payout events

### 🔄 Partial Implementation
- [~] `payout_schedules` table exists with basic schema
- [~] Basic repository queries only, no automation
- [~] No scheduler job for automatic processing

### ❌ Missing Implementation
- [ ] `escrow_holds` table and domain
- [ ] `payout_audit_log` table and logging system
- [ ] Automated scheduler job for processing due payouts
- [ ] Escrow hold calculation and release logic
- [ ] Guarantee period enforcement
- [ ] Comprehensive audit trail for all actions
- [ ] Monitoring and alerting for automation failures

---

## Implementation Tasks

## Section 1: Database Schema & Migrations

### 1.1 Payout Schedules Table Enhancement

**File**: `services/billing-service/migrations/00X_enhance_payout_schedules.sql`

#### Current Schema
```sql
CREATE TABLE payout_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES payouts(id),
    scheduled_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Enhancement Tasks
- [ ] Add `guarantee_completion_date` column (timestamptz)
- [ ] Add `placement_id` column (UUID, references placements)
- [ ] Add `processed_at` column (timestamptz)
- [ ] Add `failure_reason` column (text)
- [ ] Add `retry_count` column (integer, default 0)
- [ ] Add `last_retry_at` column (timestamptz)
- [ ] Add indexes on `status`, `scheduled_date`, `placement_id`
- [ ] Add check constraint: status IN ('pending', 'processing', 'processed', 'failed', 'cancelled')

#### Migration SQL
```sql
-- 00X_enhance_payout_schedules.sql
ALTER TABLE payout_schedules 
ADD COLUMN IF NOT EXISTS guarantee_completion_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS placement_id UUID REFERENCES placements(id),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failure_reason TEXT,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_payout_schedules_status ON payout_schedules(status);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_scheduled_date ON payout_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payout_schedules_placement ON payout_schedules(placement_id);

ALTER TABLE payout_schedules 
ADD CONSTRAINT check_schedule_status 
CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'cancelled'));
```

---

### 1.2 Escrow Holds Table Creation

**File**: `services/billing-service/migrations/00Y_create_escrow_holds.sql`

#### Tasks
- [ ] Create `escrow_holds` table
- [ ] Add foreign keys to placements and payouts
- [ ] Add indexes for common queries
- [ ] Add check constraints for valid amounts and statuses

#### Schema Design
```sql
-- 00Y_create_escrow_holds.sql
CREATE TABLE escrow_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_id UUID NOT NULL REFERENCES placements(id),
    payout_id UUID REFERENCES payouts(id),
    
    -- Financial details
    hold_amount DECIMAL(10, 2) NOT NULL CHECK (hold_amount >= 0),
    holdback_percentage DECIMAL(5, 2) NOT NULL CHECK (holdback_percentage BETWEEN 0 AND 100),
    
    -- Timing
    hold_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    release_date TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Metadata
    reason TEXT,
    released_by UUID REFERENCES users(id),
    release_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_escrow_status CHECK (status IN ('active', 'released', 'forfeited', 'cancelled'))
);

CREATE INDEX idx_escrow_holds_placement ON escrow_holds(placement_id);
CREATE INDEX idx_escrow_holds_status ON escrow_holds(status);
CREATE INDEX idx_escrow_holds_release_date ON escrow_holds(release_date);
CREATE INDEX idx_escrow_holds_payout ON escrow_holds(payout_id);

COMMENT ON TABLE escrow_holds IS 'Tracks escrow holds on payouts during guarantee periods';
COMMENT ON COLUMN escrow_holds.holdback_percentage IS 'Percentage of payout held in escrow (typically 10-20%)';
COMMENT ON COLUMN escrow_holds.release_date IS 'Date when escrow should be automatically released';
```

---

### 1.3 Payout Audit Log Table Creation

**File**: `services/billing-service/migrations/00Z_create_payout_audit_log.sql`

#### Tasks
- [ ] Create `payout_audit_log` table
- [ ] Add indexes for querying audit history
- [ ] Add foreign key to payouts table
- [ ] Design for immutability (append-only)

#### Schema Design
```sql
-- 00Z_create_payout_audit_log.sql
CREATE TABLE payout_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payout_id UUID NOT NULL REFERENCES payouts(id),
    
    -- Change tracking
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    
    -- Actor tracking
    changed_by UUID NOT NULL REFERENCES users(id),
    changed_by_role VARCHAR(50),
    
    -- Context
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp (append-only)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_payout ON payout_audit_log(payout_id);
CREATE INDEX idx_audit_changed_by ON payout_audit_log(changed_by);
CREATE INDEX idx_audit_created_at ON payout_audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON payout_audit_log(action);

COMMENT ON TABLE payout_audit_log IS 'Immutable audit trail of all payout changes';
COMMENT ON COLUMN payout_audit_log.action IS 'Action taken: created, approved, processed, failed, cancelled, etc.';
COMMENT ON COLUMN payout_audit_log.metadata IS 'Additional context like Stripe IDs, error details, etc.';
```

---

## Section 2: Payout Schedules V2 Domain

### 2.1 Repository Implementation

**File**: `services/billing-service/src/v2/payout-schedules/repository.ts`

#### Tasks
- [ ] Implement `PayoutScheduleRepository` class
- [ ] Add role-based access control (recruiters see own, admins see all)
- [ ] Implement list with filters (status, date range, placement)
- [ ] Implement getById with access checks
- [ ] Implement create with validation
- [ ] Implement update (status transitions)
- [ ] Implement delete (soft delete/cancellation)
- [ ] Add enrichment method to include placement/payout data

#### Implementation Template
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { resolveAccessContext } from '@splits-network/shared-access-context';
import { StandardListParams, StandardListResponse } from '@splits-network/shared-types';

export interface PayoutSchedule {
    id: string;
    payout_id: string;
    placement_id: string;
    scheduled_date: string;
    guarantee_completion_date: string;
    status: 'pending' | 'processing' | 'processed' | 'failed' | 'cancelled';
    processed_at?: string;
    failure_reason?: string;
    retry_count: number;
    last_retry_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ScheduleFilters {
    status?: string;
    date_from?: string;
    date_to?: string;
    placement_id?: string;
}

export class PayoutScheduleRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(
        clerkUserId: string,
        params: StandardListParams
    ): Promise<StandardListResponse<PayoutSchedule>> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const { page = 1, limit = 25, filters = {} } = params;
        const offset = (page - 1) * limit;
        
        let query = this.supabase
            .from('payout_schedules')
            .select('*', { count: 'exact' });
        
        // Role-based filtering
        if (context.role === 'recruiter') {
            // Recruiters see only their schedules
            const { data: payouts } = await this.supabase
                .from('payouts')
                .select('id')
                .eq('recruiter_user_id', context.userId);
            
            const payoutIds = payouts?.map(p => p.id) || [];
            query = query.in('payout_id', payoutIds);
        } else if (context.isCompanyUser) {
            // Company users see schedules for their placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .in('company_id', context.accessibleCompanyIds);
            
            const placementIds = placements?.map(p => p.id) || [];
            query = query.in('placement_id', placementIds);
        }
        // Platform admins see everything
        
        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.date_from) {
            query = query.gte('scheduled_date', filters.date_from);
        }
        if (filters.date_to) {
            query = query.lte('scheduled_date', filters.date_to);
        }
        if (filters.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        
        // Pagination
        query = query
            .order('scheduled_date', { ascending: true })
            .range(offset, offset + limit - 1);
        
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

    async create(clerkUserId: string, data: ScheduleCreate): Promise<PayoutSchedule> {
        const { data: schedule, error } = await this.supabase
            .from('payout_schedules')
            .insert(data)
            .select()
            .single();
        
        if (error) throw error;
        return schedule;
    }

    async update(
        id: string,
        clerkUserId: string,
        data: ScheduleUpdate
    ): Promise<PayoutSchedule> {
        const { data: updated, error } = await this.supabase
            .from('payout_schedules')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return updated;
    }

    async findDueSchedules(beforeDate: string): Promise<PayoutSchedule[]> {
        const { data, error } = await this.supabase
            .from('payout_schedules')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_date', beforeDate)
            .lte('guarantee_completion_date', new Date().toISOString());
        
        if (error) throw error;
        return data || [];
    }
}
```

---

### 2.2 Service Layer Implementation

**File**: `services/billing-service/src/v2/payout-schedules/service.ts`

#### Tasks
- [ ] Implement `PayoutScheduleServiceV2` class
- [ ] Add validation for schedule creation
- [ ] Implement status transition validation
- [ ] Add event publishing for lifecycle changes
- [ ] Implement retry logic for failed schedules
- [ ] Add cancellation logic with audit trail

#### Implementation Template
```typescript
import { EventPublisher } from '../shared/events';
import { PayoutScheduleRepository } from './repository';

export class PayoutScheduleServiceV2 {
    constructor(
        private repository: PayoutScheduleRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async list(clerkUserId: string, params: StandardListParams) {
        return await this.repository.list(clerkUserId, params);
    }

    async create(clerkUserId: string, data: ScheduleCreate) {
        // Validation
        this.validateScheduleCreate(data);
        
        const schedule = await this.repository.create(clerkUserId, data);
        
        // Publish event
        await this.eventPublisher?.publish('payout_schedule.created', {
            scheduleId: schedule.id,
            payoutId: schedule.payout_id,
            scheduledDate: schedule.scheduled_date,
            createdBy: clerkUserId
        });
        
        return schedule;
    }

    async update(id: string, clerkUserId: string, data: ScheduleUpdate) {
        // Validate status transition
        if (data.status) {
            this.validateStatusTransition(data.status);
        }
        
        const schedule = await this.repository.update(id, clerkUserId, data);
        
        // Publish event
        await this.eventPublisher?.publish('payout_schedule.updated', {
            scheduleId: id,
            changes: Object.keys(data),
            updatedBy: clerkUserId
        });
        
        return schedule;
    }

    async processDueSchedules(): Promise<number> {
        const now = new Date().toISOString();
        const dueSchedules = await this.repository.findDueSchedules(now);
        
        let processed = 0;
        
        for (const schedule of dueSchedules) {
            try {
                // Mark as processing
                await this.repository.update(schedule.id, 'system', {
                    status: 'processing'
                });
                
                // Trigger payout processing (integration with Stripe)
                await this.processScheduledPayout(schedule);
                
                // Mark as processed
                await this.repository.update(schedule.id, 'system', {
                    status: 'processed',
                    processed_at: new Date().toISOString()
                });
                
                // Publish event
                await this.eventPublisher?.publish('payout_schedule.processed', {
                    scheduleId: schedule.id,
                    payoutId: schedule.payout_id
                });
                
                processed++;
            } catch (error) {
                // Mark as failed
                await this.repository.update(schedule.id, 'system', {
                    status: 'failed',
                    failure_reason: error.message,
                    retry_count: schedule.retry_count + 1,
                    last_retry_at: new Date().toISOString()
                });
                
                // Publish failure event
                await this.eventPublisher?.publish('payout_schedule.failed', {
                    scheduleId: schedule.id,
                    payoutId: schedule.payout_id,
                    error: error.message
                });
            }
        }
        
        return processed;
    }

    private async processScheduledPayout(schedule: PayoutSchedule) {
        // Integration point with Stripe/payout processing
        // This would call the existing payout service
        // to actually transfer funds
    }

    private validateScheduleCreate(data: ScheduleCreate) {
        if (!data.payout_id) throw new Error('Payout ID required');
        if (!data.scheduled_date) throw new Error('Scheduled date required');
        
        const scheduledDate = new Date(data.scheduled_date);
        const now = new Date();
        
        if (scheduledDate < now) {
            throw new Error('Scheduled date must be in the future');
        }
    }

    private validateStatusTransition(newStatus: string) {
        const valid = ['pending', 'processing', 'processed', 'failed', 'cancelled'];
        if (!valid.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}`);
        }
    }
}
```

---

### 2.3 Routes Implementation

**File**: `services/billing-service/src/v2/payout-schedules/routes.ts`

#### Tasks
- [ ] Implement standard 5-route pattern
- [ ] Add role-based authorization checks
- [ ] Implement manual trigger endpoint for admins
- [ ] Add cancellation endpoint
- [ ] Return proper response envelopes

#### Implementation Template
```typescript
import { FastifyInstance } from 'fastify';
import { PayoutScheduleServiceV2 } from './service';

export async function payoutScheduleRoutes(app: FastifyInstance) {
    const service = new PayoutScheduleServiceV2(/* dependencies */);

    // LIST
    app.get('/v2/payout-schedules', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const params = {
            page: Number(request.query.page) || 1,
            limit: Number(request.query.limit) || 25,
            filters: request.query.filters || {}
        };
        
        const result = await service.list(clerkUserId, params);
        return reply.send({ data: result.data, pagination: result.pagination });
    });

    // GET BY ID
    app.get('/v2/payout-schedules/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        
        const schedule = await service.getById(id, clerkUserId);
        return reply.send({ data: schedule });
    });

    // CREATE
    app.post('/v2/payout-schedules', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const data = request.body as ScheduleCreate;
        
        const schedule = await service.create(clerkUserId, data);
        return reply.code(201).send({ data: schedule });
    });

    // UPDATE
    app.patch('/v2/payout-schedules/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        const data = request.body as ScheduleUpdate;
        
        const schedule = await service.update(id, clerkUserId, data);
        return reply.send({ data: schedule });
    });

    // DELETE (cancel)
    app.delete('/v2/payout-schedules/:id', async (request, reply) => {
        const clerkUserId = request.headers['x-clerk-user-id'] as string;
        const { id } = request.params as { id: string };
        
        await service.update(id, clerkUserId, { status: 'cancelled' });
        return reply.send({ data: { message: 'Schedule cancelled' } });
    });

    // ADMIN: Manual trigger
    app.post('/v2/payout-schedules/process-due', async (request, reply) => {
        // Admin only
        const processed = await service.processDueSchedules();
        return reply.send({ data: { processed_count: processed } });
    });
}
```

---

## Section 3: Escrow Holds V2 Domain

### 3.1 Repository Implementation

**File**: `services/billing-service/src/v2/escrow/repository.ts`

#### Tasks
- [ ] Implement `EscrowRepository` class
- [ ] Add role-based access control
- [ ] Implement list with filters (placement, status, release date)
- [ ] Implement create with validation
- [ ] Implement release logic
- [ ] Add query for holds due for release

#### Implementation Template
```typescript
export interface EscrowHold {
    id: string;
    placement_id: string;
    payout_id?: string;
    hold_amount: number;
    holdback_percentage: number;
    hold_date: string;
    release_date: string;
    released_at?: string;
    status: 'active' | 'released' | 'forfeited' | 'cancelled';
    reason?: string;
    released_by?: string;
    release_notes?: string;
    created_at: string;
    updated_at: string;
}

export class EscrowRepository {
    constructor(private supabase: SupabaseClient) {}

    async list(
        clerkUserId: string,
        params: StandardListParams
    ): Promise<StandardListResponse<EscrowHold>> {
        const context = await resolveAccessContext(clerkUserId, this.supabase);
        
        const { page = 1, limit = 25, filters = {} } = params;
        const offset = (page - 1) * limit;
        
        let query = this.supabase
            .from('escrow_holds')
            .select('*', { count: 'exact' });
        
        // Role-based filtering
        if (context.role === 'recruiter') {
            // Recruiters see escrow for their placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .eq('recruiter_user_id', context.userId);
            
            const placementIds = placements?.map(p => p.id) || [];
            query = query.in('placement_id', placementIds);
        } else if (context.isCompanyUser) {
            // Company users see escrow for their placements
            const { data: placements } = await this.supabase
                .from('placements')
                .select('id')
                .in('company_id', context.accessibleCompanyIds);
            
            const placementIds = placements?.map(p => p.id) || [];
            query = query.in('placement_id', placementIds);
        }
        
        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.placement_id) {
            query = query.eq('placement_id', filters.placement_id);
        }
        
        // Pagination
        query = query
            .order('release_date', { ascending: true })
            .range(offset, offset + limit - 1);
        
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

    async create(clerkUserId: string, data: EscrowCreate): Promise<EscrowHold> {
        const { data: hold, error } = await this.supabase
            .from('escrow_holds')
            .insert(data)
            .select()
            .single();
        
        if (error) throw error;
        return hold;
    }

    async release(
        id: string,
        clerkUserId: string,
        notes?: string
    ): Promise<EscrowHold> {
        const { data: released, error } = await this.supabase
            .from('escrow_holds')
            .update({
                status: 'released',
                released_at: new Date().toISOString(),
                released_by: clerkUserId,
                release_notes: notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return released;
    }

    async findDueForRelease(beforeDate: string): Promise<EscrowHold[]> {
        const { data, error } = await this.supabase
            .from('escrow_holds')
            .select('*')
            .eq('status', 'active')
            .lte('release_date', beforeDate);
        
        if (error) throw error;
        return data || [];
    }
}
```

---

### 3.2 Service Layer Implementation

**File**: `services/billing-service/src/v2/escrow/service.ts`

#### Tasks
- [ ] Implement `EscrowServiceV2` class
- [ ] Add automatic escrow calculation on placement creation
- [ ] Implement release logic with validation
- [ ] Add batch release for due holds
- [ ] Implement Stripe escrow transfer logic
- [ ] Add event publishing

#### Implementation Template
```typescript
export class EscrowServiceV2 {
    constructor(
        private repository: EscrowRepository,
        private eventPublisher?: EventPublisher
    ) {}

    async createForPlacement(
        placementId: string,
        payoutId: string,
        payoutAmount: number,
        guaranteePeriodDays: number = 90
    ): Promise<EscrowHold> {
        // Calculate escrow hold (e.g., 20% of payout)
        const holdbackPercentage = 20;
        const holdAmount = (payoutAmount * holdbackPercentage) / 100;
        
        // Calculate release date (after guarantee period)
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + guaranteePeriodDays);
        
        const hold = await this.repository.create('system', {
            placement_id: placementId,
            payout_id: payoutId,
            hold_amount: holdAmount,
            holdback_percentage: holdbackPercentage,
            release_date: releaseDate.toISOString(),
            status: 'active',
            reason: `${guaranteePeriodDays}-day guarantee period`
        });
        
        // Publish event
        await this.eventPublisher?.publish('escrow_hold.created', {
            escrowId: hold.id,
            placementId,
            payoutId,
            holdAmount
        });
        
        return hold;
    }

    async release(id: string, clerkUserId: string, notes?: string) {
        const hold = await this.repository.release(id, clerkUserId, notes);
        
        // Trigger Stripe transfer for released funds
        await this.transferEscrowFunds(hold);
        
        // Publish event
        await this.eventPublisher?.publish('escrow_hold.released', {
            escrowId: id,
            placementId: hold.placement_id,
            releasedBy: clerkUserId
        });
        
        return hold;
    }

    async processDueReleases(): Promise<number> {
        const now = new Date().toISOString();
        const dueHolds = await this.repository.findDueForRelease(now);
        
        let released = 0;
        
        for (const hold of dueHolds) {
            try {
                await this.release(hold.id, 'system', 'Automatic release after guarantee period');
                released++;
            } catch (error) {
                console.error(`Failed to release escrow ${hold.id}:`, error);
                
                // Publish failure event
                await this.eventPublisher?.publish('escrow_hold.release_failed', {
                    escrowId: hold.id,
                    error: error.message
                });
            }
        }
        
        return released;
    }

    private async transferEscrowFunds(hold: EscrowHold) {
        // Stripe Connect transfer logic
        // Transfer held amount to recruiter's connected account
    }
}
```

---

## Section 4: Payout Audit Logging

### 4.1 Audit Repository Implementation

**File**: `services/billing-service/src/v2/audit/repository.ts`

#### Tasks
- [ ] Implement `PayoutAuditRepository` class
- [ ] Add append-only insert method
- [ ] Implement query methods (by payout, by user, date range)
- [ ] Add enrichment for user details

---

### 4.2 Integrate Audit Logging into Payout Service

**File**: `services/billing-service/src/v2/payouts/service.ts`

#### Tasks
- [ ] Add audit logging to all payout state changes
- [ ] Log: create, approve, process, fail, cancel actions
- [ ] Include old/new status and reason
- [ ] Add actor tracking (user ID and role)

#### Implementation Pattern
```typescript
async function logAudit(
    payoutId: string,
    action: string,
    oldStatus: string | null,
    newStatus: string,
    changedBy: string,
    reason?: string
) {
    await this.auditRepository.create({
        payout_id: payoutId,
        action,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: changedBy,
        reason,
        metadata: {
            timestamp: new Date().toISOString()
        }
    });
}
```

---

## Section 5: Automated Scheduler Job

### 5.1 Payout Scheduler Job

**File**: `services/billing-service/src/jobs/payout-scheduler.ts`

#### Tasks
- [ ] Create scheduler job file
- [ ] Implement query for due schedules
- [ ] Trigger schedule processing
- [ ] Add error handling and retry logic
- [ ] Add Prometheus metrics
- [ ] Log all processing events

#### Implementation Template
```typescript
import { createClient } from '@supabase/supabase-js';
import { EventPublisher } from '@splits-network/shared-job-queue';
import { PayoutScheduleServiceV2 } from '../v2/payout-schedules/service';

export async function processScheduledPayouts() {
    const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const service = new PayoutScheduleServiceV2(/* dependencies */);
    
    console.log('Starting scheduled payout processing...');
    
    const processed = await service.processDueSchedules();
    
    console.log(`Processed ${processed} scheduled payouts`);
    
    return processed;
}
```

---

### 5.2 Escrow Release Job

**File**: `services/billing-service/src/jobs/escrow-release.ts`

#### Tasks
- [ ] Create escrow release job file
- [ ] Query holds due for release
- [ ] Process releases with Stripe transfers
- [ ] Add error handling and alerts
- [ ] Add metrics

---

### 5.3 Kubernetes CronJob Configuration

**File**: `infra/k8s/billing-service/cronjobs/payout-automation.yaml`

#### Tasks
- [ ] Create CronJob manifest for payout scheduler
- [ ] Set schedule: Daily at 2am UTC (`0 2 * * *`)
- [ ] Create CronJob manifest for escrow releases
- [ ] Set schedule: Daily at 3am UTC (`0 3 * * *`)
- [ ] Add resource limits
- [ ] Configure restart policies
- [ ] Add monitoring labels

#### Manifest Template
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: payout-scheduler
  namespace: splits-network
  labels:
    app: billing-service
    component: cron
spec:
  schedule: "0 2 * * *"  # 2am UTC daily
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 5
  concurrencyPolicy: Forbid
  jobTemplate:
    spec:
      backoffLimit: 2
      activeDeadlineSeconds: 1800  # 30 minute timeout
      template:
        metadata:
          labels:
            app: billing-service
            component: cron-job
        spec:
          restartPolicy: OnFailure
          containers:
          - name: payout-scheduler
            image: splits-network/billing-service:latest
            command: ["node", "dist/jobs/payout-scheduler.js"]
            resources:
              requests:
                cpu: "100m"
                memory: "256Mi"
              limits:
                cpu: "200m"
                memory: "512Mi"
            env:
              - name: SUPABASE_URL
                valueFrom:
                  secretKeyRef:
                    name: supabase-credentials
                    key: url
              - name: SUPABASE_SERVICE_ROLE_KEY
                valueFrom:
                  secretKeyRef:
                    name: supabase-credentials
                    key: service-role-key
---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: escrow-release
  namespace: splits-network
spec:
  schedule: "0 3 * * *"  # 3am UTC daily
  # ... similar configuration
```

---

## Section 6: Integration Testing

**File**: `services/billing-service/tests/integration/payout-automation.test.ts`

### Test Cases
- [ ] Test schedule creation with guarantee date
- [ ] Test automatic processing of due schedules
- [ ] Test escrow hold creation on placement
- [ ] Test escrow release after guarantee period
- [ ] Test audit log entries for all actions
- [ ] Test retry logic for failed schedules
- [ ] Test cancellation workflow
- [ ] Test role-based access control

---

## Acceptance Criteria

### Functional Requirements
- [ ] Payouts automatically scheduled based on guarantee completion
- [ ] Schedules processed daily by automated job
- [ ] Escrow holds created automatically on placements
- [ ] Escrow released automatically after guarantee period
- [ ] Full audit trail of all payout actions
- [ ] Failed schedules retry with exponential backoff
- [ ] Admin can manually trigger processing
- [ ] Admin can manually release escrow early

### Technical Requirements
- [ ] All endpoints return `{ data }` envelope
- [ ] Role-based access control enforced
- [ ] Events published for all state changes
- [ ] Kubernetes CronJobs deployed
- [ ] Metrics exported to Prometheus
- [ ] Error handling prevents partial state

### Testing Requirements
- [ ] Unit tests for business logic
- [ ] Integration tests with database
- [ ] Load testing with large datasets
- [ ] Failure scenario testing

---

## Implementation Timeline

### Days 1-2: Database & Schemas
- [ ] Create/enhance database tables
- [ ] Run migrations on dev/staging
- [ ] Test schema constraints

### Days 3-4: Payout Schedules Domain
- [ ] Implement repository
- [ ] Implement service layer
- [ ] Create routes
- [ ] Test CRUD operations

### Days 5-6: Escrow Holds Domain
- [ ] Implement repository
- [ ] Implement service layer
- [ ] Create routes
- [ ] Test escrow logic

### Day 7: Audit Logging
- [ ] Implement audit repository
- [ ] Integrate into payout service
- [ ] Test audit trail

### Days 8-9: Automation Jobs
- [ ] Create scheduler job
- [ ] Create escrow release job
- [ ] Create Kubernetes manifests
- [ ] Deploy to dev cluster

### Day 10: Testing & Production
- [ ] Integration testing
- [ ] Load testing
- [ ] Deploy to production
- [ ] Monitor first runs

---

## Status Summary

**Overall Status**: ❌ Not Started  
**Database Schema**: ❌ 0% Complete  
**Payout Schedules V2**: ❌ 0% Complete  
**Escrow Holds V2**: ❌ 0% Complete  
**Audit Logging**: ❌ 0% Complete  
**Automation Jobs**: ❌ 0% Complete  
**Testing**: ❌ 0% Complete

**Blockers**: None  
**Dependencies**: Existing payouts V2 domain complete ✅

---

**Last Updated**: January 14, 2026  
**Next Review**: After database migrations complete
