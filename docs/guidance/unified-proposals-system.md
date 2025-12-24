# Unified Proposals System - Architecture & Implementation Guide

**Document:** Unified Proposals Management Interface  
**Created:** December 23, 2025  
**Status:** Architectural Guidance - Phase 1 Enhancement  
**Priority:** High - UX Simplification & Scalability

---

## Vision

Create a **single, unified proposal management interface** that handles all approval workflows across the Splits Network platform. Instead of separate pages for different proposal types, users get ONE place to manage all items requiring action or tracking.

### Core Principle
> Every workflow on the platform follows the same pattern: **Party A proposes → Party B reviews/acts → Process continues**

Whether it's a recruiter sending a job to a candidate, a company reviewing an application, or recruiters collaborating - they're all **proposals** that need tracking, actions, and state management.

---

## The Problem This Solves

### Current State (Before Unification)
- ❌ Multiple pages: `/proposed-jobs`, `/proposals`, `/applications`, `/opportunities`
- ❌ Users confused about where to check for pending items
- ❌ Duplicate UI components doing similar things
- ❌ Inconsistent patterns across workflows
- ❌ Hard to add new proposal types

### Future State (After Unification)
- ✅ Single page: `/proposals` (or `/opportunities` in candidate portal)
- ✅ Clear mental model: "Check proposals for anything needing my action"
- ✅ Reusable components across all workflow types
- ✅ Consistent UX patterns
- ✅ Scalable architecture for new features

---

## All Proposal Types on the Platform

### 1. Job Opportunity (Recruiter → Candidate)
**Flow:** Recruiter sends job to their represented candidate
- **Initiator:** Recruiter
- **Pending Action By:** Candidate
- **Action:** Approve (start application) or Decline
- **Data:** Application in `recruiter_proposed` stage
- **Portal:** Candidate Portal
- **Documentation:** `docs/business-logic/recruiter-submission-flow.md`

---

### 2. Direct Application (Candidate → Company)
**Flow:** Candidate applies directly without recruiter
- **Initiator:** Candidate
- **Pending Action By:** Company (after AI review)
- **Action:** Review application, invite to interview, reject
- **Data:** Application in `submitted` stage
- **Portal:** Main Portal (company view)
- **Documentation:** `docs/business-logic/direct-vs-represented-candidates.md`

---

### 3. Represented Application Screen (Candidate → Recruiter → Company)
**Flow:** Candidate approved job, recruiter must screen before submitting
- **Initiator:** Candidate (by approving opportunity)
- **Pending Action By:** Recruiter
- **Action:** Conduct screen, approve submission, or decline
- **Data:** Application in `screen` stage
- **Portal:** Main Portal (recruiter view)
- **Documentation:** `docs/business-logic/recruiter-submission-flow.md`

---

### 4. Company Application Review (Recruiter → Company)
**Flow:** Recruiter submitted candidate, company reviews
- **Initiator:** Recruiter
- **Pending Action By:** Company
- **Action:** Review, invite to interview, reject
- **Data:** Application in `submitted` stage
- **Portal:** Main Portal (company view)
- **Documentation:** `docs/business-logic/direct-vs-represented-candidates.md`

---

### 5. Recruiter Collaboration Proposal (Recruiter → Recruiter → Company)
**Flow:** Company-side recruiter wants to work with candidate who has own recruiter
- **Initiator:** Company-side recruiter
- **Pending Action By:** Candidate's recruiter
- **Action:** Accept collaboration or Decline
- **Data:** `network.candidate_role_assignments` in `proposed` state
- **Portal:** Main Portal (both recruiters)
- **Documentation:** `docs/business-logic/recruiter-to-recruiter-collaboration.md`
- **Status:** Phase 2 - Future

---

### 6. Interview Invitation (Company → Candidate)
**Flow:** Company invites candidate to interview
- **Initiator:** Company
- **Pending Action By:** Candidate
- **Action:** Accept time slot or Request reschedule
- **Data:** Application in `interview` stage with pending interview
- **Portal:** Candidate Portal
- **Status:** Phase 2 - Future

---

### 7. Job Offer (Company → Candidate)
**Flow:** Company extends offer to candidate
- **Initiator:** Company
- **Pending Action By:** Candidate (with recruiter guidance if represented)
- **Action:** Accept, Counter-offer, or Decline
- **Data:** Application in `offer` stage
- **Portal:** Candidate Portal (primary), Main Portal (recruiter view)
- **Status:** Phase 3 - Future

---

## Portal Architecture

### Main Portal (`apps/portal`)
**Users:** Recruiters, Companies, Admins

**Route:** `/proposals`

**Sections:**
- **Requires My Action** - Items needing immediate attention
- **Waiting on Others** - Items I've acted on, awaiting others
- **Recently Completed** - Recent closed/completed proposals
- **All Proposals** - Comprehensive searchable list

**Role-Based Views:**
- **Recruiter:** Job opportunities sent, candidate screens pending, applications submitted, collaboration requests
- **Company:** Application reviews pending, offers sent, collaboration proposals
- **Admin:** System-wide proposal monitoring and intervention

---

### Candidate Portal (`apps/candidate`)
**Users:** Candidates

**Route:** `/opportunities` (or `/proposals`)

**Sections:**
- **New Opportunities** - Jobs sent by recruiter requiring decision
- **My Applications** - Applications submitted or in progress
- **Pending Responses** - Awaiting company/recruiter action
- **Offers** - Active offers requiring response
- **Interview Invitations** - Scheduled and pending interviews

**Key Difference:** Candidates see their own proposals only, simplified language focused on "opportunities" not "proposals"

---

## Data Model

### Unified Proposal Interface

All proposals can be represented through the existing `ats.applications` table with enriched metadata:

```typescript
interface UnifiedProposal {
    // Core identifiers
    id: string;
    type: ProposalType;
    stage: ApplicationStage;
    
    // Parties involved
    candidate_id: string;
    candidate_name: string;
    candidate_email: string;
    
    recruiter_id?: string;  // Candidate's recruiter
    recruiter_name?: string;
    
    company_recruiter_id?: string;  // Company-side recruiter (Phase 2)
    company_recruiter_name?: string;
    
    company_id: string;
    company_name: string;
    
    job_id: string;
    job_title: string;
    
    // Action tracking
    pending_action_by: ActionParty;
    pending_action_type: ActionType;
    can_current_user_act: boolean;  // Derived from user role + pending_action_by
    
    // Deadlines and urgency
    action_due_date?: Date;
    expires_at?: Date;
    is_urgent: boolean;  // < 24 hours or overdue
    
    // Context and metadata
    proposal_notes?: string;  // Initial pitch/notes
    response_notes?: string;  // Response reasoning
    ai_analysis?: AIAnalysisResult;  // AI review results if applicable
    
    // Timestamps
    created_at: Date;
    updated_at: Date;
    responded_at?: Date;
    
    // Display helpers
    status_badge: {
        text: string;
        color: 'info' | 'warning' | 'success' | 'error';
        icon: string;
    };
    
    action_label: string;  // "Review Application", "Accept Opportunity", etc.
}

type ProposalType = 
    | 'job_opportunity'        // Recruiter → Candidate
    | 'direct_application'     // Candidate → Company
    | 'application_screen'     // Candidate → Recruiter (screening)
    | 'application_review'     // Recruiter/Candidate → Company
    | 'collaboration'          // Recruiter → Recruiter
    | 'interview_invitation'   // Company → Candidate
    | 'job_offer';             // Company → Candidate

type ActionParty = 
    | 'candidate' 
    | 'recruiter' 
    | 'company_recruiter' 
    | 'company'
    | 'admin';

type ActionType = 
    | 'approve'      // Accept opportunity, approve candidate
    | 'decline'      // Reject opportunity, decline candidate
    | 'screen'       // Conduct phone screen
    | 'review'       // Review application
    | 'interview'    // Schedule/conduct interview
    | 'offer'        // Extend offer
    | 'accept'       // Accept offer
    | 'negotiate';   // Counter-offer
```

---

## Service Layer

### Unified Proposal Service

Create `packages/shared-types/src/proposals.ts` for shared types and `services/ats-service/src/services/proposals/service.ts` for business logic:

```typescript
export class ProposalService {
    /**
     * Get all proposals for current user based on their role
     */
    async getProposalsForUser(
        userId: string,
        userRole: UserRole,
        filters?: ProposalFilters
    ): Promise<UnifiedProposal[]>;
    
    /**
     * Get proposals requiring user's action
     */
    async getActionableProposals(
        userId: string,
        userRole: UserRole
    ): Promise<UnifiedProposal[]>;
    
    /**
     * Get proposals awaiting others (user initiated, pending response)
     */
    async getPendingProposals(
        userId: string,
        userRole: UserRole
    ): Promise<UnifiedProposal[]>;
    
    /**
     * Enrich application with proposal metadata
     */
    async enrichApplicationAsProposal(
        application: Application,
        currentUserId: string,
        currentUserRole: UserRole
    ): Promise<UnifiedProposal>;
    
    /**
     * Determine who can act on a proposal
     */
    determineActionParty(
        application: Application
    ): ActionParty;
    
    /**
     * Check if current user can act on proposal
     */
    canUserAct(
        proposal: UnifiedProposal,
        userId: string,
        userRole: UserRole
    ): boolean;
}
```

---

## UI Components

### Component Hierarchy

```
ProposalsPage
├── ProposalFilters (role-aware filtering)
├── ProposalSections
│   ├── ActionRequiredSection
│   │   └── ProposalCard[] (urgent badges, action buttons)
│   ├── WaitingOnOthersSection
│   │   └── ProposalCard[] (status tracking)
│   └── CompletedSection
│       └── ProposalCard[] (read-only, historical)
└── ProposalSearch (full-text search across all proposals)
```

---

### Unified Proposal Card

**Adaptive component that renders differently based on:**
1. Proposal type
2. Current user's role
3. Pending action party
4. Proposal state

```tsx
<ProposalCard proposal={proposal}>
    {/* Header - Always shown */}
    <ProposalHeader
        title={proposal.job_title}
        subtitle={getSubtitle(proposal)} // "Sent to [Candidate]" or "From [Recruiter]"
        statusBadge={proposal.status_badge}
        urgencyIndicator={proposal.is_urgent}
    />
    
    {/* Context - Proposal notes, pitch, AI insights */}
    <ProposalContext
        notes={proposal.proposal_notes}
        aiAnalysis={proposal.ai_analysis}
    />
    
    {/* Metadata - Timeline, parties, deadlines */}
    <ProposalMetadata
        createdAt={proposal.created_at}
        dueDate={proposal.action_due_date}
        parties={{
            candidate: proposal.candidate_name,
            recruiter: proposal.recruiter_name,
            company: proposal.company_name
        }}
    />
    
    {/* Actions - Conditional based on permissions */}
    {proposal.can_current_user_act && (
        <ProposalActions
            type={proposal.type}
            actions={getAvailableActions(proposal)}
            onAction={handleAction}
        />
    )}
    
    {/* Response - If already acted upon */}
    {proposal.response_notes && (
        <ProposalResponse
            notes={proposal.response_notes}
            respondedAt={proposal.responded_at}
        />
    )}
</ProposalCard>
```

---

## Implementation Phases

### Phase 1A: Foundation (Week 1) ✅ CURRENT
**Goal:** Create unified data model and service layer

**Tasks:**
- [x] Create `UnifiedProposal` type in `shared-types`
- [x] Create `ProposalService` in `ats-service`
- [x] Add API endpoint: `GET /api/proposals` (role-aware)
- [x] Add API endpoint: `GET /api/proposals/actionable`
- [x] Write unit tests for proposal enrichment logic

**Deliverable:** Backend can serve unified proposal data

---

### Phase 1B: Main Portal UI (Week 2)
**Goal:** Implement unified `/proposals` page for recruiters and companies

**Tasks:**
- [ ] Create `ProposalCard` component (adaptive rendering)
- [ ] Create `ProposalsPage` with sections (action/waiting/completed)
- [ ] Implement role-based filtering
- [ ] Add search and sorting
- [ ] Integrate with existing application actions (approve, decline, screen)
- [ ] Update navigation to feature `/proposals` prominently
- [ ] Add notification badges (count of actionable items)
- [ ] **Remove old components:** Delete `ProposedJobsList` component
- [ ] **Remove old components:** Delete recruiter-collaboration `ProposalCard` component
- [ ] **Remove old routes:** Delete `/proposed-jobs` page

**Deliverable:** Recruiters and companies use unified interface

---

### Phase 1C: Candidate Portal UI (Week 3)
**Goal:** Implement `/opportunities` page in candidate portal

**Tasks:**
- [ ] Create candidate-friendly version of `ProposalCard`
- [ ] Create `OpportunitiesPage` (candidate language/UX)
- [ ] Show job opportunities from recruiter
- [ ] Show application status tracking
- [ ] Integrate approve/decline actions
- [ ] Update candidate portal navigation

**Deliverable:** Candidates manage opportunities in one place

---

### Phase 1D: Cleanup & Polish (Week 4)
**Goal:** Remove deprecated code and polish UX

**Tasks:**
- [ ] Remove dashboard widget references to `ProposedJobsList`
- [ ] Update dashboard to use unified proposals
- [ ] Search codebase for `proposed-jobs` references and update
- [ ] Remove `/proposed-jobs` API endpoint from gateway
- [ ] Remove `getProposedJobsForRecruiter` from ApplicationService
- [ ] Clean up unused imports and types
- [ ] Update tests to reflect new architecture
- [ ] Polish UI based on initial feedback

**Deliverable:** Clean codebase with no legacy proposal code

---

### Phase 2: Recruiter Collaboration (Future)
**Goal:** Add recruiter-to-recruiter collaboration proposals

**Tasks:**
- [ ] Implement collaboration proposal creation
- [ ] Add collaboration type to unified proposals
- [ ] Implement accept/decline workflow
- [ ] Add fee split negotiation UI
- [ ] Integrate with billing system

**Deliverable:** Recruiter-to-recruiter marketplace enabled

---

### Phase 3: Advanced Features (Future)
**Goal:** Enhance with AI, bulk actions, and optimizations

**Tasks:**
- [ ] AI-powered proposal prioritization
- [ ] Bulk actions (approve/decline multiple)
- [ ] Real-time updates via WebSocket
- [ ] Mobile-optimized views
- [ ] Keyboard shortcuts
- [ ] Advanced filtering (date ranges, custom queries)
- [ ] Export to CSV/PDF

**Deliverable:** Enterprise-grade proposal management

---

## API Specifications

### GET /api/proposals
**Description:** Get all proposals for current user

**Query Parameters:**
- `filter` - `actionable` | `waiting` | `completed` | `all` (default: `all`)
- `type` - Proposal type filter (optional)
- `search` - Full-text search query (optional)
- `sort` - `urgency` | `date` | `status` (default: `urgency`)
- `page` - Page number for pagination
- `limit` - Items per page (default: 25)

**Response:**
```json
{
    "data": [
        {
            "id": "app-123",
            "type": "job_opportunity",
            "stage": "recruiter_proposed",
            "candidate_name": "Jane Smith",
            "job_title": "Senior Software Engineer",
            "company_name": "Acme Corp",
            "pending_action_by": "candidate",
            "pending_action_type": "approve",
            "can_current_user_act": false,
            "action_due_date": "2025-12-26T12:00:00Z",
            "is_urgent": true,
            "proposal_notes": "Great fit for your React background!",
            "created_at": "2025-12-23T10:00:00Z",
            "status_badge": {
                "text": "Pending Candidate Response",
                "color": "warning",
                "icon": "clock"
            }
        }
    ],
    "pagination": {
        "total": 42,
        "page": 1,
        "limit": 25,
        "total_pages": 2
    },
    "summary": {
        "actionable_count": 3,
        "waiting_count": 8,
        "urgent_count": 2
    }
}
```

---

### GET /api/proposals/actionable
**Description:** Get only proposals requiring current user's action

**Response:** Same structure as `/api/proposals` but pre-filtered

---

### GET /api/proposals/:id
**Description:** Get single proposal with full details

**Response:** Single `UnifiedProposal` object with extended metadata

---

## UI/UX Guidelines

### Visual Design Principles

1. **Urgency Hierarchy**
   - Urgent items (< 24h) get warning border + icon
   - Overdue items get error styling
   - Normal items get neutral styling

2. **Status Badges**
   - Color-coded by state
   - Icon + text for clarity
   - Consistent across all views

3. **Action Buttons**
   - Primary action (accept/approve) = Primary color
   - Secondary action (decline) = Outline style
   - Destructive action (reject) = Error color
   - Always include loading states

4. **Information Density**
   - Compact view for lists (3-4 lines per card)
   - Expanded view for details (full context + timeline)
   - Responsive breakpoints for mobile

5. **Empty States**
   - Helpful illustrations
   - Clear next steps
   - Educational content for new users

---

### Accessibility Requirements

- [ ] ARIA labels for all interactive elements
- [ ] Keyboard navigation support (Tab, Enter, Escape)
- [ ] Screen reader announcements for status changes
- [ ] High contrast mode support
- [ ] Focus indicators on all actions
- [ ] Text alternatives for all icons

---

### Mobile Considerations

- Priority: Mobile-first design (many recruiters work on phones)
- Swipe actions for quick approve/decline
- Bottom-sheet modals for actions
- Collapsible sections to save screen space
- Sticky action buttons
- Touch-friendly button sizes (min 44x44px)

---

## Testing Strategy

### Unit Tests
- [ ] Proposal enrichment logic
- [ ] Permission checking (`canUserAct`)
- [ ] Action party determination
- [ ] Urgency calculation
- [ ] Status badge generation

### Integration Tests
- [ ] API endpoints return correct proposals per role
- [ ] Filtering works correctly
- [ ] Pagination works correctly
- [ ] Search returns relevant results

### E2E Tests
- [ ] Recruiter can view and act on proposals
- [ ] Candidate can approve/decline opportunities
- [ ] Company can review applications
- [ ] Actions update state correctly
- [ ] Notifications sent appropriately

### Performance Tests
- [ ] Page loads < 1s with 100 proposals
- [ ] Search responds < 500ms
- [ ] Actions complete < 2s
- [ ] Real-time updates < 1s latency

---

## Success Metrics

### User Engagement
- **Target:** 80% of users check `/proposals` daily
- **Target:** Average time-to-action < 24 hours
- **Target:** 95% of proposals acted on before deadline

### Platform Health
- **Target:** < 5% of proposals expire without action
- **Target:** 30% reduction in "Where do I find..." support tickets
- **Target:** 50% reduction in page navigation (fewer clicks to act)

### Technical Performance
- **Target:** < 1s page load time
- **Target:** < 100ms API response time
- **Target:** Zero N+1 query issues

---

## Migration Checklist

### Before Launch
- [ ] Unified proposal service implemented and tested
- [ ] API endpoints created and documented
- [ ] UI components built and tested
- [ ] Role-based views validated
- [ ] Notification system updated for proposals
- [ ] Documentation updated
- [ ] Training materials created

### Launch Day
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Update navigation menus
- [ ] Add announcement banner
- [ ] Monitor error rates
- [ ] Monitor user adoption

### Post-Launch (Week 1-2)
- [ ] Gather user feedback
- [ ] Fix critical bugs
- [ ] Optimize performance issues
- [ ] Add redirects from old pages
- [ ] Create "What's New" blog post

### Post-Launch (Week 3-4)
- [ ] Remove old proposal pages
- [ ] Clean up deprecated code
- [ ] Update all screenshots/documentation
- [ ] Celebrate success! 🎉

---Code Removal Checklist

### Files to Delete
- [ ] `apps/portal/src/app/(authenticated)/proposed-jobs/page.tsx`
- [ ] `apps/portal/src/app/(authenticated)/proposals/page.tsx` (old version)
- [ ] `apps/portal/src/app/(authenticated)/proposals/components/proposals-list-client.tsx`
- [ ] `apps/portal/src/components/proposal-card.tsx` (old recruiter-collaboration version)
- [ ] `apps/portal/src/app/(authenticated)/dashboard/components/proposed-jobs-list.tsx`

### Code to Remove/Update

**API Gateway (`services/api-gateway/src/routes/recruiters/routes.ts`):**
```typescript
// REMOVE: Proposed-jobs endpoint
app.get('/api/recruiters/:recruiterId/proposed-jobs', ...)
```

**ATS Service (`services/ats-service/src/services/applications/service.ts`):**
```typescript
// REMOVE: Method getProposedJobsForRecruiter()
async getProposedJobsForRecruiter(recruiterId: string) { ... }
```

**ATS Service Routes (`services/ats-service/src/routes/applications/routes.ts`):**
```typescript
// REMOVE: Route '/recruiters/:recruiterId/proposed-jobs'
app.get('/recruiters/:recruiterId/proposed-jobs', ...)
```

**Recruiter Dashboard (`apps/portal/src/app/(authenticated)/dashboard/components/recruiter-dashboard.tsx`):**
```typescript
// UPDATE: Replace ProposedJobsList import with unified proposals
import ProposedJobsList from './proposed-jobs-list';  // REMOVE
// Replace with unified proposals widget
```

**Navigation Links:**
Search for and update all links to `/proposed-jobs`:
- Main navigation menus
- Dashboard quick links
- Breadcrumbs
- Documentation links

### Database Changes
**None required** - The `ats.applications` table already stores all data needed for unified proposals. No schema changes or migrations needed.

### Verification Steps
- [ ] Search codebase for `proposed-jobs` - should return no results except in git history
- [ ] Search codebase for `ProposedJobsList` - should return no results
- [ ] Search codebase for old `ProposalCard` - should return no results
- [ ] Test that dashboard loads without errors
- [ ] Test that all navigation links work
- [ ] Verify no 404 errors in production logs

---

## 

## Related Documentation

- [Recruiter Submission Flow](../business-logic/recruiter-submission-flow.md)
- [Direct vs Represented Candidates](../business-logic/direct-vs-represented-candidates.md)
- [Recruiter-to-Recruiter Collaboration](../business-logic/recruiter-to-recruiter-collaboration.md)
- [API Response Format](./api-response-format.md)
- [User Roles and Permissions](./user-roles-and-permissions.md)

---

**Last Updated:** December 23, 2025  
**Version:** 1.0  
**Status:** ✅ Architecture Approved - Ready for Implementation
