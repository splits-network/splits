# Fraud Detection & Trust Management

## Current State

### Fraud Detection
**Route:** `/secure/fraud`
**Data source:** `/fraud/admin/signals`

- **Table columns:** Severity (icon + badge), Entity name/type, Signal Type (badge), Description, Detected date, Status (Active/Resolved)
- **Filters:** Severity dropdown (All, Critical, High, Medium, Low), Resolved status (Active Only, Resolved Only, All)
- **Actions:** None - completely read-only
- **No detail view** - No click-through

### Reputation
**Route:** `/secure/reputation`
**Data source:** `/trust/admin/reputation`

- **Table columns:** Entity name/type (with tier icon), Tier (platinum/gold/silver/bronze/new), Score (progress bar), Positive Rate, Total Reviews, Updated date
- **Filters:** Tier dropdown, Entity type dropdown (Recruiters, Companies, Candidates)
- **Sorting:** By entity name, tier, score, positive rate, reviews, updated
- **Actions:** None - completely read-only
- **No detail view** - No click-through

### Ownership Audit
**Route:** `/secure/ownership`
**Data source:** `/trust/admin/ownership`

- **Table columns:** Verification Status (icon + badge), Entity name/type, Owner name/type, Verified date, Created date
- **Filters:** Verification status dropdown (All, Verified, Pending, Disputed, Failed)
- **Sorting:** By status, entity, owner, dates
- **Actions:** None - completely read-only
- **No detail view** - No click-through

### What's Missing

#### Critical (Phase Priority: High)
- **Fraud signal investigation** - Click-through to full signal details: entity profile, evidence, related signals, risk assessment
- **Fraud resolution workflow** - Resolve signals with action taken (dismissed, warning sent, account suspended, referred to legal)
- **Entity suspension from fraud** - Direct action to suspend a user/recruiter/company from a fraud signal
- **Reputation detail page** - Click-through: review breakdown, score history, factor analysis
- **Ownership verification actions** - Approve/reject pending verifications, request additional documentation
- **Fraud alerts** - Real-time alerts for critical/high severity fraud signals

#### Important (Phase Priority: Medium)
- **Reputation score override** - Admin ability to adjust reputation scores with justification
- **Reputation score history** - Chart showing score changes over time
- **Fraud investigation notes** - Internal notes on fraud investigations
- **Related signals grouping** - Group related fraud signals (same entity, same pattern)
- **Fraud rules management** - Configure what triggers fraud signals, adjust thresholds
- **Ownership dispute resolution** - Workflow for resolving ownership disputes
- **Trust dashboard** - Overview: fraud signal trends, reputation distribution, verification backlog
- **Watchlist management** - Add entities to a monitoring watchlist
- **IP/device tracking** - Track suspicious IP addresses and device fingerprints
- **Bulk verification** - Batch approve/reject pending ownership verifications

#### Nice to Have
- **Fraud pattern analysis** - ML-based pattern detection across signals
- **Risk scoring model** - Configurable risk scoring weights
- **Fraud reporting** - Generate fraud reports for compliance
- **Reputation leaderboard** - Top/bottom reputation entities for recognition/intervention

## Implementation Notes
- Fraud resolution should cascade: if suspending an entity, update all their active records
- Reputation score adjustments should be audit-logged with reason
- Ownership verification may require document upload/review capability
- Fraud alerts should integrate with notification system (and potentially external channels like Slack)
- All trust actions should be dual-logged (admin activity + trust-specific audit)
