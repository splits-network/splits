# Decision Log (Automated Decisions Audit)

## Current State

**Route:** `/secure/decision-log`
**Data source:** `/decisions/admin/log`

### What Exists
- **Table columns:** Date, Decision Type (badge), Entity name/type, Outcome (approved/rejected/flagged/escalated/pending), Confidence (progress bar + percentage), Decided By
- **Filters:** Decision type dropdown (All, Match Scoring, Fraud Check, Recruiter Approval, Payment Hold)
- **Sorting:** By date, decision type, entity, confidence
- **Actions:** None - completely read-only
- **No detail view** - No click-through to decision details

### What's Missing

#### Critical (Phase Priority: High)
- **Decision detail page** - Full view: input data, reasoning breakdown, confidence factors, related entity, outcome, who/what made the decision
- **Decision override** - Admin ability to override automated decisions with justification
- **Decision appeal tracking** - Track when users contest automated decisions
- **Link to source** - Direct link to the entity affected by the decision (recruiter, match, payout)

#### Important (Phase Priority: Medium)
- **Decision analytics** - Accuracy rates, override rates, confidence distribution, decision volume trends
- **Decision comparison** - Compare similar decisions to check consistency
- **Decision rules management** - Configure the rules that drive automated decisions
- **Override audit trail** - Track all admin overrides with before/after state
- **False positive/negative tracking** - Track decision quality over time
- **Reasoning transparency** - Expandable reasoning for each decision showing the logic chain
- **Export** - Export decision log for compliance reporting

#### Nice to Have
- **Decision tree visualization** - Visual representation of decision logic
- **A/B testing decisions** - Compare different decision models
- **Decision SLA** - Track how long automated decisions take

## Implementation Notes
- Decision override should create a new log entry linked to the original
- Reasoning should be stored as structured data (not just a text blob) for analysis
- Decision analytics are critical for tuning automated systems
- Export should include full reasoning for compliance/audit purposes
