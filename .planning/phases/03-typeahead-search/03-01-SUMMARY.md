---
phase: 03-typeahead-search
plan: 01
subsystem: frontend-data-layer
completed: 2026-02-13
duration: 3min
status: complete

tags:
  - react-hooks
  - search-api
  - typeahead
  - local-storage

requires:
  - 02-02-SUMMARY.md  # API Gateway search endpoint

provides:
  - useGlobalSearch hook for portal search UI
  - Search types mirroring search-service API
  - Entity-to-URL routing resolver
  - Recent searches persistence

affects:
  - 03-02  # GlobalSearchBar component will consume this hook

tech-stack:
  added:
    - N/A (uses existing patterns)
  patterns:
    - Custom React hook with debounced API calls
    - AbortController for request cancellation
    - localStorage for recent searches persistence
    - MEMORY.md compliance (getToken excluded from deps)

decisions:
  - id: DEC-03-01-01
    title: "250ms debounce for typeahead (vs 300ms standard)"
    rationale: "Faster debounce (250ms vs standard 300ms) for snappier typeahead UX - users expect instant feedback"
    alternatives: ["300ms standard debounce", "No debounce"]
    impact: "Better perceived performance for search-as-you-type"

  - id: DEC-03-01-02
    title: "AbortController for request cancellation"
    rationale: "Prevents stale results when user types quickly - only latest query results displayed"
    alternatives: ["Request queue", "Timestamp comparison"]
    impact: "Cleaner implementation, avoids race conditions"

  - id: DEC-03-01-03
    title: "5 max recent searches in localStorage"
    rationale: "Balance between utility and clutter - 5 is typical for search UIs"
    alternatives: ["10 items", "No limit", "Session storage"]
    impact: "Clean UI without overwhelming user with history"

key-files:
  created:
    - apps/portal/src/types/search.ts
    - apps/portal/src/hooks/use-global-search.ts
  modified: []
---

# Phase 03 Plan 01: Search Hook & Types Summary

**One-liner:** Debounced search hook with recent searches, AbortController cancellation, and entity-to-URL routing for 7 entity types

## What Was Built

Created the data layer for global search in the portal frontend:

1. **Search Types (`apps/portal/src/types/search.ts`)**
   - Frontend types mirroring search-service API contract
   - `SearchResult`, `TypeaheadGroup`, `TypeaheadResponse`, `SearchableEntityType`
   - `ENTITY_TYPE_CONFIG` mapping entity types to labels, FontAwesome icons, and route prefixes
   - `getEntityUrl()` helper for entity-to-URL resolution (handles special cases: jobs → `/portal/roles/:id`, recruiter_candidate → `/portal/candidates/:id`)

2. **useGlobalSearch Hook (`apps/portal/src/hooks/use-global-search.ts`)**
   - 250ms debounced API calls to `/api/v2/search?mode=typeahead`
   - AbortController for in-flight request cancellation (prevents stale results)
   - Recent searches persistence (localStorage, max 5, newest first, deduplicated)
   - Empty state handling (< 2 chars clears results)
   - Loading and error states with graceful degradation (log errors, don't show to user)
   - Follows MEMORY.md pattern: `getToken` excluded from dependency arrays to prevent infinite loops

3. **Entity Type Configuration**
   - 7 entity types: candidate, job, company, recruiter, application, placement, recruiter_candidate
   - Each with label, icon, and routing logic
   - Special routing: jobs display at `/portal/roles/:id` (not `/portal/jobs/:id`)
   - Recruiter list has no detail view (returns `/portal/marketplace/recruiters` without entity_id)

## Implementation Patterns

### Debounced Search with Cancellation
```typescript
// 250ms debounce - faster than standard 300ms for typeahead
const setQuery = useCallback((value: string) => {
  setQueryState(value);
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }
  debounceTimeoutRef.current = setTimeout(() => {
    fetchResults(value);
  }, DEBOUNCE_DELAY);
}, [fetchResults]);

// AbortController prevents stale results
const fetchResults = async (searchQuery: string) => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  const abortController = new AbortController();
  abortControllerRef.current = abortController;
  // ... fetch with signal
};
```

### Recent Searches Persistence
```typescript
// Load from localStorage on mount
useEffect(() => {
  const stored = localStorage.getItem('splits:recent-searches');
  if (stored) {
    const parsed = JSON.parse(stored);
    setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
  }
}, []);

// Add with deduplication (remove if exists, add to front)
const addRecentSearch = (searchQuery: string) => {
  setRecentSearches(prev => {
    const filtered = prev.filter(s => s !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, 5);
    saveRecentSearches(updated);
    return updated;
  });
};
```

### MEMORY.md Compliance
```typescript
const fetchResults = useCallback(async (searchQuery: string) => {
  // ... setup
  const token = await getToken(); // Called inside, not in deps
  const client = createAuthenticatedClient(token);
  // ... fetch
}, []); // getToken intentionally omitted - see MEMORY.md
```

## Task Breakdown

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Create search types and useGlobalSearch hook | 2619b673 | apps/portal/src/types/search.ts, apps/portal/src/hooks/use-global-search.ts |

**Note:** Work was completed in commit 2619b673 which was a multi-feature commit including analytics gateway, activity tracking, and search hook implementation.

## Deviations from Plan

None - plan executed exactly as written. All must-haves delivered:
- ✅ useGlobalSearch hook calls GET /api/v2/search?mode=typeahead with debounced query
- ✅ Hook returns grouped results (TypeaheadGroup[]) with loading, error, and empty states
- ✅ Recent searches persist in localStorage and are returned when query is empty
- ✅ Hook provides entity URL resolver mapping entity_type+entity_id to portal routes

## Testing & Verification

**Manual verification:**
1. TypeScript compilation: ✅ Passes without errors
2. API contract matching: ✅ Types mirror search-service exactly
3. URL routing: ✅ All 7 entity types route correctly (jobs → /portal/roles/:id)
4. Dependency arrays: ✅ getToken excluded per MEMORY.md
5. AbortController: ✅ Implemented for request cancellation
6. localStorage: ✅ Recent searches at 'splits:recent-searches', max 5

**Patterns verified:**
- ✅ `createAuthenticatedClient` pattern from `@/lib/api-client`
- ✅ 250ms debounce (faster than standard 300ms)
- ✅ Graceful error handling (log, don't show to user)
- ✅ Empty state when query < 2 chars

## Next Phase Readiness

**Ready for:** 03-02 GlobalSearchBar Component

**Provides:**
- Complete hook API: `{ query, setQuery, groups, hasResults, isEmpty, isLoading, isOpen, setIsOpen, recentSearches, addRecentSearch, getEntityUrl }`
- All entity types configured with labels, icons, and routes
- localStorage integration for recent searches

**Blockers:** None

**Concerns:** None

**Integration points:**
- Hook returns `groups: TypeaheadGroup[]` ready for UI rendering
- `getEntityUrl(type, id)` provides navigation URLs for result clicks
- `recentSearches: string[]` ready for empty state display
- `addRecentSearch(query)` should be called when user selects a result

## Metrics

- **Files created:** 2
- **Files modified:** 0
- **Entity types supported:** 7
- **Recent searches max:** 5
- **Debounce delay:** 250ms
- **Min query length:** 2 chars

## Key Learnings

1. **Faster debounce for typeahead:** 250ms feels more responsive than 300ms for search-as-you-type without causing excessive API calls
2. **AbortController essential:** Without it, fast typing causes race conditions where old results overwrite new ones
3. **Recent searches UX:** Showing recent searches when input is empty provides discovery and saves typing
4. **MEMORY.md infinite loop fix:** Must exclude unstable Clerk functions from dependency arrays
5. **Graceful degradation:** Typeahead should never show errors to user - log and show empty results instead

## Links

- Plan: `.planning/phases/03-typeahead-search/03-01-PLAN.md`
- API Contract: `services/search-service/src/v2/search/types.ts`
- API Endpoint: `services/api-gateway/src/routes.ts` (Phase 02-02)
