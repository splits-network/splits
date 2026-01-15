
# Splits Network – Navigation by Persona (Phase 1)

This document describes the navigation and available pages for each primary user persona in Splits Network, focusing on Phase 1 functionality.

Personas:

- Recruiter
- Company Admin / Hiring Manager
- Platform Admin

Each section includes a simple diagram-style tree (Mermaid) and a short description of what the persona can *see* vs *do* on each page.

---

## 1. Recruiter Navigation

**High-level idea**  
Recruiters live in “my roles, my candidates, my placements.”  
Admin tools are hidden, company configuration is hidden.

```mermaid
graph TD
  R[Recruiter] --> RD[Dashboard]
  R --> RR[Roles]
  RR --> RR_L[Roles List]
  RR --> RR_D[Role Detail & Pipeline]

  R --> RC[Candidates]
  RC --> RC_L[My Candidates List]
  RC --> RC_D[Candidate Detail]

  R --> RP[Placements]
  RP --> RP_L[My Placements & Earnings]

  R --> RS[Settings]
  RS --> RS_P[Profile & Notifications]
  RS --> RS_B[Billing Shortcuts (optional)]
```

### 1.1 Pages & Capabilities – Recruiter

#### Dashboard
- **See**
  - Number of active roles assigned to this recruiter.
  - Number of in-process candidates.
  - Recent activity (stage changes involving this recruiter’s candidates).
- **Do**
  - Navigate to relevant roles, candidates, or placements via quick links.

#### Roles
- **Roles List**
  - **See**
    - All roles assigned to the recruiter (via `network-service` role assignments).
    - Columns: Role title, Company, Location, Fee %, Status, Opened date.
  - **Do**
    - Filter by status, company.
    - Open role detail.

- **Role Detail & Pipeline**
  - **See**
    - Job details: title, company, location, salary range, fee %, status.
    - Candidate pipeline for this role (all candidates, with stage and last activity).
  - **Do**
    - Submit new candidate to this role (if assigned).
    - Open candidate detail.
    - Add notes if allowed (Phase 1 minimal notes).

#### Candidates
- **My Candidates List**
  - **See**
    - All candidates this recruiter has submitted (across all roles).
  - **Do**
    - Open candidate detail.

- **Candidate Detail**
  - **See**
    - Candidate profile: name, email, LinkedIn, notes.
    - History of submissions (roles this recruiter has submitted them to, in Phase 1 context).
  - **Do**
    - Edit recruiter-specific notes.

#### Placements
- **My Placements & Earnings**
  - **See**
    - List of placements attributed to this recruiter.
    - Role, Company, Candidate, Hired date, Salary, Fee amount, Recruiter share.
    - Simple summaries: lifetime total, last 30 days, this year.
  - **Do**
    - Filter by date range (Phase 1 basic).

#### Settings
- **Profile & Notifications**
  - **See**
    - Current display name, contact email, basic notification preferences.
  - **Do**
    - Update profile fields and preferences (where allowed; auth handled via Clerk).

- **Billing Shortcuts (Optional / Later)**
  - **See**
    - Current subscription status (from `billing-service`).
  - **Do**
    - Click “Manage subscription” to open Stripe customer portal or dedicated billing page.

---

## 2. Company Admin / Hiring Manager Navigation

**High-level idea**  
Company users own **roles and pipelines**, not subscriptions or network-level configuration.  
They do not see recruiter earnings; they focus on hires and role progress.

```mermaid
graph TD
  C[Company Admin / Hiring Manager] --> CD[Dashboard]
  C --> CR[Roles]
  CR --> CR_L[Company Roles List]
  CR --> CR_D[Role Detail & Pipeline]

  C --> CC[Candidates]
  CC --> CC_L[All Candidates for Company]
  CC --> CC_D[Candidate Detail]

  C --> CP[Placements]
  CP --> CP_L[Company Placements]

  C --> CS[Company Settings]
  CS --> CS_INFO[Company Profile]
  CS --> CS_TEAM[Team Members (later)]
```

### 2.1 Pages & Capabilities – Company Users

#### Dashboard
- **See**
  - Total active roles for the company.
  - Candidates in process (across all roles).
  - Recent hires and recent activity.
- **Do**
  - Navigate quickly into “stuck” roles or roles with many candidates.

#### Roles
- **Company Roles List**
  - **See**
    - All roles owned by this company.
    - Columns: Title, Location, Department, Status, Opened date, Candidates in process.
  - **Do**
    - Create new role.
    - Pause/activate role.
    - Open role detail.

- **Role Detail & Pipeline**
  - **See**
    - Job details and full candidate pipeline (submitted by any recruiter).
    - Candidate stages: Submitted, Screen, Interview, Offer, Hired/Rejected.
  - **Do**
    - Move candidates between stages.
    - Add simple notes (internal/hiring-team view).
    - Mark a candidate as “Hired” and input final salary (trigger placement creation).

#### Candidates
- **All Candidates for Company**
  - **See**
    - All candidates attached to this company’s roles.
  - **Do**
    - Filter by role, stage, recruiter.
    - Open candidate detail.

- **Candidate Detail**
  - **See**
    - Candidate profile and applications within this company.
    - Notes and stage history for each application.
  - **Do**
    - Add company-side notes (feedback, interview impressions).

#### Placements
- **Company Placements**
  - **See**
    - All hires for this company.
    - Role, Candidate, Hired date, Salary, Total placement fee.
  - **Do**
    - Filter by date range, role, recruiter.

#### Company Settings
- **Company Profile**
  - **See**
    - Company name, logo, basic contact info.
  - **Do**
    - Update company metadata.

- **Team Members (Later Phase)**
  - **See**
    - List of internal hiring managers using the platform for this company.
  - **Do**
    - Invite/remove team members, set internal permissions (deferred past Phase 1 if needed).

---

## 3. Platform Admin Navigation

**High-level idea**  
Admins get the “operator console”: global view of roles, recruiters, companies, placements, and basic configuration (plans, approvals).

```mermaid
graph TD
  A[Platform Admin] --> AD[Dashboard]
  A --> AR[Roles]
  AR --> AR_L[All Roles]
  AR --> AR_D[Role Detail & Pipeline]

  A --> AN[Recruiters]
  AN --> AN_L[Recruiter Directory]
  AN --> AN_D[Recruiter Detail]

  A --> AC[Companies]
  AC --> AC_L[Company Directory]
  AC --> AC_D[Company Detail]

  A --> AP[Placements]
  AP --> AP_L[All Placements]

  A --> AB[Billing & Plans]
  AB --> AB_PL[Plans Config]
  AB --> AB_SUB[Subscriptions Overview]

  A --> AS[System Settings]
  AS --> AS_ACCESS[Access & Approvals]
  AS --> AS_EVENTS[Event / Queue Health (later)]
```

### 3.1 Pages & Capabilities – Platform Admin

#### Dashboard
- **See**
  - Global counts: active roles, active recruiters, total submissions, interviews, hires in last N days.
  - Recent placements and key activity indicators.
  - Shortcuts to “needs attention” items (pending recruiter approvals, stalled roles).

#### Roles
- **All Roles**
  - **See**
    - All roles across all companies.
  - **Do**
    - Filter by company, status, age.
    - Open role detail.
- **Role Detail & Pipeline**
  - **See**
    - Same view as company pipeline plus metadata about assigned recruiters.
  - **Do**
    - Assign/unassign recruiters to/from this role.
    - Override status (force close/fill in edge cases).

#### Recruiters
- **Recruiter Directory**
  - **See**
    - All recruiters, with status: pending, active, suspended.
    - High-level metrics: submissions, interviews, hires.
  - **Do**
    - Filter/search by name, email, performance.

- **Recruiter Detail**
  - **See**
    - Recruiter profile, assigned roles, placements, performance summary.
  - **Do**
    - Approve or reject recruiter application.
    - Suspend/reactivate recruiter.
    - Adjust internal flags (e.g., priority tier, max roles; later phase).

#### Companies
- **Company Directory**
  - **See**
    - All client companies.
    - Basic info and usage metrics (roles, hires).
  - **Do**
    - Filter/search companies.

- **Company Detail**
  - **See**
    - Company profile, roles, placements, assigned account manager (if any).
  - **Do**
    - Update company metadata.
    - Mark company as “design partner” or similar internal flags.

#### Placements
- **All Placements**
  - **See**
    - Global placement ledger.
    - Role, Company, Candidate, Recruiter, Salary, Total Fee, Platform share, Recruiter share.
  - **Do**
    - Filter by company, recruiter, date range.
    - Export data (later / Phase 2).

#### Billing & Plans
- **Plans Config**
  - **See**
    - Defined recruiter plans and pricing.
  - **Do**
    - Add/edit plans, update Stripe price IDs (carefully).

- **Subscriptions Overview**
  - **See**
    - Active, trialing, canceled subscriptions per recruiter.
  - **Do**
    - Drill into a recruiter’s subscription for support purposes.

#### System Settings
- **Access & Approvals**
  - **See**
    - Queues of pending recruiter accounts, flagged companies, etc.
  - **Do**
    - Approve/deny, suspend/unsuspend, manage basic feature flags (later).

- **Event / Queue Health (Later Phase)**
  - **See**
    - Health of RabbitMQ consumers, notification-service status.
  - **Do**
    - Trigger basic diagnostics or retries (beyond Phase 1).

---

## 4. Summary – Persona-to-Nav Mapping

- **Recruiter**
  - Dashboard, Roles (assigned only), My Candidates, My Placements, Settings.
- **Company Admin / Hiring Manager**
  - Dashboard, Company Roles, Company Candidates, Company Placements, Company Settings.
- **Platform Admin**
  - Global Dashboard, All Roles, Recruiters, Companies, All Placements, Billing & Plans, System Settings.

This structure keeps each persona’s world tightly scoped:

- Recruiters focus on **their pipeline and earnings**.
- Companies focus on **their roles and hires**.
- Admins focus on **the network as a whole**.

It’s also straightforward to translate into `apps/portal/app/**` routes and role-based access checks in `api-gateway`.
