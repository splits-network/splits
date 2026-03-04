# Technical and Administrative Features

## The "Split-First" Design Philosophy

Unlike general-purpose Applicant Tracking Systems (ATS) that bolt on split-fee features as an afterthought, Splits Network was **designed from the ground up for collaborative recruiting**. Every feature, from the data model to the UI, is built around the concept of multiple parties collaborating on a single placement with transparent attribution and automated financial settlement.

---

## 1. Integrated ATS (Applicant Tracking System)

The ATS is the central nervous system of Splits Network, managing the full lifecycle of a hire.

### Jobs

Jobs are posted by companies (or by recruiters on behalf of companies) with rich metadata:

- **Core fields:** Title, description (separate versions for recruiters and candidates), responsibilities, requirements
- **Compensation:** Salary range (min/max) with optional visibility toggle
- **Classification:** Employment type (full-time, contract, temporary), commute type (remote, hybrid 1–4 days, in-office), job level (entry through C-suite)
- **Requirements:** Mandatory vs. preferred, with structured requirement entries
- **Pre-screening:** Custom questions per job (text, yes/no, select, multi-select)
- **Company context:** Perks, culture tags, company skills
- **Lifecycle:** Active → Paused → Filled or Closed
- **Fee structure:** Percentage-based placement fee, guarantee period (default 90 days)

### Candidates

Candidates exist in two modes:

- **Recruiter-managed:** Created by a recruiter, no user account — the recruiter manages all interactions
- **Self-managed:** Candidate has their own Applicant Network account and controls their profile

Candidate data includes parsed resume metadata (experience, education, skills, certifications) extracted via AI, plus manual profile information.

**Identity masking:** Companies see only initials and a masked email until they formally accept a candidate submission, preventing platform bypass.

### Applications

Applications connect candidates to jobs and flow through a defined pipeline:

```
draft → ai_review → ai_reviewed → recruiter_review → submitted
  → company_review → company_feedback → interview → offer → hired
```

Terminal states: `rejected`, `withdrawn`, `expired`

Special flows:
- `recruiter_request` — Recruiter requests more info from candidate
- `recruiter_proposed` — Recruiter proposes a job to a candidate for their consideration

Each stage transition is logged, creating a complete audit trail visible as an application timeline.

### Application Notes

Threaded communication attached to applications with typed categories:

| Note Type | Purpose |
|-----------|---------|
| `info_request` | Request for additional information |
| `info_response` | Response to an info request |
| `note` | General note |
| `improvement_request` | Suggestion for application improvement |
| `stage_transition` | System-generated stage change record |
| `interview_feedback` | Post-interview feedback |
| `general` | General communication |
| `pitch` | Recruiter's pitch for the candidate |

Visibility controls: `shared` (all parties see), `company_only`, or `candidate_only`.

### Placements

Created upon a successful hire, placements track:

- Salary, start date, guarantee days, fee percentage
- Status lifecycle: created → activated → guarantee period → completed or failed
- Commission attribution snapshot (frozen at hire time)
- Payout scheduling and escrow management

---

## 2. AI-Powered Features

### Candidate-Job Fit Analysis

Every application can trigger an AI review that provides:

- **Fit score:** 0–100 numerical rating
- **Recommendation:** Strong fit, Good fit, Fair fit, or Poor fit
- **Strengths:** What makes this candidate a good match
- **Concerns:** Potential gaps or mismatches
- **Skills analysis:** Matched skills vs. missing skills
- **Revision loop:** Candidates can read the AI feedback, revise their application, return to draft, and resubmit for a fresh analysis

### AI-Powered Matching

The matching engine combines three scoring methods:

1. **Rule-based scoring:** Salary overlap, employment type match, commute compatibility, job level match, location compatibility, availability
2. **Skills scoring:** Percentage of required skills matched
3. **AI scoring:** Semantic similarity via vector embeddings (pgvector)

Results are classified into match tiers (`standard` vs. `true` for higher confidence) and presented with detailed match factors explaining why each match was suggested.

### Resume Processing

- **Text extraction:** Parses resume documents into structured text
- **AI metadata extraction:** Identifies experience, education, skills, and certifications
- **Skills tagging:** Extracted skills are mapped to a centralized skills taxonomy

---

## 3. The 5-Role Commission System

The defining financial innovation of Splits Network. Every placement can have up to five attributed roles, each earning a share of the placement fee:

| # | Role | Nickname | Description | How Assigned |
|---|------|----------|-------------|--------------|
| 1 | Candidate Recruiter | Closer | Represents and submits the candidate | Assigned when submitting a candidate |
| 2 | Company Recruiter | Client | Represents the company's hiring interests | Assigned by company or platform |
| 3 | Job Owner | Specs Owner | Created the job posting | Automatically assigned to the recruiter who posts the job |
| 4 | Candidate Sourcer | Discovery | First brought the candidate to the platform | Attributed via referral codes — permanent |
| 5 | Company Sourcer | BD | First brought the company to the platform | Attributed via referral codes — permanent |

### How Commission Splits Work

1. **Company sets the total fee** — a percentage of the hired candidate's first-year salary
2. **Commission rates are plan-tier-dependent** — stored in a database-driven `splits_rates` table, varying by Starter/Pro/Partner plans
3. **Each filled role gets its defined percentage** of the total fee
4. **Unfilled roles' percentages go to the platform** — if no one holds the "Company Sourcer" role, that share becomes platform revenue
5. **Everything is transparent** — all parties can see the fee structure before committing

### 4-Layer Payout Architecture

1. **Placement Snapshot** — Freezes who held which role and at what rates at the moment of hire (immutable record)
2. **Placement Splits** — Attribution layer: one row per role per placement with explicit dollar amounts
3. **Placement Payout Transactions** — Execution layer: Stripe transfer tracking, one per split
4. **Escrow Holds** — Payouts are withheld during the guarantee period; released on schedule if the placement succeeds

### Financial Features

- **Stripe Connect** — Recruiters set up Express accounts with identity verification for receiving payouts
- **Firm Admin Take Rate** — Recruiting agencies can take a percentage from member recruiters' payouts
- **Company Billing** — Net terms (immediate, net-30, net-60, net-90), Stripe invoicing
- **Discount Codes** — Percentage or flat amount, once/repeating/forever duration
- **Dispute Resolution** — Formal disputes for fee amount, fee split, placement validity, or service quality

---

## 4. Multi-Gate Approval Workflows

Quality control is maintained through a series of approval gates:

1. **Candidate Recruiter Gate** — The recruiter representing the candidate reviews the application before submission
2. **Company Recruiter Gate** — The company-side recruiter validates the submission
3. **Company Decision Gate** — The hiring company makes the final decision

The **Candidate Role Assignment (CRA)** is the deal record that ties a candidate to a job with explicit recruiter roles assigned. It serves as the wiring harness for gate routing and commission attribution.

---

## 5. Real-Time Communication

### Chat System

- WebSocket-based real-time messaging between all platform participants
- Conversations scoped to candidates, applications, or general communication
- Presence tracking (online/offline status)
- Message history and threading

### Notification System

Event-driven notifications via RabbitMQ with 20+ consumer domains:

- Application stage changes, placement events, billing events
- Collaboration invitations, relationship changes
- Gamification achievements (badges, level-ups, streak milestones)
- Security events, onboarding guidance
- Delivered via email (Resend) with branded templates per platform

---

## 6. Gamification Engine

Engagement mechanics that reward active platform participation:

| Feature | Description |
|---------|-------------|
| **XP (Experience Points)** | Earned from placements, submissions, responses, profile completion, referrals, streaks, milestones |
| **Levels** | Progressive levels with titles and perks, based on total XP |
| **Badges** | Tiered (bronze → silver → gold → platinum) achievements with specific criteria |
| **Badge Progress** | Tracks partial progress toward earning each badge |
| **Streaks** | Consecutive activity tracking (current and longest) |
| **Leaderboards** | Rankings by entity type (recruiter, candidate, company, firm) for weekly, monthly, quarterly, and all-time periods |

Gamification is **event-driven** — domain events (placements, submissions, etc.) automatically trigger XP awards and badge evaluations.

---

## 7. Search and Discovery

### Global Search

- Full-text search across candidates, jobs, companies, recruiters, applications, placements, and recruiter-candidate relationships
- Two modes: **Typeahead** (grouped results by entity type for quick navigation) and **Full** (ranked results across all entities)
- Rich filtering: employment type, job level, commute type, salary range, relocation, remote work, availability, industry, company size

### Skills Taxonomy

- Centralized skills table with junction tables linking skills to candidates and jobs
- Skills sources: `manual` (user-entered) and `resume_extraction` (AI-parsed from resumes)
- Enables structured skill matching between candidates and job requirements

---

## 8. Recruiting Firms (Agencies)

Recruiting agencies operate as first-class entities on Splits Network:

- **Firm Management** — Create or join a recruiting firm with shared resources
- **Public Marketplace Profile** — Industries, specialties, placement types, geographic focus, team size
- **Admin Take Rate** — Firm administrators can set a percentage taken from member recruiter payouts
- **Firm-Level Stripe** — Separate Stripe Connect accounts for firm-level financial operations
- **Firm Statistics** — Aggregated placement stats and recent placement history
- **Member Roles** — Owner, admin, member, collaborator with appropriate permissions

---

## 9. ATS Integrations

Bidirectional sync with external Applicant Tracking Systems:

| Platform | Status |
|----------|--------|
| Greenhouse | Supported |
| Lever | Supported |
| Workable | Supported |
| Ashby | Supported |
| Generic (API) | Supported |

**Sync capabilities:**
- **Inbound** (External ATS → Splits Network): Import roles, candidates, applications, interviews
- **Outbound** (Splits Network → External ATS): Push submissions, status updates, placement data
- Async sync queue with priority, retries, and conflict resolution

---

## 10. Automation and Fraud Detection

### Rules Engine

- Configurable trigger conditions and automated actions
- Human approval requirement flag for sensitive automations
- Full execution tracking and audit trail

### Fraud Detection

- Signal detection with severity levels: low, medium, high, critical
- Monitors for suspicious patterns in applications, relationships, and financial activity
