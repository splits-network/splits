# Plan: Database Table Integration Strategy

The database contains **15+ tables defined in migrations but never implemented** in services/apps, creating critical gaps in core business logic (sourcer protection, multi-recruiter splits) and advanced features (payout automation, marketplace messaging). This plan prioritizes implementing missing functionality and cleaning up schema drift.

## Steps

1. **Implement sourcer protection** in `services/network-service/src/v2/` or `services/ats-service/src/v2/`
   - Create `candidate-sourcers/` domain with `repository.ts`, `service.ts`, `routes.ts` following V2 patterns
   - Track first sourcer per candidate with 30/60/90-day protection window
   - Add `POST /api/v2/candidate-sourcers` and `GET /api/v2/candidates/:id/sourcers` endpoints
   - Integrate sourcer validation in candidate creation flow in `services/ats-service/src/v2/candidates/service.ts`

2. **Implement multi-recruiter placement splits** in `services/ats-service/src/v2/placements/` and `services/billing-service/src/v2/`
   - Create `placement-collaborators/` domain in ATS service for tracking multiple recruiters per placement
   - Create `payout-splits/` domain in billing service for revenue distribution
   - Update `services/ats-service/src/v2/placements/service.ts` to support collaborator array in create/update
   - Add split calculation logic and Stripe Connect multi-transfer in billing service

3. **Implement automated payout features** in `services/billing-service/src/v2/`
   - Create `payout-schedules/` domain with CRON-based schedule processing
   - Create `escrow-holds/` domain for holdback management during guarantee periods
   - Create `payout-audit-log/` domain for compliance tracking
   - Add background worker to process scheduled payouts and release holds

4. **Create marketplace connection system** in `services/network-service/src/v2/`
   - Create `marketplace-connections/` domain with state machine (pending → active → inactive)
   - Create `marketplace-messages/` domain with real-time messaging (consider external solution like SendBird)
   - Update `apps/portal/src/app/portal/marketplace/` and `apps/candidate/src/app/marketplace/` with connection/messaging UI
   - Add WebSocket/SSE infrastructure for real-time message delivery

5. **Clean up schema drift** across all `services/*/migrations/` folders
   - Document Phase 2/3 feature roadmap in `docs/roadmap/` clarifying planned vs abandoned features
   - For abandoned features: create migration to drop unused tables (`marketplace_config`, `candidate_outreach`, `marketplace_events`, `decision_audit_log`)
   - For planned features: add TODO comments in `packages/shared-types/` linking to implementation tickets
   - Update `AGENTS.md` with table usage audit results and implementation priorities

## Further Considerations

1. **Sourcer protection business rules**: Should protection window vary by job level (junior vs senior roles)? Should there be exceptions for company-requested candidates?

2. **Multi-recruiter split calculation**: How should split percentages be determined - equal splits, custom percentages, or automated based on contribution metrics (sourcer bonus, closer bonus)?

3. **Marketplace messaging architecture**: Build in-house with WebSocket infrastructure OR integrate external solution (SendBird, Stream, PubNub)? External may be faster but adds dependency.

4. **Phase 2/3 feature prioritization**: Which advanced payout features (schedules, holds, splits) provide most ROI? Should these be implemented sequentially or in parallel?

5. **Database cleanup strategy**: Remove unused tables immediately to reduce bloat, or keep them for potential future use? Consider migration reversibility.

## Critical Findings from Audit

### Tables with NO Runtime Usage (Migrations Exist)

**Phase 2 - Ownership & Sourcing**:
- `candidate_sourcers` - Tracks first sourcer + protection window
- `placement_collaborators` - Multi-recruiter placements
- `candidate_outreach` - Outreach tracking
- `marketplace_events` - Event log for marketplace actions

**Phase 3 - Payouts**:
- `payout_schedules` - Scheduled payout triggers
- `payout_splits` - Multi-recruiter payout distribution
- `escrow_holds` - Holdback management
- `payout_audit_log` - Payout audit trail

**Phase 3 - Automation**:
- `decision_audit_log` - AI/human decision tracking

**Marketplace Messaging**:
- `marketplace_connections` - Candidate-recruiter connections
- `marketplace_messages` - In-app messaging
- `marketplace_config` - Marketplace settings

### Impact Analysis

**CRITICAL Gaps** (Core Business Logic):
1. **Sourcer Protection** - First-sourcer credit not enforced, causing potential disputes
2. **Multi-Recruiter Splits** - Complex placements cannot properly distribute revenue

**HIGH Priority** (Phase 3 Features):
3. **Automated Payouts** - Manual payout processing inefficient at scale
4. **Escrow Management** - Risk management for guarantee periods missing

**MEDIUM Priority** (Marketplace Enhancement):
5. **Direct Messaging** - Candidate-recruiter communication limited
6. **Connection Requests** - No formal connection workflow

**LOW Priority** (Analytics & Audit):
7. **Decision Audit Log** - AI transparency nice-to-have
8. **Outreach Tracking** - Can use Resend webhooks as alternative
9. **Marketplace Events** - Can use existing RabbitMQ event bus

## Implementation Priorities

### Sprint 1-2 (Immediate)
- [ ] Implement `candidate_sourcers` table and V2 domain
- [ ] Implement `placement_collaborators` table and V2 domain
- [ ] Document Phase 2/3 roadmap decisions

### Sprint 3-6 (Short-Term)
- [ ] Implement `payout_schedules` automation
- [ ] Implement `payout_splits` for multi-recruiter payouts
- [ ] Implement `escrow_holds` management
- [ ] Add `payout_audit_log` logging

### Phase 2+ (Long-Term)
- [ ] Evaluate marketplace messaging solution (build vs buy)
- [ ] Implement `marketplace_connections` if building in-house
- [ ] Implement `marketplace_messages` if building in-house
- [ ] Add outreach tracking integration with Resend
- [ ] Consolidate event logging patterns

### Clean-Up Tasks
- [ ] Remove unused tables if features abandoned
- [ ] Update shared types to mark deprecated interfaces
- [ ] Update AGENTS.md with audit results
- [ ] Document schema hygiene standards
