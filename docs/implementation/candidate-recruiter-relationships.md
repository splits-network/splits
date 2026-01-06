# Candidate Recruiter Relationships - Integration Plan

**Feature**: Display and manage recruiter relationships on candidate profile page

**Date**: December 19, 2025  
**Status**: Planning  
**Tracking**: Phase 1 - Candidate Experience

---

## Overview

Candidates need visibility into their recruiter relationships to understand:
- Who is representing them in the job market
- When those relationships expire (12-month terms)
- Their relationship history and status
- How to take action (renew, contact, etc.)

This feature adds a "My Recruiters" section to the candidate profile page displaying active and historical recruiter relationships.

---

## Architecture

### Data Model (Already Exists)

```typescript
// packages/shared-types/src/models.ts
interface RecruiterCandidate {
  id: string;
  recruiter_id: string;
  candidate_id: string;
  relationship_start_date: Date;
  relationship_end_date: Date; // 12 months from start
  status: 'active' | 'expired' | 'terminated';
  invited_at: Date;
  invitation_token?: string;
  invitation_expires_at?: Date;
  consent_given: boolean;
  consent_given_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

### Backend Services

**Network Service** (Already implements):
- `GET /recruiter-candidates/candidate/:candidateId` - Get all relationships for a candidate
- `POST /recruiter-candidates/:id/renew` - Renew relationship
- Full CRUD for recruiter-candidate relationships

**API Gateway** (Needs new endpoint):
- `GET /api/candidates/me/recruiters` - Get authenticated candidate's recruiters with enriched data
  - Fetches relationships from network-service
  - Enriches with recruiter user details from identity-service
  - Returns formatted response with profile info

---

## API Specification

### New Endpoint: Get My Recruiters

**Route**: `GET /api/candidates/me/recruiters`  
**Auth**: Required (Candidate only)  
**Service**: API Gateway

**Response**: `200 OK`
```typescript
{
  data: {
    active: RecruiterRelationship[];
    expired: RecruiterRelationship[];
    terminated: RecruiterRelationship[];
  }
}

interface RecruiterRelationship {
  id: string; // relationship ID
  recruiter_id: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_bio?: string;
  recruiter_status: string;
  relationship_start_date: string;
  relationship_end_date: string;
  status: 'active' | 'expired' | 'terminated';
  consent_given: boolean;
  consent_given_at?: string;
  created_at: string;
  days_until_expiry?: number; // for active relationships
}
```

**Business Logic**:
1. Verify user is a candidate (not recruiter/admin)
2. Get candidate ID from identity service using user_id
3. Fetch relationships from network service
4. For each relationship, enrich with recruiter details:
   - Get recruiter profile from network service
   - Get user details from identity service
5. Calculate days_until_expiry for active relationships
6. Group by status (active, expired, terminated)
7. Sort: active by expiry date, others by relationship_start_date DESC

**Error Responses**:
- `401` - Not authenticated
- `403` - Not a candidate user
- `404` - Candidate profile not found

---

## Frontend Implementation

### File Structure

```
apps/candidate/src/
├── app/(authenticated)/profile/
│   └── page.tsx (update)
├── components/
│   └── recruiters/
│       ├── recruiter-card.tsx (new)
│       └── my-recruiters-section.tsx (new)
└── lib/
    └── api.ts (update)
```

### Components

#### 1. `my-recruiters-section.tsx`

**Purpose**: Main container component for displaying recruiter relationships

**Props**: None (fetches own data)

**Features**:
- Fetches recruiter relationships on mount
- Loading and error states
- Tabs/sections for: Active, Expired, Terminated
- Empty states for each section
- Visual indicators for relationships expiring soon (<30 days)

**UI Structure**:
```tsx
<div className="card bg-base-100 shadow">
  <div className="card-body">
    <h2 className="card-title">My Recruiters</h2>
    
    {/* Active Relationships */}
    <div className="space-y-3">
      {active.map(rel => <RecruiterCard key={rel.id} relationship={rel} />)}
    </div>
    
    {/* Expander for Historical */}
    <details className="collapse">
      <summary>View Past Relationships</summary>
      {/* Expired & Terminated */}
    </details>
  </div>
</div>
```

#### 2. `recruiter-card.tsx`

**Purpose**: Display individual recruiter relationship details

**Props**:
```typescript
interface RecruiterCardProps {
  relationship: RecruiterRelationship;
  showActions?: boolean;
}
```

**Features**:
- Recruiter name, email, bio
- Status badge (active/expired/terminated)
- Date range display
- Expiry warning for active relationships (<30 days)
- Actions: Contact recruiter, Renew (if eligible)

**UI Layout**:
```
┌─────────────────────────────────────────┐
│ [Avatar] John Smith                 [●] │
│          john@example.com          Active│
│                                          │
│ Relationship: Jan 15, 2025 - Jan 15, 2026│
│ ⚠️  Expiring in 27 days                  │
│                                          │
│ Bio: 10+ years placing software engineers│
│                                          │
│ [Contact] [Renew Relationship]           │
└─────────────────────────────────────────┘
```

### API Client Methods

```typescript
// apps/candidate/src/lib/api.ts

export interface RecruiterRelationship {
  id: string;
  recruiter_id: string;
  recruiter_name: string;
  recruiter_email: string;
  recruiter_bio?: string;
  relationship_start_date: string;
  relationship_end_date: string;
  status: 'active' | 'expired' | 'terminated';
  days_until_expiry?: number;
}

export interface MyRecruitersResponse {
  active: RecruiterRelationship[];
  expired: RecruiterRelationship[];
  terminated: RecruiterRelationship[];
}

export async function getMyRecruiters(authToken: string | null): Promise<MyRecruitersResponse> {
  return fetchApi<MyRecruitersResponse>('/api/candidates/me/recruiters', {}, authToken);
}
```

---

## UI/UX Specifications

### Visual Design Principles

1. **Primary Focus**: Active relationships (always visible)
2. **Secondary Info**: Historical relationships (collapsible)
3. **Urgency Indicators**: Warning badges for expiring relationships
4. **Action Clarity**: Clear CTAs for renewal/contact

### Status Badges

```tsx
// Active: green
<span className="badge badge-success">Active</span>

// Expiring Soon (<30 days): warning
<span className="badge badge-warning">Expires Soon</span>

// Expired: neutral
<span className="badge badge-ghost">Expired</span>

// Terminated: error (muted)
<span className="badge badge-error badge-outline">Terminated</span>
```

### Empty States

**No Active Recruiters**:
```
You don't have any active recruiter relationships yet.

Recruiters will invite you to establish a relationship when they 
start representing you for job opportunities.
```

**No Historical Relationships**:
```
No past relationships
```

### Responsive Behavior

- **Desktop**: Card layout with avatar, full info
- **Mobile**: Stacked layout, condensed info
- **Tablet**: Hybrid approach

---

## Implementation Steps

### Phase 1: Backend (API Gateway)

1. **Create new route file**
   - File: `services/api-gateway/src/routes/candidates/me-recruiters.ts`
   - Implement `GET /api/candidates/me/recruiters`
   - Add RBAC check (candidate only)
   - Fetch and enrich relationship data

2. **Register route**
   - Update `services/api-gateway/src/routes/candidates/routes.ts`
   - Import and register new route

3. **Test endpoint**
   - Manual test with existing data
   - Verify response format matches spec

### Phase 2: Frontend (Candidate Portal)

1. **Add API client method**
   - Update `apps/candidate/src/lib/api.ts`
   - Add `getMyRecruiters()` function
   - Add TypeScript interfaces

2. **Create components**
   - Create `apps/candidate/src/components/recruiters/` directory
   - Implement `recruiter-card.tsx`
   - Implement `my-recruiters-section.tsx`

3. **Update profile page**
   - Add `<MyRecruitersSection />` to profile page
   - Position after personal info, before documents

4. **Styling & polish**
   - Apply DaisyUI fieldset patterns
   - Add loading skeletons
   - Implement error states
   - Add animations/transitions

### Phase 3: Testing

1. **Manual Testing**
   - Test with no relationships
   - Test with active relationship
   - Test with expiring relationship (<30 days)
   - Test with expired relationship
   - Test with terminated relationship
   - Test with multiple relationships

2. **Edge Cases**
   - Missing recruiter profile data
   - Missing user details
   - Network errors
   - Permission errors

3. **Responsive Testing**
   - Mobile viewport
   - Tablet viewport
   - Desktop viewport

---

## Future Enhancements

1. **Relationship Renewal**: Allow candidates to initiate renewal requests
2. **Direct Messaging**: Contact recruiter via in-app messaging
3. **Relationship Insights**: Show placements made, jobs applied via recruiter
4. **Recruiter Ratings**: Allow candidates to rate/review recruiters
5. **Notifications**: Alert when relationship is expiring (30/14/7 days)

---

## Security Considerations

1. **Authorization**: Candidates can ONLY see their own relationships
2. **Data Privacy**: Don't expose recruiter's full profile, only relevant info
3. **Rate Limiting**: Apply standard rate limits to prevent abuse
4. **Audit Trail**: Log when candidates view recruiter relationships

---

## Success Metrics

1. **Adoption**: % of candidates viewing their recruiter relationships
2. **Engagement**: Time spent on recruiters section
3. **Actions**: Number of renewal requests initiated
4. **Support**: Reduction in "who is my recruiter" support tickets

---

## Dependencies

### Existing Services
- ✅ Network Service: `/recruiter-candidates/candidate/:candidateId` endpoint exists
- ✅ Identity Service: User profile lookup exists
- ✅ Database: `recruiter_candidates` table exists

### New Components
- ❌ API Gateway: New `/api/candidates/me/recruiters` endpoint
- ❌ Frontend: New recruiter relationship components

---

## Timeline Estimate

- **Backend**: 2-3 hours
  - Route implementation: 1.5 hours
  - Testing: 1 hour

- **Frontend**: 4-5 hours
  - Component development: 2.5 hours
  - Integration: 1 hour
  - Styling/polish: 1.5 hours

- **Testing & QA**: 1-2 hours

**Total**: 7-10 hours

---

## Acceptance Criteria

- [ ] Candidate can view all their recruiter relationships on profile page
- [ ] Active relationships are displayed prominently
- [ ] Relationships expiring within 30 days show warning indicator
- [ ] Historical relationships are accessible but not primary focus
- [ ] Empty states are clear and helpful
- [ ] UI follows DaisyUI/TailwindCSS patterns from form-controls.md
- [ ] API endpoint properly enforces candidate-only access
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Loading and error states are handled gracefully
- [ ] No console errors or warnings

---

## References

- [User Roles and Permissions](../guidance/user-roles-and-permissions.md)
- [Form Controls Guidance](../guidance/form-controls.md)
- [API Response Format](../guidance/api-response-format.md)
- [Phase 1 PRD](../splits-network-phase1-prd.md)
- Network Service: `services/network-service/src/routes/recruiter-candidates/routes.ts`
- Shared Types: `packages/shared-types/src/models.ts`
