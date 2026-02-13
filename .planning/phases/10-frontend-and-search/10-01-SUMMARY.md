---
phase: 10
plan: 01
subsystem: frontend
tags: [ui, forms, job-wizard, commute-types, job-level]
dependencies:
  requires: [09-01]
  provides: [job-form-commute-types, job-form-job-level]
  affects: []
tech-stack:
  added: []
  patterns: [multi-select-checkboxes, form-state-management]
file-tracking:
  created: []
  modified:
    - apps/portal/src/app/portal/roles/components/wizards/wizard-steps/types.ts
    - apps/portal/src/app/portal/roles/components/wizards/wizard-steps/step-2-compensation.tsx
    - apps/portal/src/app/portal/roles/components/modals/role-wizard-modal.tsx
decisions:
  - key: checkbox-layout
    choice: flex-wrap layout for commute type checkboxes
    rationale: 6 options need responsive wrapping for mobile/desktop
  - key: job-level-as-select
    choice: dropdown select for job level
    rationale: 8 mutually exclusive options, standard pattern
  - key: optional-fields
    choice: only send commute_types and job_level if set
    rationale: preserves existing null values on edit, doesn't force selection
metrics:
  duration: 4m
  completed: 2026-02-13
---

# Phase 10 Plan 01: Job Wizard Commute Type & Job Level Summary

**One-liner:** Multi-select commute types (6 checkboxes) and job level dropdown (8 options) in role wizard Step 2

## What Was Accomplished

### Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 & 2 | Extend FormData and add form controls | 6f0f9925 | types.ts, step-2-compensation.tsx, role-wizard-modal.tsx |

### Key Features Delivered

1. **FormData Type Extension**
   - Added `commute_types: string[]` for multi-select array
   - Added `job_level: string` for single-select dropdown
   - Placed after `open_to_relocation` in Step 2 section

2. **Step 2 Form Controls**
   - **Commute Type fieldset:** 6 checkboxes in flex-wrap layout
     - remote, hybrid_1-4, in_office
     - Checkbox size: `checkbox-sm` for compact display
     - Toggle handler: adds/removes from array
   - **Job Level fieldset:** Dropdown select with 8 options
     - entry, mid, senior, lead, manager, director, vp, c_suite
     - Empty default option: "Select Level"

3. **Modal State Management**
   - **Init (line 63):** `commute_types: [], job_level: ""`
   - **Edit load (line 130):** Populates from API response `job.commute_types || []` and `job.job_level || ""`
   - **Reset (line 294):** Clears to empty array and empty string
   - **Payload (line 366):** Conditionally includes if set (`commute_types.length > 0` or `job_level` truthy)

## Technical Implementation

### Form Control Patterns

**Commute Type Checkboxes:**
```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Commute Type</legend>
    <div className="flex flex-wrap gap-4">
        {COMMUTE_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="label cursor-pointer gap-2">
                <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={formData.commute_types.includes(option.value)}
                    onChange={(e) => {
                        setFormData((prev) => ({
                            ...prev,
                            commute_types: e.target.checked
                                ? [...prev.commute_types, option.value]
                                : prev.commute_types.filter(t => t !== option.value),
                        }));
                    }}
                />
                <span className="label-text">{option.label}</span>
            </label>
        ))}
    </div>
</fieldset>
```

**Job Level Dropdown:**
```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Job Level</legend>
    <select
        className="select w-full"
        value={formData.job_level}
        onChange={(e) =>
            setFormData((prev) => ({
                ...prev,
                job_level: e.target.value,
            }))
        }
    >
        <option value="">Select Level</option>
        {JOB_LEVEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
</fieldset>
```

### Placement

New fieldsets inserted after "Employment Type" and before "Additional Options" in Step 2, maintaining logical grouping:
1. Salary fields
2. Display options (show salary)
3. Fee/Guarantee fields
4. **Employment Type**
5. **Commute Type** (NEW)
6. **Job Level** (NEW)
7. Additional Options (open to relocation)

## Decisions Made

1. **Multi-select via checkboxes (not multi-select dropdown)**
   - Rationale: 6 options visible at once, no hidden selections
   - UX benefit: Users can see all selected options simultaneously
   - Mobile-friendly: flex-wrap adapts to screen size

2. **Conditional payload inclusion**
   - Only send `commute_types` if array length > 0
   - Only send `job_level` if string is truthy
   - Preserves null values on edit (doesn't force selection)
   - Aligns with existing optional field pattern (location, department, etc.)

3. **Empty string default for job_level**
   - Consistent with other select fields in the form
   - "Select Level" placeholder guides users
   - Allows submission without selection (optional field)

## Deviations from Plan

None - plan executed exactly as written.

## Testing Notes

### Type Safety Verification

```bash
cd apps/portal && npx tsc --noEmit --project tsconfig.json
# Result: No type errors
```

### Form State Verification

```bash
grep -n "commute_types" role-wizard-modal.tsx
# 63:        commute_types: [],                    (init)
# 130:       commute_types: job.commute_types || [],(edit load)
# 294:       commute_types: [],                    (reset)
# 366:       if (formData.commute_types.length > 0)(payload)
```

All 4 required locations confirmed.

## Integration Points

### API Contract

Sends to `/jobs` (POST/PATCH):
```typescript
{
    // ... existing fields
    commute_types?: string[],  // if length > 0
    job_level?: string,        // if truthy
}
```

Expects from `/jobs/:id` (GET):
```typescript
{
    // ... existing fields
    commute_types: string[] | null,
    job_level: string | null,
}
```

### Downstream Impact

- **Job list filters (10-02):** Will use these fields for filtering
- **Job detail view:** Should display commute types and job level (future UI enhancement)
- **Search (10-03):** Will filter by these new fields

## Next Phase Readiness

**Ready for 10-02 (Job List Filters)**

Prerequisites met:
- ✅ FormData type includes commute_types and job_level
- ✅ Form controls functional and styled
- ✅ API payload includes new fields
- ✅ Edit mode populates from API

**Potential concerns:**
- None identified

**Recommendations:**
- Verify API actually returns `commute_types` and `job_level` in GET response before implementing filters
- Consider adding visual indicators in job list (e.g., badges for remote/hybrid)

## Files Modified

### `types.ts`
- Added `commute_types: string[]` to FormData interface
- Added `job_level: string` to FormData interface

### `step-2-compensation.tsx`
- Defined `COMMUTE_TYPE_OPTIONS` const array (6 options)
- Defined `JOB_LEVEL_OPTIONS` const array (8 options)
- Added Commute Type fieldset with 6 checkboxes
- Added Job Level fieldset with dropdown select

### `role-wizard-modal.tsx`
- Init: Set `commute_types: []` and `job_level: ""`
- Edit load: Populate from `job.commute_types` and `job.job_level`
- Reset: Clear to `[]` and `""`
- Payload: Conditionally include if set

## Metrics

- **Duration:** ~4 minutes
- **Commits:** 1
- **Files modified:** 3
- **Lines added:** ~83
- **Type errors:** 0
