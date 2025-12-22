# User Onboarding Flows - Complete Implementation Guide

**Version:** 1.0  
**Created:** December 21, 2025  
**Status:** Implementation Ready

## 1. Overview

This document outlines the complete implementation of role-based user onboarding for Splits Network. The onboarding flow is seamless, happening entirely within the sign-up page, and supports both self-signup and invitation-based paths.

### 1.1 Core Requirements

- **Clerk Integration**: User authentication and email verification
- **Role Selection**: User chooses their role during sign-up
- **Role-Specific Data Collection**: Collect minimum required data for each role
- **Organization & Entity Creation**: Automatic creation of organizations, companies, teams, etc.
- **Invitation Support**: Users can sign up via invitation links
- **Progress Persistence**: Save onboarding state to allow users to resume
- **Seamless UX**: Multi-step wizard with clear progress indicators

### 1.2 Supported Roles

1. **Recruiter** (self-signup + invitation to join team)
2. **Company Admin** (self-signup only)
3. **Hiring Manager** (invitation-only)
4. **Platform Admin** (manual provisioning only - not covered in this flow)

---

## 2. Onboarding Paths Matrix

| Role | Self-Signup | Invitation | Creates Organization | Creates Company | Joins Team/Organization |
|------|-------------|------------|---------------------|-----------------|------------------------|
| **Recruiter** | ✅ Yes | ✅ Yes (team invite) | ✅ Yes (personal) | ❌ No | ⚠️ Optional (team) |
| **Company Admin** | ✅ Yes | ❌ No | ✅ Yes (company org) | ✅ Yes | ❌ No |
| **Hiring Manager** | ❌ No | ✅ Yes (company invite) | ❌ No | ❌ No | ✅ Yes (company org) |
| **Platform Admin** | ❌ No | ❌ No | N/A | N/A | N/A |

---

## 3. Detailed Flows

### 3.1 Self-Signup Flow: Recruiter

**User Journey:**
1. User lands on `/sign-up`
2. Completes Clerk sign-up (email + password)
3. Verifies email via Clerk
4. Selects "Recruiter" role
5. Enters recruiter profile data
6. (Optional) Enters team invite code to join existing team
7. System creates:
   - User in `identity.users` (synced from Clerk)
   - Personal organization in `identity.organizations`
   - Membership in `identity.memberships` (role: `recruiter`)
   - Recruiter profile in `network.recruiters` (status: `pending`)
   - (Optional) Team membership in `network.team_members`
8. Redirects to recruiter dashboard

**Required Data:**
- ✅ Name (from Clerk)
- ✅ Email (from Clerk)
- ⚠️ Phone number (optional, recommended)
- ⚠️ Bio/tagline (optional, can complete later)
- ⚠️ Industries/specialties (optional, can complete later)
- ⚠️ Team invite code (optional)

**API Calls:**
```typescript
// Step 1: Sync user from Clerk
POST /api/identity/users/sync
{
  clerk_user_id: string;
  email: string;
  name: string;
}

// Step 2: Create personal organization
POST /api/identity/organizations
{
  name: string; // e.g., "John Smith's Organization"
  type: "recruiter";
}

// Step 3: Create membership
POST /api/identity/memberships
{
  user_id: string;
  organization_id: string;
  role: "recruiter";
}

// Step 4: Create recruiter profile
POST /api/recruiters
{
  user_id: string;
  bio?: string;
  phone?: string;
}

// Step 5 (Optional): Join team via invite
POST /api/teams/invitations/{token}/accept
{
  recruiter_id: string;
}
```

---

### 3.2 Self-Signup Flow: Company Admin

**User Journey:**
1. User lands on `/sign-up`
2. Completes Clerk sign-up (email + password)
3. Verifies email via Clerk
4. Selects "Company Admin" role
5. Enters company information
6. System creates:
   - User in `identity.users` (synced from Clerk)
   - Company organization in `identity.organizations` (type: `company`)
   - Membership in `identity.memberships` (role: `company_admin`)
   - Company in `ats.companies` (linked to organization)
7. Redirects to company dashboard

**Required Data:**
- ✅ Name (from Clerk)
- ✅ Email (from Clerk)
- ✅ Company name
- ⚠️ Company website (optional)
- ⚠️ Company industry (optional)
- ⚠️ Company size (optional)
- ⚠️ Company logo (optional, can upload later)

**API Calls:**
```typescript
// Step 1: Sync user from Clerk
POST /api/identity/users/sync
{
  clerk_user_id: string;
  email: string;
  name: string;
}

// Step 2: Create company organization
POST /api/identity/organizations
{
  name: string; // Company name
  type: "company";
}

// Step 3: Create membership
POST /api/identity/memberships
{
  user_id: string;
  organization_id: string;
  role: "company_admin";
}

// Step 4: Create company (linked to organization)
POST /api/companies
{
  name: string;
  identity_organization_id: string;
  website?: string;
  industry?: string;
  size?: string;
}
```

---

### 3.3 Invitation Flow: Hiring Manager

**User Journey:**
1. Company admin sends invitation from their dashboard
2. User receives email with invitation link (e.g., `/sign-up?invite={token}`)
3. User clicks link, lands on `/sign-up` with pre-filled invitation
4. Completes Clerk sign-up (email + password)
5. Verifies email via Clerk
6. Sees "You've been invited to join [Company Name] as a Hiring Manager"
7. Confirms acceptance
8. System creates:
   - User in `identity.users` (synced from Clerk)
   - Membership in `identity.memberships` (role: `hiring_manager`, linked to company org)
   - Updates invitation status to `accepted`
9. Redirects to company dashboard

**Required Data:**
- ✅ Name (from Clerk)
- ✅ Email (from Clerk, must match invitation email)
- ⚠️ Department/title (optional)

**API Calls:**
```typescript
// Step 1: Fetch invitation details
GET /api/identity/invitations/{token}
{
  data: {
    email: string;
    organization_id: string;
    role: string;
    invited_by: string;
    status: "pending";
  }
}

// Step 2: Sync user from Clerk
POST /api/identity/users/sync
{
  clerk_user_id: string;
  email: string; // Must match invitation email
  name: string;
}

// Step 3: Accept invitation (creates membership)
POST /api/identity/invitations/{token}/accept
{
  user_id: string;
}
```

---

### 3.4 Invitation Flow: Recruiter Team Join

**User Journey:**
1. Team owner sends team invitation from their dashboard
2. User receives email with invitation link (e.g., `/sign-up?team_invite={token}`)
3. User clicks link, can either:
   - Sign up as new user (full recruiter onboarding + auto-join team)
   - Sign in as existing recruiter (auto-join team)
4. System creates:
   - (If new user) User, organization, membership, recruiter profile
   - Team membership in `network.team_members`
   - Updates team invitation status to `accepted`
5. Redirects to team dashboard

**Required Data:**
- ✅ Name (from Clerk)
- ✅ Email (from Clerk, must match invitation email)
- ⚠️ Bio (optional, can complete later)

**API Calls:**
```typescript
// Step 1: Fetch team invitation details
GET /api/teams/invitations/{token}
{
  data: {
    team_id: string;
    email: string;
    role: "member" | "admin" | "collaborator";
    invited_by: string;
    status: "pending";
  }
}

// Step 2: Complete recruiter onboarding (if new user)
// ... same as 3.1 ...

// Step 3: Accept team invitation
POST /api/teams/invitations/{token}/accept
{
  recruiter_id: string;
}
```

---

## 4. Multi-Step Wizard Structure

### 4.1 Step Definitions

**Step 1: Clerk Authentication**
- Component: Clerk's `<SignUp />` component
- Actions: Email + password entry, email verification
- Next: Redirect to Step 2

**Step 2: Role Selection** (only for self-signup, skipped for invitations)
- UI: Card-based selection (Recruiter, Company Admin)
- State: `selectedRole: 'recruiter' | 'company_admin' | null`
- Next: Step 3 (role-specific form)

**Step 3: Role-Specific Data Collection**
- Recruiter Form:
  - Bio/tagline (optional)
  - Industries (multi-select, optional)
  - Specialties (multi-select, optional)
  - Phone (optional)
  - Team invite code (text input, optional)
- Company Admin Form:
  - Company name (required)
  - Company website (optional)
  - Company industry (select, optional)
  - Company size (select, optional)
- Hiring Manager Invitation:
  - Display invitation details
  - Confirm acceptance button

**Step 4: Confirmation & Redirect**
- Show success message
- Display next steps
- Redirect to appropriate dashboard

### 4.2 Progress Indicator

```
[ Clerk Sign-Up ] → [ Role Selection ] → [ Profile Setup ] → [ Complete ]
       1                     2                   3                  4
```

For invitation flows:
```
[ Clerk Sign-Up ] → [ Review Invitation ] → [ Complete ]
       1                     2                    3
```

---

## 5. API Endpoints Required

### 5.1 Identity Service Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/identity/users/sync` | POST | Sync user from Clerk | ✅ Exists |
| `/api/identity/organizations` | POST | Create organization | ✅ Exists |
| `/api/identity/memberships` | POST | Create membership | ✅ Exists |
| `/api/identity/invitations` | POST | Create invitation | ✅ Exists (table exists) |
| `/api/identity/invitations/:token` | GET | Get invitation details | ⚠️ **Needs Implementation** |
| `/api/identity/invitations/:token/accept` | POST | Accept invitation | ⚠️ **Needs Implementation** |

### 5.2 Network Service Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/recruiters` | POST | Create recruiter profile | ✅ Exists |
| `/api/recruiters/me` | GET | Get current recruiter | ✅ Exists |
| `/api/teams` | POST | Create team | ✅ Exists (code exists) |
| `/api/teams/invitations` | POST | Create team invitation | ⚠️ **Needs Implementation** |
| `/api/teams/invitations/:token` | GET | Get team invitation | ⚠️ **Needs Implementation** |
| `/api/teams/invitations/:token/accept` | POST | Accept team invitation | ⚠️ **Needs Implementation** |

### 5.3 ATS Service Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/companies` | POST | Create company | ✅ Exists |
| `/api/companies/:id` | GET | Get company details | ✅ Exists |

---

## 6. Frontend Component Structure

### 6.1 File Organization

```
apps/portal/src/
├── app/
│   ├── (auth)/
│   │   └── sign-up/
│   │       ├── [[...sign-up]]/
│   │       │   └── page.tsx                  # Main sign-up page
│   │       └── components/
│   │           ├── onboarding-wizard.tsx      # Main wizard container
│   │           ├── role-selection-step.tsx    # Step 2: Role selection
│   │           ├── recruiter-form-step.tsx    # Step 3a: Recruiter form
│   │           ├── company-admin-form-step.tsx # Step 3b: Company form
│   │           ├── invitation-review-step.tsx  # Step 2 (invitation): Review
│   │           └── completion-step.tsx         # Step 4: Success message
│   └── ...
└── lib/
    ├── api-client.ts                          # Enhanced with onboarding methods
    └── onboarding-state.ts                    # State management for wizard
```

### 6.2 State Management

Use React Context + `useReducer` for wizard state:

```typescript
interface OnboardingState {
  step: number;
  maxStep: number;
  flow: 'self-signup' | 'company-invitation' | 'team-invitation';
  selectedRole: 'recruiter' | 'company_admin' | null;
  invitationToken: string | null;
  invitationData: Invitation | TeamInvitation | null;
  formData: {
    recruiter?: {
      bio?: string;
      phone?: string;
      industries?: string[];
      specialties?: string[];
      teamInviteCode?: string;
    };
    companyAdmin?: {
      companyName: string;
      website?: string;
      industry?: string;
      size?: string;
    };
  };
  submitting: boolean;
  error: string | null;
}
```

---

## 7. Clerk Integration Details

### 7.1 Clerk User Metadata

Store onboarding state in Clerk's user metadata to enable resume:

```typescript
// Public metadata (readable by frontend)
{
  onboarding_completed: boolean;
  selected_role?: 'recruiter' | 'company_admin';
  onboarding_step?: number;
}

// Private metadata (server-only)
{
  splits_user_id?: string;      // identity.users.id
  splits_organization_id?: string;
  splits_recruiter_id?: string; // network.recruiters.id
  splits_company_id?: string;   // ats.companies.id
}
```

### 7.2 Clerk Sign-Up Callback

After Clerk sign-up completes, redirect with session:

```typescript
<SignUp
  afterSignUpUrl="/sign-up/onboarding?step=2"
  redirectUrl="/sign-up/onboarding?step=2"
/>
```

### 7.3 Invitation Link Handling

Invitation links include tokens in query params:

- Company invitation: `/sign-up?invite={token}`
- Team invitation: `/sign-up?team_invite={token}`

The sign-up page detects these params and adjusts the flow accordingly.

---

## 8. Error Handling & Edge Cases

### 8.1 Common Error Scenarios

| Scenario | Handling |
|----------|----------|
| **User closes browser mid-flow** | Save progress in Clerk metadata; resume on return |
| **Email already exists** | Clerk handles this; show "Sign in instead" |
| **Invitation expired** | Show error, offer to request new invitation |
| **Invitation email mismatch** | Block signup, require correct email |
| **API timeout during submission** | Show retry button, preserve form data |
| **Duplicate organization name** | Allow duplicates with warning (Phase 1) |
| **Team invite code invalid** | Show error, allow to skip or retry |

### 8.2 Validation Rules

**Recruiter Form:**
- Bio: Max 500 characters (optional)
- Phone: Valid phone format (optional)
- Industries: Max 5 selections (optional)
- Specialties: Max 10 selections (optional)

**Company Admin Form:**
- Company name: Required, 2-100 characters
- Website: Valid URL format (optional)
- Industry: Select from predefined list (optional)
- Size: Select from predefined ranges (optional)

**Hiring Manager Invitation:**
- Email must match invitation email
- Invitation must not be expired
- Invitation must have status: `pending`

---

## 9. Implementation Checklist

### Phase 1: Backend APIs

- [ ] **Identity Service:**
  - [ ] `GET /api/identity/invitations/:token` (fetch invitation)
  - [ ] `POST /api/identity/invitations/:token/accept` (accept invitation)
  - [ ] `POST /api/identity/invitations` (create invitation)
  - [ ] Add invitation creation endpoint to API Gateway

- [ ] **Network Service:**
  - [ ] `POST /api/teams/invitations` (create team invitation)
  - [ ] `GET /api/teams/invitations/:token` (fetch team invitation)
  - [ ] `POST /api/teams/invitations/:token/accept` (accept team invitation)
  - [ ] Add team invitation endpoints to API Gateway

- [ ] **API Gateway:**
  - [ ] Route invitation endpoints
  - [ ] Route team invitation endpoints
  - [ ] Add onboarding completion webhook handler

### Phase 2: Frontend Components

- [ ] **Onboarding Wizard:**
  - [ ] Create `onboarding-wizard.tsx` with step management
  - [ ] Create `onboarding-state.ts` context provider
  - [ ] Integrate Clerk sign-up component

- [ ] **Role Selection:**
  - [ ] Create `role-selection-step.tsx` with card UI
  - [ ] Add role descriptions and visual cues

- [ ] **Role-Specific Forms:**
  - [ ] Create `recruiter-form-step.tsx`
  - [ ] Create `company-admin-form-step.tsx`
  - [ ] Create `invitation-review-step.tsx`

- [ ] **Completion:**
  - [ ] Create `completion-step.tsx` with success message
  - [ ] Implement role-specific dashboard redirects

### Phase 3: Invitation Flows

- [ ] **Company Admin Dashboard:**
  - [ ] Add "Invite Hiring Manager" button/modal
  - [ ] Display pending invitations
  - [ ] Allow invitation revocation

- [ ] **Team Owner Dashboard:**
  - [ ] Add "Invite Team Member" button/modal
  - [ ] Display pending team invitations
  - [ ] Allow invitation revocation

- [ ] **Email Templates:**
  - [ ] Create hiring manager invitation email
  - [ ] Create team invitation email
  - [ ] Add invitation expiry reminders

### Phase 4: Testing & Polish

- [ ] **Unit Tests:**
  - [ ] Test invitation creation/acceptance
  - [ ] Test onboarding state management
  - [ ] Test form validation

- [ ] **Integration Tests:**
  - [ ] Test full recruiter self-signup flow
  - [ ] Test full company admin self-signup flow
  - [ ] Test hiring manager invitation flow
  - [ ] Test team invitation flow

- [ ] **UI/UX Polish:**
  - [ ] Add loading skeletons
  - [ ] Add error states
  - [ ] Add success animations
  - [ ] Mobile responsiveness
  - [ ] Accessibility audit

---

## 10. Security Considerations

### 10.1 Invitation Tokens

- Use secure random tokens (UUID v4 or equivalent)
- Store hashed tokens in database (optional for Phase 1)
- Set reasonable expiration (7 days default)
- Invalidate on acceptance or revocation

### 10.2 Email Verification

- Require Clerk email verification before proceeding
- Block invitation acceptance if email doesn't match
- Prevent multiple accounts with same email

### 10.3 Rate Limiting

- Limit invitation creation (10 per hour per user)
- Limit sign-up attempts (5 per IP per hour)
- Throttle API calls during onboarding

---

## 11. Analytics & Monitoring

Track key onboarding metrics:

- **Conversion Rates:**
  - Clerk sign-up started → completed
  - Role selection completed
  - Full onboarding completed
  - Time to complete onboarding

- **Drop-off Points:**
  - Which step has highest abandonment?
  - Error frequency by step

- **Invitation Performance:**
  - Invitation acceptance rate
  - Time from invitation sent → accepted
  - Invitation expiry rate

---

## 12. Future Enhancements (Post-Phase 1)

- [ ] Social sign-up (Google, LinkedIn, Microsoft)
- [ ] Domain verification for company admins
- [ ] Bulk invitation upload (CSV)
- [ ] Custom invitation messages
- [ ] Role change requests (user upgrades/downgrades)
- [ ] Organization transfer (change company admin)
- [ ] Team merging and splitting
- [ ] Advanced recruiter onboarding (portfolio, references)
- [ ] Company verification (business documents)
- [ ] Subscription selection during onboarding

---

## 13. Dependencies & Prerequisites

### 13.1 Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# API Gateway
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Services (internal)
IDENTITY_SERVICE_URL=http://localhost:3001
NETWORK_SERVICE_URL=http://localhost:3002
ATS_SERVICE_URL=http://localhost:3003
```

### 13.2 Database Migrations

Ensure these migrations are applied:

- ✅ `identity.invitations` table (004_create_invitations.sql)
- ✅ `network.teams` table (004_teams_and_agencies.sql)
- ✅ `network.team_members` table
- ✅ `network.team_invitations` table

---

## 14. API Response Formats

All endpoints follow the standard envelope format (see `docs/guidance/api-response-format.md`):

**Success:**
```json
{
  "data": { ... }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid invitation token",
    "details": { ... }
  }
}
```

---

## 15. Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1: Backend APIs** | Identity + Network service endpoints | 2-3 days |
| **Phase 2: Frontend Components** | Wizard, forms, state management | 3-4 days |
| **Phase 3: Invitation Flows** | Dashboard integration, email templates | 2-3 days |
| **Phase 4: Testing & Polish** | Tests, UI polish, bug fixes | 2-3 days |
| **Total** | | **9-13 days** |

---

**End of Document**

**Next Steps:**
1. Review and approve this document
2. Identify any missing requirements
3. Begin Phase 1 implementation (backend APIs)
4. Proceed sequentially through phases
