# Payout Automation - UI/Frontend Implementation Tracker

**Feature**: Payout Automation & Guarantees  
**Priority**: 🔥 HIGH  
**Status**: Not Started - Backend In Progress  
**Created**: January 14, 2026  
**Last Updated**: January 14, 2026

---

## Overview

Build admin UI for managing automated payout schedules and escrow holds. Allows platform administrators to monitor, override, and manage the automated payout system.

**Related Documents**:
- Feature Plan: `docs/plan-databaseTableIntegration2.prompt.md` (Feature 2)
- Backend Tracker: `docs/implementation-plans/payout-automation-api-backend.md`
- API Gateway: Billing Service V2 `/api/v2/payout-schedules`, `/api/v2/escrow-holds`

---

## Frontend Status Summary

### ✅ Backend Ready for Integration (In Progress)
- [ ] REST API endpoints at `/api/v2/payout-schedules`
- [ ] REST API endpoints at `/api/v2/escrow-holds`
- [ ] REST API endpoints at `/api/v2/payout-audit-log`
- [ ] Role-based access control (admins only)
- [ ] Pagination, search, filtering support

### ❌ Missing Frontend Implementation
- [ ] Admin payout schedules dashboard
- [ ] Schedule list view with filters
- [ ] Schedule detail modal
- [ ] Manual trigger interface
- [ ] Escrow holds dashboard
- [ ] Escrow management interface
- [ ] Audit log viewer
- [ ] Charts and analytics

---

## Implementation Tasks

## Section 1: Payout Schedules Dashboard

**Location**: `apps/portal/src/app/portal/admin/payouts/schedules/`

### 1.1 Main Schedules Page

**File**: `apps/portal/src/app/portal/admin/payouts/schedules/page.tsx`

#### Tasks
- [ ] Create admin-only page component
- [ ] Add breadcrumb navigation (Portal > Admin > Payouts > Schedules)
- [ ] Implement header with stats cards
- [ ] Add manual trigger button for admins
- [ ] Add loading skeleton
- [ ] Add empty state
- [ ] Implement error boundary

#### Stats Cards
| Stat | Description |
|------|-------------|
| Pending Schedules | Count of schedules awaiting processing |
| Processed Today | Number processed in last 24 hours |
| Failed Schedules | Count requiring admin attention |
| Total Scheduled Amount | Sum of all pending schedule amounts |

#### Component Structure
```tsx
'use client';

import { useState, useEffect } from 'react';
import { SchedulesTable } from './components/schedules-table';
import { ScheduleFilters } from './components/schedule-filters';
import { ScheduleDetailModal } from './components/schedule-detail-modal';
import { getPayoutSchedules, triggerScheduleProcessing } from './lib/api';

export default function PayoutSchedulesPage() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        processed_today: 0,
        failed: 0,
        total_amount: 0
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 25,
        status: '',
        date_from: '',
        date_to: ''
    });
    const [processing, setProcessing] = useState(false);
    
    useEffect(() => {
        loadSchedules();
        loadStats();
    }, [filters]);
    
    async function loadSchedules() {
        setLoading(true);
        try {
            const { data, pagination } = await getPayoutSchedules(filters);
            setSchedules(data);
        } catch (error) {
            console.error('Failed to load schedules:', error);
        } finally {
            setLoading(false);
        }
    }
    
    async function handleManualTrigger() {
        if (!confirm('Trigger manual processing of due schedules?')) return;
        
        setProcessing(true);
        try {
            const result = await triggerScheduleProcessing();
            alert(`Processed ${result.processed_count} schedules`);
            loadSchedules();
        } catch (error) {
            alert('Failed to trigger processing');
        } finally {
            setProcessing(false);
        }
    }
    
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Payout Schedules</h1>
                <button 
                    onClick={handleManualTrigger}
                    disabled={processing}
                    className="btn btn-primary"
                >
                    {processing ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-play"></i>
                            Trigger Processing
                        </>
                    )}
                </button>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                    title="Pending"
                    value={stats.pending}
                    icon="clock"
                    color="warning"
                />
                <StatsCard
                    title="Processed Today"
                    value={stats.processed_today}
                    icon="check"
                    color="success"
                />
                <StatsCard
                    title="Failed"
                    value={stats.failed}
                    icon="exclamation-triangle"
                    color="error"
                />
                <StatsCard
                    title="Total Scheduled"
                    value={`$${stats.total_amount.toLocaleString()}`}
                    icon="dollar-sign"
                    color="info"
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1">
                    <ScheduleFilters 
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                </aside>
                
                <main className="lg:col-span-3">
                    {loading ? (
                        <div>Loading...</div>
                    ) : schedules.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <SchedulesTable 
                            schedules={schedules}
                            onRefresh={loadSchedules}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
```

---

### 1.2 Schedules Table Component

**File**: `apps/portal/src/app/portal/admin/payouts/schedules/components/schedules-table.tsx`

#### Tasks
- [ ] Create table component with DaisyUI styling
- [ ] Display schedule data (payout, placement, dates, status)
- [ ] Add status badges (pending, processing, processed, failed)
- [ ] Show countdown to scheduled date
- [ ] Add action buttons (view, cancel, retry)
- [ ] Implement pagination controls
- [ ] Add sorting by date, status
- [ ] Make responsive

#### Columns
| Column | Display | Sortable |
|--------|---------|----------|
| Schedule ID | Short UUID | No |
| Payout | Amount + Recruiter | Yes |
| Placement | Job + Candidate | No |
| Scheduled Date | Date + countdown | Yes |
| Guarantee Date | Date | Yes |
| Status | Badge | Yes |
| Retries | Count | No |
| Actions | View, Cancel, Retry | No |

#### Component Template
```tsx
interface PayoutSchedule {
    id: string;
    payout_id: string;
    placement_id: string;
    scheduled_date: string;
    guarantee_completion_date: string;
    status: 'pending' | 'processing' | 'processed' | 'failed' | 'cancelled';
    processed_at?: string;
    failure_reason?: string;
    retry_count: number;
}

export function SchedulesTable({ schedules, onRefresh }: Props) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Payout</th>
                            <th>Placement</th>
                            <th>Scheduled</th>
                            <th>Guarantee</th>
                            <th>Status</th>
                            <th>Retries</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule) => (
                            <tr key={schedule.id}>
                                <td>
                                    <span className="font-mono text-sm">
                                        {schedule.id.substring(0, 8)}
                                    </span>
                                </td>
                                <td>
                                    {/* Payout info */}
                                </td>
                                <td>
                                    {/* Placement info */}
                                </td>
                                <td>
                                    {formatDate(schedule.scheduled_date)}
                                    <br />
                                    <CountdownBadge date={schedule.scheduled_date} />
                                </td>
                                <td>{formatDate(schedule.guarantee_completion_date)}</td>
                                <td>
                                    <StatusBadge status={schedule.status} />
                                </td>
                                <td>
                                    {schedule.retry_count > 0 && (
                                        <span className="badge badge-warning">
                                            {schedule.retry_count}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-ghost">
                                            <i className="fa-duotone fa-regular fa-eye"></i>
                                        </button>
                                        {schedule.status === 'pending' && (
                                            <button className="btn btn-sm btn-error btn-outline">
                                                <i className="fa-duotone fa-regular fa-xmark"></i>
                                            </button>
                                        )}
                                        {schedule.status === 'failed' && (
                                            <button className="btn btn-sm btn-primary">
                                                <i className="fa-duotone fa-regular fa-rotate"></i>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
```

---

### 1.3 Schedule Filters Sidebar

**File**: `apps/portal/src/app/portal/admin/payouts/schedules/components/schedule-filters.tsx`

#### Tasks
- [ ] Create filters card
- [ ] Add status filter dropdown
- [ ] Add date range picker (scheduled date)
- [ ] Add placement search (optional)
- [ ] Add clear filters button
- [ ] Persist filters to URL query params

#### Component Template
```tsx
export function ScheduleFilters({ filters, onFilterChange }: Props) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Filters</h2>
                
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select w-full"
                        value={filters.status || ''}
                        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="processed">Processed</option>
                        <option value="failed">Failed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </fieldset>
                
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Scheduled From</legend>
                    <input
                        type="date"
                        className="input w-full"
                        value={filters.date_from || ''}
                        onChange={(e) => onFilterChange({ ...filters, date_from: e.target.value })}
                    />
                </fieldset>
                
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Scheduled To</legend>
                    <input
                        type="date"
                        className="input w-full"
                        value={filters.date_to || ''}
                        onChange={(e) => onFilterChange({ ...filters, date_to: e.target.value })}
                    />
                </fieldset>
                
                <button 
                    onClick={() => onFilterChange({ page: 1, limit: 25 })}
                    className="btn btn-ghost btn-sm"
                >
                    Clear Filters
                </button>
            </div>
        </div>
    );
}
```

---

### 1.4 Schedule Detail Modal

**File**: `apps/portal/src/app/portal/admin/payouts/schedules/components/schedule-detail-modal.tsx`

#### Tasks
- [ ] Create modal component
- [ ] Display full schedule details
- [ ] Show associated payout information
- [ ] Show placement guarantee details
- [ ] Display processing history
- [ ] Show failure reason if failed
- [ ] Add cancel/retry actions for admins

---

### 1.5 API Client Methods

**File**: `apps/portal/src/app/portal/admin/payouts/schedules/lib/api.ts`

#### Tasks
- [ ] Create `getPayoutSchedules(filters)` method
- [ ] Create `getSchedule(id)` method
- [ ] Create `triggerScheduleProcessing()` method
- [ ] Create `cancelSchedule(id)` method
- [ ] Create `retrySchedule(id)` method
- [ ] Add error handling

#### Implementation
```typescript
import { apiClient } from '@/lib/api-client';

export interface ScheduleFilters {
    page?: number;
    limit?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
    placement_id?: string;
}

export async function getPayoutSchedules(filters: ScheduleFilters = {}) {
    const { data, pagination } = await apiClient.get('/payout-schedules', {
        params: filters
    });
    return { data, pagination };
}

export async function getSchedule(id: string) {
    const { data } = await apiClient.get(`/payout-schedules/${id}`);
    return data;
}

export async function triggerScheduleProcessing() {
    const { data } = await apiClient.post('/payout-schedules/process-due');
    return data;
}

export async function cancelSchedule(id: string) {
    await apiClient.delete(`/payout-schedules/${id}`);
}

export async function retrySchedule(id: string) {
    const { data } = await apiClient.patch(`/payout-schedules/${id}`, {
        status: 'pending',
        retry_count: 0
    });
    return data;
}
```

---

## Section 2: Escrow Holds Dashboard

**Location**: `apps/portal/src/app/portal/admin/payouts/escrow/`

### 2.1 Main Escrow Page

**File**: `apps/portal/src/app/portal/admin/payouts/escrow/page.tsx`

#### Tasks
- [ ] Create admin-only page component
- [ ] Add breadcrumb navigation
- [ ] Implement header with escrow stats
- [ ] Add filters sidebar
- [ ] Display escrow holds table
- [ ] Add manual release button for admins
- [ ] Show total amount in escrow

#### Stats Cards
| Stat | Description |
|------|-------------|
| Active Holds | Count of unreleased escrow holds |
| Total Held | Sum of all active hold amounts |
| Due for Release | Count eligible for release today |
| Released Today | Count released in last 24 hours |

---

### 2.2 Escrow Holds Table

**File**: `apps/portal/src/app/portal/admin/payouts/escrow/components/escrow-table.tsx`

#### Tasks
- [ ] Create table component
- [ ] Display hold data (placement, amount, dates, status)
- [ ] Add status badges (active, released, forfeited)
- [ ] Show countdown to release date
- [ ] Add release button for admins
- [ ] Implement pagination
- [ ] Add sorting
- [ ] Make responsive

#### Columns
| Column | Display | Sortable |
|--------|---------|----------|
| Hold ID | Short UUID | No |
| Placement | Job + Candidate | No |
| Hold Amount | Dollar amount | Yes |
| Holdback % | Percentage | No |
| Release Date | Date + countdown | Yes |
| Status | Badge | Yes |
| Actions | View, Release | No |

---

### 2.3 Release Escrow Modal

**File**: `apps/portal/src/app/portal/admin/payouts/escrow/components/release-modal.tsx`

#### Tasks
- [ ] Create confirmation modal
- [ ] Show hold details
- [ ] Add release notes field (required)
- [ ] Show Stripe transfer preview
- [ ] Implement confirm/cancel buttons
- [ ] Add loading state
- [ ] Show success toast

---

### 2.4 Escrow API Client

**File**: `apps/portal/src/app/portal/admin/payouts/escrow/lib/api.ts`

#### Tasks
- [ ] Create `getEscrowHolds(filters)` method
- [ ] Create `getEscrowHold(id)` method
- [ ] Create `releaseEscrow(id, notes)` method
- [ ] Create `forfeitEscrow(id, reason)` method
- [ ] Add error handling

---

## Section 3: Audit Log Viewer

**Location**: `apps/portal/src/app/portal/admin/payouts/audit/`

### 3.1 Audit Log Page

**File**: `apps/portal/src/app/portal/admin/payouts/audit/page.tsx`

#### Tasks
- [ ] Create read-only audit viewer
- [ ] Add filters (payout, user, action, date range)
- [ ] Display timeline view of audit events
- [ ] Show actor information (user + role)
- [ ] Display old/new status transitions
- [ ] Add export to CSV functionality
- [ ] Implement search by payout ID

---

### 3.2 Audit Timeline Component

**File**: `apps/portal/src/app/portal/admin/payouts/audit/components/audit-timeline.tsx`

#### Tasks
- [ ] Create vertical timeline component
- [ ] Show audit events chronologically
- [ ] Color code by action type (create, update, process, fail)
- [ ] Display actor avatars
- [ ] Show metadata in expandable sections
- [ ] Add filtering by action type

---

## Section 4: Charts & Analytics

**Location**: Integrated into dashboard pages

### 4.1 Schedule Processing Chart

#### Tasks
- [ ] Create line chart showing processing trends
- [ ] Display successful vs failed schedules over time
- [ ] Add date range selector
- [ ] Show average processing time

### 4.2 Escrow Hold Chart

#### Tasks
- [ ] Create stacked area chart
- [ ] Show total held amount over time
- [ ] Display releases and new holds
- [ ] Add trend indicators

---

## Section 5: Navigation Integration

### 5.1 Admin Menu

**File**: `apps/portal/src/app/portal/admin/layout.tsx`

#### Tasks
- [ ] Add "Payouts" section to admin menu
- [ ] Add sub-items: Schedules, Escrow, Audit Log
- [ ] Add icons for each page
- [ ] Show badge counts for pending items

---

## Acceptance Criteria

### Functional Requirements
- [ ] Admins can view all payout schedules
- [ ] Admins can manually trigger schedule processing
- [ ] Admins can cancel pending schedules
- [ ] Admins can retry failed schedules
- [ ] Admins can view all escrow holds
- [ ] Admins can manually release escrow early
- [ ] Admins can view complete audit trail
- [ ] All actions show loading states
- [ ] All actions show success/error feedback

### User Experience
- [ ] Pages load within 1 second
- [ ] Progressive loading for secondary data
- [ ] Clear status indicators (badges, colors)
- [ ] Countdown timers update in real-time
- [ ] Confirmation modals for destructive actions
- [ ] Export functionality for reporting
- [ ] Mobile responsive layouts

### Technical Requirements
- [ ] Uses V2 API endpoints (`/api/v2/payout-schedules`, etc.)
- [ ] Server-side filtering/pagination
- [ ] Proper error boundaries
- [ ] TypeScript types for all data
- [ ] DaisyUI v5 components
- [ ] Admin-only access control

---

## Implementation Timeline

### Days 1-2: Schedules Dashboard
- [ ] Create page structure and routing
- [ ] Implement schedules table with filters
- [ ] Build stats cards
- [ ] Add manual trigger button
- [ ] Wire up API calls

### Days 3-4: Escrow Dashboard
- [ ] Create escrow page layout
- [ ] Implement escrow holds table
- [ ] Build release modal
- [ ] Add filters and search
- [ ] Test release workflow

### Day 5: Audit Log Viewer
- [ ] Create audit log page
- [ ] Build timeline component
- [ ] Add filters and export
- [ ] Test audit trail display

### Days 6-7: Charts & Polish
- [ ] Add analytics charts
- [ ] Integrate into admin menu
- [ ] Add responsive breakpoints
- [ ] Integration testing
- [ ] Deploy to staging

---

## Testing Checklist

### Integration Tests
- [ ] Load schedules list
- [ ] Trigger manual processing
- [ ] Cancel schedule
- [ ] Retry failed schedule
- [ ] Load escrow holds
- [ ] Release escrow hold
- [ ] View audit log
- [ ] Export audit log

### E2E Tests
- [ ] Admin triggers processing → Verify schedules processed
- [ ] Admin releases escrow → Verify funds transferred
- [ ] Admin cancels schedule → Verify status updated

### Manual Tests
- [ ] Test on desktop browsers
- [ ] Test on mobile devices
- [ ] Test with large datasets (1000+ schedules)
- [ ] Test filter/search performance

---

## Status Summary

**Overall Status**: ❌ Not Started - Backend In Progress  
**Schedules Dashboard**: ❌ 0% Complete  
**Escrow Dashboard**: ❌ 0% Complete  
**Audit Log Viewer**: ❌ 0% Complete  
**Charts & Analytics**: ❌ 0% Complete  
**Testing**: ❌ 0% Complete

**Blockers**: Backend API must be complete first  
**Dependencies**: Backend tracker tasks must finish

---

**Last Updated**: January 14, 2026  
**Next Review**: After backend API complete
