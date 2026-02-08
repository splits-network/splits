# Portal Feature Gap Analysis

> Comprehensive audit of the Splits Network portal from the perspective of a **recruiter** and a **company admin**, identifying missing features that would meaningfully improve their workflows, retention, and competitive positioning against tools like Crelate, Bullhorn, JobAdder, and marketplace platforms like Hired/Vettery.
>
> _Generated: February 2026_

---

## What Exists Today (Summary)

The portal has solid fundamentals: job/candidate/application CRUD, multi-view listings (browse/table/grid), real-time messaging, placement tracking with split calculations, a recruiter marketplace, billing/subscriptions, notifications, and a comprehensive admin panel. The backend is actually more capable than the frontend surfaces.

---

## Missing Features - Recruiter Perspective

### 1. Candidate Pipeline / Kanban Board

**Impact: HIGH** | Applications have stages but there's no drag-and-drop kanban view. Every modern ATS has this. Recruiters live in pipeline views - being able to drag a candidate from "Screen" to "Interview" is table stakes. The data model supports it; the UI doesn't.

### 2. Task & Reminder System

**Impact: HIGH** | No way to set follow-up reminders ("Call Sarah on Thursday", "Check in with Acme Corp about offer"). Recruiters juggle dozens of concurrent workflows. Without tasks/reminders, they'll keep a separate tool open, reducing stickiness.

### 3. Candidate Tags, Lists & Talent Pools

**Impact: HIGH** | No tagging system, no "hot lists," no curated talent pools. Recruiters build niche candidate shortlists (e.g., "Senior Go Engineers - Bay Area") and reuse them across roles. This is a core differentiator for recruiting tools.

### 4. Email Templates & Sequences

**Impact: HIGH** | Messaging exists but there are no templates, no sequences, no drip campaigns. Recruiters send the same outreach dozens of times daily. Without templates, every message is typed from scratch.

### 5. Candidate Notes & Activity Timeline

**Impact: MEDIUM-HIGH** | Application-level feedback exists, but there's no unified activity timeline on a candidate record showing every touchpoint across all jobs - calls, emails, stage changes, notes. This is how recruiters build candidate relationships over time.

### 6. Resume Parsing & Auto-Fill

**Impact: MEDIUM-HIGH** | Candidates can be created and documents uploaded, but there's no resume parser to auto-extract name, title, company, skills, experience into the profile. Manual data entry is a dealbreaker at scale.

### 7. Earnings & Commission Dashboard

**Impact: MEDIUM-HIGH** | Placements track splits, but there's no dedicated earnings dashboard showing: total earned this month/quarter/year, pending payouts, projected pipeline value, earnings by company. Recruiters are motivated by money - show them the money.

### 8. AI Match Suggestions (Surfaced to Recruiters)

**Impact: MEDIUM-HIGH** | The backend has a full AI matching engine (`automation-service/matches`, `ai-service/ai-reviews`), but it's not surfaced to recruiters proactively. Imagine: "3 candidates in your pool match this new role" or "This candidate fits 5 open roles." The intelligence exists but is admin-only.

### 9. Advanced Search / Boolean Search

**Impact: MEDIUM** | Current search is basic text matching. Recruiters need boolean search ("Java AND (AWS OR GCP) NOT junior"), saved searches, and search alerts ("notify me when a candidate matching X is added").

### 10. Bulk Actions

**Impact: MEDIUM** | No bulk email, bulk stage changes, bulk tagging, or bulk exports. When a recruiter wants to move 15 candidates to "interview" or send a bulk rejection, they must do it one by one.

### 11. Split Fee Calculator / Deal Modeler

**Impact: MEDIUM** | Before submitting a candidate, recruiters want to preview: "If this candidate gets hired at $150K with a 20% fee and a 50/50 split, I earn $15K." No calculator exists to model this pre-submission.

### 12. Duplicate Candidate Detection

**Impact: MEDIUM** | No dedup logic when creating candidates. Two recruiters can add the same person, creating ownership disputes. The backend has ownership audit, but preventing dupes upfront is better.

### 13. Reporting & Data Export

**Impact: MEDIUM** | No CSV/PDF export anywhere. No custom reports. Recruiters need to report to their agencies/firms on pipeline activity, placements, and revenue. Currently they'd have to screenshot the UI.

### 14. Sourcing Attribution & Channel Tracking

**Impact: MEDIUM-LOW** | No tracking of where candidates come from (LinkedIn, referral, job board, inbound). This data is critical for recruiters to optimize their sourcing strategy.

### 15. Quick Actions / Global Search

**Impact: MEDIUM-LOW** | No cmd+K universal search. No quick-action shortcuts. Power users want to jump to any candidate, job, or company instantly without navigating through menus.

---

## Missing Features - Company Admin Perspective

### 16. Interview Scheduling & Calendar

**Impact: HIGH** | Zero calendar integration. No availability sharing, no interview slot booking, no Google/Outlook sync. Companies coordinate interviews across multiple stakeholders - doing this outside the platform is a major friction point.

### 17. Structured Scorecards & Evaluation Forms

**Impact: HIGH** | No way to create evaluation rubrics for interviewers. Hiring managers need standardized scorecards per role ("Rate technical skills 1-5, communication 1-5"). Without this, feedback is unstructured text at best.

### 18. Hiring Analytics & Funnel Reporting

**Impact: HIGH** | The dashboard has basic stats, but no: time-to-hire, time-in-stage, conversion rates by stage, source-of-hire analysis, cost-per-hire, recruiter comparison. The analytics endpoints exist on the backend (`/api/v2/stats`, `/api/v2/charts`) but the frontend barely uses them.

### 19. Offer Management & Approval Workflow

**Impact: HIGH** | The application can be moved to "offer" stage, but there's no actual offer management: no offer letter generation, no approval chain (hiring manager -> VP -> HR), no offer comparison, no candidate response tracking.

### 20. Job Templates & Cloning

**Impact: MEDIUM-HIGH** | Companies hire for the same roles repeatedly. No ability to save a job as a template or clone an existing job. Every "Senior Software Engineer" posting is built from scratch.

### 21. Recruiter Performance Scoreboard

**Impact: MEDIUM-HIGH** | Companies work with multiple recruiters but can't compare them side-by-side: submission quality (interview-to-offer ratio), speed (time-to-submit), volume, placement success rate. The reputation system exists in admin but isn't surfaced to company admins.

### 22. SLA & Recruiter Accountability Tracking

**Impact: MEDIUM** | No service-level tracking. Companies can't monitor: "Recruiter X was assigned 5 days ago and hasn't submitted anyone" or "Average time from assignment to first submission is 12 days." This is how companies decide which recruiters to keep working with.

### 23. Compliance & EEO Reporting

**Impact: MEDIUM** | No diversity tracking, no EEOC reporting, no OFCCP compliance features. For enterprise companies, this is a hard requirement. Even basic demographic tracking with anonymized reporting would be valuable.

### 24. Hiring Budget & Cost Tracking

**Impact: MEDIUM** | No department-level hiring budget management. Companies want to track: "We budgeted $200K in recruiting fees this quarter, we've spent $80K, $40K is in pipeline."

### 25. Custom Fields on Entities

**Impact: MEDIUM** | No ability to add custom fields to jobs, candidates, or applications. Every company has unique data needs ("clearance level", "visa status", "internal req number"). Without custom fields, the platform can't adapt to enterprise workflows.

### 26. Multi-Stage Approval Workflows

**Impact: MEDIUM** | No configurable approval chains for job postings, offers, or budget. A hiring manager creates a job, but there's no "submit for approval" flow where a VP or HR must approve before it goes live.

### 27. Candidate Experience & Feedback

**Impact: MEDIUM-LOW** | No candidate NPS surveys, no automated rejection emails with personalized feedback, no candidate portal experience tracking. The candidate-facing portal exists but is minimal.

### 28. Onboarding Handoff

**Impact: MEDIUM-LOW** | Placement tracking ends at "hired." No handoff to onboarding: start date tracking, document collection, background check status, first-day preparation. This is the natural next step after a placement.

---

## Missing Features - Both Perspectives

### 29. Global Search (Cmd+K)

**Impact: HIGH** | No universal search across candidates, jobs, companies, applications, and conversations. Users must navigate to each section and search independently. A spotlight-style search would dramatically improve UX.

### 30. Dashboard Customization / Widgets

**Impact: MEDIUM** | Fixed dashboards with no personalization. Recruiters and company admins have different priorities - let them choose which metrics, charts, and quick-links appear on their dashboard.

### 31. In-App Onboarding & Guided Tours

**Impact: MEDIUM** | Comprehensive docs exist at `/public/documentation` but nothing in-app. First-time users see a dashboard with no guidance. Contextual tooltips, feature walkthroughs, and "getting started" checklists would reduce churn.

### 32. Notification Preferences & Channels

**Impact: MEDIUM** | The notification center exists, but preferences are "Coming Soon." Users can't control what they're notified about or how (in-app, email, SMS). This is basic table stakes for any notification system.

### 33. File/Document Management Improvements

**Impact: MEDIUM-LOW** | Documents can be uploaded but there's no folder organization, no version history, no document signing integration (DocuSign/HelloSign), and no shared document library.

### 34. Audit Trail for Non-Admins

**Impact: MEDIUM-LOW** | Activity logging exists in admin but company admins can't see an audit trail of actions taken on their jobs, candidates, and applications. "Who moved this candidate to rejected?" is a common question.

### 35. Dark Mode / Theme Customization

**Impact: LOW** | No theme toggle. Minor but increasingly expected.

---

## Backend Capabilities Already Built But Not Surfaced

These represent the **lowest-hanging fruit** - the API already supports them:

| Backend Feature                | API Location                            | Frontend Gap                                  |
| ------------------------------ | --------------------------------------- | --------------------------------------------- |
| AI Match Suggestions           | `automation-service/v2/matches`         | Not shown to recruiters, admin-only           |
| Application Feedback Threading | `ats-service/applications/:id/feedback` | Exists but may be underutilized               |
| Pre-Screen Questions           | `ats-service/v2/job-pre-screen-*`       | Job creation doesn't prominently surface this |
| Sourcer Protection Windows     | `ats-service/company-sourcers`          | Not visible in company admin UI               |
| Proposal Stats                 | `analytics/v2/proposal-stats`           | Not surfaced in recruiter dashboard           |
| Marketplace Metrics            | `analytics/v2/marketplace-metrics`      | Not surfaced anywhere                         |
| Chat Presence (Online/Offline) | `chat/v2/presence`                      | Backend ready, unclear if UI shows status     |
| Chat Attachments               | `chat/v2/attachments/*`                 | May not be fully surfaced in message UI       |
| Chat Block/Report              | `chat/v2/blocks`, `chat/v2/reports`     | May not be in user-facing UI                  |
| Discount Codes                 | `billing/v2/discounts`                  | Admin-only, not surfaced for promos           |
| Stripe Connect                 | `billing/v2/connect`                    | Recruiter payout onboarding flow unclear      |
| Return to Draft                | `applications/:id/return-to-draft`      | May not have UI button                        |

---

## Priority Recommendations

### Tier 1 - Ship These First (Competitive Necessity)

1. **Kanban Pipeline View** (#1) - Visual pipeline is expected in every ATS
2. **Global Search / Cmd+K** (#29) - UX multiplier across everything
3. **Interview Scheduling** (#16) - Major workflow gap
4. **AI Match Surfacing to Recruiters** (#8) - Low effort, high value (backend exists)
5. **Hiring Analytics & Funnels** (#18) - Backend exists, needs frontend

### Tier 2 - Ship These Next (Differentiation)

6. **Task & Reminders** (#2) - Keeps users in-platform
7. **Candidate Tags & Talent Pools** (#3) - Core recruiter workflow
8. **Email Templates** (#4) - Messaging efficiency
9. **Structured Scorecards** (#17) - Enterprise expectation
10. **Earnings Dashboard** (#7) - Recruiter motivation & retention

### Tier 3 - Polish & Scale

11. Offer Management (#19)
12. Job Templates (#20)
13. Recruiter Performance Scoreboard (#21)
14. Notification Preferences (#32)
15. Resume Parsing (#6)
16. Bulk Actions (#10)
17. Reporting & Export (#13)
