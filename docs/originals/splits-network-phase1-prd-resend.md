
# Splits Network – Phase 1 PRD (Split-First ATS)

## 1. Overview

### 1.1 Product
Splits Network is a split-fee recruiting marketplace and platform where:

- Companies post roles that need to be filled.
- Independent recruiters join the network and submit candidates to those roles.
- When a candidate is hired, the placement fee is split between the company’s recruiting partner(s) and the platform.

Phase 1 focuses on delivering a split-first Applicant Tracking System (ATS) and basic network mechanics that enable real placements, tracked accurately end-to-end.

### 1.2 Phase 1 Goal
Enable real design-partner recruiters and companies to:

1. Operate split roles through Splits Network from job creation to hire.
2. Track candidate submissions, stages, and outcomes.
3. Log placement fees and recruiter payouts in a transparent way.
4. Gate access with basic subscriptions for recruiters.

This phase should be usable in production by a small set of design partners and form the foundation for later features (reputation, payouts, shared pools, outreach, etc.).

### 1.3 Non-Goals (Phase 1)
These are explicitly out of scope for Phase 1:

- AI assistance (deal copilot, recommendations, etc.).
- Outreach engine (bulk email campaigns, sequences).
- Browser extension.
- Shared talent pools and royalties.
- Full analytics dashboards and advanced reporting.
- Escrow / Stripe Connect marketplace payouts.
- Public job board and candidate self-service portal.
- Micro-networks / white-labeled hubs.

These may be mentioned in the data model or event structure for future compatibility, but they are not required to be implemented or exposed in the UI.

---

## 2. Personas & Use Cases

### 2.1 Personas

1. **Recruiter (Network Partner)**
   - Independent or agency recruiter who joins Splits Network to access roles and earn placement fees.
   - Needs to see assigned roles, submit candidates, track stages, and view their historical placements and earnings.

2. **Company Admin / Hiring Manager**
   - Represents a client company that has roles to fill.
   - Needs to create roles, see candidate pipelines, and mark hires.

3. **Platform Admin (Splits Network Operator)**
   - Internal admin responsible for running the network.
   - Needs to approve recruiters, assign roles, resolve issues, and view global activity.

### 2.2 Core Phase 1 Use Cases

1. Recruiter signs in and views the roles they can work.
2. Recruiter submits a candidate to a role.
3. Recruiter and company view the pipeline (stages and candidate status).
4. Company (or admin) moves candidates through stages to hired or rejected.
5. On hire, the platform records the placement, salary, fee amount, and recruiter split.
6. Recruiter sees their placement and payout history.
7. Admin sees global overview of roles, candidates, and placements.
8. Recruiter subscription status controls access (basic gating).

---

## 3. Scope – Functional Requirements

### 3.1 Apps & Services Overview

Monorepo structure (conceptual):

- `apps/`
  - `portal/` – main authenticated app for recruiters and company users (Next.js 16, App Router, DaisyUI).
- `services/`
  - `api-gateway/` – public HTTP entrypoint that fronts all backend services.
  - `identity-service/` – users, organizations, memberships (Clerk integration).
  - `ats-service/` – companies, jobs, candidates, applications, stages, placements.
  - `network-service/` – recruiters, role assignments, minimal performance stats.
  - `billing-service/` – plans, subscriptions, Stripe integration.
  - `notification-service/` – email notifications powered by Resend.
- `packages/` – shared types, config, logging, Fastify helpers, service clients, etc.

All backend services are Fastify-based Node.js services, deployed as separate pods in Kubernetes. Supabase Postgres is used as the database, with separate schemas per service.

Clerk is used for auth. Stripe is used for subscriptions. Resend is used for transactional email delivery.

---

### 3.2 apps/portal – Phase 1 UX

#### 3.2.1 Navigation

- Left sidebar:
  - Dashboard
  - Roles
  - Candidates
  - Placements
  - (Admin only) Admin
- Top bar:
  - Org switcher (if applicable)
  - User menu (profile, sign out)
  - Subscription status indicator (for recruiters)

#### 3.2.2 Recruiter Experience

**Dashboard (Recruiter)**

- Summary cards:
  - Active roles assigned to me
  - Candidates in process
  - Offers / Hires this month
- Recent activity list:
  - Last N stage changes involving the recruiter’s candidates.

**Roles List**

- Table of roles recruiter can see/work:
  - Columns: Role title, Company, Location, Fee %, Status (Active/Paused/Filled), Opened date.
  - Filters: Status, Company.
  - Action: View role details.

**Role Detail & Pipeline View**

- Role header:
  - Title, Company, Location, Fee %, Salary range, Status.
- Candidate pipeline:
  - List of candidate rows with stage, last activity, owner recruiter.
  - Stage displayed via pill (Submitted, Screen, Interview, Offer, Hired/Rejected).
- Actions:
  - Submit new candidate (for recruiters assigned to the role).
  - View candidate details.

**Submit Candidate Flow**

- Form:
  - Candidate full name (required)
  - Email (required)
  - LinkedIn URL (optional)
  - Resume upload (optional for Phase 1 if needed; can be deferred)
  - Notes (freeform text)
- On submit:
  - Creates candidate (if not existing) and application to the role in `ats-service`.
  - Stage is set to “Submitted”.
  - Application is associated with submitting recruiter (via `network-service`).

**Candidate Detail (Recruiter)**

- Profile information:
  - Name, email, LinkedIn, notes.
- Applications:
  - List of roles for which this candidate has been submitted (Phase 1 can be limited to a simple list).
- Activity log (Phase 1 basic):
  - Stage changes and timestamps.

**Placements & Earnings (Recruiter)**

- List of placements attributed to the recruiter:
  - Role, Company, Candidate, Hired date, Salary, Fee amount, Recruiter share.
- Simple earnings summary:
  - Lifetime total.
  - Last 30 days.
  - This year.

#### 3.2.3 Company / Hiring Manager Experience

**Roles Management**

- Create role:
  - Title, Department, Location, Salary range, Fee %, Description, Status (defaults to Active).
- View pipelines similar to recruiters, but can move stages and mark hires.

**Stage Management**

- For each candidate in a role, company users can:
  - Change stage (Submitted, Screen, Interview, Offer, Hired, Rejected).
  - Add simple notes.

**Hire Flow**

- When marking a candidate as “Hired”:
  - Prompt for:
    - Final salary (required)
    - Confirmation of fee % (default from role)
  - Triggers creation of placement in `ats-service` and `ats.placements`.

#### 3.2.4 Admin Experience

**Admin Overview**

- View all roles with filters (status, company, recruiter).
- View all recruiters and their basic stats (submissions, hires).

**Role Assignment**

- Assign/unassign recruiters to roles.
- Control which roles each recruiter can see.

**Placement Audit View**

- Admin table of all placements:
  - Role, company, candidate, recruiter(s), salary, fee, platform share, recruiter share.

Phase 1 does not require full dispute handling or advanced performance analytics, only basic visibility and control.

---

### 3.3 services/api-gateway – Responsibilities

**Responsibilities**

- Public entrypoint for all API requests from `apps/portal`.
- Validates Clerk JWT, extracts user identity, and resolves org context.
- Routes requests to backend services:
  - `identity-service`, `ats-service`, `network-service`, `billing-service`.
- Applies authorization checks at a coarse level (role/tenant).

**Phase 1 Requirements**

- JWT verification middleware (Clerk).
- Basic rate limiting (Redis-based if feasible).
- Endpoint routing (minimal aggregation in this phase; can proxy mostly 1:1).

Example routes (conceptual):

- `GET /me` → identity-service
- `GET /roles` → ats-service + network-service (for recruiter scoping)
- `POST /roles` → ats-service (company/admin users only)
- `POST /roles/:id/submissions` → ats-service + network-service attribution
- `GET /placements` → ats-service
- `GET /subscriptions/me` → billing-service

The exact shape will be refined in API design, but the gateway must own auth and tenant resolution.

---

### 3.4 services/identity-service – Responsibilities

**Responsibilities**

- Synchronize Clerk users into internal user records.
- Maintain organizations and memberships (user roles per org).

**Data Model (Phase 1)**

- `identity.users`
  - `id` (UUID, PK)
  - `clerk_user_id` (string, unique)
  - `email`
  - `name`
  - `created_at`, `updated_at`
- `identity.organizations`
  - `id` (UUID, PK)
  - `name`
  - `type` (e.g., `company`, `platform`)
  - `created_at`, `updated_at`
- `identity.memberships`
  - `id` (UUID, PK)
  - `user_id` (FK → users)
  - `organization_id` (FK → organizations)
  - `role` (e.g., `recruiter`, `company_admin`, `hiring_manager`, `platform_admin`)
  - `created_at`, `updated_at`

**Key Endpoints**

- `GET /me`
  - Returns user profile and memberships.
- `POST /sync-clerk-user`
  - Internal endpoint used by gateway to ensure user exists.

Phase 1 can create organizations manually or via simple flows; complex multi-org scenarios are not required yet.

---

### 3.5 services/ats-service – Responsibilities

**Responsibilities**

- Core ATS data and operations:
  - Companies (optionally mirrored or referenced from identity).
  - Jobs/roles.
  - Candidates.
  - Applications (candidate ↔ job).
  - Stages and status.
  - Placements.

**Data Model (Phase 1)**

- `ats.companies`
  - `id` (UUID, PK)
  - `identity_organization_id` (optional FK to identity.organizations)
  - `name`
  - `created_at`, `updated_at`
- `ats.jobs`
  - `id` (UUID, PK)
  - `company_id` (FK → companies)
  - `title`
  - `department`
  - `location`
  - `salary_min`, `salary_max`
  - `fee_percent`
  - `status` (`active`, `paused`, `filled`)
  - `created_at`, `updated_at`
- `ats.candidates`
  - `id` (UUID, PK)
  - `full_name`
  - `email`
  - `linkedin_url`
  - `created_at`, `updated_at`
- `ats.applications`
  - `id` (UUID, PK)
  - `candidate_id` (FK → candidates)
  - `job_id` (FK → jobs)
  - `submitted_by_recruiter_id` (FK → network.recruiters or recruiter profile ID)
  - `stage` (`submitted`, `screen`, `interview`, `offer`, `hired`, `rejected`)
  - `status` (`open`, `closed`)
  - `created_at`, `updated_at`
- `ats.notes` (minimal Phase 1)
  - `id` (UUID, PK)
  - `application_id` (FK → applications)
  - `author_user_id`
  - `body`
  - `created_at`
- `ats.placements`
  - `id` (UUID, PK)
  - `application_id` (FK → applications)
  - `job_id` (FK → jobs)
  - `candidate_id` (FK → candidates)
  - `recruiter_id` (for Phase 1: single recruiter)
  - `salary`
  - `fee_percent`
  - `fee_amount`
  - `platform_share_amount`
  - `recruiter_share_amount`
  - `created_at`

**Key Endpoints (Phase 1)**

- Jobs:
  - `GET /jobs`
  - `GET /jobs/:id`
  - `POST /jobs`
  - `PATCH /jobs/:id`
- Candidates & Applications:
  - `POST /jobs/:id/applications` (create candidate + application)
  - `GET /jobs/:id/applications`
  - `PATCH /applications/:id` (update stage/status)
- Placements:
  - `POST /applications/:id/placement`
    - Body: salary, fee_percent (optional override).
  - `GET /placements` (filter by recruiter, role, date range).

The service is responsible for calculating fee_amount, platform_share_amount, and recruiter_share_amount with simple, configurable logic.

---

### 3.6 services/network-service – Responsibilities

**Responsibilities**

- Model recruiter profiles and relationships to jobs.
- Provide recruiter-centric views of roles and applications.

**Data Model (Phase 1)**

- `network.recruiters`
  - `id` (UUID, PK)
  - `user_id` (FK → identity.users)
  - `display_name`
  - `status` (`pending`, `active`, `suspended`)
  - `created_at`, `updated_at`
- `network.role_assignments`
  - `id` (UUID, PK)
  - `recruiter_id` (FK → recruiters)
  - `job_id` (FK → ats.jobs)
  - `created_at`, `updated_at`

Phase 1 performance stats can be stubbed or derived on the fly; no dedicated stats tables are required yet.

**Key Endpoints (Phase 1)**

- `GET /recruiters/me`
  - Returns recruiter profile for current user (or 404 if not a recruiter).
- `GET /recruiters/me/jobs`
  - Returns jobs assigned to the recruiter (joined via role_assignments).
- `POST /jobs/:id/assign-recruiter`
  - Admin-only; assigns a recruiter to a job.

Later, network-service will own more advanced performance metrics and reputation data.

---

### 3.7 services/billing-service – Responsibilities

**Responsibilities**

- Manage recruiter subscription plans using Stripe.
- Gate recruiter-level features based on subscription status.

**Data Model (Phase 1)**

- `billing.plans`
  - `id` (UUID, PK)
  - `name`
  - `stripe_price_id`
  - `features` (JSONB, optional)
  - `created_at`, `updated_at`
- `billing.subscriptions`
  - `id` (UUID, PK)
  - `recruiter_id` (FK → network.recruiters)
  - `stripe_customer_id`
  - `stripe_subscription_id`
  - `plan_id` (FK → plans)
  - `status` (`trialing`, `active`, `past_due`, `canceled`)
  - `current_period_end`
  - `created_at`, `updated_at`

**Key Endpoints (Phase 1)**

- `GET /plans`
  - List available plans for recruiters.
- `GET /subscriptions/me`
  - Returns current subscription for the authenticated recruiter.
- `POST /subscriptions/checkout-session`
  - Creates a Stripe Checkout session for the recruiter to subscribe or upgrade.
- `POST /webhooks/stripe`
  - Stripe webhook endpoint (server-to-server) updating subscription records.

Feature gating logic (e.g., “free users see fewer roles”) will be enforced by `api-gateway` based on subscription status returned by billing-service.

---

### 3.8 services/notification-service – Responsibilities (Phase 1 Minimal)

**Responsibilities**

- Handle basic email notifications for key events using **Resend**:
  - New application submitted.
  - Stage change (optional).
  - Placement created (optional).

**Phase 1 Scope**

- Subscribe to RabbitMQ events from `ats-service` such as `application.created`.
- Use Resend’s Node.js SDK or HTTP API to send emails from a configured sender domain.
- Minimal template system:
  - Simple inline templates stored in code or in a small table (e.g., `notifications.templates`) if needed.

Minimal persistence (if any) is needed in Phase 1; logging to observability tools may be sufficient.

---

## 4. Non-Functional Requirements

### 4.1 Architecture Constraints

- All backend logic is implemented as discrete services under `services/`.
- No business logic in Next.js API routes.
- Microservice boundaries must reflect domain boundaries:
  - Identity, ATS, Network, Billing, Notifications.
- Monorepo with shared packages for types, logging, config, and clients.

### 4.2 Performance & Scalability

- Phase 1 scale is modest (design-partner usage), but:

  - Typical page loads for recruiter dashboard should complete in under 500ms server-side (excluding network latency).
  - Key list views (roles, applications) should support pagination from the start.

- Use Redis caching for:
  - Expensive dashboard queries (if needed).
  - Basic rate limiting in `api-gateway`.

### 4.3 Security & Authorization

- Authentication via Clerk, enforced at `api-gateway`.
- All internal services trust gateway tokens/claims, not raw Clerk tokens.
- Role-based access control:
  - Recruiter vs company vs platform admin flows.
- Candidate PII stored in Postgres must be protected via:
  - Connection encryption (TLS).
  - Limited access by service.
  - No logging of sensitive values in plain text.
- Resend API keys and Stripe keys must be stored in Secrets (not checked into source).

### 4.4 Observability

- Each service uses a shared logging package (`packages/shared-logging`).
- Log key actions with correlation IDs:
  - Requests through gateway.
  - Stage changes.
  - Placement creation.
  - Subscription status changes.
  - Notification sends via Resend (success/failure).
- Basic metrics:
  - Requests per service.
  - Error rates.
  - Latency histograms per endpoint (optional in Phase 1, but recommended).

---

## 5. Success Metrics (Phase 1)

Qualitative:

- Design-partner recruiters can run their active split roles entirely through Splits Network without needing spreadsheets for core tracking.
- Design-partner companies can view pipelines and mark hires successfully.
- Platform admin can see all roles, candidates, and placements in one place.
- Email notifications for key events are reliably delivered via Resend.

Quantitative (targets to refine):

- At least N design-partner recruiters onboarded and active.
- At least X real roles created and worked through the platform.
- At least Y real hires logged as placements.
- >80% of design partners report that the system makes split collaboration easier than their current process.

---

## 6. Dependencies & Risks

### 6.1 Dependencies

- Clerk tenant and configuration for Splits Network.
- Stripe account and basic product/price setup for recruiter plans.
- Resend account and verified sender domain for transactional email.
- Supabase Postgres instance provisioned with schemas per service.
- Kubernetes cluster with:
  - RabbitMQ
  - Redis
  - Ingress, TLS, and CI/CD already wired (reused from existing setups).

### 6.2 Risks

- **Over-engineering boundaries too early:** Mitigated by keeping Phase 1 functionality minimal while still respecting service boundaries.
- **Stripe integration delays:** Mitigated by starting with a single plan and simple “Subscribe” flow.
- **Resend configuration issues (DNS, sender reputation):** Mitigated by setting up early with a dedicated domain/subdomain and testing deliverability.
- **Product discovery risk:** Even with good architecture, if UX is clunky Phase 1 feedback will be poor. Mitigate with early UI prototypes and tight iteration with design partners.

---

## 7. Open Questions

1. How strict should recruiter subscription gating be in Phase 1 (e.g., number of roles available, number of active submissions)?
2. Do we require resume uploads for Phase 1, or is LinkedIn + notes sufficient initially?
3. Should placements live permanently in `ats-service` or be split into a dedicated `placements-service` later? For Phase 1 they can remain in `ats-service` with clear interfaces.
4. Do we want multi-recruiter splits in Phase 1, or is a single recruiter per placement acceptable initially? (Recommendation: single recruiter in Phase 1, multi-recruiter in a later phase.)

This PRD describes the Phase 1 foundations needed to run real split recruiting workflows through Splits Network, with a microservice-first architecture that remains friendly for both humans and AI agents, and with transactional email powered by Resend.
