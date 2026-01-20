# UI Cleanup: Gate Actions and Application Detail - COMPLETE

**Date:** January 19, 2026  
**Status:** ✅ COMPLETE  
**Scope:** Removed redundant buttons and improved gate action language for clarity

---

## Changes Summary

### 1. Gate Actions Component (`gate-actions.tsx`)

**Problem:** Company users saw confusing "Approve & Move to Offer" button language that didn't clarify the standard progression path (interview → offer) vs explicit skip option.

**Solution:** Split company gate approve button into two explicit options:
- **"Move to Interview"** (btn-primary) - Standard progression path
- **"Skip to Offer"** (btn-success) - Explicit skip for fast-track candidates

**Implementation:**
- Added `nextStage` state to track whether moving to interview or skipping to offer
- Modified button rendering for company gate to show two distinct options
- Updated `ApproveGateModal` gateName to show "Company Gate (Skip to Offer)" when applicable

**Code Changes:**
```typescript
// Added state
const [nextStage, setNextStage] = useState<'interview' | 'offer'>('interview');

// Split approve button for company gate
{showCompanyActions ? (
    <>
        <button className="btn btn-primary btn-sm" onClick={() => {
            setNextStage('interview');
            setModalType('approve');
        }}>
            <i className="fa-duotone fa-regular fa-calendar"></i>
            Move to Interview
        </button>
        <button className="btn btn-success btn-sm" onClick={() => {
            setNextStage('offer');
            setModalType('approve');
        }}>
            <i className="fa-duotone fa-regular fa-handshake"></i>
            Skip to Offer
        </button>
    </>
) : (
    <button className="btn btn-primary btn-sm" onClick={() => setModalType('approve')}>
        <i className="fa-duotone fa-regular fa-circle-check"></i>
        {getActionButtonText()}
    </button>
)}
```

### 2. Application Detail Actions Card (`application-detail-client.tsx`)

**Problem:** Actions card contained duplicate buttons that were already available in the main content panels:
- "View Candidate" - Already in Candidate detail panel with expand functionality
- "View Job" - Already in Job detail panel with expand functionality
- "Reject" - Duplicate of gate actions reject button

**Solution:** Removed all three redundant buttons from Actions card.

**Remaining Actions:**
- **Platform Admin Only:**
  - Update Stage (for direct stage manipulation)
- **All Authorized Users:**
  - Add Note (useful utility)
  - Review & Submit (only shown when stage='screen')
- **Quick Stage Actions:**
  - Move to Interview (when stage='submitted')
  - Make Offer (when stage='interview')
  - Mark as Hired (when stage='offer')

**Result:** Actions card now contains only unique, non-redundant actions that aren't available elsewhere on the page.

---

## Benefits

### Clarity Improvements
1. **Explicit progression paths:** Users now see clear distinction between standard workflow (interview) and fast-track option (skip to offer)
2. **No ambiguity:** "Approve & Move to Offer" was misleading - it suggested skipping interview was the only option
3. **Standard vs exception:** Primary button color for standard path, success color for skip option

### UX Improvements
1. **Reduced redundancy:** Removed 3 duplicate buttons that added visual clutter
2. **Single source of truth:** Each action appears once in the most logical location
3. **Cleaner interface:** Actions card now focused on truly unique actions

### Consistency
1. **Gate actions:** Reject, Request Info, Approve/Progress buttons in gate actions card
2. **Actions card:** Add Note, Review, Quick Stage Progression buttons
3. **Main panels:** View/expand candidate and job details inline

---

## Testing Checklist

- [ ] Navigate to application detail page with 'submitted' stage
- [ ] Verify company gate shows two buttons: "Move to Interview" and "Skip to Offer"
- [ ] Click "Move to Interview" and verify modal shows standard gate approval message
- [ ] Click "Skip to Offer" and verify modal shows "Company Gate (Skip to Offer)" in title
- [ ] Verify Actions card no longer shows "View Candidate" button
- [ ] Verify Actions card no longer shows "View Job" button
- [ ] Verify Actions card no longer shows duplicate "Reject" button
- [ ] Verify gate actions card still shows its own "Reject" button
- [ ] Verify candidate panel still has expand/collapse functionality
- [ ] Verify job panel still has expand/collapse functionality

---

## Files Modified

1. **apps/portal/src/app/portal/applications/[id]/components/gate-actions.tsx**
   - Added `nextStage` state
   - Split company gate approve button into two options
   - Updated modal gate name for skip to offer

2. **apps/portal/src/app/portal/applications/[id]/components/application-detail-client.tsx**
   - Removed "View Candidate" button from Actions card
   - Removed "View Job" button from Actions card
   - Removed duplicate "Reject" button from Actions card

---

## Related Context

**Previous Issue:** User saw only 1 of 2 submitted applications due to missing CRA records for legacy applications (created before gate system implementation).

**Resolution:** Created migration 033 to backfill CRA records for all submitted applications without gate data.

**Current Issue:** After fixing data issue, user noticed UI redundancy and confusing action language during testing.

**This Fix:** Cleaned up UI based on user feedback during application detail page review.

---

**Implementation Status:** ✅ COMPLETE - Ready for testing
