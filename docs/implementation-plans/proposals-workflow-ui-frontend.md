# Proposals Workflow - UI/Frontend Implementation Tracker

**Feature**: Complete Proposals Workflow  
**Priority**: 🔥 HIGH  
**Status**: ✅ Components Complete - Integration Pending  
**Created**: January 14, 2026  
**Last Updated**: January 14, 2026

---

## Overview

Build complete frontend UI for proposals workflow in Portal app. Backend V2 API is complete and ready for integration. Automation tracked separately in `proposals-workflow-api-backend.md`.

**Related Documents**:
- Feature Plan: `docs/plan-databaseTableIntegration2.prompt.md` (Feature 1)
- Backend Tracker: `docs/implementation-plans/proposals-workflow-api-backend.md`
- API Gateway: Network Service V2 `/api/v2/proposals`

---

## Frontend Status Summary

### ✅ Backend Ready for Integration
- [x] REST API endpoints at `/api/v2/proposals`
- [x] Role-based access control (recruiters, company users, admins)
- [x] Pagination, search, filtering support
- [x] Event publishing for notifications
- [x] Email templates for all states

### ✅ Components Implemented
- [x] ProposalsTable component with countdown timers
- [x] ProposalFilters component with search/filtering
- [x] CreateProposalDrawer component with form validation
- [x] Existing proposals page with unified system

### 🔄 Pending Integration
- [ ] Test components with live API data
- [ ] Integration with recruiter dashboard
- [ ] Company user acceptance workflow
- [ ] End-to-end user acceptance testing

---

## Implementation Tasks

## Section 1: Recruiter Proposals Dashboard

**Location**: `apps/portal/src/app/portal/proposals/`

### 1.1 Main Page Layout

**File**: `apps/portal/src/app/portal/proposals/page.tsx`

#### Tasks
- [ ] Create page component with authentication guard
- [ ] Add breadcrumb navigation (Portal > Proposals)
- [ ] Implement header with title and create button
- [ ] Add loading skeleton for initial load
- [ ] Add empty state when no proposals exist
- [ ] Implement error boundary for API failures
- [ ] Add responsive layout (mobile-friendly)

#### Component Structure
```tsx
'use client';

import { useState, useEffect } from 'react';
import { ProposalsTable } from './components/proposals-table';
import { ProposalFilters } from './components/proposal-filters';
import { CreateProposalDrawer } from './components/create-proposal-drawer';
import { getProposals } from './lib/api';

export default function ProposalsPage() {
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 25,
        state: '',
        search: '',
    });
    const [showCreateDrawer, setShowCreateDrawer] = useState(false);
    
    useEffect(() => {
        loadProposals();
    }, [filters]);
    
    async function loadProposals() {
        setLoading(true);
        try {
            const { data, pagination } = await getProposals(filters);
            setProposals(data);
        } catch (error) {
            console.error('Failed to load proposals:', error);
        } finally {
            setLoading(false);
        }
    }
    
    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Candidate Proposals</h1>
                <button 
                    onClick={() => setShowCreateDrawer(true)}
                    className="btn btn-primary"
                >
                    <i className="fa-duotone fa-regular fa-plus"></i>
                    New Proposal
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1">
                    <ProposalFilters 
                        filters={filters}
                        onFilterChange={setFilters}
                    />
                </aside>
                
                <main className="lg:col-span-3">
                    {loading ? (
                        <div>Loading...</div>
                    ) : proposals.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <ProposalsTable 
                            proposals={proposals}
                            onRefresh={loadProposals}
                        />
                    )}
                </main>
            </div>
            
            <CreateProposalDrawer
                isOpen={showCreateDrawer}
                onClose={() => setShowCreateDrawer(false)}
                onSuccess={loadProposals}
            />
        </div>
    );
}
```

---

### 1.2 Proposals Table Component

**File**: `apps/portal/src/app/portal/proposals/components/proposals-table.tsx`

#### Tasks
- [x] Create table component with DaisyUI styling
- [x] Display proposal data (candidate, job, status, due date)
- [x] Add status badges (pending, accepted, declined, expired)
- [x] Implement countdown timer for pending proposals
  - [x] Red text + bold when < 6 hours remaining
  - [x] Yellow text when < 24 hours remaining
  - [x] Show "Expired" for past-due proposals
- [x] Add action buttons (view, withdraw)
- [ ] Implement pagination controls (existing page already has this)
- [x] Add sorting by date, status
- [ ] Make table responsive (card view on mobile)

#### Columns
| Column | Display | Sortable |
|--------|---------|----------|
| Candidate | Name + photo | Yes |
| Job | Title + company | Yes |
| Status | Badge | Yes |
| Created | Relative time | Yes |
| Due | Countdown timer | Yes |
| Actions | View, Withdraw | No |

#### Component Template
```tsx
interface Proposal {
    id: string;
    candidate_name: string;
    job_title: string;
    company_name: string;
    state: 'proposed' | 'accepted' | 'declined' | 'timed_out';
    proposed_at: string;
    response_due_at: string;
    proposal_notes?: string;
}

export function ProposalsTable({ proposals, onRefresh }: Props) {
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="overflow-x-auto">
                <table className="table table-zebra">
                    <thead>
                        <tr>
                            <th>Candidate</th>
                            <th>Job</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Time Remaining</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proposals.map((proposal) => (
                            <tr key={proposal.id}>
                                <td>{proposal.candidate_name}</td>
                                <td>
                                    {proposal.job_title}
                                    <br />
                                    <span className="text-sm opacity-50">
                                        {proposal.company_name}
                                    </span>
                                </td>
                                <td>
                                    <StatusBadge state={proposal.state} />
                                </td>
                                <td>{formatRelativeTime(proposal.proposed_at)}</td>
                                <td>
                                    <CountdownTimer dueAt={proposal.response_due_at} />
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-ghost">
                                            <i className="fa-duotone fa-regular fa-eye"></i>
                                        </button>
                                        {proposal.state === 'proposed' && (
                                            <button className="btn btn-sm btn-error btn-outline">
                                                <i className="fa-duotone fa-regular fa-xmark"></i>
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

### 1.3 Proposal Filters Sidebar

**File**: `apps/portal/src/app/portal/proposals/components/proposal-filters.tsx`

#### Tasks
- [x] Create filters card component
- [x] Add search input (debounced to 300ms)
- [x] Add status filter (all, pending, accepted, declined, expired)
- [ ] Add date range filter (optional - not yet implemented)
- [x] Add clear filters button
- [ ] Persist filters to URL query params (existing page may handle this)
- [x] Show active filter count badge

#### Component Template
```tsx
export function ProposalFilters({ filters, onFilterChange }: Props) {
    const [searchInput, setSearchInput] = useState(filters.search || '');
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({ ...filters, search: searchInput });
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);
    
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Filters</h2>
                
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Search</legend>
                    <input
                        type="text"
                        className="input w-full"
                        placeholder="Search proposals..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                </fieldset>
                
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Status</legend>
                    <select
                        className="select w-full"
                        value={filters.state || ''}
                        onChange={(e) => onFilterChange({ ...filters, state: e.target.value })}
                    >
                        <option value="">All Statuses</option>
                        <option value="proposed">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="timed_out">Expired</option>
                    </select>
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

### 1.4 Create Proposal Drawer

**File**: `apps/portal/src/app/portal/proposals/components/create-proposal-drawer.tsx`

#### Tasks
- [x] Create drawer component (opens from right)
- [x] Add candidate search/select input
- [x] Add job search/select input
- [x] Add proposal notes textarea
- [x] Add response due date info (defaults to 72 hours)
- [x] Implement form validation
- [x] Add submit handler with loading state
- [x] Show success toast on creation
- [x] Show error alert on failure
- [x] Auto-close drawer on success
- [x] Support pre-selection of job or candidate

#### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Candidate | Search select | Yes | Must be recruiter's candidate |
| Job | Search select | Yes | Must be active job |
| Notes | Textarea | No | Max 1000 chars |
| Due Date | Date picker | No | Min: now + 24h, Max: now + 168h |

#### Component Template
```tsx
export function CreateProposalDrawer({ isOpen, onClose, onSuccess }: Props) {
    const [formData, setFormData] = useState({
        candidate_id: '',
        job_id: '',
        proposal_notes: '',
        response_due_at: getDefaultDueDate(), // now + 72h
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        
        try {
            await createProposal(formData);
            toast.success('Proposal created successfully');
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to create proposal');
        } finally {
            setSubmitting(false);
        }
    }
    
    return (
        <div className={`drawer drawer-end ${isOpen ? 'drawer-open' : ''}`}>
            <input type="checkbox" className="drawer-toggle" checked={isOpen} readOnly />
            <div className="drawer-side">
                <label className="drawer-overlay" onClick={onClose}></label>
                <div className="menu p-4 w-96 min-h-full bg-base-100">
                    <h2 className="text-2xl font-bold mb-6">New Proposal</h2>
                    
                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <CandidateSelect
                            value={formData.candidate_id}
                            onChange={(id) => setFormData({ ...formData, candidate_id: id })}
                        />
                        
                        <JobSelect
                            value={formData.job_id}
                            onChange={(id) => setFormData({ ...formData, job_id: id })}
                        />
                        
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Proposal Notes</legend>
                            <textarea
                                className="textarea w-full h-32"
                                placeholder="Why is this candidate a great fit?"
                                value={formData.proposal_notes}
                                onChange={(e) => setFormData({ ...formData, proposal_notes: e.target.value })}
                                maxLength={1000}
                            />
                        </fieldset>
                        
                        <div className="flex gap-2 pt-4">
                            <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
                                Cancel
                            </button>
                            <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creating...
                                    </>
                                ) : (
                                    'Create Proposal'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
```

---

### 1.5 Countdown Timer Component

**File**: `apps/portal/src/app/portal/proposals/components/countdown-timer.tsx`

#### Tasks
- [ ] Create countdown component with useEffect timer
- [ ] Calculate time remaining (hours:minutes)
- [ ] Update every minute
- [ ] Show "Expired" for past due dates
- [ ] Color code: green (>24h), yellow (6-24h), red (<6h)
- [ ] Add icon for urgency
- [ ] Handle timezone conversions

#### Component Template
```tsx
export function CountdownTimer({ dueAt }: { dueAt: string }) {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [urgency, setUrgency] = useState<'safe' | 'warning' | 'urgent' | 'expired'>('safe');
    
    useEffect(() => {
        function updateTimer() {
            const now = new Date();
            const due = new Date(dueAt);
            const diff = due.getTime() - now.getTime();
            
            if (diff <= 0) {
                setTimeRemaining('Expired');
                setUrgency('expired');
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            setTimeRemaining(`${hours}h ${minutes}m`);
            
            if (hours > 24) setUrgency('safe');
            else if (hours > 6) setUrgency('warning');
            else setUrgency('urgent');
        }
        
        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        
        return () => clearInterval(interval);
    }, [dueAt]);
    
    const badgeClass = {
        safe: 'badge-success',
        warning: 'badge-warning',
        urgent: 'badge-error',
        expired: 'badge-ghost',
    }[urgency];
    
    return (
        <span className={`badge ${badgeClass}`}>
            <i className="fa-duotone fa-regular fa-clock mr-1"></i>
            {timeRemaining}
        </span>
    );
}
```

---

### 1.6 Proposal Details Modal

**File**: `apps/portal/src/app/portal/proposals/components/proposal-details-modal.tsx`

#### Tasks
- [ ] Create modal component with full proposal details
- [ ] Display candidate information
- [ ] Display job information
- [ ] Show proposal notes (read-only)
- [ ] Show timeline (created, accepted/declined dates)
- [ ] Add response notes if accepted/declined
- [ ] Show status badge
- [ ] Add close button

---

### 1.7 API Client Methods

**File**: `apps/portal/src/app/portal/proposals/lib/api.ts`

#### Tasks
- [ ] Create `getProposals(filters)` method
- [ ] Create `getProposal(id)` method
- [ ] Create `createProposal(data)` method
- [ ] Create `withdrawProposal(id)` method
- [ ] Add error handling with typed errors
- [ ] Add request/response logging
- [ ] Handle authentication errors

#### Implementation
```typescript
import { apiClient } from '@/lib/api-client';

export interface ProposalFilters {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    recruiter_id?: string;
    job_id?: string;
}

export interface ProposalCreate {
    candidate_id: string;
    job_id: string;
    recruiter_id: string;
    proposal_notes?: string;
    response_due_at?: string;
}

export async function getProposals(filters: ProposalFilters = {}) {
    const { data, pagination } = await apiClient.get('/proposals', {
        params: {
            page: filters.page || 1,
            limit: filters.limit || 25,
            search: filters.search,
            state: filters.state,
            recruiter_id: filters.recruiter_id,
            job_id: filters.job_id,
        },
    });
    
    return { data, pagination };
}

export async function getProposal(id: string) {
    const { data } = await apiClient.get(`/proposals/${id}`);
    return data;
}

export async function createProposal(proposal: ProposalCreate) {
    const { data } = await apiClient.post('/proposals', proposal);
    return data;
}

export async function withdrawProposal(id: string) {
    await apiClient.delete(`/proposals/${id}`);
}
```

---

## Section 2: Company User Acceptance Workflow

**Location**: `apps/portal/src/app/portal/roles/[id]/proposals/`

### 2.1 Job-Specific Proposals Page

**File**: `apps/portal/src/app/portal/roles/[id]/proposals/page.tsx`

#### Tasks
- [ ] Create page component for job-specific proposals
- [ ] Fetch job details and proposals
- [ ] Add breadcrumb navigation (Portal > Roles > [Job] > Proposals)
- [ ] Show job header with title and status
- [ ] Display proposals in card layout
- [ ] Add filters (pending, accepted, declined)
- [ ] Show empty state if no proposals
- [ ] Implement responsive layout

---

### 2.2 Proposal Card Component

**File**: `apps/portal/src/app/portal/roles/[id]/proposals/components/proposal-card.tsx`

#### Tasks
- [ ] Create card component for each proposal
- [ ] Display recruiter name and photo
- [ ] Display candidate name and summary
- [ ] Show proposal notes prominently
- [ ] Add countdown timer badge
- [ ] Show accept/decline buttons for pending
- [ ] Show response notes for accepted/declined
- [ ] Disable actions if expired
- [ ] Add hover effects

#### Card Layout
```
┌─────────────────────────────────────┐
│ [Photo] John Smith (Recruiter)     │
│                            [Timer]  │
│ Candidate: Jane Doe                 │
│                                     │
│ "Great fit because..."              │
│ (proposal notes)                    │
│                                     │
│ [Accept]  [Decline]                 │
└─────────────────────────────────────┘
```

---

### 2.3 Accept Proposal Modal

**File**: `apps/portal/src/app/portal/roles/[id]/proposals/components/accept-modal.tsx`

#### Tasks
- [ ] Create confirmation modal
- [ ] Show proposal summary
- [ ] Add response notes field (optional)
- [ ] Add warning about creating recruiter relationship
- [ ] Implement confirm/cancel buttons
- [ ] Add loading state during submission
- [ ] Show success toast on completion
- [ ] Close modal and refresh list

#### Modal Content
```
Accept Candidate Proposal
─────────────────────────

Recruiter: John Smith
Candidate: Jane Doe
Job: Senior Engineer

By accepting, you agree to work with this recruiter
on this candidate. A recruiter-candidate relationship
will be created.

Response Notes (optional):
[Textarea]

[Cancel]  [Accept Proposal]
```

---

### 2.4 Decline Proposal Modal

**File**: `apps/portal/src/app/portal/roles/[id]/proposals/components/decline-modal.tsx`

#### Tasks
- [ ] Create confirmation modal
- [ ] Show proposal summary
- [ ] Add decline reason dropdown
  - Not a good fit
  - Already sourced this candidate
  - Position filled
  - Other (specify)
- [ ] Add response notes field (required)
- [ ] Implement confirm/cancel buttons
- [ ] Show warning about notifying recruiter
- [ ] Add loading state
- [ ] Show success toast
- [ ] Close modal and refresh

---

### 2.5 API Client Methods (Company User)

**File**: `apps/portal/src/app/portal/roles/[id]/proposals/lib/api.ts`

#### Tasks
- [ ] Create `getJobProposals(jobId)` method
- [ ] Create `acceptProposal(id, notes)` method
- [ ] Create `declineProposal(id, notes)` method
- [ ] Add error handling
- [ ] Handle optimistic updates

#### Implementation
```typescript
export async function getJobProposals(jobId: string) {
    const { data } = await apiClient.get('/proposals', {
        params: { job_id: jobId, state: 'proposed' },
    });
    return data;
}

export async function acceptProposal(id: string, notes?: string) {
    const { data } = await apiClient.patch(`/proposals/${id}`, {
        state: 'accepted',
        response_notes: notes,
        accepted_at: new Date().toISOString(),
    });
    return data;
}

export async function declineProposal(id: string, notes: string) {
    const { data } = await apiClient.patch(`/proposals/${id}`, {
        state: 'declined',
        response_notes: notes,
        declined_at: new Date().toISOString(),
    });
    return data;
}
```

---

## Section 3: Shared Components

### 3.1 Status Badge Component

**File**: `apps/portal/src/app/portal/proposals/components/status-badge.tsx`

#### Tasks
- [ ] Create badge component with color coding
- [ ] Map states to badge styles
- [ ] Add icons for each state

```tsx
export function StatusBadge({ state }: { state: string }) {
    const config = {
        proposed: { label: 'Pending', class: 'badge-warning', icon: 'clock' },
        accepted: { label: 'Accepted', class: 'badge-success', icon: 'check' },
        declined: { label: 'Declined', class: 'badge-error', icon: 'xmark' },
        timed_out: { label: 'Expired', class: 'badge-ghost', icon: 'clock-rotate-left' },
    }[state];
    
    return (
        <span className={`badge ${config.class}`}>
            <i className={`fa-duotone fa-regular fa-${config.icon} mr-1`}></i>
            {config.label}
        </span>
    );
}
```

---

### 3.2 Empty State Component

**File**: `apps/portal/src/app/portal/proposals/components/empty-state.tsx`

#### Tasks
- [ ] Create empty state with illustration
- [ ] Add descriptive text
- [ ] Add CTA button to create proposal
- [ ] Make it friendly and helpful

---

## Section 4: Routing & Navigation

### 4.1 Navigation Menu Integration

**File**: `apps/portal/src/app/portal/layout.tsx`

#### Tasks
- [ ] Add "Proposals" menu item
- [ ] Add icon (handshake)
- [ ] Position in main navigation
- [ ] Add badge for pending proposals count (optional)
- [ ] Show only for recruiters and company users

---

### 4.2 Breadcrumbs

#### Tasks
- [ ] Add breadcrumbs to proposals pages
- [ ] Ensure consistent navigation hierarchy
- [ ] Link back to parent pages

---

## Acceptance Criteria

### Functional Requirements
- [ ] Recruiters can view all their proposals
- [ ] Recruiters can create new proposals
- [ ] Recruiters can withdraw pending proposals
- [ ] Recruiters can search/filter proposals
- [ ] Company users can view proposals for their jobs
- [ ] Company users can accept proposals with notes
- [ ] Company users can decline proposals with notes
- [ ] Countdown timers update in real-time
- [ ] Expired proposals are visually distinct
- [ ] Toast notifications on all actions
- [ ] Form validation prevents invalid submissions

### User Experience
- [ ] Page loads within 1 second
- [ ] Progressive loading (list loads first, details lazy)
- [ ] Smooth transitions and animations
- [ ] Keyboard navigation support
- [ ] Screen reader accessible
- [ ] Mobile responsive (works on phones)
- [ ] Clear error messages
- [ ] Loading states on all async actions

### Technical Requirements
- [ ] Uses V2 API endpoints (`/api/v2/proposals`)
- [ ] Implements progressive loading pattern
- [ ] Server-side filtering/pagination
- [ ] Proper error boundaries
- [ ] TypeScript types for all data
- [ ] DaisyUI v5 components (fieldset pattern)
- [ ] No HTTP calls to other services
- [ ] Follows form control guidance

---

## Implementation Timeline

### Day 1-2: Recruiter Dashboard
- [ ] Create page structure and routing
- [ ] Implement proposals table with pagination
- [ ] Add filters sidebar
- [ ] Build countdown timer component
- [ ] Create API client methods
- [ ] Test with mock data

### Day 3: Create Proposal Flow
- [ ] Build create proposal drawer
- [ ] Implement candidate/job search selects
- [ ] Add form validation
- [ ] Wire up API calls
- [ ] Test end-to-end creation

### Day 4: Company User Acceptance
- [ ] Create job-specific proposals page
- [ ] Build proposal cards
- [ ] Implement accept modal
- [ ] Implement decline modal
- [ ] Wire up API calls
- [ ] Test accept/decline flow

### Day 5: Polish & Testing
- [ ] Add status badges
- [ ] Create empty states
- [ ] Implement navigation integration
- [ ] Add responsive breakpoints
- [ ] Integration testing
- [ ] Accessibility audit
- [ ] Deploy to staging

---

## Testing Checklist

### Unit Tests
- [ ] API client methods
- [ ] Countdown timer logic
- [ ] Filter state management
- [ ] Form validation

### Integration Tests
- [ ] Load proposals list
- [ ] Create new proposal
- [ ] Accept proposal
- [ ] Decline proposal
- [ ] Withdraw proposal
- [ ] Pagination works
- [ ] Search works
- [ ] Filters work

### E2E Tests
- [ ] Recruiter creates proposal → Company accepts → Verify relationship created
- [ ] Recruiter creates proposal → Company declines → Verify notification sent
- [ ] Recruiter creates proposal → Withdraw → Verify deleted

### Accessibility Tests
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Focus management
- [ ] Color contrast
- [ ] Form errors announced

### Manual Tests
- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Mobile (iOS Safari, Android Chrome)
- [ ] Tablet landscape/portrait
- [ ] Print view (if applicable)

---

## Related Files

### New Files to Create
- `apps/portal/src/app/portal/proposals/page.tsx`
- `apps/portal/src/app/portal/proposals/components/proposals-table.tsx`
- `apps/portal/src/app/portal/proposals/components/proposal-filters.tsx`
- `apps/portal/src/app/portal/proposals/components/create-proposal-drawer.tsx`
- `apps/portal/src/app/portal/proposals/components/proposal-details-modal.tsx`
- `apps/portal/src/app/portal/proposals/components/countdown-timer.tsx`
- `apps/portal/src/app/portal/proposals/components/status-badge.tsx`
- `apps/portal/src/app/portal/proposals/components/empty-state.tsx`
- `apps/portal/src/app/portal/proposals/lib/api.ts`
- `apps/portal/src/app/portal/roles/[id]/proposals/page.tsx`
- `apps/portal/src/app/portal/roles/[id]/proposals/components/proposal-card.tsx`
- `apps/portal/src/app/portal/roles/[id]/proposals/components/accept-modal.tsx`
- `apps/portal/src/app/portal/roles/[id]/proposals/components/decline-modal.tsx`
- `apps/portal/src/app/portal/roles/[id]/proposals/lib/api.ts`

### Existing Files to Modify
- `apps/portal/src/app/portal/layout.tsx` (add navigation)
- `apps/portal/src/lib/api-client.ts` (if needed)

---

## Status Summary

**Overall Status**: ❌ Not Started - Backend Ready  
**Backend API**: ✅ Ready for integration  
**Recruiter UI**: ❌ 0% Complete  
**Company User UI**: ❌ 0% Complete  
**Shared Components**: ❌ 0% Complete  
**Testing**: ❌ 0% Complete

**Blockers**: None - Backend is complete and ready  
**Dependencies**: Backend API endpoints operational

---

**Last Updated**: January 14, 2026  
**Next Review**: After first UI component implemented
