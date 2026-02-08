# Feature Backlog

> Consolidated from code-level audit and live platform walkthrough. Deduplicated, validated against the actual codebase, and organized by category.
>
> _Last updated: February 2026_

---

## Pipeline & Workflow

### Kanban Pipeline Board

**Priority: Tier 1** | **Effort: Medium** | **Backend: Ready**
Drag-and-drop kanban view for applications by stage. The data model already supports stages (draft, screen, submitted, company_review, interview, offer, hired, rejected, withdrawn). Needs a new view mode alongside existing browse/table/grid.

### Pipeline Automation & Triggers

**Priority: Tier 3** | **Effort: Large** | **Backend: Partial** (automation-service has rules engine)
Auto-progress applications based on conditions (e.g., "if AI score > 80, auto-advance to screen"). The automation service has a rules engine but it's not wired into a user-configurable UI.

### Task & Reminder System

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
Follow-up reminders tied to candidates, applications, and roles ("Call Sarah Thursday", "Check Acme offer status"). Needs new tasks table, notification integration, and a sidebar widget or dedicated page.

---

## Search & Discovery

### Global Search (Cmd+K)

**Priority: Tier 1** | **Effort: Medium** | **Backend: Partial** (individual search endpoints exist)
Universal spotlight search across candidates, jobs, companies, applications, and conversations. Single input, federated results, keyboard-driven.

### Advanced / Boolean Search

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
Boolean operators ("Java AND AWS NOT junior"), skill-based filtering, location radius, salary range. Critical for recruiters with large candidate pools.

### Saved Searches & Alerts

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
Save filter configurations for reuse. Optional: alert when new candidates/roles match a saved search. Needs saved_searches table and notification hook.

### Role Recommendations for Recruiters

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (AI matching exists)
Suggest roles to recruiters based on their specialization, past placements, and candidate pool. Could leverage existing AI matching infrastructure.

---

## Candidate Management

### Candidate Tags & Talent Pools

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
Tagging system (e.g., "senior-go", "bay-area", "hot-lead") and curated talent pool lists that can be reused across multiple roles. Needs tags table, candidate_tags junction, and a talent pools CRUD.

### Unified Candidate Activity Timeline

**Priority: Tier 2** | **Effort: Medium** | **Backend: Partial** (events are published, application feedback exists)
Single chronological view on a candidate record showing every touchpoint: applications, stage changes, messages, notes, documents, across all jobs. Aggregate from existing event data.

### Resume Parsing & Auto-Fill

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
When a resume is uploaded, auto-extract name, title, company, skills, experience, education into the candidate profile. Requires a parsing service (third-party or AI-powered).

### Duplicate Candidate Detection

**Priority: Tier 2** | **Effort: Small** | **Backend: New**
On candidate creation, check for matching email/phone/name and warn before creating a duplicate. Prevents ownership disputes and data quality issues.

### Candidate Side-by-Side Comparison

**Priority: Tier 3** | **Effort: Small** | **Backend: Ready**
Select 2-3 candidates and compare profiles, skills, experience in a side-by-side view. Frontend-only feature using existing candidate data.

### Sourcing Attribution & Channel Tracking

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Track where each candidate was sourced (LinkedIn, referral, job board, inbound, event). Simple source field on candidate record + analytics aggregation.

---

## Communication & Messaging

### Message Templates

**Priority: Tier 2** | **Effort: Small** | **Backend: New**
Reusable message templates for common outreach (initial contact, interview follow-up, rejection, offer). Template CRUD + quick-insert in message composer.

### Bulk Messaging

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Send a templated message to multiple candidates at once. Needs recipient selection UI, template merge fields, and rate-limiting/queue integration.

### Internal Team Notes / @Mentions

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Internal-only comments on candidates/applications visible to team members but not external parties. The application feedback threading API exists but may not distinguish internal vs. external.

### Candidate Handoff Between Recruiters

**Priority: Tier 3** | **Effort: Small** | **Backend: Partial** (recruiter-candidate relationships exist)
Formal handoff workflow when a recruiter transfers a candidate relationship to a colleague. Audit trail of ownership transfer.

---

## Scheduling & Calendar

### Interview Scheduling & Calendar Integration

**Priority: Tier 1** | **Effort: Large** | **Backend: New**
Calendar sync (Google Calendar, Outlook), availability sharing, interview slot booking, multi-interviewer coordination. This is the single biggest workflow gap for company admins.

---

## Analytics & Reporting

### Hiring Funnel Analytics

**Priority: Tier 1** | **Effort: Medium** | **Backend: Partial** (stats/charts endpoints exist)
Conversion rates by stage, time-in-stage, drop-off analysis, time-to-hire, source-of-hire. The backend analytics service has `/api/v2/stats` and `/api/v2/charts` endpoints that need frontend visualization.

### Earnings & Commission Dashboard

**Priority: Tier 2** | **Effort: Medium** | **Backend: Partial** (payouts/placements data exists)
Recruiter-facing view: total earned this period, pending payouts, projected pipeline value, earnings by company/role, commission projections based on active pipeline.

### Recruiter Performance Scoreboard

**Priority: Tier 2** | **Effort: Medium** | **Backend: Partial** (reputation system exists)
Company-facing view: compare recruiters by submission volume, interview-to-offer ratio, time-to-submit, placement success rate. The admin reputation system needs to be surfaced to company admins.

### Cost-Per-Hire & ROI Metrics

**Priority: Tier 3** | **Effort: Small** | **Backend: Partial**
Company-facing: total fees paid per hire, fee as % of salary, ROI by recruiter/source. Derived from existing placement and payout data.

### Data Export (CSV/PDF)

**Priority: Tier 2** | **Effort: Small** | **Backend: New**
Export any list view (candidates, applications, placements, analytics) to CSV or PDF. Frontend formatting + server-side generation for large datasets.

---

## AI & Matching

### Surface AI Matches to Recruiters

**Priority: Tier 1** | **Effort: Small** | **Backend: Ready**
The automation-service already generates candidate-job matches with scores. Surface these as suggestions on the recruiter dashboard and on individual job/candidate pages. Lowest-hanging fruit in the entire backlog.

### Job Description Optimization Suggestions

**Priority: Tier 3** | **Effort: Medium** | **Backend: New** (could use ai-service)
AI-powered suggestions to improve job postings: clarity, inclusivity, keyword optimization, competitive compensation benchmarking.

---

## Offer & Negotiation

### Offer Management Workflow

**Priority: Tier 2** | **Effort: Large** | **Backend: Partial**
Full offer lifecycle: create offer with details (salary, equity, benefits, start date), approval chain (hiring manager -> VP -> HR), send to candidate, track acceptance/counter/decline. Needs new offer entity or extension of application stage.

### Offer Templates

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Reusable offer templates per role type with standard compensation structures. Simple template CRUD.

### Offer Comparison (Candidate-Facing)

**Priority: Tier 3** | **Effort: Small** | **Backend: Ready**
When a candidate has multiple offers, side-by-side comparison of compensation, benefits, location, role. Candidate portal feature.

---

## Evaluation & Feedback

### Structured Scorecards

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
Per-role evaluation templates with scored criteria (technical skills, communication, culture fit). Interviewers fill in scorecards; hiring managers see aggregated scores. Needs scorecard_templates and scorecard_responses tables.

### Collaborative Candidate Review

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (application feedback threading exists)
Multiple team members comment, rate, and vote on candidates within the application view. Thumbs up/down, structured ratings, discussion threads.

### Blind Screening Mode

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Optional mode that hides candidate name, photo, and demographic info during initial screening. Reduces unconscious bias. Frontend masking only.

---

## Job Management

### Job Templates & Cloning

**Priority: Tier 2** | **Effort: Small** | **Backend: Partial**
Save a job as template or clone an existing job. Duplicate all fields except status. Simple "Clone" button + template library.

### Role Expiration & Renewal

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Auto-expire stale roles after configurable period. Send renewal reminders. Prevents dead listings from cluttering the marketplace.

### Featured / Priority Listings

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Allow companies to boost visibility of urgent roles. Could be tied to billing tier or a la carte purchase.

### Pre-Screen Questions (Better Surfacing)

**Priority: Tier 2** | **Effort: Small** | **Backend: Ready**
The backend already supports job pre-screen questions and answers (`/api/v2/job-pre-screen-*`). Needs to be more prominently integrated into the job creation wizard and candidate application flow.

---

## Financial & Billing

### Split Fee Calculator / Deal Modeler

**Priority: Tier 2** | **Effort: Small** | **Backend: Ready**
Interactive calculator: input salary, fee %, split ratio -> see projected earnings. Could live on role detail page or as a standalone tool. Uses existing fee structure data.

### Invoice Generation

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (placement-invoices endpoint exists)
Generate professional PDF invoices for placements. The backend has `/api/v2/placement-invoices` but needs frontend exposure and PDF rendering.

### Tax Document Support (1099)

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Year-end tax document generation for independent recruiter payouts. Important for US-based recruiters.

### Fee Dispute Resolution Workflow

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (escrow holds exist)
Structured dispute process: flag issue -> review -> resolution. The escrow hold system provides the financial mechanism; needs a user-facing dispute flow.

---

## Compliance & Governance

### EEO / Diversity Reporting

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Optional demographic tracking (self-reported by candidates) with anonymized aggregate reporting. For enterprise companies with EEOC/OFCCP requirements.

### Multi-Stage Approval Workflows

**Priority: Tier 3** | **Effort: Large** | **Backend: New**
Configurable approval chains for job postings, offers, and budget. "Submit for approval" flow where designated approvers must sign off before action takes effect.

### SLA Tracking for Recruiter Assignments

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (assignments have timestamps)
Track time-to-first-submission, response rates, and compliance with agreed service levels. Alert companies when SLAs are at risk.

### Custom Fields on Entities

**Priority: Tier 3** | **Effort: Large** | **Backend: New**
Company-configurable custom fields on jobs, candidates, and applications ("clearance level", "visa status", "internal req number"). Requires a flexible schema approach (JSONB or EAV pattern).

---

## Profile & Marketplace

### Recruiter Certifications & Credentials

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Section on recruiter profile to showcase certifications (AIRS, LinkedIn Recruiter, industry certifications). Builds trust in marketplace.

### Placement Track Record Display

**Priority: Tier 2** | **Effort: Small** | **Backend: Ready**
Show placement count, success rate, and industry focus prominently on recruiter marketplace profiles. Data exists in placements; needs aggregation and display.

### Testimonials & Reviews

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (reputation system exists)
Companies leave reviews for recruiters after placements. Visible on marketplace profile. Extends existing reputation system.

### Profile Strength Indicator

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Clear guidance on what improves profile completeness and marketplace ranking. Progress bar with actionable suggestions.

---

## Platform UX

### In-App Onboarding & Guided Tours

**Priority: Tier 2** | **Effort: Medium** | **Backend: New**
First-time user experience: step-by-step walkthrough of key features, contextual tooltips, "getting started" checklist. Track onboarding completion per user.

### Notification Preferences

**Priority: Tier 2** | **Effort: Medium** | **Backend: Partial** (notification templates exist)
User-configurable preferences: which categories to receive, delivery channels (in-app, email, SMS), frequency/digest settings. Currently marked "Coming Soon" in the profile page.

### Dashboard Customization / Widgets

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Drag-and-drop dashboard widgets. Choose which metrics, charts, and quick-links appear. Save layout per user.

### Keyboard Shortcuts

**Priority: Tier 3** | **Effort: Small** | **Backend: N/A**
Power-user shortcuts: navigate sections, open search, quick-create entities, bulk select. Frontend-only.

### Audit Trail for Non-Admins

**Priority: Tier 3** | **Effort: Small** | **Backend: Partial** (activity logs exist in admin)
Surface entity-specific activity history to company admins: "Who moved this candidate?", "When was this job edited?" Scoped view of existing admin activity data.

### Bulk Actions Across All Lists

**Priority: Tier 2** | **Effort: Medium** | **Backend: Partial**
Multi-select + batch operations on any list view: bulk stage changes, bulk status updates, bulk export, bulk message. Standard pattern to implement across candidates, applications, jobs.

---

## Integrations

### Email Sync (Gmail / Outlook)

**Priority: Tier 3** | **Effort: Large** | **Backend: New**
Two-way email sync so messages sent outside the platform are captured on candidate records. Requires OAuth + email API integration.

### Slack / Teams Notifications

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Push key notifications (new application, stage change, new message) to Slack channels or Teams. Webhook-based integration.

### Background Check Integration

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
Trigger background checks from within the application flow (Checkr, Sterling, GoodHire). Track status inline.

### Calendar Tool Integration (Calendly, etc.)

**Priority: Tier 3** | **Effort: Small** | **Backend: New**
Embed scheduling links or integrate with Calendly/Cal.com for simpler interview scheduling (lighter weight than full calendar sync).

---

## Candidate Portal Improvements

### Job Alerts & Recommendations

**Priority: Tier 3** | **Effort: Medium** | **Backend: Partial** (AI matching exists)
Notify candidates when new matching roles are posted. Recommend roles based on profile/skills. Leverage existing AI matching.

### One-Click Apply / Smart Form Pre-Fill

**Priority: Tier 3** | **Effort: Small** | **Backend: Ready**
Pre-fill application fields from candidate profile. Reduce friction from repeated data entry across applications.

### Interview Feedback Visibility

**Priority: Tier 3** | **Effort: Small** | **Backend: Partial** (feedback exists)
Share appropriate feedback with candidates after interviews. Configurable by company (full feedback, summary only, or none).

### Application Withdrawal

**Priority: Tier 3** | **Effort: Small** | **Backend: Ready** (status change to withdrawn)
Allow candidates to self-withdraw from applications. The withdrawn status exists; needs a candidate-facing button.

### Post-Hire Onboarding Tracking

**Priority: Tier 3** | **Effort: Medium** | **Backend: New**
After placement: start date tracking, document collection checklist, background check status, first-day preparation. Natural extension of placement tracking.

---

## Backend Quick Wins (Already Built, Need Frontend)

These are the lowest-effort items - the API already exists:

| Task                               | API Ready At                        | What's Needed                                 |
| ---------------------------------- | ----------------------------------- | --------------------------------------------- |
| Surface AI matches to recruiters   | `automation-service/v2/matches`     | Dashboard widget + job/candidate page section |
| Pre-screen questions in job wizard | `ats-service/v2/job-pre-screen-*`   | Add step to job creation flow                 |
| Chat presence indicators           | `chat/v2/presence`                  | Online/offline dots in conversation list      |
| Chat file attachments              | `chat/v2/attachments/*`             | Attachment button in message composer         |
| Chat block/report users            | `chat/v2/blocks`, `chat/v2/reports` | Menu items in conversation header             |
| Return application to draft        | `applications/:id/return-to-draft`  | Button in application detail view             |
| Placement track record on profile  | Derived from `placements` data      | Aggregation + profile section                 |
| Split fee calculator               | Derived from `jobs` fee data        | Interactive calculator component              |
| Marketplace health metrics         | `analytics/v2/marketplace-metrics`  | Admin or public dashboard widget              |
| Proposal analytics                 | `analytics/v2/proposal-stats`       | Recruiter dashboard chart                     |
| Discount/promo codes               | `billing/v2/discounts`              | Admin UI + checkout flow integration          |
| Sourcer protection visibility      | `ats-service/company-sourcers`      | Company admin UI section                      |
