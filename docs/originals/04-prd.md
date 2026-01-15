# Splits Network – PRD (Implementation Guidance)

This PRD is focused on **implementing**:
1) Draft application + AI assessment routing
2) Hybrid sourcer incentive model (6% base + tier bonus)

---

## 1. Objectives

### Draft + Assessment
- Reduce noise
- Improve candidate completeness
- Route cleanly through recruiter/company gates

### Hybrid Sourcer Incentive
- Always reward origination
- Increase upgrades via bonus (not penalty)
- Snapshot at hire for dispute-proof math

---

## 2. Requirements

### 2.1 Application draft + AI assessment
- Draft applications are persistent
- Assessment stores score + payload + model version
- Assessment can request info
- Submission routes to candidate recruiter (if assigned), then company recruiter (if assigned), then company

### 2.2 Hybrid sourcer incentive
- Candidate sourcer: 6% base + bonus
- Business sourcer: 6% base + bonus
- Snapshot at hire, immutable
- Earnings UI shows “base + bonus”

---

## 3. Notifications (Resend)
- Assessment completed
- Info requested
- Forwarded/denied
- Hire confirmed
- Payout scheduled/paid

---

## 4. Acceptance Criteria
- Payout for a hire is reproducible from stored snapshots only
- A sourcer upgrading after hire does not change past payouts
- Draft → assessment → submit → gating is fully auditable
