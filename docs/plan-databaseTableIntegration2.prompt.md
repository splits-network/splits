# Plan: Database Table Integration - Feature Rollout

**Date:** January 14, 2026  
**Status:** Planning Phase  
**Based On:** Comprehensive database table usage audit

## Executive Summary

This audit reveals **22 tables** that exist but lack complete integration, representing significant missing functionality across the platform. These fall into **8 logical feature groups** that can be rolled out incrementally.

### Critical Findings
- **56% of tables** (28/50) are well-integrated with full V2 patterns
- **24% of tables** (12/50) have partial backend code but no frontend/complete workflows
- **20% of tables** (10/50) have zero runtime integration despite existing in migrations
- **Key gaps:** Proposals frontend, payout automation, multi-recruiter collaboration, candidate ownership, marketplace discovery

---

## Feature 1: Complete Proposals Workflow

**Tables:** `candidate_role_assignments`  
**Status:** Backend V2 complete, frontend missing  
**Priority:** 🔥 HIGH - Core marketplace feature non-functional  
**Effort:** Medium (3-5 days)  
**Current State:**
- ✅ V2 repository in network-service (`src/v2/proposals/repository.ts`)
- ✅ V2 service layer exists
- ✅ V2 API routes at `/api/v2/proposals`
- ❌ NO frontend integration in portal
- ❌ NO frontend integration in candidate app
- ❌ NO timeout handling workflow

### Implementation Steps

1. **Create Portal UI for Recruiters**
   - Location: `apps/portal/src/app/portal/proposals/`
   - Features:
     - List view of all proposals (pending, accepted, declined, expired)
     - Propose candidate for role action
     - View proposal status and timeline
     - Withdraw proposal before acceptance

2. **Add Company User Acceptance Workflow**
   - Location: `apps/portal/src/app/portal/roles/[id]/proposals/`
   - Features:
     - View proposals for their roles
     - Accept/decline proposals
     - 72-hour countdown timer display
     - Proposal acceptance creates recruiter-candidate relationship

3. **Implement Timeout Handling**
   - Location: `services/automation-service/src/v2/proposals/`
   - Logic:
     - Daily job checks for proposals older than 72 hours
     - Auto-decline expired proposals
     - Send notification to recruiter about expiration
     - Update proposal status to `expired`

4. **Add Proposal Notifications**
   - Events to handle:
     - `proposal.created` → Notify company user
     - `proposal.accepted` → Notify recruiter
     - `proposal.declined` → Notify recruiter
     - `proposal.expired` → Notify recruiter
   - Integration: Use existing notification-service event handlers

5. **Create Candidate App View**
   - Location: `apps/candidate/src/app/portal/proposals/`
   - Features:
     - View proposals where they are the candidate
     - See which recruiters proposed them for which roles
     - Track proposal status (read-only for candidates)

### API Integration
- Already complete at `/api/v2/proposals` (network-service V2)
- Endpoints available:
  - `GET /api/v2/proposals` - List proposals
  - `GET /api/v2/proposals/:id` - Get single proposal
  - `POST /api/v2/proposals` - Create proposal
  - `PATCH /api/v2/proposals/:id` - Accept/decline proposal
  - `DELETE /api/v2/proposals/:id` - Withdraw proposal

### Success Criteria
- Recruiters can propose candidates for roles via portal UI
- Company users receive notifications and can accept/decline
- Expired proposals auto-decline after 72 hours
- Accepted proposals create recruiter-candidate relationships
- All actions publish events for notifications

---

## Feature 2: Payout Automation & Guarantees

**Tables:** `payout_schedules`, `escrow_holds`, `payout_audit_log`  
**Status:** Manual payout processing, no escrow/scheduling  
**Priority:** 🔥 HIGH - Billing reliability and risk management  
**Effort:** High (7-10 days)  
**Current State:**
- ✅ `payouts` table V2 complete in billing-service
- 🔄 `payout_schedules` - Basic queries only, no automation
- ❌ `escrow_holds` - NO code
- ❌ `payout_audit_log` - NO code

### Implementation Steps

1. **Create Payout Schedules V2 Domain**
   - Location: `services/billing-service/src/v2/payout-schedules/`
   - Structure:
     - `repository.ts` - CRUD operations with access context
     - `service.ts` - Business logic for schedule creation
     - `routes.ts` - Standard 5-route pattern
     - `types.ts` - ScheduleFilters, ScheduleUpdate types

2. **Implement Automated Scheduler Job**
   - Location: `services/billing-service/src/jobs/payout-scheduler.ts`
   - Logic:
     - Run daily (e.g., 2am UTC)
     - Query `payout_schedules` for due payouts
     - Check placement guarantee completion dates
     - Trigger payout processing for eligible schedules
     - Update schedule status to `processed`
   - Deployment: Kubernetes CronJob manifest

3. **Add Escrow Hold Calculation Logic**
   - Location: `services/billing-service/src/v2/escrow/`
   - Features:
     - Repository for escrow CRUD operations
     - Service for holdback percentage calculation
     - Automatic escrow hold creation on placement creation
     - Scheduled release after guarantee period expires
     - Manual release by admin for early completion

4. **Create Automated Audit Logging**
   - Location: Update `services/billing-service/src/v2/payouts/service.ts`
   - Logic:
     - Log all payout state changes to `payout_audit_log`
     - Include: old status, new status, changed by user, reason, timestamp
     - Trigger on: create, approve, process, fail, cancel

5. **Build Portal UI for Schedule Management**
   - Location: `apps/portal/src/app/portal/admin/payouts/schedules/`
   - Features:
     - List all scheduled payouts with due dates
     - Filter by status (pending, processing, processed, failed)
     - Manual trigger for overdue schedules
     - Edit schedule due dates
     - Cancel schedules

6. **Add Escrow Dashboard**
   - Location: `apps/portal/src/app/portal/admin/payouts/escrow/`
   - Features:
     - View all escrow holds by placement
     - Show hold amount, release date, status
     - Manual release action for admins
     - Filter by placement, recruiter, date range

### API Endpoints
- `/api/v2/payout-schedules` - Schedule CRUD
- `/api/v2/escrow-holds` - Escrow management
- `/api/v2/payout-audit-log` - Audit trail (read-only)

### Dependencies
- Requires placement guarantee period enforcement logic
- Integration with Stripe for escrow hold transfers

### Success Criteria
- Payouts automatically scheduled based on guarantee completion
- Escrow holds created and released automatically
- Full audit trail of all payout actions
- Admin UI for schedule and escrow management
- Zero manual intervention for standard payouts

---

## Feature 3: Multi-Recruiter Placements & Split Fees

**Tables:** `placement_collaborators`, `payout_splits`  
**Status:** Single recruiter limitation, collaboration tracking missing  
**Priority:** 📊 MEDIUM - Advanced collaboration feature  
**Effort:** High (8-12 days)  
**Current State:**
- ✅ `placements` table V2 complete in ATS service
- 🔄 `placement_collaborators` - Lookup queries in notification-service only
- ❌ `payout_splits` - NO code

### Implementation Steps

1. **Create Placement Collaborators V2 Domain**
   - Location: `services/ats-service/src/v2/placement-collaborators/`
   - Structure:
     - `repository.ts` - CRUD with access context
     - `service.ts` - Split validation logic
     - `routes.ts` - Standard 5-route pattern
     - `types.ts` - CollaboratorFilters, CollaboratorUpdate

2. **Implement Split Percentage Validation**
   - Location: `services/ats-service/src/v2/placement-collaborators/service.ts`
   - Rules:
     - Total split percentages must sum to 100%
     - Minimum 5% per collaborator
     - Maximum 10 collaborators per placement
     - Cannot modify splits after payout processing begins
     - Require company approval for split changes

3. **Add Stripe Connect Split Transfer Logic**
   - Location: `services/billing-service/src/v2/payout-splits/`
   - Features:
     - Repository for split records
     - Service for calculating split amounts
     - Stripe API integration for split transfers
     - Handle failed transfers with retry logic
     - Record split status per collaborator

4. **Build Portal UI for Split Management**
   - Location: `apps/portal/src/app/portal/placements/[id]/collaborators/`
   - Features:
     - Add collaborators to placement
     - Set split percentage per collaborator
     - Visual split percentage editor (sliders or inputs)
     - Validate splits sum to 100%
     - Lock splits after payout processing
     - Show payout split amounts per collaborator

5. **Update Placement Creation Flow**
   - Location: `apps/portal/src/app/portal/placements/new/`
   - Changes:
     - Add collaborators section to placement form
     - Search for recruiters to add as collaborators
     - Set initial split percentages
     - Default to 100% for single recruiter
     - Validate before submission

6. **Extend Notification Service**
   - Events to handle:
     - `placement.created` → Notify all collaborators
     - `payout.split_processed` → Notify each collaborator of their split amount
     - `placement_collaborator.added` → Notify new collaborator
     - `placement_collaborator.removed` → Notify removed collaborator

### API Endpoints
- `/api/v2/placement-collaborators` - Collaborator CRUD
- `/api/v2/payout-splits` - Split records (mostly read-only)

### Success Criteria
- Multiple recruiters can be added to placements
- Split percentages validated and locked after processing
- Stripe Connect split transfers executed correctly
- All collaborators notified of payouts
- Portal UI supports split management workflow

---

## Feature 4: Candidate Ownership & Sourcing Attribution

**Tables:** `candidate_sourcers`, `candidate_outreach`, `marketplace_events`  
**Status:** Zero implementation despite Phase 2 goal  
**Priority:** 📊 MEDIUM - Recruiter credit and protection  
**Effort:** High (10-14 days)  
**Current State:**
- ❌ `candidate_sourcers` - NO code (types exist in shared-types package)
- ❌ `candidate_outreach` - NO code
- ❌ `marketplace_events` - NO code

### Implementation Steps

1. **Create Candidate Sourcers V2 Domain**
   - Location: `services/network-service/src/v2/candidate-sourcers/`
   - Structure:
     - `repository.ts` - Sourcing claim CRUD
     - `service.ts` - Protection window enforcement
     - `routes.ts` - Standard 5-route pattern
     - `types.ts` - SourcerFilters, SourcerUpdate

2. **Implement Sourcing Claim Logic**
   - Location: `services/network-service/src/v2/candidate-sourcers/service.ts`
   - Rules:
     - Automatically create sourcer record when recruiter first adds candidate
     - First-touch attribution (first recruiter to source wins)
     - Record sourcing method (referral, LinkedIn, etc.)
     - Establish protection window start date

3. **Add 30-Day Protection Window Enforcement**
   - Location: `services/ats-service/src/v2/applications/service.ts`
   - Logic:
     - When application created, check for existing sourcer
     - If sourcer exists and within 30-day window, require that recruiter
     - Block other recruiters from submitting during protection
     - Allow sourcer to opt-out of protection (release candidate)
     - Emit `candidate_sourcer.protected_submission_blocked` event

4. **Create Conflict Resolution System**
   - Location: `services/network-service/src/v2/candidate-sourcers/service.ts`
   - Rules:
     - If multiple recruiters claim sourcing, first timestamp wins
     - Admin can override sourcing attribution
     - Log all sourcing disputes to decision_audit_log
     - Notification to losing recruiter about conflict resolution

5. **Integrate Resend Webhook Tracking**
   - Location: `services/notification-service/src/v2/outreach/`
   - Features:
     - Listen for Resend webhook events (email opened, clicked)
     - Record outreach event in `candidate_outreach` table
     - Track which emails establish first contact
     - Use email open as proof of outreach for ownership disputes

6. **Build Portal UI for Sourcing Attribution**
   - Location: `apps/portal/src/app/portal/candidates/[id]/sourcing/`
   - Features:
     - Show sourcer name and date
     - Display protection window countdown
     - Show all outreach events timeline
     - Admin override controls for disputes
     - Release protection action for sourcer

7. **Create Marketplace Event Logger**
   - Location: `services/network-service/src/v2/marketplace-events/`
   - Events to log:
     - Sourcing claims
     - Protection window triggers
     - Ownership disputes
     - Attribution changes
   - Purpose: Analytics and dispute resolution

### API Endpoints
- `/api/v2/candidate-sourcers` - Sourcing CRUD
- `/api/v2/candidate-outreach` - Outreach tracking (read-only)
- `/api/v2/marketplace-events` - Event log (read-only)

### Business Rules (Needs Clarification)
- **Protection window duration:** Currently 30 days, should this be configurable?
- **Sourcing methods:** What qualifies as "sourcing" (first email? first call? first submission?)?
- **Conflict resolution:** Who has authority to override (platform admin only?)?
- **Opt-out mechanism:** Can sourcer release candidate early? Permanent or temporary?

### Success Criteria
- Automatic sourcing attribution on candidate first contact
- 30-day protection window enforced for applications
- Conflict resolution system for duplicate claims
- Outreach tracking integrated with Resend
- Portal UI shows sourcing history and protection status

---

## Feature 5: Marketplace Discovery & Messaging

**Tables:** `marketplace_connections`, `marketplace_messages`, `marketplace_config`  
**Status:** Core marketplace features missing  
**Priority:** 📊 MEDIUM - User engagement and discovery  
**Effort:** Very High (15-20 days)  
**Current State:**
- ❌ `marketplace_connections` - NO code
- ❌ `marketplace_messages` - NO code
- ❌ `marketplace_config` - NO code (default values only)
- ⚠️ Recruiter table has marketplace fields (`marketplace_enabled`, `marketplace_profile`) but unused

### Implementation Steps

1. **Create Marketplace Connections V2 Domain**
   - Location: `services/network-service/src/v2/marketplace-connections/`
   - Structure:
     - `repository.ts` - Connection request CRUD
     - `service.ts` - Connection workflow logic
     - `routes.ts` - Standard 5-route pattern
     - `types.ts` - ConnectionFilters, ConnectionUpdate

2. **Implement Marketplace Messages V2 Domain**
   - Location: `services/network-service/src/v2/marketplace-messages/`
   - Structure:
     - `repository.ts` - Message CRUD with threading
     - `service.ts` - Message validation and rate limiting
     - `routes.ts` - Messaging endpoints
     - `types.ts` - MessageFilters, MessageCreate

3. **Add Real-Time Messaging via WebSocket**
   - Location: `services/api-gateway/src/websocket-server.ts`
   - Features:
     - WebSocket server for real-time message delivery
     - Subscribe to user message channels
     - Typing indicators
     - Read receipts
     - Push notifications for mobile (future)

4. **Create Marketplace Config V2 Domain**
   - Location: `services/network-service/src/v2/marketplace-config/`
   - Features:
     - Repository for global settings
     - Service for config validation
     - Routes for admin management
     - Default values for connection limits, message rate limits

5. **Build Candidate App Discovery UI**
   - Location: `apps/candidate/src/app/portal/recruiters/browse/`
   - Features:
     - Browse available recruiters (marketplace_enabled=true)
     - Filter by specialization, location, rating
     - View recruiter marketplace profiles
     - Send connection request
     - Message connected recruiters

6. **Add Portal Messaging UI**
   - Location: `apps/portal/src/app/portal/messages/`
   - Features:
     - Inbox for all conversations
     - Thread view with message history
     - Send messages to candidates
     - Real-time updates via WebSocket
     - Mark as read/unread
     - Archive conversations

7. **Implement Admin Portal Config Management**
   - Location: `apps/portal/src/app/portal/admin/marketplace/config/`
   - Settings to manage:
     - Connection request limits per user
     - Message rate limits
     - Marketplace enabled/disabled globally
     - Blocked keywords for moderation
     - Auto-approve vs manual review for connections

### API Endpoints
- `/api/v2/marketplace-connections` - Connection request CRUD
- `/api/v2/marketplace-messages` - Messaging CRUD
- `/api/v2/marketplace-config` - Config management (admin only)
- WebSocket: `wss://<domain>/api/v2/messages/subscribe`

### Success Criteria
- Candidates can browse and connect with recruiters
- Real-time messaging between users
- Admin can configure marketplace rules
- Connection requests tracked and approved
- Message threading and read receipts working

---

## Feature 6: Automation Audit Trail & Approval Workflows

**Tables:** `automation_executions`, `decision_audit_log`  
**Status:** Rules execute without audit or human approval  
**Priority:** 📅 LOW - Compliance and transparency  
**Effort:** Medium (5-7 days)  
**Current State:**
- ✅ `automation_rules` V2 complete in automation-service
- ❌ `automation_executions` - NO code
- ❌ `decision_audit_log` - NO code

### Implementation Steps

1. **Add Execution Logging to Automation Rules**
   - Location: `services/automation-service/src/v2/automation-rules/service.ts`
   - Changes:
     - Log every rule execution to `automation_executions` table
     - Record: rule_id, trigger_event, conditions_met, actions_taken, result
     - Include execution time and affected entities
     - Store error details if execution fails

2. **Create Automation Executions V2 Domain**
   - Location: `services/automation-service/src/v2/automation-executions/`
   - Structure:
     - `repository.ts` - Execution record queries
     - `service.ts` - Execution history and analytics
     - `routes.ts` - Read-only endpoints
     - `types.ts` - ExecutionFilters

3. **Implement Human Approval Workflow**
   - Location: `services/automation-service/src/v2/approvals/`
   - Features:
     - Flag high-impact actions for approval (e.g., stage advances to offer)
     - Create approval request record
     - Send notification to approver
     - Hold execution until approved/rejected
     - Timeout after 24 hours (configurable)

4. **Add AI Decision Logging**
   - Location: `services/ai-service/src/v2/reviews/service.ts`
   - Changes:
     - Log every AI decision to `decision_audit_log`
     - Record: entity_type, entity_id, decision_type, confidence_score, reasoning
     - Include model version and prompt used
     - Track human override if decision changed

5. **Build Admin Dashboard for Executions**
   - Location: `apps/portal/src/app/portal/admin/automation/executions/`
   - Features:
     - List all automation executions with filters
     - View execution details and results
     - Filter by rule, status, date range
     - Search by entity (candidate, job, application)
     - Export execution logs for compliance

6. **Create Decision Log Viewer**
   - Location: `apps/portal/src/app/portal/admin/decision-log/`
   - Features:
     - View all AI and human decisions
     - Filter by decision type, confidence, entity
     - Compare AI recommendations vs human overrides
     - Export for regulatory compliance
     - Confidence score distribution charts

### API Endpoints
- `/api/v2/automation-executions` - Execution history (read-only)
- `/api/v2/decision-audit-log` - Decision log (read-only)
- `/api/v2/automation-approvals` - Approval workflow

### Purpose
- **Regulatory compliance:** Audit trail for automated decisions
- **AI transparency:** Track AI recommendations and human overrides
- **Debugging:** Troubleshoot automation issues
- **Analytics:** Measure automation effectiveness

### Success Criteria
- All automation executions logged automatically
- High-impact actions require human approval
- AI decisions tracked with confidence scores
- Admin UI for viewing execution history
- Exportable logs for compliance audits

---

## Feature 7: Long-Term Analytics & Health Metrics

**Tables:** `analytics.metrics_monthly`, `analytics.marketplace_health_daily`  
**Status:** Daily metrics exist, monthly/health aggregation missing  
**Priority:** 📅 LOW - Executive reporting  
**Effort:** Low (3-5 days)  
**Current State:**
- ✅ `analytics.events` - Active event stream
- ✅ `analytics.metrics_hourly` - Hourly aggregation working
- ✅ `analytics.metrics_daily` - Daily aggregation working
- ❌ `analytics.metrics_monthly` - Table exists, NO rollup job
- ❌ `analytics.marketplace_health_daily` - Table exists, NO population job

### Implementation Steps

1. **Create Monthly Rollup Job**
   - Location: `services/analytics-service/src/jobs/monthly-aggregation.ts`
   - Logic:
     - Run monthly (1st of each month at 3am UTC)
     - Aggregate data from `metrics_daily` for previous month
     - Calculate monthly totals, averages, trends
     - Store in `metrics_monthly` table
     - Publish `analytics.monthly_rollup_completed` event

2. **Implement Health Score Calculation Logic**
   - Location: `services/analytics-service/src/v2/marketplace-health/`
   - Metrics to calculate:
     - Recruiter satisfaction (survey data or placement success rate)
     - Company satisfaction (time to fill, quality of candidates)
     - Average time to first candidate submission
     - Average time to placement (hire)
     - Fill rate percentage (placements / open roles)
     - Overall health score (weighted composite)

3. **Add Kubernetes CronJob Manifest**
   - Location: `infra/k8s/analytics-service/cronjobs.yaml`
   - Jobs:
     - Monthly aggregation (1st of month)
     - Daily health metrics (runs daily)
   - Resources: Low CPU/memory, longer timeout (30 min)

4. **Extend Admin Dashboard to Use Health Metrics**
   - Location: `apps/portal/src/app/portal/admin/dashboard/components/admin-dashboard.tsx`
   - Changes:
     - Replace TODO placeholders with actual health data
     - Fetch from `/api/v2/marketplace-metrics?type=health&range=daily`
     - Display recruiter satisfaction, company satisfaction, etc.
     - Add trend indicators (up/down from previous period)

5. **Create Long-Term Trend Charts**
   - Location: `apps/portal/src/app/portal/admin/metrics/`
   - Features:
     - Monthly trend charts (applications, placements, revenue)
     - Year-over-year comparisons
     - Health score over time
     - Exportable reports for executives

### API Integration
- Extend `/api/v2/marketplace-metrics` endpoint:
  - Add `range` parameter: `hourly`, `daily`, `monthly`
  - Add `type` parameter: `metrics`, `health`
  - Example: `/api/v2/marketplace-metrics?type=health&range=daily&limit=30`

### Success Criteria
- Monthly metrics automatically aggregated
- Daily health scores calculated and stored
- Admin dashboard shows real health data (no more TODOs)
- Long-term trend analysis available
- Executive-ready reporting

---

## Feature 8: ATS Platform Integrations (Phase 4C)

**Tables:** `integrations`, `sync_logs`, `external_entity_map`, `sync_queue`  
**Status:** Future phase - entire integration framework missing  
**Priority:** 📅 FUTURE - Enterprise customers  
**Effort:** Very High (20-30 days)  
**Current State:**
- ❌ All tables created but NO runtime code
- 📋 Documented in `docs/phases/phase-4c-integrations.md`

### Implementation Steps

1. **Create Dedicated Integration Service**
   - Location: `services/integration-service/`
   - Purpose: Handle all external ATS platform connections
   - Structure:
     - `src/connectors/greenhouse.ts` - Greenhouse API integration
     - `src/connectors/lever.ts` - Lever API integration
     - `src/connectors/workday.ts` - Workday API integration
     - `src/oauth/` - OAuth flow handlers per platform
     - `src/sync/` - Bidirectional sync engine

2. **Implement OAuth Flows**
   - Location: `services/integration-service/src/oauth/`
   - Features:
     - OAuth 2.0 authorization code flow
     - Token refresh handling
     - Credential encryption in database
     - Redirect URL handling
     - Per-platform OAuth configuration

3. **Build Entity Mapping System**
   - Location: `services/integration-service/src/v2/entity-map/`
   - Structure:
     - `repository.ts` - Map internal IDs to external IDs
     - `service.ts` - Mapping logic and conflict resolution
     - Map entities: jobs, candidates, applications, companies
     - Handle entity updates and deletions

4. **Add Async Sync Queue with RabbitMQ**
   - Location: `services/integration-service/src/queue/`
   - Features:
     - Queue sync operations (pull from ATS, push to ATS)
     - Priority queue (urgent vs background sync)
     - Retry failed sync operations
     - Rate limiting per platform (respect API limits)
     - Dead letter queue for permanent failures

5. **Implement Bidirectional Sync Logic**
   - Pull from external ATS:
     - Fetch new jobs from external ATS → Create in Splits
     - Fetch updates to jobs → Update in Splits
     - Handle deletions (archive in Splits)
   - Push to external ATS:
     - Send new applications to external ATS
     - Update application stage in external ATS
     - Send candidate notes and feedback

6. **Create Admin Portal for Connection Management**
   - Location: `apps/portal/src/app/portal/admin/integrations/`
   - Features:
     - Connect to external ATS (OAuth flow)
     - View connected integrations
     - Enable/disable sync per integration
     - Configure sync settings (frequency, entities to sync)
     - View sync logs and error history
     - Manual sync trigger for testing

7. **Implement Conflict Resolution UI**
   - Location: `apps/portal/src/app/portal/admin/integrations/conflicts/`
   - Features:
     - List sync conflicts (duplicate entities, update conflicts)
     - Side-by-side comparison of conflicting data
     - Choose resolution (use Splits data, use external data, merge)
     - Apply resolution and re-sync

### API Endpoints
- `/api/v2/integrations` - Integration CRUD
- `/api/v2/integrations/:id/sync` - Manual sync trigger
- `/api/v2/sync-logs` - Sync history (read-only)
- `/api/v2/sync-conflicts` - Conflict management
- OAuth callbacks: `/api/v2/integrations/oauth/:platform/callback`

### Platforms to Support
1. **Greenhouse** (priority 1)
2. **Lever** (priority 2)
3. **Workday** (priority 3)
4. **SAP SuccessFactors** (future)
5. **iCIMS** (future)

### Success Criteria
- Companies can connect their external ATS
- Jobs automatically sync from external ATS to Splits
- Applications sync bidirectionally
- Sync errors logged and surfaced to admins
- Conflict resolution UI functional
- Rate limiting respects external API limits

---

## Implementation Priority & Roadmap

### Sprint 1 (Current) - Foundation
- ✅ Complete database table audit (DONE)
- ✅ Document unused/partial tables (DONE)
- 📋 Prioritize feature implementation order (IN PROGRESS)

### Sprint 2-3 - High Priority Features
1. **Feature 1: Complete Proposals Workflow** (3-5 days)
   - Critical for marketplace functionality
   - Backend already complete, frontend only
   - Unblocks recruiter-candidate assignment flow

2. **Feature 2: Payout Automation** (7-10 days)
   - Critical for billing reliability
   - Reduces manual workload
   - Improves recruiter trust

### Sprint 4-6 - Medium Priority Features
3. **Feature 3: Multi-Recruiter Placements** (8-12 days)
   - Advanced collaboration feature
   - Enables split fee model
   - Requires Stripe Connect integration

4. **Feature 4: Candidate Ownership** (10-14 days)
   - Phase 2 compliance feature
   - Protects recruiter attribution
   - Requires business rule clarification

5. **Feature 7: Long-Term Analytics** (3-5 days)
   - Quick win for executive reporting
   - Completes admin dashboard
   - Minimal complexity

### Sprint 7-10 - Lower Priority Features
6. **Feature 5: Marketplace Discovery** (15-20 days)
   - Complex feature with real-time messaging
   - High user engagement impact
   - Requires WebSocket infrastructure

7. **Feature 6: Automation Audit Trail** (5-7 days)
   - Compliance and transparency
   - Not blocking core features
   - Good for regulatory readiness

### Phase 4C (Future)
8. **Feature 8: ATS Platform Integrations** (20-30 days)
   - Enterprise customer requirement
   - Very high complexity
   - Requires per-platform OAuth implementations

---

## Technical Considerations

### 1. Schema Reorganization
**Question:** Should Phase 2/3 tables in `public` schema migrate to domain schemas?

**Examples:**
- `placement_collaborators` → `ats.placement_collaborators`
- `marketplace_connections` → `network.marketplace_connections`
- `marketplace_messages` → `network.marketplace_messages`
- `marketplace_config` → `network.marketplace_config`

**Pros:**
- Clearer domain boundaries
- Follows V2 architecture patterns
- Better service isolation

**Cons:**
- Requires migration scripts
- Potential downtime during migration
- Cross-schema queries needed

**Recommendation:** Defer until feature implementation to avoid premature optimization.

### 2. Feature Flags
**Question:** Should we add feature flags for partially implemented tables?

**Use Cases:**
- Enable proposals workflow per organization (beta test)
- Roll out marketplace discovery gradually
- A/B test automation approval workflows

**Implementation:**
- Add feature flags to `marketplace_config` table
- Check flags in service layer before allowing actions
- Admin UI to enable/disable features per org

**Recommendation:** Implement for Feature 5 (Marketplace Discovery) and Feature 6 (Automation Approvals).

### 3. Type Safety Cleanup
**Question:** Should we mark unused table types as `@deprecated` in `@splits-network/shared-types`?

**Current State:**
- Types exist for `candidate_sourcers`, `marketplace_*` but no runtime usage
- Developers may assume features are implemented when they see types
- Confusion about "production ready" vs. "planned"

**Recommendation:**
```typescript
/**
 * @deprecated Feature not yet implemented. See docs/plan-databaseTableIntegration2.prompt.md
 */
export interface CandidateSourcer {
  // ...
}
```

### 4. Redundant Tables
**Question:** `marketplace_events` (public) vs. `analytics.events` - consolidate or clarify?

**Current State:**
- Both tables store event streams
- `analytics.events` is active and used
- `marketplace_events` is unused

**Options:**
1. **Consolidate:** Remove `marketplace_events`, use `analytics.events` for all events
2. **Clarify:** `marketplace_events` for marketplace-specific audit (ownership, disputes), `analytics.events` for metrics
3. **Rename:** `marketplace_events` → `marketplace_audit_log` to clarify purpose

**Recommendation:** Option 3 - Rename to clarify distinct purposes.

### 5. Event-Driven Architecture
**Question:** Should automation features use RabbitMQ events or direct database polling?

**Options:**
- **Events:** Automation service subscribes to events, processes immediately
- **Polling:** Cron jobs query database for due actions

**Recommendation:**
- **Proposals timeout:** Use daily cron job (not time-critical)
- **Payout scheduling:** Use daily cron job with Kubernetes CronJob
- **Automation approvals:** Use events for real-time workflow

### 6. Real-Time Messaging
**Question:** WebSocket server in api-gateway or separate service?

**Options:**
1. **API Gateway:** Add WebSocket server to existing gateway
2. **Separate Service:** New `messaging-service` with WebSocket server

**Pros/Cons:**
- Gateway: Simpler deployment, shared auth context
- Separate: Better scaling, isolates real-time complexity

**Recommendation:** Start with API Gateway, extract to separate service if scaling needed.

---

## Success Metrics

### Feature 1: Proposals
- 90%+ of proposals accepted within 24 hours
- <5% expired due to timeout
- 50+ proposals per week after launch

### Feature 2: Payout Automation
- 100% of payouts scheduled automatically
- 0 manual intervention for standard payouts
- <1% escrow release errors

### Feature 3: Multi-Recruiter Placements
- 20%+ of placements have multiple collaborators
- 100% accuracy on split calculations
- 0 Stripe split transfer failures

### Feature 4: Candidate Ownership
- 100% of candidates have sourcing attribution
- <2% ownership disputes per month
- 95%+ protection window compliance

### Feature 5: Marketplace Discovery
- 40%+ of candidates connect with recruiters
- 10+ messages per user per week
- <1 second message delivery latency

### Feature 6: Automation Audit Trail
- 100% of automation executions logged
- <5% human override rate on AI decisions
- 0 compliance audit findings

### Feature 7: Long-Term Analytics
- Monthly reports generated automatically
- <5 minute load time for trend charts
- 90%+ executive satisfaction with reporting

### Feature 8: ATS Integrations
- 3 platforms integrated (Greenhouse, Lever, Workday)
- <1% sync error rate
- <5 minute sync latency

---

## Risk Assessment

### High Risk
- **Feature 2:** Payout automation errors could result in incorrect payments (mitigation: extensive testing, audit trail)
- **Feature 3:** Stripe split transfers failing could block payouts (mitigation: retry logic, manual fallback)
- **Feature 5:** Real-time messaging at scale could overload WebSocket server (mitigation: rate limiting, separate service if needed)

### Medium Risk
- **Feature 4:** Ownership disputes could create recruiter friction (mitigation: clear business rules, admin override capability)
- **Feature 8:** ATS API rate limits could block syncs (mitigation: respect rate limits, queue system)

### Low Risk
- **Feature 1:** Proposals timeout edge cases (mitigation: well-tested automation logic)
- **Feature 6:** Audit log volume growth (mitigation: archive old logs, optimize queries)
- **Feature 7:** Monthly aggregation job failures (mitigation: retry logic, alerting)

---

## Next Steps

1. **Review & Approve Plan**
   - Stakeholder review of priorities
   - Confirm business rules for Feature 4 (ownership)
   - Approve budget/timeline for each feature

2. **Create Feature Tickets**
   - Break down each feature into user stories
   - Assign story points
   - Add to sprint backlog

3. **Technical Spike for High-Risk Items**
   - Stripe Connect split transfers (Feature 3)
   - WebSocket scaling (Feature 5)
   - OAuth flow complexity (Feature 8)

4. **Begin Implementation**
   - Start with Feature 1 (proposals frontend)
   - Parallel track: Feature 7 (quick win for analytics)
   - Prepare Feature 2 (payout automation) for next sprint

---

**Document Version:** 1.0  
**Last Updated:** January 14, 2026  
**Status:** Pending Review
