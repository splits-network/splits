# Database Table Usage Audit & Integration Plan

**Date**: January 14, 2026  
**Status**: 🚨 CRITICAL - Multiple unused tables discovered  
**Impact**: Missing functionality affecting platform goals

---

## Executive Summary

This audit compared all Supabase database tables against actual code usage in services and applications. We discovered **12 critical tables** with zero or minimal integration, representing significant gaps in platform functionality.

### Key Findings
- **12 empty/unused tables** (0 rows, no code integration)
- **4 partially implemented tables** (some rows, incomplete integration)
- **Missing features**: Organization invitations, team collaboration, subscription billing, payout processing, ATS integrations, AI matching, fraud detection
- **Business impact**: Can't onboard team members, can't process payments, can't sync with external ATS systems

---

## Critical Unused Tables (0 rows, no integration)

### 1. `invitations` (Identity Domain)
**Purpose**: Pending invitations to join organizations  
**Row Count**: 0  
**Integration Status**: ❌ NO ENDPOINTS, NO SERVICE LOGIC

**Intended Functionality**:
- Company admins invite new team members via email
- Clerk organization invitation integration
- 7-day expiration window
- Track invitation status (pending, accepted, expired, revoked)

**Missing Implementation**:
- ❌ No V2 endpoints (`/v2/invitations`)
- ❌ No service layer for invitation creation/management
- ❌ No email integration for invitation delivery
- ❌ No Clerk API calls to create organization invitations
- ❌ No frontend UI for sending/managing invitations

**Business Impact**: **CRITICAL**
- Cannot onboard new team members to organizations
- No way for companies to add hiring managers or admins
- Blocks multi-user company accounts

---

### 2. `plans` (Billing Domain)
**Purpose**: Subscription plan definitions for recruiters  
**Row Count**: 0  
**Integration Status**: ❌ NO PLANS DEFINED, BILLING BROKEN

**Intended Functionality**:
- Define recruiter subscription tiers (Free, Pro, Enterprise)
- Store monthly pricing and Stripe price IDs
- List features per plan (job slots, support level, etc.)

**Missing Implementation**:
- ❌ No plan definitions in database
- ❌ No V2 endpoints (`/v2/plans`)
- ❌ No service logic for plan management
- ❌ No frontend plan selection UI
- ❌ No Stripe product/price linking

**Business Impact**: **CRITICAL**
- Cannot charge recruiters for platform access
- No tiered access control (all users have same permissions)
- No revenue generation from recruiter subscriptions
- Free-for-all marketplace with no monetization

**Required Actions**:
1. Seed initial plans (Free trial, Pro, Enterprise)
2. Create Stripe products and link price IDs
3. Implement V2 CRUD endpoints
4. Build plan selection UI in onboarding

---

### 3. `subscriptions` (Billing Domain)
**Purpose**: Track active recruiter subscriptions  
**Row Count**: 0  
**Integration Status**: ❌ NO SUBSCRIPTION TRACKING

**Intended Functionality**:
- Link recruiters to their active plan
- Store Stripe subscription IDs
- Track billing periods and cancellation dates
- Enforce access based on subscription status

**Missing Implementation**:
- ❌ No subscription creation during onboarding
- ❌ No Stripe webhook handling for subscription events
- ❌ No V2 endpoints (`/v2/subscriptions`)
- ❌ No access control based on subscription status
- ❌ No billing management UI

**Business Impact**: **CRITICAL**
- Cannot track who has paid vs free accounts
- No billing enforcement (all features unlocked)
- No recurring revenue tracking
- No subscription lifecycle management

**Blocks**: Entire recruiter monetization strategy

---

### 4. `candidate_sourcers` (ATS Domain)
**Purpose**: Track first sourcer of each candidate (365-day protection)  
**Row Count**: 0  
**Integration Status**: ❌ NO SOURCING ATTRIBUTION

**Intended Functionality**:
- Record which recruiter/TSN first sourced a candidate
- 365-day protection window for placement fees
- Prevent fee disputes over candidate ownership
- Support "I found them first" claims

**Missing Implementation**:
- ❌ No sourcing attribution on candidate creation
- ❌ No protection window enforcement
- ❌ No V2 endpoints (`/v2/candidate-sourcers`)
- ❌ No service logic for sourcing claims
- ❌ No UI for viewing sourcing history

**Business Impact**: **HIGH**
- No fee protection for recruiters who source candidates
- Potential fee disputes and conflicts
- No incentive to source new candidates (vs poaching existing ones)
- Marketplace trust issues

**Proposed Fix**: Implement automatic sourcing attribution when candidate is created by a recruiter

---

### 5. `candidate_role_assignments` (Network Domain)
**Purpose**: Candidate-to-role proposals from companies/recruiters  
**Row Count**: 0  
**Integration Status**: ❌ NO PROPOSAL WORKFLOW (ALIAS: `proposals`)

**Intended Functionality**:
- Companies/recruiters propose candidates for specific roles
- 72-hour acceptance window
- State machine: proposed → accepted → submitted → closed
- Track proposal acceptance/decline rates

**Missing Implementation**:
- ❌ Table exists but called `proposals` in code
- ❌ No endpoints using `candidate_role_assignments` table name
- ❌ Confusion between table name and code reference
- ❌ No frontend proposal creation workflow

**Business Impact**: **MEDIUM**
- Functionality partially exists under different name
- Documentation/naming inconsistency
- Confusing for developers

**Proposed Fix**: 
1. Standardize on `candidate_role_assignments` as table name
2. Update all code references to match
3. Add proper V2 endpoints using correct table name

---

### 6. `marketplace_events` (Network Domain)
**Purpose**: Event log for marketplace analytics and auditing  
**Row Count**: 0  
**Integration Status**: ❌ NO EVENT LOGGING

**Intended Functionality**:
- Log all marketplace actions (views, applications, placements)
- Enable analytics queries (most viewed jobs, recruiter activity)
- Audit trail for compliance
- Data source for recommendations engine

**Missing Implementation**:
- ❌ No event publishing to this table
- ❌ No analytics queries reading from it
- ❌ No V2 endpoints for event retrieval
- ❌ No background job writing events

**Business Impact**: **MEDIUM**
- Cannot track marketplace behavior
- No data for analytics dashboard
- No audit trail for compliance
- Cannot build recommendation features

**Proposed Fix**: Implement event logging middleware that writes to this table on every action

---

### 7. `candidate_role_matches` (Automation Domain)
**Purpose**: AI-generated candidate-job match suggestions  
**Row Count**: 0  
**Integration Status**: ❌ NO AI MATCHING

**Intended Functionality**:
- AI suggests candidates for open roles (0-100 score)
- Store match reasons and explainability
- Track acceptance/rejection of suggestions
- Learn from human feedback to improve matching

**Missing Implementation**:
- ❌ No AI matching service running
- ❌ No V2 endpoints (`/v2/matches`)
- ❌ No background job generating matches
- ❌ No frontend UI for reviewing suggestions

**Business Impact**: **HIGH**
- Manual candidate-job matching only
- No intelligent recommendations
- Recruiters must search manually
- Platform lacks AI-powered value proposition

**Blocks**: AI-assisted recruiting features (Phase 3 goal)

---

### 8. `payout_schedules` (Billing Domain)
**Purpose**: Automated payout scheduling based on placement milestones  
**Row Count**: 0  
**Integration Status**: ❌ NO PAYOUT AUTOMATION

**Intended Functionality**:
- Schedule payouts for future dates (30/60/90 days post-hire)
- Trigger on events (start date reached, guarantee expires)
- Auto-cancel if placement fails
- Support guarantee period enforcement

**Missing Implementation**:
- ❌ No payout scheduling during placement creation
- ❌ No background job processing scheduled payouts
- ❌ No V2 endpoints (`/v2/payout-schedules`)
- ❌ All payouts manual (no automation)

**Business Impact**: **HIGH**
- Manual payout processing only
- No guarantee period enforcement
- Risk of premature payouts
- High admin overhead

**Blocks**: Automated payout processing (Phase 3 requirement)

---

### 9. `payout_splits` (Billing Domain)
**Purpose**: Track fee splits for team-based placements  
**Row Count**: 0  
**Integration Status**: ❌ NO COLLABORATION SPLITS

**Intended Functionality**:
- Split placement fees among multiple recruiters
- Support sourcer + closer splits
- Track individual payout status per collaborator
- Enable team-based recruiting

**Missing Implementation**:
- ❌ No split calculation during placement
- ❌ No V2 endpoints (`/v2/payout-splits`)
- ❌ Single recruiter per placement only
- ❌ No collaboration workflow

**Business Impact**: **MEDIUM**
- Cannot support team recruiting
- No fee sharing for collaborations
- Limits marketplace flexibility
- Blocks sourcing + closing split models

**Blocks**: Team collaboration features (Phase 3 goal)

---

### 10. `escrow_holds` (Billing Domain)
**Purpose**: Hold back portion of payout during guarantee period  
**Row Count**: 0  
**Integration Status**: ❌ NO ESCROW SYSTEM

**Intended Functionality**:
- Hold 10-20% of fee during guarantee window
- Auto-release after guarantee expires
- Forfeit if placement fails
- Protect companies from failed hires

**Missing Implementation**:
- ❌ No escrow calculation on payout
- ❌ No V2 endpoints (`/v2/escrow-holds`)
- ❌ No background job releasing holds
- ❌ Full payout immediately (no holdback)

**Business Impact**: **HIGH**
- No risk protection for companies
- Recruiters get full fee upfront
- Potential refund disputes
- Financial risk if hires don't work out

**Blocks**: Guarantee period enforcement (critical for marketplace trust)

---

### 11. `payout_audit_log` (Billing Domain)
**Purpose**: Compliance audit trail for all payout operations  
**Row Count**: 0  
**Integration Status**: ❌ NO PAYOUT AUDITING

**Intended Functionality**:
- Log every payout state change
- Track admin actions (holds, releases, reversals)
- Provide audit trail for disputes
- Support compliance requirements (SOX, PCI)

**Missing Implementation**:
- ❌ No audit logging on payout events
- ❌ No V2 endpoints for audit retrieval
- ❌ Cannot track who did what when
- ❌ No dispute resolution history

**Business Impact**: **HIGH**
- No compliance audit trail
- Cannot investigate disputes
- Legal/regulatory risk
- No accountability for admin actions

**Blocks**: Financial compliance requirements

---

### 12. All Integration Tables (Phase 4)
**Purpose**: Sync data with external ATS platforms (Greenhouse, Lever, etc.)  
**Row Count**: 0 (all tables)  
**Integration Status**: ❌ NO ATS INTEGRATIONS

**Affected Tables**:
- `integrations` (0 rows)
- `sync_logs` (0 rows)
- `external_entity_map` (0 rows)
- `sync_queue` (0 rows)

**Intended Functionality**:
- Connect to company ATS systems
- Bi-directional sync (roles, candidates, applications)
- Webhook handling for real-time updates
- Async queue for sync operations
- Audit trail of all syncs

**Missing Implementation**:
- ❌ No integration service
- ❌ No V2 endpoints (`/v2/integrations`)
- ❌ No platform connectors (Greenhouse, Lever)
- ❌ No webhook handlers
- ❌ No sync worker processes

**Business Impact**: **MEDIUM** (Phase 4 feature)
- Companies cannot integrate existing ATS
- Manual data entry required
- Duplicate work for companies
- Limits enterprise adoption

**Blocks**: Enterprise sales (large companies require ATS integration)

---

### 13. All Team Collaboration Tables
**Purpose**: Multi-recruiter teams with shared splits  
**Row Count**: 0 (all tables)  
**Integration Status**: ❌ NO TEAM FEATURES

**Affected Tables**:
- `teams` (0 rows)
- `team_members` (0 rows)
- `split_configurations` (0 rows)
- `placement_splits` (0 rows)
- `team_invitations` (0 rows)

**Intended Functionality**:
- Recruiting agencies operate as unified entities
- Teams share job access and candidate pools
- Economic split models (flat, tiered, credit-based)
- Team-based billing and payouts
- Invitation workflow for team members

**Missing Implementation**:
- ❌ No team creation workflow
- ❌ No V2 endpoints for team management
- ❌ No split calculation engine
- ❌ No team-based permissions
- ❌ No team billing

**Business Impact**: **HIGH**
- Agencies cannot use platform (major customer segment)
- Individual recruiters only
- Cannot support sourcing + closing splits
- Limits addressable market

**Blocks**: Agency/team recruiting features (critical for Phase 3)

---

## Partially Implemented Tables (has data, incomplete integration)

### 14. `automation_rules` & `automation_executions`
**Row Count**: 0  
**Integration Status**: ✅ V2 ENDPOINTS EXIST, ❌ NO RULES CREATED

**What Works**:
- V2 CRUD endpoints implemented
- Repository and service layers complete
- Basic rule execution framework

**What's Missing**:
- ❌ No default rules created
- ❌ No background job triggering rules
- ❌ No frontend UI for rule management
- ❌ Human approval workflow not built

**Proposed Fix**: 
1. Seed common automation rules
2. Build background worker to check triggers
3. Create admin UI for rule management

---

### 15. `fraud_signals`
**Row Count**: 0  
**Integration Status**: ✅ V2 ENDPOINTS EXIST, ❌ NO DETECTION RUNNING

**What Works**:
- V2 CRUD endpoints implemented
- Repository for signal management

**What's Missing**:
- ❌ No detection algorithms running
- ❌ No background job checking for fraud
- ❌ No signals being raised
- ❌ No admin alerting

**Proposed Fix**: 
1. Implement fraud detection checks
2. Run checks on application submissions
3. Alert admins via notifications

---

### 16. `marketplace_metrics_daily`
**Row Count**: 0  
**Integration Status**: ✅ V2 ENDPOINTS EXIST, ❌ NO METRICS COLLECTED

**What Works**:
- V2 endpoints for reading metrics
- Repository for metric access

**What's Missing**:
- ❌ No daily aggregation job
- ❌ No metrics being calculated
- ❌ Empty data source for analytics

**Proposed Fix**: 
1. Build nightly aggregation job
2. Calculate daily metrics from transactional data
3. Backfill historical data

---

## Implementation Priority Matrix

| Priority | Table(s) | Business Impact | Effort | Phase |
|----------|----------|----------------|--------|-------|
| 🚨 **P0** | `plans`, `subscriptions` | Cannot monetize | HIGH | Phase 2 |
| 🚨 **P0** | `invitations` | Cannot onboard teams | MEDIUM | Phase 2 |
| ⚠️ **P1** | `escrow_holds`, `payout_schedules` | Financial risk | HIGH | Phase 3 |
| ⚠️ **P1** | `payout_audit_log` | Compliance risk | LOW | Phase 3 |
| ⚠️ **P1** | `candidate_sourcers` | Fee disputes | MEDIUM | Phase 2 |
| ⚠️ **P1** | Team tables (5 total) | Cannot serve agencies | HIGH | Phase 3 |
| 📊 **P2** | `marketplace_metrics_daily` | No analytics | MEDIUM | Phase 2 |
| 📊 **P2** | `marketplace_events` | No audit trail | LOW | Phase 2 |
| 🤖 **P2** | `candidate_role_matches` | No AI matching | HIGH | Phase 3 |
| 🤖 **P2** | `automation_rules`, `fraud_signals` | Enable existing endpoints | LOW | Phase 3 |
| 🔌 **P3** | Integration tables (4 total) | Enterprise blocker | VERY HIGH | Phase 4 |

---

## Recommended Action Plan

### Phase 1: Emergency Fixes (This Week)
**Goal**: Unblock critical business functionality

1. **Billing System** (2-3 days)
   - Create initial plans in database (Free, Pro)
   - Link Stripe product/price IDs
   - Implement V2 `/plans` CRUD endpoints
   - Build subscription creation flow in onboarding
   - Add Stripe webhook handlers for subscription lifecycle

2. **Organization Invitations** (1-2 days)
   - Implement V2 `/invitations` CRUD endpoints
   - Build invitation creation service
   - Integrate Clerk organization invitations
   - Add email notification for invitations
   - Create invitation management UI

3. **Candidate Sourcing** (1 day)
   - Auto-create sourcer record on candidate creation
   - Add V2 `/candidate-sourcers` endpoints
   - Display sourcing info on candidate profile

### Phase 2: Core Marketplace Features (Next Sprint)
**Goal**: Complete Phase 2 requirements

4. **Payout Infrastructure** (3-4 days)
   - Implement escrow hold calculations
   - Build payout scheduling system
   - Add payout audit logging
   - Create admin payout management UI

5. **Marketplace Analytics** (2 days)
   - Build nightly metrics aggregation job
   - Backfill historical metrics
   - Implement event logging middleware
   - Enable analytics dashboards

6. **Admin Dashboard Data** (1 day)
   - Fix `TODO` in admin dashboard (line 104 in attachment)
   - Populate missing health metrics
   - Add fraud alert counts
   - Display pending approval counts

### Phase 3: Advanced Features (Future Sprint)
**Goal**: Enable team collaboration and AI

7. **Team Collaboration** (5-7 days)
   - Implement all 5 team-related tables
   - Build team creation/management workflows
   - Add split configuration engine
   - Create team billing integration

8. **AI Matching & Automation** (3-5 days)
   - Build match generation service
   - Implement fraud detection algorithms
   - Enable automation rule triggers
   - Create human approval workflows

### Phase 4: Enterprise (Future)
9. **ATS Integrations** (2-3 weeks)
   - Build integration connectors
   - Implement sync queue processor
   - Add webhook handlers
   - Create integration management UI

---

## Database Schema Validation

### Schema Integrity
✅ All foreign keys are valid  
✅ Check constraints are present  
✅ Indexes exist for common queries  
✅ RLS policies are defined (where needed)  

### Potential Issues
⚠️ `candidate_role_assignments` vs `proposals` naming mismatch  
⚠️ No unique constraints on some junction tables  
⚠️ Missing indexes on search_vector columns (performance)  

---

## Next Steps

1. **Review & Prioritize**: Team reviews this audit and confirms priority order
2. **Sprint Planning**: Break P0/P1 items into concrete sprint tasks
3. **Implementation**: Execute Phase 1 fixes immediately
4. **Validation**: Run integration tests to ensure tables are properly used
5. **Monitoring**: Add alerts for empty critical tables (prevent regression)

---

## Success Metrics

### Short-term (1 week)
- ✅ Billing system functional (plans & subscriptions working)
- ✅ Team invitations working end-to-end
- ✅ Candidate sourcing attribution active

### Medium-term (1 month)
- ✅ Payout automation operational
- ✅ Marketplace analytics dashboard populated
- ✅ All P1 tables in active use

### Long-term (3 months)
- ✅ Team collaboration features live
- ✅ AI matching generating suggestions
- ✅ Zero empty critical tables

---

## Conclusion

This audit reveals significant functionality gaps due to unused database tables. The good news: **the data model is well-designed and ready to use**. We don't need to redesign schemas, just implement the missing service layers and endpoints.

**Critical blockers identified**:
- Cannot monetize platform (no billing)
- Cannot onboard teams (no invitations)
- Cannot protect fees (no sourcing/escrow)
- Cannot serve agencies (no teams)

**Recommended approach**: Execute Phase 1 fixes immediately to unblock revenue, then systematically implement remaining features per priority.

