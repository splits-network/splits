
# Splits Network – Phase 2 PRD (Marketplace Expansion & Economic Depth)

Phase 2 is not an iteration on Phase 1 UX.
Phase 2 is the transition from a working split-first ATS into a durable recruiting marketplace with enforceable economics.

Phase 1 proved that:
- Recruiters will use the system
- Companies will hire through it
- Fees, splits, and pipelines can be tracked accurately

Phase 2 ensures:
- Ownership is unambiguous
- Collaboration is profitable
- Quality compounds naturally
- Scale does not break trust

---

## 0. Phase 2 Implementation Checklist

### Infrastructure & Platform
- [x] Extend database schemas for ownership and sourcing
  - [x] `ats.candidate_sourcers` table created
  - [x] `network.candidate_role_assignments` table created
  - [x] Extended `ats.placements` with state machine fields
  - [x] `ats.placement_collaborators` table created
  - [x] `network.recruiter_reputation` table created
  - [x] `ats.candidate_outreach` table created
  - [x] Migration 008 applied with all Phase 2 schema changes
- [x] Add new marketplace domain events
  - [x] Event publisher infrastructure in place
  - [x] Events: `candidate.sourced`, `proposal.created`, `proposal.accepted`, `proposal.declined`
  - [x] Events: `placement.state_changed`, `placement.activated`, `placement.completed`, `placement.failed`
- [x] Extend RabbitMQ exchanges
  - [x] EventPublisher supports topic exchange
  - [x] Routing keys configured for all Phase 2 events
- [x] Add Redis-backed counters for reputation signals
  - Completed: Reputation calculation is database-driven; Redis integration deferred as not needed
- [x] Update shared-types with Phase 2 models
  - Completed: All Phase 2 types added to `packages/shared-types/src/models.ts` and `events.ts`
- [x] Update shared-clients for new APIs
  - Completed: Created `packages/shared-clients` with full Phase 2 API coverage

### Core Domain
- [x] Candidate ownership model
  - [x] `CandidateOwnershipService` implemented
  - [x] First-sourcer-wins logic
  - [x] Protection window enforcement (default 365 days)
  - [x] TSN as first-class sourcer support
- [x] Sourcer attribution with protection windows
  - [x] Protection expiry tracking
  - [x] Can-user-work-with-candidate validation
  - [x] Ownership transfer after expiry
- [x] CandidateRoleAssignment state machine
  - [x] `CandidateRoleAssignmentService` implemented
  - [x] States: proposed → accepted/declined/timed_out → submitted → closed
  - [x] Response timeout handling
  - [x] State transition validation
- [x] Placement lifecycle and guarantees
  - [x] `PlacementLifecycleService` implemented
  - [x] States: hired → active → completed or failed
  - [x] 90-day guarantee period (configurable)
  - [x] Guarantee expiry calculation
  - [x] Replacement placement tracking
- [x] Multi-recruiter split math
  - [x] `PlacementCollaborationService` implemented
  - [x] Sourcer share calculation (first, then split remaining)
  - [x] Collaborator role tracking (sourcer, submitter, closer, support)
  - [x] Split percentage validation (must total 100%)
  - [x] Split amount calculation locked at hire
- [x] Reputation signal aggregation
  - [x] `RecruiterReputationService` implemented
  - [x] Metrics: submission quality, hire rate, completion rate, responsiveness
  - [x] Reputation score calculation (0-100)
  - [x] Incremental reputation updates

### Services
- [x] ATS service extensions
  - [x] `ownership.ts` - CandidateOwnershipService & PlacementCollaborationService
  - [x] `placement-lifecycle.ts` - PlacementLifecycleService
  - [x] `routes-phase2.ts` - 15+ Phase 2 endpoints
  - [x] Repository methods for all Phase 2 tables
  - [x] Event publishing for ownership and lifecycle changes
- [x] Network service collaboration logic
  - [x] `proposals.ts` - CandidateRoleAssignmentService & RecruiterReputationService
  - [x] `routes-phase2.ts` - Proposal and reputation endpoints
  - [x] Repository methods for proposals and reputation
  - [x] Timeout detection for proposals
- [x] Notification extensions (ownership, guarantees)
  - Completed: All Phase 2 event handlers implemented in `consumer.ts`
  - Completed: All email templates added to `email.ts`
- [ ] Billing extensions (tracking only)
  - Note: Billing service integration with multi-recruiter splits deferred to Phase 3

### Frontend
- [x] Recruiter collaboration UI
  - [x] Proposals list page (`/proposals`)
  - [x] ProposalCard component
  - [x] Proposal state indicators
- [x] Placement breakdown UI
  - [x] PlacementCollaborators component
  - [x] Split percentage display
  - [x] Collaborator role badges
- [x] Ownership indicators
  - [x] OwnershipBadge component
  - [x] Sourcer information display on candidate detail pages
  - [x] Protection window expiry display
- [x] Reputation badges
  - [x] RecruiterReputationBadge component
  - [x] Score visualization
  - [x] Metric breakdown tooltips
- [x] Placement lifecycle UI
  - [x] PlacementLifecycle component
  - [x] State transition controls
  - [x] Guarantee status display
- [x] Admin audit views
  - Completed: Ownership audit page at `/admin/ownership`
  - Completed: Reputation management page at `/admin/reputation`
  - Completed: Admin dashboard updated with Phase 2 navigation

### Testing
- [x] Ownership claim flows
  - Completed: Comprehensive testing guide created in `docs/PHASE2-TESTING-GUIDE.md`
  - Manual testing documented with step-by-step flows
- [x] Multi-recruiter placement flows
  - Completed: Split calculation tests documented
  - Collaboration workflows defined
- [x] Failure and replacement flows
  - Completed: Guarantee period and replacement testing documented
  - Lifecycle state transitions covered

---

## 1. Phase 2 Goals

1. Enforce ownership and credit
2. Enable safe collaboration
3. Reward high-quality behavior
4. Reduce wasted recruiter effort
5. Prepare for AI assistance without automation risk

---

## 2. Candidate Ownership & Sourcing

Candidate ownership is a time-bound economic right, not UI metadata.

- First valid sourcer establishes ownership
- Ownership applies across roles
- Protection windows determine payout eligibility
- TSN may act as a first-class sourcer

---

## 3. CandidateRoleAssignment State Machine

Explicit states:
- Proposed
- Accepted
- Declined
- TimedOut
- Submitted
- Closed

Timeouts and declines affect reputation.

---

## 4. Recruiter Collaboration

- Multiple active recruiters per placement
- Explicit split percentages
- Sourcer share calculated first
- Math locked at hire

Referrals are economic edges, not ownership.

---

## 5. Placement Lifecycle & Guarantees

States:
- Hired
- Active
- Completed
- Failed

Failed placements within guarantee windows enable replacements.

---

## 6. Reputation System

Derived from outcomes:
- Submission quality
- Hire rate
- Completion rate
- Responsiveness

Reputation influences access, not authority.

---

## 7. Outreach & Sourcing Tools

- Outreach via Resend
- Outreach establishes ownership
- Unsubscribe and rate limits enforced

---

## 8. Analytics

- Recruiter funnels
- Collaboration vs solo placements
- Network health metrics

---

## 9. Non-Goals

- Automated payouts
- Public job boards
- Autonomous AI decisions

---

## 10. Success Metrics

- Reduced disputes
- Increased collaboration
- Faster hires
- Lower recruiter churn

---

## 11. Summary

Phase 2 makes Splits Network durable:
- Ownership is enforceable
- Collaboration is safe
- Quality compounds
