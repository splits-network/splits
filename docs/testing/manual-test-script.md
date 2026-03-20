# Manual Test Script — Splits Network

Complete step-by-step QA instructions for manually testing all user flows. Follow the execution order below — each section builds on data created by previous sections.

**URLs:**
- Portal: `http://localhost:3100`
- Candidate App: `http://localhost:3101`
- Corporate Site: `http://localhost:3102`

**Test Accounts:** Created by `pnpm tsx scripts/e2e-seed.ts`

| Role | Email | Password |
|------|-------|----------|
| Recruiter | e2e-recruiter@test.splits.network | E2eTest!Recruiter2024 |
| Company Admin | e2e-company-admin@test.splits.network | E2eTest!CompanyAdmin2024 |
| Hiring Manager | e2e-hiring-manager@test.splits.network | E2eTest!HiringManager2024 |
| Candidate | e2e-candidate@test.splits.network | E2eTest!Candidate2024 |
| Platform Admin | e2e-admin@test.splits.network | E2eTest!Admin2024 |
| Second Recruiter | e2e-recruiter2@test.splits.network | E2eTest!Recruiter2B2024 |

---

## Pre-Test Setup

1. Start all services: `pnpm dev`
2. Run seed script: `pnpm tsx scripts/e2e-seed.ts`
3. Verify all 3 apps are running at their ports

---

## 1. Corporate Site (localhost:3102)

**No login required.**

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Open `localhost:3102` | Homepage loads with hero section, stats, testimonials | ☐ |
| 2 | Verify stats section | Shows role count, recruiter count, company count | ☐ |
| 3 | Open `/contact` | Contact form loads with name, email, message fields | ☐ |
| 4 | Submit contact form with valid data | Success message or redirect | ☐ |
| 5 | Open `/terms-of-service` | Legal page loads | ☐ |
| 6 | Open `/privacy-policy` | Legal page loads | ☐ |
| 7 | Open `/cookie-policy` | Legal page loads | ☐ |
| 8 | View page source — check for JSON-LD | Structured data present | ☐ |

---

## 2. Company Admin Flows (localhost:3100)

**Login as:** e2e-company-admin@test.splits.network

### 2.1 Onboarding & Dashboard

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Log in as company admin | Redirect to `/portal/dashboard` | ☐ |
| 2 | Verify dashboard heading | Company-specific greeting or stats | ☐ |
| 3 | Check sidebar nav | Shows: Dashboard, Roles, Applications, Candidates, Recruiters, Company Settings | ☐ |
| 4 | Verify stats cards present | Open roles, active applications, placements shown | ☐ |

### 2.2 Create Job Role

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/roles` | Company board loads | ☐ |
| 2 | Click "Create Role" | Role creation form opens | ☐ |
| 3 | Fill: Title="QA Test Role - Senior Developer" | Field accepts input | ☐ |
| 4 | Fill: Description, requirements, salary range ($80K-$120K) | Fields accept input | ☐ |
| 5 | Fill: Location="Remote", Employment type="Full-time" | Fields accept input | ☐ |
| 6 | Add pre-screening question: "Years of experience?" | Question saved | ☐ |
| 7 | Set status to "Published" | Status updated | ☐ |
| 8 | Submit form | Role created, appears in listing | ☐ |

### 2.3 Recruiter Management

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/recruiters` | Recruiter directory loads | ☐ |
| 2 | Search for recruiter | Results filter | ☐ |
| 3 | Invite recruiter to work on roles | Invitation form, set permissions | ☐ |
| 4 | Navigate to `/portal/company-invitations` | Invitation list loads | ☐ |

### 2.4 Company Settings

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/company/settings` | Settings page loads | ☐ |
| 2 | Verify company name field | Editable | ☐ |
| 3 | Update company description | Changes save | ☐ |

---

## 3. Recruiter Flows (localhost:3100)

**Login as:** e2e-recruiter@test.splits.network

### 3.1 Onboarding & Dashboard

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Log in as recruiter | Redirect to `/portal/dashboard` | ☐ |
| 2 | Verify recruiter dashboard | Pipeline stats, activity feed | ☐ |
| 3 | Check sidebar nav | Shows: Dashboard, Roles, Applications, Candidates, Companies, Firms, Messages | ☐ |

### 3.2 Candidate Management

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/candidates` | Candidate list loads | ☐ |
| 2 | Click "Add Candidate" | Creation form opens | ☐ |
| 3 | Fill: Name="Jane Smith", Email="jane@test.com", Phone="555-0123" | Fields accept input | ☐ |
| 4 | Submit | Candidate created, appears in list | ☐ |
| 5 | Switch to Table view | View changes | ☐ |
| 6 | Switch to Grid view | View changes | ☐ |
| 7 | Search for "Jane" | Results filtered | ☐ |
| 8 | Click candidate | Detail panel/page opens | ☐ |

### 3.3 Company Marketplace

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/companies` | Company marketplace loads | ☐ |
| 2 | Search for company | Results filter | ☐ |
| 3 | Click company card | Company detail with open roles | ☐ |
| 4 | Send sourcer invitation | Invitation sent confirmation | ☐ |
| 5 | Navigate to `/portal/invitations` | Sent invitation appears, "pending" status | ☐ |

### 3.4 Role Management

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/roles` | Recruiter board loads | ☐ |
| 2 | Verify accessible roles listed | Roles from connected companies visible | ☐ |
| 3 | Click role to view detail | Full description, requirements visible | ☐ |

### 3.5 Application Management

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/applications` | Application list loads | ☐ |
| 2 | Filter "My Applications" | Only recruiter's own apps shown | ☐ |
| 3 | Filter by stage "Interview" | Results filtered | ☐ |
| 4 | Switch between Grid/Table/Split | Views toggle | ☐ |
| 5 | Click application for detail | Full candidate info, job info, timeline | ☐ |
| 6 | Add a note | Note saved and visible | ☐ |

### 3.6 Submit Candidate to Role

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | From candidate detail, click "Submit to Role" | Role selection appears | ☐ |
| 2 | Select "QA Test Role - Senior Developer" | Application created | ☐ |
| 3 | Navigate to `/portal/applications` | New application at "recruiter_proposed" stage | ☐ |

### 3.7 Firm Management

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/firms` | Firms page loads | ☐ |
| 2 | Create firm: Name="E2E Test Firm" | Firm created | ☐ |
| 3 | Set admin take rate: 15% | Rate saved | ☐ |
| 4 | View firm members | Member list loads | ☐ |

### 3.8 Referral Codes

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/referral-codes` | Page loads with tabs | ☐ |
| 2 | Create new referral code | Code generated | ☐ |
| 3 | View "Created" tab | Code listed | ☐ |

### 3.9 Messages

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/messages` | Conversation list or empty state | ☐ |

---

## 4. Hiring Manager Flows (localhost:3100)

**Login as:** e2e-hiring-manager@test.splits.network

### 4.1 Dashboard & Restricted Access

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Log in as hiring manager | Dashboard loads | ☐ |
| 2 | Verify sidebar does NOT show "Company Settings" | Item absent | ☐ |
| 3 | Verify sidebar shows: Applications, Candidates, Placements | Items present | ☐ |
| 4 | Navigate to `/portal/roles` | No "Create Role" button | ☐ |
| 5 | Navigate to `/portal/company/settings` | Redirected or access denied | ☐ |

### 4.2 Application Review

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Navigate to `/portal/applications` | Applications list loads | ☐ |
| 2 | View application detail | Candidate + job info visible | ☐ |
| 3 | Advance from "company_review" → "interview" | Stage updates | ☐ |
| 4 | Add feedback note | Note saved | ☐ |

---

## 5. Candidate Flows (localhost:3101)

### 5.1 Public Browsing (No Login)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Open `localhost:3101` | Homepage loads | ☐ |
| 2 | Navigate to `/jobs` | Job listing loads (grid view) | ☐ |
| 3 | Switch to table view | View toggles | ☐ |
| 4 | Filter by "Full-time" | Results filtered | ☐ |
| 5 | Click a job card | Job detail page opens | ☐ |
| 6 | Navigate to `/marketplace` | Recruiter marketplace loads | ☐ |
| 7 | Search by specialty | Results filtered | ☐ |
| 8 | Click recruiter profile | Detail page loads | ☐ |
| 9 | Navigate to `/firms` | Firm directory loads | ☐ |
| 10 | Click a firm | Firm detail with tabs | ☐ |
| 11 | Navigate to `/resources/interview-prep` | Resource page loads | ☐ |

### 5.2 Authenticated Portal

**Login as:** e2e-candidate@test.splits.network

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Log in | Redirect to dashboard | ☐ |
| 2 | Verify greeting with name | "Hello, Test" or similar | ☐ |
| 3 | Navigate to `/portal/applications` | Application list or empty state | ☐ |
| 4 | Switch views (Grid/Table/Split) | Views toggle | ☐ |
| 5 | Navigate to `/portal/jobs/saved` | Saved jobs or empty state | ☐ |
| 6 | Navigate to `/portal/messages` | Conversations or empty state | ☐ |
| 7 | Navigate to `/portal/documents` | Documents or empty state, upload area visible | ☐ |
| 8 | Navigate to `/portal/recruiters` | Connected recruiters or empty state | ☐ |

---

## 6. Platform Admin Flows (localhost:3100)

**Login as:** e2e-admin@test.splits.network

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1 | Log in | Redirect to `/portal/admin` | ☐ |
| 2 | Verify admin sidebar sections | Activity, Applications, Users, Companies, Payouts visible | ☐ |
| 3 | Navigate to `/portal/admin/users` | User list loads | ☐ |
| 4 | Search for "e2e-recruiter" | User found | ☐ |
| 5 | Navigate to `/portal/admin/recruiters` | Recruiter list loads | ☐ |
| 6 | Navigate to `/portal/admin/companies` | Company list loads | ☐ |
| 7 | Navigate to `/portal/admin/applications` | All applications listed | ☐ |
| 8 | Navigate to `/portal/admin/payouts` | Payout overview loads | ☐ |
| 9 | Navigate to `/portal/admin/payouts/schedules` | Schedules listed | ☐ |
| 10 | Navigate to `/portal/admin/payouts/escrow` | Escrow holds listed | ☐ |
| 11 | Navigate to `/portal/admin/payouts/audit` | Audit log loads | ☐ |
| 12 | Navigate to `/portal/admin/fraud` | Fraud dashboard loads | ☐ |
| 13 | Navigate to `/portal/admin/metrics` | Platform metrics load | ☐ |

---

## 7. Full Application → Placement → Payout Lifecycle

This test requires switching between multiple user accounts.

| # | Actor | Step | Expected | Pass? |
|---|-------|------|----------|-------|
| 1 | **Recruiter** | Log in, go to `/portal/candidates` | Candidate list | ☐ |
| 2 | **Recruiter** | Find candidate, click "Submit to Role" | Role selection | ☐ |
| 3 | **Recruiter** | Select the QA Test Role | Application created at "recruiter_proposed" | ☐ |
| 4 | **Recruiter** | Go to `/portal/applications` | New app visible | ☐ |
| 5 | **Company Admin** | Log in, go to `/portal/applications` | Application from recruiter visible | ☐ |
| 6 | **Company Admin** | Open application, review candidate | Full profile displayed | ☐ |
| 7 | **Company Admin** | Advance to "company_review" | Stage updates | ☐ |
| 8 | **Company Admin** | Advance to "interview" | Stage updates | ☐ |
| 9 | **Recruiter** | Log in, check application | Stage shows "interview" | ☐ |
| 10 | **Recruiter** | Go to `/applications/[id]/offer` | Offer wizard opens | ☐ |
| 11 | **Recruiter** | Step 1: Review Candidate | Candidate summary shown | ☐ |
| 12 | **Recruiter** | Step 2: Enter salary=$100K, fee=20%, start date | Fields validate | ☐ |
| 13 | **Recruiter** | Step 3: Financial Impact | Commission breakdown shown | ☐ |
| 14 | **Recruiter** | Step 4: Confirm and submit | Stage → "offer" | ☐ |
| 15 | **Company Admin** | View application at "offer" stage | Offer details visible | ☐ |
| 16 | **Company Admin** | Go to `/applications/[id]/hire`, confirm | Application → "hired" | ☐ |
| 17 | **Recruiter** | Go to `/portal/placements` | New placement visible | ☐ |
| 18 | **Recruiter** | View placement detail | Salary: $100K, Fee: $20K, splits shown | ☐ |
| 19 | **Recruiter** | Verify commission split | Correct % per subscription tier | ☐ |
| 20 | **Admin** | Go to `/portal/admin/payouts` | Payout schedule exists | ☐ |
| 21 | **Admin** | View escrow hold | Active for 90 days | ☐ |
| 22 | **Admin** | View payout transactions | Pending transactions per split role | ☐ |

---

## 8. Cross-Role Invitation Flows

### 8.1 Recruiter → Company

| # | Actor | Step | Expected | Pass? |
|---|-------|------|----------|-------|
| 1 | **Recruiter** | Browse companies, send sourcer invitation | Invitation created | ☐ |
| 2 | **Company Admin** | Go to `/portal/company-invitations` | Pending invitation visible | ☐ |
| 3 | **Company Admin** | Accept with permissions | Recruiter gains access | ☐ |
| 4 | **Recruiter** | Check invitation status | Shows "accepted" | ☐ |
| 5 | **Recruiter** | Go to `/portal/roles` | Company's roles now visible | ☐ |

### 8.2 Company → Recruiter

| # | Actor | Step | Expected | Pass? |
|---|-------|------|----------|-------|
| 1 | **Company Admin** | Browse recruiters, send invitation | Invitation with permissions | ☐ |
| 2 | **Recruiter** | Go to invitation page | Details shown | ☐ |
| 3 | **Recruiter** | Accept | Permissions applied | ☐ |

### 8.3 Recruiter → Candidate

| # | Actor | Step | Expected | Pass? |
|---|-------|------|----------|-------|
| 1 | **Recruiter** | Send invitation to candidate | Invitation sent | ☐ |
| 2 | **Candidate** | Go to invitation page | Details shown | ☐ |
| 3 | **Candidate** | Accept | Recruiter relationship created | ☐ |
| 4 | **Candidate** | Go to `/portal/recruiters` | Recruiter in connections | ☐ |

---

## Post-Test Notes

- Record any bugs found with screenshots
- Note any pages that loaded slowly (>3s)
- Flag any console errors visible in browser devtools
- Report any broken links or missing images
