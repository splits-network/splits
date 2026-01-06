# User Roles and Permissions

**Version:** 1.1  
**Last Updated:** December 17, 2025  
**Status:** Active

## 1. Overview

Splits Network implements a role-based access control (RBAC) system with four primary user roles and additional team-level roles (Phase 4+). Users can have multiple memberships across different organizations, with each membership defining their role and permissions within that organization's context.

### 1.1 Key Concepts

- **User**: An individual authenticated via Clerk with a unique identity
- **Organization**: A company or platform entity (e.g., hiring company, recruiting agency, or Splits Network itself)
- **Company**: A hiring entity within the ATS system. Organizations can be linked to companies (1:1 relationship for now), but not all organizations need companies (e.g., recruiter agencies operate without companies)
- **Membership**: A relationship connecting a user to an organization with a specific role
- **Multi-tenancy**: Users can be members of multiple organizations with different roles in each

**Organization-Company Relationship:**
- Recruiter agencies: Have organizations but NO companies (they work on other companies' roles)
- Hiring companies: Have organizations WITH linked companies (manage their own job postings)
- Platform: Has an organization but NO company
- Linking: Platform admins can link organizations to companies; company creation happens during company_admin onboarding
- Ratio: Currently 1:1 (one organization → one company max), may evolve to 1:many in future phases

**Phase 1 Marketplace Model:**
- Recruiters can see **all active jobs** (marketplace discovery model) - not restricted to assigned jobs
- Recruiters can only see **their own candidate submissions** (privacy protection)
- Companies see all applications to their jobs regardless of which recruiter submitted them

---

## 2. Primary User Roles

### 2.1 Platform Admin

**Role Code:** `platform_admin`

**Purpose:** Manages the Splits Network platform itself, not tied to any specific company or recruiting agency. Platform admins ensure system health, resolve disputes, and maintain platform operations.

**Capabilities:**

- **User & Organization Management:**
  - View all users across the platform
  - View all organizations (companies, agencies, platform)
  - Access user memberships and role assignments
  - Deactivate or suspend user accounts
  - Override user permissions when necessary (logged)
  - Resolve account issues and disputes

- **Recruiter Management:**
  - View all recruiter profiles and status
  - Approve pending recruiter applications
  - Suspend or reactivate recruiter accounts
  - Review recruiter performance and compliance
  - Manage recruiter verification and vetting
  - Handle recruiter disputes and conflicts
  - View all recruiter earnings and payout history

- **Company Management:**
  - View all companies on the platform
  - Access company profiles and settings
  - Monitor company usage and activity
  - Assist with company onboarding
  - Link organizations to companies
  - View company billing and subscription status
  - Access company hiring metrics

- **Job & Application Oversight:**
  - View all jobs across all companies (global view)
  - Monitor job quality and compliance
  - View all applications and submissions
  - Access application history and timelines
  - Resolve duplicate submission conflicts
  - Override stage transitions when needed (logged)
  - Handle escalated hiring issues

- **Candidate Data Access:**
  - View all candidates in the system
  - Access candidate profiles and contact information
  - View candidate sourcing and relationship history
  - Resolve candidate ownership disputes
  - Manage duplicate candidate records
  - Access verification status and documentation

- **Placement & Financial Management:**
  - View all placements across the platform
  - Access placement details, fees, and splits
  - Review fee calculations and payouts
  - Manage payout schedules and processing
  - Handle payment disputes and adjustments
  - View platform revenue and metrics
  - Access financial reports and analytics

- **Platform Configuration:**
  - Manage billing plans and subscription tiers
  - Configure platform-wide settings and rules
  - Set default fee percentages and structures
  - Manage integration configurations
  - Configure notification templates and workflows
  - Set platform policies and guidelines
  - Manage API keys and webhooks

- **Monitoring & Analytics:**
  - Access admin dashboard with system-wide analytics
  - View platform health metrics and status
  - Monitor system performance and uptime
  - Access audit logs and activity trails
  - Track platform growth and usage statistics
  - Generate reports on any data dimension
  - View data quality and integrity metrics

- **Support & Resolution:**
  - Override business rules when necessary (with justification)
  - Resolve disputes between companies and recruiters
  - Handle escalated customer support issues
  - Manage refunds and fee adjustments
  - Access support tools and diagnostic information
  - Communicate with all platform users

**Restrictions:**

- **Operational Boundaries:**
  - Should not perform day-to-day recruiting or hiring activities
  - Should document and justify all override actions
  - Limited access to sensitive company proprietary data (except for support/audit purposes)
  - Should maintain impartiality in dispute resolution

- **Data Privacy:**
  - Must follow data access policies and audit requirements
  - Should only access sensitive data when necessary for support or compliance
  - All admin data access should be logged and justified

**Typical User:** Splits Network team members, customer support leads, system administrators, compliance officers

**Organization Type:** `platform` (the Splits Network organization itself)

**API Endpoints (Primary):**
- All endpoints accessible without filtering
- `GET /api/admin/recruiters` - Manage recruiter accounts
- `GET /api/admin/companies` - View all companies
- `GET /api/roles` - View all jobs (no filtering)
- `GET /api/applications` - View all applications
- `GET /api/placements` - View all placements
- `GET /api/candidates` - View all candidates
- Platform-specific admin endpoints (system management)

**Implementation Files:**
- Admin Detection: [services/api-gateway/src/rbac.ts#L68-L71](../../services/api-gateway/src/rbac.ts)
- No RBAC Filtering: [services/api-gateway/src/routes/roles/routes.ts#L36-L39](../../services/api-gateway/src/routes/roles/routes.ts)
- Platform Admin UI: [apps/portal/src/app/(authenticated)/admin/](../../apps/portal/src/app/(authenticated)/admin/)

**Admin Dashboard Sections:**
- Recruiter Directory & Management
- Company Directory & Metrics
- Platform-Wide Analytics
- Billing & Plans Management
- System Health & Monitoring
- Audit Logs & Activity
- Support Tools & Overrides

---

### 2.2 Company Admin

**Role Code:** `company_admin`

**Purpose:** Full control over a hiring company's presence on the platform, including jobs, candidates, and internal team management.

**Capabilities:**

- **Job Management:**
  - Create new job postings (roles) with full details
  - Edit job details, requirements, and descriptions
  - Set fee percentages and salary ranges
  - Publish, pause, or close job postings
  - View all jobs for their company
  - Archive completed jobs
  - Duplicate jobs for similar positions

- **Candidate & Application Management:**
  - View all candidates submitted to their company's jobs (from any recruiter)
  - See full candidate profiles, resumes, and contact information
  - View application history and timeline
  - Move candidates through pipeline stages:
    - Submitted → Screen → Interview → Offer → Hired/Rejected
  - Add company-internal notes on candidates (not visible to recruiters)
  - Accept or reject recruiter submissions
  - Unmask candidate contact details after acceptance
  - Rate and provide feedback on candidates

- **Pipeline & Stage Management:**
  - Full control over application stages
  - Move multiple candidates simultaneously (bulk actions)
  - Set stage-specific workflows and requirements
  - Track time-in-stage and hiring velocity metrics
  - Configure stage notifications and reminders
  - Add interview schedules and hiring team feedback

- **Placement Management:**
  - Create placements when candidates are hired
  - Enter final salary and start date information
  - Trigger recruiter fee calculations
  - View all placements for their company
  - Track placement confirmations and completion
  - Manage post-hire follow-ups

- **Team & Organization Management:**
  - Invite hiring managers to their organization
  - Assign hiring managers to specific jobs/departments
  - Manage team member permissions
  - Remove or deactivate team members
  - View organization-wide activity logs

- **Company Profile & Settings:**
  - Manage company profile (name, logo, description)
  - Configure company branding and messaging
  - Set default fee percentages and hiring policies
  - Configure notification preferences for team
  - Manage integration settings (ATS sync, webhooks - Phase 2+)
  - Set company-wide hiring guidelines

- **Analytics & Reporting:**
  - View company-wide hiring metrics
  - Track time-to-hire, cost-per-hire, source effectiveness
  - Monitor application conversion rates by stage
  - View recruiter performance (submissions, placements per recruiter)
  - Export reports and data (Phase 2+)
  - Compare metrics across departments and time periods

- **Recruiter Collaboration:**
  - View which recruiters are submitting to their jobs
  - See recruiter submission history and success rates
  - Assign or recommend jobs to specific recruiters (Phase 2+)
  - Provide feedback on recruiter submissions

**Restrictions:**

- **Cross-Company Boundaries:**
  - Cannot access other companies' jobs or candidates
  - Cannot view other companies' hiring data or metrics
  - Cannot see platform-wide statistics

- **Recruiter Data Privacy:**
  - Cannot see recruiter's portion of fee split (only total placement fee)
  - Cannot view recruiter's other placements or earnings
  - Cannot access recruiter's full candidate pipeline (only submitted candidates)
  - Cannot see candidates before recruiter submission

- **Platform Configuration:**
  - Cannot modify platform-wide settings or rules
  - Cannot override platform fee structures
  - Cannot approve/suspend recruiter accounts (platform admin only)
  - Cannot access system-level audit logs

- **Financial Limitations:**
  - Cannot modify fee calculations after placement
  - Cannot adjust platform fees or billing
  - Cannot view other companies' payment history

**Typical User:** VP of Talent, Director of Recruiting, Talent Operations Manager

**Organization Type:** `company`

**API Endpoints (Primary):**
- `GET /api/roles` - List company's jobs (filtered by company_id)
- `POST /api/jobs` - Create new job posting
- `PATCH /api/jobs/:id` - Update job details
- `GET /api/jobs/:jobId/applications` - View all applications (all recruiters)
- `POST /api/applications/:id/accept` - Accept recruiter submission
- `PATCH /api/applications/:id/stage` - Move candidate through stages
- `POST /api/placements` - Create placement when candidate is hired
- `GET /api/placements?company_id={id}` - View company placements
- `GET /api/candidates` - View candidates submitted to company jobs
- `POST /api/companies` - Create/update company profile

**Implementation Files:**
- Company Job Filtering: [services/api-gateway/src/routes/roles/routes.ts#L41-L68](../../services/api-gateway/src/routes/roles/routes.ts)
- Application Management: [services/api-gateway/src/routes/applications/routes.ts](../../services/api-gateway/src/routes/applications/routes.ts)
- RBAC Checks: [services/api-gateway/src/rbac.ts#L75-L78](../../services/api-gateway/src/rbac.ts)

---

### 2.3 Hiring Manager

**Role Code:** `hiring_manager`

**Purpose:** Collaborates on hiring within a company but with limited administrative capabilities. Typically manages hiring for specific departments or job roles.

**Capabilities:**

- **Job Viewing:**
  - View all job postings for their company
  - See job details, requirements, and status
  - Request new job openings (requires company admin approval - Phase 2+)
  - Comment on job requirements and descriptions
  - View job analytics for their assigned roles

- **Candidate Review:**
  - View candidates submitted to their company's jobs
  - Review candidate profiles, resumes, and applications
  - See full candidate contact information after acceptance
  - View application history and timeline
  - Access candidate notes and feedback from team

- **Application Management (Limited):**
  - Move candidates through pipeline stages (same as company admin)
  - Add feedback and notes on candidates
  - Participate in interview scheduling
  - Provide hiring recommendations
  - Track candidates through interview process
  - Update application status

- **Collaboration:**
  - Communicate with hiring team (internal notes)
  - Schedule interviews and coordinate with team
  - Provide input on hiring decisions
  - Share candidate feedback with team
  - Tag other hiring managers for review

- **Reporting (Scoped):**
  - View metrics for their department/assigned jobs
  - Track hiring progress and velocity
  - Monitor application pipeline for their roles
  - See recruiter performance on their jobs

**Restrictions:**

- **Job Management:**
  - Cannot create new job postings without approval
  - Cannot publish or close jobs (company admin only)
  - Cannot set fee percentages or billing terms
  - Cannot assign recruiters to jobs
  - Cannot modify job visibility settings

- **Organization Management:**
  - Cannot invite or remove team members
  - Cannot manage company settings or profile
  - Cannot configure integrations or webhooks
  - Cannot manage subscriptions or billing
  - Cannot access organization-wide settings

- **Analytics:**
  - Cannot view company-wide financials
  - Cannot see total placement costs (only their department if configured)
  - Cannot access platform-level reports
  - Limited to department/job-specific metrics

- **Placement Management:**
  - Cannot create placements (company admin only in Phase 1)
  - Cannot modify fee structures or payment terms
  - May view but not edit placement details

- **Cross-Department Access:**
  - May be restricted to assigned department/jobs (configuration dependent)
  - Cannot view other departments' hiring data (if isolation configured)

**Typical User:** Engineering Manager, Sales Director, Department Head, Team Lead

**Organization Type:** `company`

**Note on Permissions:** Hiring managers have similar application management capabilities as company admins but lack administrative and financial controls. In Phase 1, the distinction is primarily organizational - companies can assign hiring manager role to department heads while reserving company admin for talent/HR leaders. Phase 2+ will introduce more granular permission controls (department-specific access, approval workflows, etc.).

**API Endpoints (Primary):**
- `GET /api/roles` - List company's jobs (filtered by company_id)
- `GET /api/jobs/:id` - View job details
- `GET /api/jobs/:jobId/applications` - View applications
- `PATCH /api/applications/:id/stage` - Move candidates through stages
- `GET /api/candidates` - View candidates for company jobs
- `GET /api/placements?company_id={id}` - View company placements (read-only)

**Implementation Files:**
- Same RBAC filtering as company admin for most endpoints
- Stage management: [services/api-gateway/src/routes/applications/routes.ts](../../services/api-gateway/src/routes/applications/routes.ts)
- Company filtering: [services/api-gateway/src/routes/roles/routes.ts#L41-L68](../../services/api-gateway/src/routes/roles/routes.ts)

**Future Enhancements (Phase 2+):**
- Department-specific job filtering
- Approval workflows for job creation requests
- Limited budget/cost visibility controls
- Granular role-based permissions configuration

---

### 2.4 Recruiter

**Role Code:** `recruiter`

**Purpose:** Sources and submits candidates for open roles, earns fees for successful placements.

**Capabilities:**
- **Job Discovery (Marketplace Model - Phase 1):**
  - View **all active jobs** on the platform (not restricted to assignments)
  - Search and filter jobs by company, location, title, fee percentage
  - Browse job details, requirements, and fee structures
  - Must have 'active' recruiter status to view jobs
  
- **Candidate Management:**
  - Submit candidates to any active role
  - View **only their own candidate submissions** (cannot see other recruiters' candidates)
  - Track application status and stage changes for their submissions
  - View candidates they sourced (candidates with their recruiter_id)
  - View candidates with active relationships (12-month renewable relationships)
  - Claim sourcing rights for candidates

- **Candidate Sourcing & Relationships:**
  - When a recruiter submits a candidate, they become the **sourcer** (permanent credit)
  - A 12-month **renewable relationship** is created in `recruiter_candidates`
  - Sourcing credit persists even after relationship expires
  - Can see candidate's full contact details only for their own submissions

- **Pipeline & Applications:**
  - View application stages for candidates they submitted
  - Track submission progress (submitted → screen → interview → offer → hired/rejected)
  - Receive notifications on stage changes
  - Cannot manually move candidates between stages (company-only action)

- **Placements & Earnings:**
  - View placement confirmations where they are the recruiter of record
  - View their earnings and fee percentages
  - Access payout history and pending payments
  - View personal analytics (submissions, placements, conversion rates)

- **Profile & Settings:**
  - Manage recruiter profile (bio, specialties, contact info)
  - Configure notification preferences
  - Manage subscription status (free vs paid tier)

- **Team Features (Phase 4+):**
  - Join or create recruiting teams
  - Collaborate with team members on shared pipeline

**Restrictions:**
- **Privacy & Competition:**
  - Cannot view candidates submitted by other recruiters
  - Cannot see other recruiters' applications on job roles
  - Cannot view other recruiters' earnings or performance metrics
  - Cannot access team data unless explicitly part of that team

- **Company Data:**
  - Cannot edit job postings or company information
  - Cannot access company's internal notes or hiring workflows
  - Cannot view company-side candidate feedback before acceptance
  - Cannot see salary data until placement is confirmed

- **Stage Management:**
  - Cannot manually change application stages (read-only view)
  - Cannot mark candidates as "hired" or create placements
  - Cannot reject or disqualify applications

- **Access Requirements:**
  - Must have **active recruiter status** to view jobs and submit candidates
  - Pending or suspended recruiters lose job discovery access
  - Free tier has submission limits; paid tier has unlimited submissions

**Typical User:** Independent recruiters, recruiting agency employees, staffing professionals

**Organization Type:** `company` (if internal recruiter) or personal/agency organization

**Subscription Status:**
- **Free Tier:** Limited to X submissions per month, basic features
- **Paid Tier:** Unlimited submissions, advanced features, lower platform fee

**API Endpoints (Primary):**
- `GET /api/roles` - List all active jobs (filtered for active recruiters)
- `GET /api/jobs/:id` - View job details
- `GET /api/jobs/:jobId/applications` - View applications (filtered to recruiter's own submissions)
- `POST /api/applications` - Submit candidate to job
- `GET /api/candidates` - List candidates (filtered to sourced + active relationships)
- `GET /api/placements?recruiter_id={id}` - View own placements

**Implementation Files:**
- RBAC Filtering: [services/api-gateway/src/routes/roles/routes.ts](../../services/api-gateway/src/routes/roles/routes.ts)
- Application Privacy: [services/api-gateway/src/routes/jobs/routes.ts](../../services/api-gateway/src/routes/jobs/routes.ts)
- Candidate Visibility: [services/api-gateway/src/routes/candidates/routes.ts](../../services/api-gateway/src/routes/candidates/routes.ts)



---

## 3. Team Roles (Phase 4+)

For recruiting agencies and collaborative recruiting groups, additional team-level roles are introduced:

### 3.1 Team Owner

**Role Code:** `owner` (within `team_members` context)

**Purpose:** Founder/owner of a recruiting team or agency.

**Capabilities:**
- All recruiter capabilities
- Create and manage team
- Invite and remove team members
- Set team-wide split configurations
- Manage team subscription and billing
- View all team members' activities and earnings
- Configure team policies and workflows
- Set team visibility and branding

**Restrictions:**
- Cannot force splits on placements from before split agreement was established
- Must honor platform-wide rules and policies

---

### 3.2 Team Admin

**Role Code:** `admin` (within `team_members` context)

**Purpose:** Trusted team administrator with most owner capabilities except ownership transfer and 

**Capabilities:**
- All recruiter capabilities
- Invite new team members (pending owner approval)
- Manage team member permissions (except owner role)
- View team analytics
- Configure team workflows
- Reassign jobs between team members

**Restrictions:**
- Cannot remove team owner
- Cannot change billing or subscription settings
- Cannot dissolve the team

---

### 3.3 Team Member

**Role Code:** `member` (within `team_members` context)

**Purpose:** Full team participant with shared pipeline and split earnings.

**Capabilities:**
- All recruiter capabilities
- View team pipeline and shared candidates
- Collaborate on submissions
- Participate in split earnings per team configuration
- View team analytics and reports
- Communicate with team members

**Restrictions:**
- Cannot invite new members
- Cannot change team configuration
- Cannot view individual team member earnings (only team totals)

---

### 3.4 Team Collaborator

**Role Code:** `collaborator` (within `team_members` context)

**Purpose:** Limited participant, typically external or temporary team member.

**Capabilities:**
- View specific assigned jobs only
- Submit candidates with team attribution
- Earn fees per individual agreement (not subject to team split rules by default)
- Limited access to team pipeline

**Restrictions:**
- Cannot view full team analytics
- Cannot collaborate on other members' candidates
- Limited visibility into team operations

---

## 4. Permission Matrix

| Capability | Platform Admin | Company Admin | Hiring Manager | Recruiter | Team Owner | Team Admin |
|------------|:--------------:|:-------------:|:--------------:|:---------:|:----------:|:----------:|
| **Jobs/Roles** |
| View open jobs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create jobs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Edit jobs | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Close jobs | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign recruiters | ✅ | ✅ | ❌ | ❌ | ⚠️ | ⚠️ |
| **Candidates** |
| Search candidates | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit candidates | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ |
| View submissions | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| Move stages | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| Claim sourcing | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Placements** |
| Create placements | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| View placements | ✅ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| **Organizations** |
| Manage org settings | ✅ | ✅ | ❌ | ❌ | ⚠️ | ⚠️ |
| Invite members | ✅ | ✅ | ❌ | ❌ | ✅ | ⚠️ |
| Remove members | ✅ | ✅ | ❌ | ❌ | ✅ | ⚠️ |
| **Billing** |
| Manage subscription | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| View earnings | ✅ | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ |
| Configure splits | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Analytics** |
| Platform-wide | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Company-wide | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Department/Role | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Personal/Team | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **System** |
| Manage API keys | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ |
| View audit logs | ✅ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| Configure webhooks | ✅ | ✅ | ❌ | ❌ | ⚠️ | ❌ |

**Legend:**
- ✅ Full access
- ⚠️ Limited/scoped access (see role details)
- ❌ No access

---

## 5. Data Scoping Rules

### 5.1 Recruiter Data Scoping

**Phase 1 Implementation (Marketplace Model):**

**Jobs/Roles - Recruiter Can View:**
- ✅ All active jobs across all companies (marketplace discovery)
- ✅ Job details: title, company, location, salary range, fee percentage, requirements
- ✅ Job status and metadata
- ❌ Requires **active recruiter status** - pending/suspended recruiters blocked

**Candidates - Recruiter Can View:**
- ✅ Candidates they **sourced** (where `candidate.recruiter_id` = their ID) - permanent visibility
- ✅ Candidates with **active relationships** (12-month renewable in `recruiter_candidates`)
- ✅ Full candidate details (contact info, LinkedIn, resume) for their sourced candidates
- ❌ **Cannot see** candidates sourced/submitted by other recruiters
- ❌ **Cannot see** candidate names/contact info before they source/submit them

**Applications - Recruiter Can View:**
- ✅ Their own applications/submissions across all jobs
- ✅ Application stages and status updates for their submissions
- ✅ Application notes (their own notes, not company internal notes)
- ❌ **Cannot see** other recruiters' applications on the same job
- ❌ **Cannot see** company-side internal feedback/notes

**Placements - Recruiter Can View:**
- ✅ Placements where they are the recruiter of record
- ✅ Their earned fees and payout status
- ✅ Placement confirmation details
- ❌ **Cannot see** other recruiters' placements or earnings
- ❌ **Cannot see** company's total hiring costs beyond their fee

**Analytics - Recruiter Can View:**
- ✅ Personal submission metrics (count, conversion rate)
- ✅ Personal placement history
- ✅ Personal earnings over time
- ❌ **Cannot see** other recruiters' performance data
- ❌ **Cannot see** company-wide hiring metrics

**Implementation Notes:**
- Filtering happens at API Gateway before calling domain services
- `/api/roles` returns all active jobs for active recruiters (no job filtering)
- `/api/jobs/:id/applications` filters by recruiter_id when role is 'recruiter'
- `/api/candidates` filters by sourcer (recruiter_id) and active relationships
- Recruiter ID resolved from network service, not Clerk user ID

**Code References:**
- [services/api-gateway/src/routes/roles/routes.ts#L74-L90](../../services/api-gateway/src/routes/roles/routes.ts) - Marketplace job access
- [services/api-gateway/src/routes/jobs/routes.ts#L77-L107](../../services/api-gateway/src/routes/jobs/routes.ts) - Application privacy filtering
- [services/api-gateway/src/routes/candidates/routes.ts#L26-L99](../../services/api-gateway/src/routes/candidates/routes.ts) - Candidate visibility logic

---

### 5.2 Company Data Scoping

**Phase 1 Implementation:**

**Jobs/Roles - Company Users Can View:**
- ✅ All jobs for their organization (filtered by `company_id`)
- ✅ Job details, requirements, and hiring workflow
- ✅ Full job analytics (views, applications, conversion rates)
- ❌ **Cannot see** other companies' jobs or data

**Candidates - Company Users Can View:**
- ✅ All candidates submitted to their jobs (regardless of which recruiter submitted)
- ✅ Full candidate profiles after recruiter submission
- ✅ Candidate contact information and resumes
- ✅ Application history for candidates across all their jobs
- ❌ **Cannot see** candidates not submitted to their jobs
- ❌ **Cannot see** which other companies a candidate is submitted to

**Applications - Company Users Can View:**
- ✅ All applications to their company's jobs
- ✅ Applications from all recruiters (no privacy filtering)
- ✅ Full application details, notes, and history
- ✅ Recruiter information for each submission
- ✅ Stage progression and timeline
- ❌ **Cannot see** recruiter's sourcing notes before submission
- ❌ **Cannot see** candidate's applications to other companies

**Placements - Company Users Can View:**
- ✅ All placements for their organization
- ✅ Total placement fees paid
- ✅ Hired candidate details
- ✅ Placement timing and salary information
- ❌ **Cannot see** recruiter's share of the fee (only total fee)
- ❌ **Cannot see** other companies' placements

**Analytics - Company Users Can View:**
- ✅ Company-wide hiring metrics
- ✅ Time-to-hire, applications per job, conversion rates
- ✅ Recruiter performance (submissions, placements per recruiter)
- ✅ Department-specific metrics (if configured)
- ❌ **Cannot see** cross-company benchmarks
- ❌ **Cannot see** recruiter earnings details

**Permissions by Company Role:**
- **Company Admin:** Full access to all company data, can create/edit jobs
- **Hiring Manager:** Limited to assigned departments/jobs (if configured), cannot edit jobs

**Code References:**
- [services/api-gateway/src/routes/roles/routes.ts#L41-L68](../../services/api-gateway/src/routes/roles/routes.ts) - Company job filtering
- [services/api-gateway/src/rbac.ts#L75-L78](../../services/api-gateway/src/rbac.ts) - Company user detection

---

### 5.3 Platform Admin Data Scoping

**Phase 1 Implementation:**

**Platform Admins Can View:**
- ✅ All system data across all organizations, companies, and recruiters
- ✅ All jobs, candidates, applications, and placements (global view)
- ✅ Recruiter profiles, status, and performance metrics
- ✅ Company profiles, jobs, and hiring data
- ✅ Audit logs and system health metrics
- ✅ Financial data: fees, splits, payouts (all entities)
- ✅ User accounts and membership management
- ✅ Subscription and billing data

**Platform Admin Capabilities:**
- ✅ Override business rules when necessary (documented in audit trail)
- ✅ Approve/suspend recruiter accounts
- ✅ Resolve disputes between parties
- ✅ Access support tools and admin dashboards
- ✅ Configure platform-wide settings
- ✅ Monitor system performance and data quality

**Access Control:**
- No filtering applied to admin queries (global access)
- All admin actions logged in audit trail
- Admin access to sensitive data should be justified and logged
- UI typically shows admin-specific navigation and views

**Code References:**
- [services/api-gateway/src/rbac.ts#L68-L71](../../services/api-gateway/src/rbac.ts) - Admin detection
- [services/api-gateway/src/routes/roles/routes.ts#L36-L39](../../services/api-gateway/src/routes/roles/routes.ts) - No filtering for admins

---

### 5.4 Data Scoping Summary Table

| Data Type | Platform Admin | Company Admin | Hiring Manager | Recruiter |
|-----------|:--------------:|:-------------:|:--------------:|:---------:|
| **Jobs** | All jobs | Their company's jobs | Their dept's jobs | All active jobs (read-only) |
| **Candidates** | All candidates | Submitted to their jobs | Submitted to their jobs | Their sourced + relationships |
| **Applications** | All applications | All apps to their jobs | All apps to their jobs | Only their own submissions |
| **Placements** | All placements | Their company's placements | Their dept's placements | Only their own placements |
| **Recruiter Profiles** | All recruiters | View only | View only | Own profile only |
| **Company Data** | All companies | Own company only | Own company only | View company names only |
| **Earnings** | All earnings | N/A | N/A | Own earnings only |
| **Fee Splits** | All splits | Total fee only | N/A | Own share only |
| **Analytics** | Platform-wide | Company-wide | Department-level | Personal only |

---

## 6. Role Assignment & Management

### 6.1 Initial Role Assignment

**New User Onboarding:**
1. User signs up via Clerk authentication
2. User is synced to `users` table
3. During onboarding flow, user selects their role intent:
   - "I'm hiring" → Creates company organization + assigns `company_admin` role
   - "I'm recruiting" → Creates personal organization + assigns `recruiter` role
4. Membership created in `memberships` table

**Invitation Flow:**
1. Company admin or team owner sends invite
2. Invited user creates account (or uses existing)
3. Membership created with specified role
4. User accepts invitation to activate membership

### 6.2 Role Changes

**Elevation (e.g., Hiring Manager → Company Admin):**
- Requires existing company admin approval
- Logged in audit trail
- Previous permissions immediately replaced

**Demotion:**
- Requires company admin or platform admin action
- Logged in audit trail
- Access immediately restricted

**Role Transitions:**
- Users can have multiple memberships (e.g., recruiter at Agency A + hiring manager at Company B)
- Each membership is independent with its own role
- Authentication context includes all active memberships

### 6.3 Deactivation

**Membership Removal:**
- Membership set to inactive
- User loses access to that organization's data
- Historical data (submissions, placements) remains attributed
- User can still access other active memberships

**Account Deactivation:**
- All memberships deactivated
- User cannot log in
- Historical audit trail preserved

---

## 7. Authentication & Authorization Flow

### 7.1 Authentication (Who are you?)

1. User authenticates via Clerk (sign-in, SSO, etc.)
2. Clerk issues JWT session token
3. API Gateway verifies token with Clerk
4. Gateway resolves user identity via Identity Service

### 7.2 Authorization (What can you do?)

1. Gateway retrieves user's memberships from Identity Service
2. Memberships include organization_id and role for each
3. Gateway attaches `AuthContext` to request:
   ```typescript
   {
     userId: string;
     clerkUserId: string;
     email: string;
     name: string;
     memberships: [
       {
         id: string;
         organization_id: string;
         organization_name: string;
         role: 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin';
       }
     ]
   }
   ```
4. Route handlers use RBAC middleware to check roles:
   ```typescript
   fastify.get('/jobs', {
     preHandler: requireRoles(['company_admin', 'hiring_manager', 'recruiter'])
   }, handler);
   ```
5. Business logic applies additional data scoping based on role

### 7.3 Context Switching (Future Enhancement)

For users with multiple memberships:
- UI provides organization switcher
- Selected organization stored in session/context
- API requests include `X-Organization-Id` header
- Backend validates user has membership in requested organization

---

## 8. Security Considerations

### 8.1 Principle of Least Privilege

- Users are granted only the permissions necessary for their role
- Default deny: if not explicitly permitted, access is denied
- Scope all queries by organization_id or user_id where applicable

### 8.2 Audit Logging

All role-based actions are logged:
- Who performed the action (user_id)
- What role they used (role from membership)
- What organization context (organization_id)
- What action was performed
- When it occurred (timestamp)

### 8.3 Cross-Organization Isolation

- Strict validation that users can only access data within organizations they're members of
- Platform admins log use of cross-organization data access for compliance
- API responses filtered by membership context

### 8.4 Sensitive Data Protection

- Recruiter earnings visible only to that recruiter (and platform admin)
- Company proprietary information not visible to external recruiters
- Candidate PII access logged and restricted

---

## 9. Implementation References

### 9.1 Key Files

- **RBAC Logic:** [services/api-gateway/src/rbac.ts](../services/api-gateway/src/rbac.ts)
- **Auth Middleware:** [services/api-gateway/src/auth.ts](../services/api-gateway/src/auth.ts)
- **Identity Service:** [services/identity-service/src/service.ts](../services/identity-service/src/service.ts)
- **Shared Types:** [packages/shared-types/src/](../packages/shared-types/src/)

### 9.2 Database Tables

- **Users:** `users`
- **Organizations:** `organizations` (with `type`: `company` or `platform`)
- **Memberships:** `memberships` (links users to organizations with roles)
- **Teams:** `teams` (Phase 4+)
- **Team Members:** `team_members` (Phase 4+, with team-level roles)

### 9.3 Type Definitions

```typescript
// From api-gateway/src/auth.ts
export type UserRole = 'recruiter' | 'company_admin' | 'hiring_manager' | 'platform_admin';

// Team roles from team_members
export type TeamRole = 'owner' | 'admin' | 'member' | 'collaborator';
```

---

## 10. Future Enhancements

### 10.1 Custom Roles (Backlog)

- Allow companies to define custom roles (e.g., "Sourcing Specialist", "Recruiting Coordinator")
- Map custom roles to base permission sets
- UI for companies to manage custom role definitions

### 10.2 Fine-Grained Permissions (Backlog)

- Permission flags beyond role (e.g., `can_approve_placements`, `can_view_salary_data`)
- Role templates with customizable permission sets

### 10.3 Temporary Access (Backlog)

- Time-bound role assignments (e.g., contractor with 90-day access)
- Automatic expiration and notifications

### 10.4 Delegation (Backlog)

- Allow users to temporarily delegate authority (e.g., out-of-office coverage)
- Audit trail of delegated actions

---

## 12. Typical User Workflows

### 12.1 Recruiter Workflow

**Daily Activities:**
1. **Discover Jobs:** Browse `/roles` to see all active jobs on the platform
2. **Research Opportunities:** Review job details, fee percentages, company information
3. **Source Candidates:** Search external channels for qualified candidates
4. **Submit Candidates:** Use Submit Candidate modal to add candidates to jobs
5. **Track Progress:** Monitor application stages for their submissions
6. **Communicate:** Respond to company questions about their candidates
7. **Celebrate Placements:** Receive notifications when their candidates are hired

**Common Tasks:**
- Check dashboard for application updates
- View personal metrics (submissions, conversion rates)
- Manage recruiter profile and bio
- Configure notification preferences
- Review earnings and payouts

**Key Pages:**
- `/dashboard` - Personal metrics and activity
- `/roles` - Browse all active jobs
- `/roles/:id` - Job details and submit candidate
- `/candidates` - View sourced candidates and relationships
- `/placements` - Track successful placements

---

### 12.2 Company Admin Workflow

**Daily Activities:**
1. **Manage Jobs:** Create, edit, and publish job postings
2. **Review Submissions:** Check new candidate applications from recruiters
3. **Accept Candidates:** Unmask contact info and move to interview stage
4. **Coordinate Interviews:** Schedule and track interview progress
5. **Move Pipeline:** Update candidate stages (screen → interview → offer)
6. **Create Placements:** Mark hired candidates and enter final details
7. **Monitor Metrics:** Review hiring velocity and recruiter performance

**Common Tasks:**
- Review recruiter submissions quality
- Provide feedback on candidates
- Adjust job descriptions and requirements
- Invite hiring managers to platform
- Export hiring reports
- Manage company profile and settings

**Key Pages:**
- `/dashboard` - Company hiring metrics
- `/roles` - All company jobs
- `/roles/:id` - Job details and pipeline
- `/candidates` - All submitted candidates
- `/placements` - Company hires and fees
- `/settings/company` - Company profile

---

### 12.3 Hiring Manager Workflow

**Daily Activities:**
1. **Review Candidates:** Check applications for their department/roles
2. **Provide Feedback:** Add notes and ratings on candidates
3. **Interview Coordination:** Schedule and conduct interviews
4. **Pipeline Updates:** Move candidates through stages
5. **Collaborate:** Communicate with hiring team about candidates
6. **Track Progress:** Monitor hiring progress for open roles

**Common Tasks:**
- Review candidate profiles and resumes
- Add interview feedback and notes
- Recommend candidates for advancement
- Check job status and applicant counts
- View department hiring metrics

**Key Pages:**
- `/dashboard` - Department/role metrics
- `/roles` - Company jobs
- `/roles/:id` - Job pipeline and candidates
- `/candidates` - Submitted candidates
- `/candidates/:id` - Candidate details and feedback

---

### 12.4 Platform Admin Workflow

**Daily Activities:**
1. **Monitor Platform:** Check system health and metrics
2. **Review Recruiters:** Approve pending recruiter applications
3. **Support Issues:** Handle escalated support tickets
4. **Resolve Disputes:** Mediate conflicts between parties
5. **Data Quality:** Monitor and clean duplicate records
6. **Analytics Review:** Track platform growth and usage

**Common Tasks:**
- Approve/suspend recruiter accounts
- Resolve sourcing conflicts
- Adjust fee calculations (when justified)
- Review audit logs
- Monitor payment processing
- Generate platform reports

**Key Pages:**
- `/admin/dashboard` - Platform-wide metrics
- `/admin/recruiters` - Recruiter management
- `/admin/companies` - Company directory
- `/roles` - All jobs (global view)
- `/admin/placements` - All placements and fees
- `/admin/system` - Configuration and settings

---

## 13. Role Comparison Quick Reference

| Aspect | Platform Admin | Company Admin | Hiring Manager | Recruiter |
|--------|:-------------:|:-------------:|:--------------:|:---------:|
| **Primary Goal** | Platform operations | Company hiring | Department hiring | Candidate placement |
| **Job Access** | All jobs | Company jobs | Company jobs | All active jobs |
| **Job Creation** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Candidate View** | All candidates | Company submissions | Company submissions | Own sourced only |
| **Stage Management** | ✅ Override | ✅ Full control | ✅ Full control | ❌ Read-only |
| **Placement Creation** | ✅ Yes | ✅ Yes | ⚠️ Limited | ❌ No |
| **Earnings Visibility** | All earnings | Total fees only | N/A | Own earnings |
| **Analytics Scope** | Platform-wide | Company-wide | Department | Personal |
| **User Management** | Platform users | Company team | ❌ No | ❌ No |
| **Billing Access** | All billing | Company billing | ❌ No | Own subscription |
| **Support Tools** | ✅ Full | ⚠️ Limited | ❌ No | ❌ No |

---

## 15. UI/UX Features by Role

### 15.1 Navigation & Menu Visibility

**Platform Admin:**
- Admin Dashboard
- Recruiter Management
- Company Management
- All Roles (Global)
- All Applications
- All Placements
- System Settings
- Audit Logs
- Billing & Plans

**Company Admin:**
- Company Dashboard
- Roles (Company Jobs)
- Candidates (Company Submissions)
- Placements (Company Hires)
- Team Management
- Company Settings
- Analytics & Reports

**Hiring Manager:**
- Department Dashboard
- Roles (Company Jobs - Read-only)
- Candidates (Company Submissions)
- Placements (Company Hires - Read-only)
- Analytics (Department Level)

**Recruiter:**
- Personal Dashboard
- Browse Roles (Marketplace)
- My Candidates
- My Placements
- Earnings & Payouts
- Profile Settings
- Subscription

---

### 15.2 Action Buttons & Capabilities

**On Job Pages:**

| Action | Platform Admin | Company Admin | Hiring Manager | Recruiter |
|--------|:--------------:|:-------------:|:--------------:|:---------:|
| Create Job | ✅ | ✅ | ❌ | ❌ |
| Edit Job | ✅ | ✅ | ❌ | ❌ |
| Close Job | ✅ | ✅ | ❌ | ❌ |
| Submit Candidate | ✅ | ✅ | ⚠️ | ✅ |
| Assign Recruiter | ✅ | ✅ | ❌ | ❌ |
| Duplicate Job | ✅ | ✅ | ❌ | ❌ |

**On Candidate/Application Pages:**

| Action | Platform Admin | Company Admin | Hiring Manager | Recruiter |
|--------|:--------------:|:-------------:|:--------------:|:---------:|
| View Contact Info | ✅ | ✅ (after accept) | ✅ (after accept) | ✅ (own only) |
| Move Stage | ✅ | ✅ | ✅ | ❌ |
| Add Notes | ✅ | ✅ | ✅ | ⚠️ (submission notes) |
| Accept/Reject | ✅ | ✅ | ✅ | ❌ |
| Create Placement | ✅ | ✅ | ❌ | ❌ |
| Rate Candidate | ✅ | ✅ | ✅ | ❌ |

**On Placement Pages:**

| Action | Platform Admin | Company Admin | Hiring Manager | Recruiter |
|--------|:--------------:|:-------------:|:--------------:|:---------:|
| Create Placement | ✅ | ✅ | ❌ | ❌ |
| View Fee Details | ✅ (all) | ✅ (company total) | ❌ | ✅ (own share) |
| Edit Placement | ✅ | ✅ | ❌ | ❌ |
| Request Payout | ❌ | ❌ | ❌ | ✅ |

---

### 15.3 Data Masking & Privacy

**Candidate Contact Information:**
- **Before Acceptance:**
  - Recruiters: Full details (for own submissions)
  - Companies: Masked (initials only, hidden email)
  - Platform Admins: Full details
  
- **After Acceptance:**
  - All roles: Full contact details visible

**Salary Information:**
- **Job Posting:**
  - All roles: Salary range visible
  
- **Final Placement:**
  - Platform Admin: Full details
  - Company Admin: Full details
  - Hiring Manager: Full details (if authorized)
  - Recruiter: Final salary visible after placement confirmation

**Fee Structure:**
- **Platform Admin:** Complete fee breakdown (platform + recruiter shares)
- **Company Admin:** Total placement fee only
- **Hiring Manager:** May be hidden (company policy)
- **Recruiter:** Their fee share and percentage only

---

### 15.4 Notifications & Alerts

**Recruiter Notifications:**
- New jobs matching their specialties (Phase 2+)
- Application status changes (stage transitions)
- Placement confirmations and payouts
- Subscription expiration warnings
- Profile completion reminders

**Company Admin Notifications:**
- New candidate submissions
- Candidates ready for interview
- Placement confirmations
- Team member activity
- Job performance alerts (low applications)

**Hiring Manager Notifications:**
- New candidates for their jobs
- Interview schedules and reminders
- Candidate feedback requests
- Stage transition updates
- Hiring deadline alerts

**Platform Admin Notifications:**
- Pending recruiter approvals
- Dispute escalations
- System health alerts
- Payment processing issues
- Compliance violations

---

## 16. FAQ

**Q: Can a user be both a recruiter and a company admin?**  
A: Yes. A user can have multiple memberships across different organizations. For example, a recruiter who also works as a hiring manager at their own company would have two memberships with different roles.

**Q: What happens if a recruiter's subscription expires?**  
A: They revert to free tier limitations (limited submissions, restricted features). Their role remains `recruiter`, but feature access is gated by subscription status checked via Billing Service.

**Q: Can hiring managers view recruiter earnings?**  
A: No. Recruiter earnings are private to the recruiter and platform admins. Companies see only the placement fee they're paying, not how it's split.

**Q: How are disputes between recruiters handled?**  
A: Platform admins have override capabilities to resolve sourcing conflicts, adjust placements, and mediate disputes. All actions are logged.

**Q: Can a company admin become a recruiter?**  
A: Yes, by creating or joining a recruiter organization. They would have two separate memberships with different roles in each context.

**Q: What role does the API Gateway assign if a user has multiple memberships?**  
A: The gateway includes all memberships in the AuthContext. Business logic can then determine which membership applies for a given request (e.g., based on organization context or resource ownership).

**Q: Can recruiters see all jobs or only assigned jobs?**  
A: In Phase 1, recruiters use a **marketplace model** and can see **all active jobs** on the platform. This allows them to discover opportunities and submit candidates to any open role. They must have "active" recruiter status to view jobs.

**Q: Why can't recruiters see other recruiters' candidates?**  
A: Privacy and competitive protection. Recruiters should not see competitors' candidate submissions on the same job. This prevents poaching and maintains fair competition. Companies see all submissions, but recruiters only see their own.

**Q: What is a "sourcer" vs "active relationship"?**  
A: 
- **Sourcer:** The recruiter who first brought a candidate to the platform (`candidate.recruiter_id`). This is permanent credit that never expires.
- **Active Relationship:** A 12-month renewable relationship in `recruiter_candidates` that tracks ongoing engagement. After 12 months, the relationship expires but sourcing credit remains.
- Recruiters can see candidates they sourced OR have active relationships with.

**Q: How does candidate visibility work for recruiters?**  
A:
1. Recruiter submits candidate to a job → becomes the sourcer + 12-month relationship created
2. Recruiter can see this candidate's full details forever (sourcing credit)
3. After 12 months, relationship expires but sourcer visibility remains
4. If another recruiter submits the same candidate to a different job, both recruiters can see the candidate (for their respective jobs)
5. Recruiters cannot see candidates submitted by others unless they also have a relationship/sourcing claim

**Q: What happens when a recruiter is suspended?**  
A: 
- Loses access to view jobs (marketplace)
- Cannot submit new candidates
- Can still view their existing submissions and placements
- Historical data and sourcing credits remain intact
- Can be reactivated by platform admin

**Q: Can companies hide jobs from certain recruiters?**  
A: Not in Phase 1 (marketplace model). All active jobs are visible to all active recruiters. Phase 2+ may introduce private jobs or recruiter assignments with restricted visibility.

**Q: What's the difference between Company Admin and Hiring Manager?**  
A: 
- **Company Admin:** Full administrative control - can create jobs, manage team, configure settings, handle billing, and create placements.
- **Hiring Manager:** Collaborative hiring role - can review candidates and move them through stages, but cannot create jobs, manage settings, or handle placements.
- Both can move candidates through pipeline stages, but hiring managers lack administrative and financial controls.

**Q: Can hiring managers create job postings?**  
A: Not directly in Phase 1. They can request new jobs (which requires company admin approval in Phase 2+), but cannot publish jobs. This ensures proper oversight and fee structure approval.

**Q: Do companies see which recruiters submitted which candidates?**  
A: Yes. Companies see full recruiter attribution on all submissions. This helps them track recruiter quality and build relationships with high-performing recruiters.

**Q: Can companies rate or review recruiters?**  
A: Phase 1 has basic feedback capabilities. Phase 2+ will introduce formal recruiter ratings, reviews, and performance scores visible to other companies.

**Q: How do companies accept candidate submissions?**  
A: Company admins click "Accept" on recruiter submissions, which unmasks full candidate contact details and moves the application to "Screen" or "Interview" stage. Before acceptance, candidates are masked to prevent direct sourcing bypassing recruiters.

**Q: Can companies edit jobs after publishing?**  
A: Yes, company admins can edit job details, requirements, salary ranges, and fee percentages at any time. Changes are logged and may trigger recruiter notifications if significant updates occur.

**Q: What happens if a company closes a job with active applications?**  
A: Active applications remain in the system but the job status changes to "closed". Companies can still process existing applications and make hires. Recruiters can see the job is closed and cannot submit new candidates.

**Q: Can multiple people from a company be company admins?**  
A: Yes. A company can have multiple company admins. Each has full administrative access to the company's hiring operations. Use hiring manager role for team members who need limited access.

**Q: Do hiring managers have their own login?**  
A: Yes. Hiring managers are separate user accounts with their own login credentials. They are invited by company admins and assigned the hiring_manager role within the company organization.

**Q: Can platform admins see company internal notes?**  
A: Yes. Platform admins have full access to all data for support, compliance, and dispute resolution purposes. All admin access is logged in audit trails.

---

**Document Owner:** Platform Team  
**Review Cycle:** Quarterly  
**Last Code Review:** December 17, 2025  
**Related Documents:**
- [Architecture Overview](../splits-network-architecture.md)
- [Phase 1 PRD](../splits-network-phase1-prd.md)
- [Phase 4 PRD - Teams](../splits-network-phase4-prd.md)
- [API Documentation](../API-DOCUMENTATION.md)
- [RBAC Implementation Guide](../RBAC-Implementation.md)
- [Form Controls Guidance](./form-controls.md)
