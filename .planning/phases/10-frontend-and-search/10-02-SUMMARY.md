---
phase: 10-frontend-and-search
plan: 02
subsystem: frontend
tags: [ui, filtering, job-details, commute-types, job-level]
requires: [09-01]
provides:
  - Job detail views display commute types and job level
  - Job list supports filtering by commute type and job level
affects: []
tech-stack:
  added: []
  patterns: [conditional-rendering, filter-propagation]
key-files:
  created: []
  modified:
    - apps/portal/src/app/portal/roles/types.ts
    - apps/portal/src/app/portal/roles/components/details-view.tsx
    - apps/portal/src/app/portal/roles/components/detail-sidebar.tsx
    - apps/portal/src/app/portal/roles/components/header-filters.tsx
decisions:
  - Use COMMUTE_TYPE_LABELS and JOB_LEVEL_LABELS maps for human-readable display
  - Render Work Arrangement and Job Level cards conditionally (only if data present)
  - Single-select dropdowns for commute_type and job_level filters
  - Keep "Remote Only" toggle for backward compatibility
  - Filter propagation happens automatically via useStandardList hook
metrics:
  duration: 4.4 min
  completed: 2026-02-13
---

# Phase 10 Plan 02: Job Detail Display & Filters Summary

**One-liner:** Job details show commute types and job level with human-readable labels; job list supports filtering by both fields

## What Was Built

### Task 1: Type Extensions and Detail View Display
- **Extended Job interface** in `types.ts` with `commute_types?: string[] | null` and `job_level?: string | null`
- **Extended UnifiedJobFilters** with `commute_type?: string` and `job_level?: string`
- **Added label maps** (COMMUTE_TYPE_LABELS, JOB_LEVEL_LABELS) in details-view.tsx
- **Added two new QuickStatsSection cards**:
  - **Work Arrangement card**: Shows commute types (comma-separated, human-readable)
  - **Job Level card**: Shows job level with human-readable label
- **Updated local Job interfaces** in details-view.tsx and detail-sidebar.tsx for type consistency

### Task 2: Filter Controls
- **Added Commute Type filter dropdown** in header-filters.tsx:
  - 6 options: Remote, Hybrid (1-4 days), In Office
  - Single-select (matches API any-match semantics)
- **Added Job Level filter dropdown**:
  - 8 options: Entry → C-Suite
  - Single-select
- **Updated filter reset logic** to clear new filters
- **Updated active filter count** to include new filters
- **Filter propagation**: Filters automatically propagate through useStandardList to API via UnifiedJobFilters

## Deviations from Plan

None - plan executed exactly as written.

## Technical Decisions

### Label Map Pattern
Centralized human-readable labels in const objects rather than inline ternaries for maintainability:
```typescript
const COMMUTE_TYPE_LABELS: Record<string, string> = {
    remote: 'Remote',
    hybrid_1: 'Hybrid (1 day in office)',
    // ...
};
```

### Conditional Rendering
Cards only render when data is present:
- Work Arrangement: `{job.commute_types && job.commute_types.length > 0 && (...)}`
- Job Level: `{job.job_level && (...)}`

This prevents empty cards and keeps UI clean for legacy jobs without these fields.

### Single-Select Filters
Used single-select dropdowns rather than multi-select because:
1. Simpler UX for most use cases
2. API supports any-match filtering (selecting "remote" finds jobs with remote in their commute_types array)
3. Matches existing filter pattern (employment_type, status)

### Backward Compatibility
Kept "Remote Only" toggle in addition to Commute Type filter for users familiar with old UI pattern.

## Files Modified

### apps/portal/src/app/portal/roles/types.ts (11 lines)
- Added `commute_types` and `job_level` to Job interface
- Added `commute_type` and `job_level` to UnifiedJobFilters

### apps/portal/src/app/portal/roles/components/details-view.tsx (42 lines)
- Added fields to local Job interface
- Added COMMUTE_TYPE_LABELS and JOB_LEVEL_LABELS maps
- Added Work Arrangement and Job Level cards to QuickStatsSection

### apps/portal/src/app/portal/roles/components/detail-sidebar.tsx (2 lines)
- Added fields to local Job interface for type consistency

### apps/portal/src/app/portal/roles/components/header-filters.tsx (42 lines)
- Added two filter fieldsets (Commute Type, Job Level)
- Updated handleReset and activeFilterCount

## Integration Points

### Filter Propagation Flow
```
header-filters.tsx
  → setFilter("commute_type", value)
  → useStandardList hook (in roles-filter-context.tsx)
  → API Gateway /jobs endpoint
  → ATS Service repository.list()
  → Supabase .overlaps() for commute_types array matching
```

### Display Flow
```
API returns jobs with commute_types/job_level
  → details-view.tsx receives Job object
  → Maps raw values through label dictionaries
  → Conditionally renders cards if data present
```

## Testing Notes

### Manual Testing Checklist
- [ ] Job detail view shows Work Arrangement card when commute_types is set
- [ ] Job detail view shows Job Level card when job_level is set
- [ ] Cards display human-readable labels (not raw enum values)
- [ ] Filter dropdown includes Commute Type and Job Level dropdowns
- [ ] Selecting a commute type triggers filtered API call
- [ ] Selecting a job level triggers filtered API call
- [ ] Reset button clears new filters
- [ ] Active filter count badge includes new filters
- [ ] TypeScript compilation passes with zero errors

### Edge Cases Handled
- **Legacy jobs without fields**: Cards don't render (conditional)
- **Multiple commute types**: Comma-separated display
- **Unknown enum values**: Fallback to raw value in label lookup

## Dependencies

### Requires
- **09-01**: Backend API support for commute_types and job_level filtering

### Provides
- Job detail views display commute types and job level
- Job list filtering by commute type and job level

## Performance Impact

**Minimal** - No new API calls, just additional filter parameters and display fields.

## Next Phase Readiness

**Phase 11**: Frontend now displays and filters by commute types and job level. Ready for Phase 11 (Search Service Integration) to index these fields in Meilisearch.

---

## Commits

- `233f9f16` - feat(10-02): add commute types and job level to job detail views
- `f13cfce8` - feat(10-02): add commute type and job level filters to job list

**Duration:** 4.4 minutes
**Completed:** 2026-02-13
