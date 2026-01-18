# Phase 4: Recruiter Proposals - Portal UI Complete ✅

**Date**: January 18, 2026  
**Status**: ✅ Portal UI Implemented | Build Verified  
**Progress**: Task 8 Complete (Portal Proposal Form)

---

## Overview

Completed the Portal UI for Phase 4 (Recruiter Proposals), enabling recruiters to propose jobs to candidates through a professional form interface.

## Implementation Summary

### **Task 8: Portal UI - Recruiter Proposal Form** ✅ COMPLETE

**Files Created**:

1. **`apps/portal/src/app/portal/candidates/[id]/propose/page.tsx`** (11 lines)
   - Server component that wraps the client component
   - Passes candidate ID from URL params
   - Follows Next.js 16 async params pattern

2. **`apps/portal/src/app/portal/candidates/[id]/propose/components/propose-job-client.tsx`** (337 lines)
   - Complete proposal form with progressive loading
   - Job selection dropdown
   - Optional pitch textarea (500 char limit)
   - Form validation
   - API integration
   - Success/error handling

### **Files Modified**:

1. **`apps/portal/src/app/portal/candidates/[id]/components/candidate-detail-client.tsx`** (Updated button section)
   - Added "Propose Job" button to candidate header
   - Made primary success button
   - Changed existing "Send Job Opportunity" to outline style

---

## Implementation Details

### **Proposal Form Features** ✅

**1. Progressive Loading Pattern**:
```tsx
// Load candidate first (fast)
useEffect(() => loadCandidate() }, [candidateId]);

// Load jobs in parallel (after candidate)
useEffect(() => loadJobs() }, []);

// Independent loading states
const [candidateLoading, setCandidateLoading] = useState(true);
const [jobsLoading, setJobsLoading] = useState(true);
```

**2. Job Selection**:
- Fetches recruiter's open jobs from `/jobs?filters[status]=open&include=company`
- Displays job title + company name in dropdown
- Validates selection is required

**3. Pitch Input**:
- Optional textarea with 500 character limit
- Real-time character counter
- Validation for max length

**4. Form Validation**:
```tsx
const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!selectedJobId) {
        errors.job = 'Please select a job to propose';
    }
    
    if (pitch && pitch.length > 500) {
        errors.pitch = 'Pitch must be 500 characters or less';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
};
```

**5. API Integration**:
- Endpoint: `POST /applications/propose`
- Payload: `{ candidate_id, job_id, pitch }`
- Success: Redirects to candidate detail with `?proposed=true` query param
- Error: Displays error message in form

**6. UI/UX Features**:
- Breadcrumb navigation: Candidates → [Name] → Propose Job
- Loading states during submission
- Error alerts for API failures
- Help text explaining proposal workflow
- Warning when no open jobs available
- DaisyUI v5 fieldset pattern for forms

---

## Code Statistics

### **Portal UI Implementation**:
- **Page Component**: 11 lines
- **Client Component**: 337 lines
- **Button Update**: ~25 lines modified
- **Total New Code**: ~373 lines

### **Phase 4 Progress Update**:
- **Backend Complete**: ~430 lines (100%)
- **Notifications Complete**: ~268 lines (100%)
- **Portal UI Complete**: ~373 lines (100%)
- **Total Complete**: ~1,071 lines
- **Remaining**: ~300 lines (Candidate UI - Task 9)
- **Overall Progress**: ~1,071 of ~1,371 total lines (78%)

---

## Build Verification ✅

**Command**: `pnpm build` in apps/portal  
**Result**: ✅ Success - 0 TypeScript errors

**New Route Added**:
```
ƒ /portal/candidates/[id]/propose
```

**Build Output**:
- ✓ Compiled successfully in 8.5s
- ✓ Finished TypeScript in 10.6s
- ✓ Collecting page data using 31 workers in 2.4s
- ✓ Generating static pages using 31 workers (65/65)

---

## User Flow

### **Recruiter Proposes Job**:

1. Navigate to candidate detail page: `/portal/candidates/:id`
2. Click "Propose Job" button (green primary button)
3. Redirected to: `/portal/candidates/:id/propose`
4. Select job from dropdown (only open jobs shown)
5. Optionally enter pitch (max 500 chars)
6. Click "Send Proposal" button
7. Backend creates application with `recruiter_proposed=true`
8. Backend publishes `application.recruiter_proposed` event
9. Phase 2 consumer sends "New Opportunity" email to candidate
10. Redirected to candidate detail: `/portal/candidates/:id?proposed=true`

### **Success State**:
- Success toast notification (future enhancement)
- Candidate detail page shows proposal in applications list
- Candidate receives email notification (Phase 2 consumer)

---

## API Integration

### **Endpoint**: `POST /api/v2/applications/propose`

**Request**:
```json
{
  "candidate_id": "uuid",
  "job_id": "uuid",
  "pitch": "Optional personalized message..."
}
```

**Response**:
```json
{
  "data": {
    "id": "application-uuid",
    "candidate_id": "uuid",
    "job_id": "uuid",
    "recruiter_proposed": true,
    "status": "proposed",
    ...
  }
}
```

**Error Handling**:
- 400: Validation errors (missing job, invalid IDs)
- 401: Not authenticated
- 403: Not authorized (not recruiter or not assigned to candidate)
- 409: Conflict (duplicate proposal, candidate already applied)
- 500: Server error

---

## UI Components Structure

```
apps/portal/src/app/portal/candidates/[id]/
├── page.tsx                           # Candidate detail (existing)
├── propose/
│   ├── page.tsx                       # Proposal page wrapper (NEW)
│   └── components/
│       └── propose-job-client.tsx     # Proposal form (NEW)
└── components/
    └── candidate-detail-client.tsx    # Updated with "Propose Job" button
```

---

## DaisyUI v5 Patterns Used ✅

**Semantic Fieldset Pattern**:
```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Select Job *</legend>
    <select className="select w-full" {...props}>
        <option>...</option>
    </select>
    <p className="fieldset-label">Helper text</p>
</fieldset>
```

**Card Layout**:
```tsx
<form onSubmit={handleSubmit} className="card bg-base-100 shadow">
    <div className="card-body">
        <h2 className="card-title">Proposal Details</h2>
        {/* Form fields */}
        <div className="card-actions justify-end">
            {/* Submit buttons */}
        </div>
    </div>
</form>
```

**Alert Messages**:
```tsx
<div className="alert alert-info">
    <i className="fa-duotone fa-regular fa-circle-info"></i>
    <div>
        <div className="font-semibold">How Proposals Work</div>
        <div className="text-sm mt-1">Description...</div>
    </div>
</div>
```

---

## Next Steps

### **Task 9: Candidate UI - Proposal Review Page** ⏹️ IMMEDIATE NEXT (60-90 minutes)

**File**: `apps/candidate/src/app/proposals/[id]/page.tsx` (~300 lines)

**Requirements**:
1. **Display Proposal**:
   - Job title, company name
   - Recruiter name and info
   - Pitch message (if provided)
   - Job description
   - Proposal date

2. **Accept Action**:
   - Accept button
   - Confirmation modal
   - API call: `POST /api/v2/applications/:id/accept-proposal`
   - Success → redirect to applications

3. **Decline Action**:
   - Decline button
   - Reason textarea (optional)
   - API call: `POST /api/v2/applications/:id/decline-proposal`
   - Success → redirect to proposals list

4. **UI/UX**:
   - Loading states
   - Success/error messages
   - Responsive design
   - Breadcrumb navigation

**Estimated Time**: 60-90 minutes for complete candidate proposal review page

---

### **Task 10: Full Build Verification** ⏹️ FINAL (15-20 minutes)

**Steps**:
1. ✅ Build portal app (already done)
2. Build candidate app
3. Build API gateway
4. Build ATS service
5. Build notification service (already done)

**Commands**:
```bash
cd apps/candidate && pnpm build
cd services/api-gateway && pnpm build
cd services/ats-service && pnpm build
```

---

## Testing Checklist

### **Manual Testing** (Portal UI):
- [ ] Navigate to candidate detail page
- [ ] Click "Propose Job" button
- [ ] Verify proposal form loads correctly
- [ ] Select job from dropdown
- [ ] Enter pitch text
- [ ] Submit proposal
- [ ] Verify redirect to candidate detail
- [ ] Check application appears in list
- [ ] Verify candidate receives email

### **Edge Cases**:
- [ ] No open jobs available (shows warning)
- [ ] Network error during submission (shows error)
- [ ] Invalid candidate ID (shows error)
- [ ] Already proposed to this job (backend validates)
- [ ] Pitch exceeds 500 characters (validation error)

---

## Documentation Updates Needed

- [ ] Update Phase 4 planning doc with Portal UI completion
- [ ] Add screenshots of proposal form to docs
- [ ] Document API endpoint in API specs
- [ ] Add user guide for recruiters

---

## Success Criteria ✅

- ✅ Proposal form page created and compiles
- ✅ Job selection dropdown implemented
- ✅ Pitch textarea with validation
- ✅ Form validation implemented
- ✅ API integration complete
- ✅ Success/error handling
- ✅ "Propose Job" button added to candidate detail
- ✅ Build verification passed (0 errors)
- ✅ Route registered in Next.js build

**Task 8 Status**: 100% COMPLETE 🎉

---

**Implementation Date**: January 18, 2026  
**Implemented By**: GitHub Copilot  
**Status**: ✅ READY FOR CANDIDATE UI IMPLEMENTATION

