---
phase: 03-typeahead-search
plan: 02
subsystem: frontend-ui
completed: 2026-02-13
duration: 12min
status: complete

tags:
    - react-component
    - daisyui
    - keyboard-navigation
    - search-ui
    - access-control

requires:
    - 03-01-SUMMARY.md # useGlobalSearch hook and search types

provides:
    - GlobalSearchBar component integrated in portal header
    - Typeahead dropdown with grouped results and keyboard navigation
    - Company-level access control on search results
    - Deep link entity URL routing

affects:
    - Phase 4 (full search page) will reuse types and access control patterns

tech-stack:
    added:
        - N/A (uses existing patterns)
    patterns:
        - DaisyUI v5 flex input pattern (label > icon + input.grow)
        - Keyboard navigation with flattened result index
        - Click-outside-to-close with ref + mousedown listener
        - Deep link query parameter routing

decisions:
    - id: DEC-03-02-01
      title: "DaisyUI v5 flex input pattern for search bar"
      rationale: "Replaces absolute-positioned icons with flex siblings inside <label class='input'> - native DaisyUI pattern, no alignment issues"
      alternatives: ["Absolute positioning", "Custom CSS grid"]
      impact: "Clean alignment of search icon, input, clear button, and Ctrl+K kbd hint"

    - id: DEC-03-02-02
      title: "Deep link query params for entity URLs"
      rationale: "Portal uses list pages with slide-out detail panels (?candidateId=x), not dedicated detail pages (/candidates/:id)"
      alternatives: ["Path segment routing"]
      impact: "All 7 entity types route correctly to existing list pages"

    - id: DEC-03-02-03
      title: "Marketplace entities visible to all users"
      rationale: "Candidates, jobs, companies, recruiters are marketplace content - accessible to all authenticated users. Applications and placements are company-scoped."
      alternatives: ["Filter everything by org/company"]
      impact: "Balanced visibility: marketplace + scoped entities based on user's access level"

    - id: DEC-03-02-04
      title: "orgWideOrganizationIds field on AccessContext"
      rationale: "Distinguishes org-wide memberships (company_id IS NULL) from company-scoped memberships - needed for proper search filtering"
      alternatives: ["Filter at query time with JOIN on memberships"]
      impact: "Clean separation of org-wide vs company-scoped access across all services"

key-files:
    created:
        - supabase/migrations/20260214000001_search_index_company_access_control.sql
    modified:
        - apps/portal/src/components/global-search/global-search-bar.tsx
        - apps/portal/src/components/global-search/search-result-item.tsx
        - apps/portal/src/components/global-search/index.ts
        - apps/portal/src/components/portal-header.tsx
        - apps/portal/src/types/search.ts
        - services/search-service/src/v2/search/repository.ts
        - packages/shared-access-context/src/index.ts
---

# Phase 03 Plan 02: GlobalSearchBar Component Summary

**One-liner:** Typeahead search bar with grouped dropdown, keyboard navigation, DaisyUI styling, deep link routing, and company-level access control

## What Was Built

### Core Component (Plan 03-02 scope)

1. **GlobalSearchBar (`apps/portal/src/components/global-search/global-search-bar.tsx`)**
    - Search input in portal header using DaisyUI v5 `<label class="input">` flex pattern
    - Dropdown with results grouped by entity type (icon + label + count)
    - Keyboard navigation: ArrowUp/ArrowDown to select, Enter to navigate, Esc to close
    - Cmd+K / Ctrl+K global shortcut to focus search bar
    - Recent searches displayed when input is empty and focused
    - Loading spinner during API calls, empty state when no results
    - Clear button (X) resets input, Ctrl+K kbd hint when empty
    - Click-outside-to-close via ref + mousedown listener
    - Responsive: full input on lg+, compact icon button on mobile

2. **SearchResultItem (`apps/portal/src/components/global-search/search-result-item.tsx`)**
    - Entity type icon (FontAwesome duotone) with colored circle background
    - Title with highlighted matching terms (`<mark>` tags, case-insensitive)
    - Subtitle in muted text
    - Active state highlight for keyboard navigation

3. **Header Integration (`apps/portal/src/components/portal-header.tsx`)**
    - GlobalSearchBar rendered in header's center section
    - Page title visible on xl+ screens alongside search bar
    - Search bar takes priority on smaller screens

### Post-Checkpoint Fixes

4. **DaisyUI Input Alignment Fix**
    - Replaced absolute-positioned icons with DaisyUI v5 flex pattern
    - `<label class="input input-sm w-full">` wraps icon + input.grow + clear button
    - Added `<kbd class="kbd kbd-sm">Ctrl+K</kbd>` hint when input is empty

5. **Deep Link Entity URLs (`apps/portal/src/types/search.ts`)**
    - Changed from path segments (`/portal/candidates/{id}`) to query params (`/portal/candidates?candidateId={id}`)
    - Updated `ENTITY_TYPE_CONFIG` with `route` + `queryParam` per entity type
    - `getEntityUrl()` generates correct deep link URLs for all 7 entity types

6. **Company-Level Access Control**
    - **AccessContext** (`packages/shared-access-context/src/index.ts`): Added `orgWideOrganizationIds: string[]` field - orgs where user has membership WITHOUT company_id constraint
    - **Migration** (`supabase/migrations/20260214000001_search_index_company_access_control.sql`): Added `company_id` column to search_index, fixed `organization_id` to use actual org UUIDs (via `companies.identity_organization_id`), updated all 7 trigger functions, backfilled existing data
    - **Search Repository** (`services/search-service/src/v2/search/repository.ts`): Updated `applyAccessControl` with marketplace entity visibility + org-wide + company-scoped OR filters

## Implementation Patterns

### DaisyUI v5 Flex Input

```tsx
<label className="input input-sm w-full">
    <i className="fa-duotone fa-regular fa-magnifying-glass opacity-50"></i>
    <input
        ref={inputRef}
        type="search"
        className="grow"
        placeholder="Search..."
    />
    {query && (
        <button className="btn btn-ghost btn-xs btn-circle">
            <i className="fa-xmark" />
        </button>
    )}
    {!query && <kbd className="kbd kbd-sm">Ctrl+K</kbd>}
</label>
```

### Keyboard Navigation (Flattened Index)

```typescript
const allResults = groups.flatMap((g) => g.results);
// ArrowDown/ArrowUp: increment/decrement activeIndex (wrap around)
// Enter: router.push(getEntityUrl(allResults[activeIndex]...))
// Escape: close dropdown, blur input
```

### Access Control Filter

```typescript
// Marketplace entities visible to all authenticated users
const filters = ["entity_type.in.(candidate,job,company,recruiter)"];
// Org-wide access: all entities in those orgs
if (context.orgWideOrganizationIds.length > 0)
    filters.push(
        `organization_id.in.(${context.orgWideOrganizationIds.join(",")})`,
    );
// Company-scoped access: specific company entities
if (context.companyIds.length > 0)
    filters.push(`company_id.in.(${context.companyIds.join(",")})`);
return queryBuilder.or(filters.join(","));
```

## Task Breakdown

| Task | Description                                             | Commit   | Files                                                      |
| ---- | ------------------------------------------------------- | -------- | ---------------------------------------------------------- |
| 1    | Create GlobalSearchBar + SearchResultItem components    | 24652f99 | global-search-bar.tsx, search-result-item.tsx, index.ts    |
| 2    | Integrate GlobalSearchBar into portal header            | 5688578a | portal-header.tsx                                          |
| 3    | DaisyUI alignment fix + deep link URLs + access control | b0cf9ee3 | global-search-bar.tsx, search.ts, repository.ts, migration |

## Deviations from Plan

1. **DaisyUI input pattern** - Plan specified absolute-positioned icons; switched to DaisyUI v5 `<label class="input">` flex pattern after user reported alignment issues. Better approach.

2. **Entity URL routing** - Plan assumed path segment routing (`/portal/candidates/:id`); portal actually uses deep link query params (`?candidateId=x`). Updated types and getEntityUrl().

3. **Access control addition** - Not in original 03-02 plan. User identified during testing that search results weren't properly filtered by company-level access. Added `orgWideOrganizationIds` to AccessContext, `company_id` column to search_index, and updated repository filter logic. This was essential for correctness.

4. **Deployment artifacts** - Search-service needed Dockerfile, docker-compose entry, K8s manifests, and CI/CD pipeline entries. Added in commit 4b42b02d.

## Testing & Verification

**Manual verification (human-verified):**

1. Search bar visible in portal header on all pages: **PASS**
2. Typing query shows grouped dropdown results from API: **PASS**
3. Arrow keys navigate results, Enter selects, Esc closes: **PASS**
4. Cmd+K / Ctrl+K focuses search bar: **PASS**
5. Clicking result navigates to correct entity page (deep link): **PASS**
6. Recent searches display when input empty and focused: **PASS**
7. Loading spinner during search, empty state when no results: **PASS**
8. Clear button resets and closes dropdown: **PASS**
9. DaisyUI input alignment correct (icon, input, X button): **PASS**
10. Company-level access control filters results appropriately: **PASS**

## Requirements Coverage

All Phase 3 requirements satisfied:

| Requirement | Description                    | Status       |
| ----------- | ------------------------------ | ------------ |
| TYPE-01     | Real-time typeahead dropdown   | **Complete** |
| TYPE-02     | Results grouped by entity type | **Complete** |
| TYPE-03     | Keyboard navigation            | **Complete** |
| TYPE-04     | Loading/empty states           | **Complete** |
| TYPE-05     | Highlighted matches            | **Complete** |
| TYPE-06     | Context snippets (subtitle)    | **Complete** |
| TYPE-07     | Click to navigate              | **Complete** |
| TYPE-08     | Clear button                   | **Complete** |
| INT-01      | Cmd+K shortcut                 | **Complete** |
| INT-02      | Recent searches                | **Complete** |

## Metrics

- **Files created:** 2 (search-result-item.tsx, migration)
- **Files modified:** 6
- **Components built:** 2 (GlobalSearchBar, SearchResultItem)
- **Entity types routed:** 7
- **Access control modes:** 3 (platform admin, org-wide, company-scoped)
- **Keyboard shortcuts:** 5 (ArrowUp, ArrowDown, Enter, Esc, Ctrl+K)

## Key Learnings

2. **Portal uses deep links:** All entity detail views are slide-out panels on list pages, not dedicated routes. Always use `?entityId=x` query params.
3. **Access control must distinguish org-wide vs company-scoped:** `organizationIds` alone isn't sufficient - need `orgWideOrganizationIds` (memberships without company_id) to prevent company-scoped users from seeing other companies' data.
4. **Marketplace visibility pattern:** Candidates, jobs, companies, recruiters are marketplace entities visible to all. Applications and placements are company-scoped.

## Links

- Plan: `.planning/phases/03-typeahead-search/03-02-PLAN.md`
- Hook: `apps/portal/src/hooks/use-global-search.ts` (03-01)
- Types: `apps/portal/src/types/search.ts`
- Access Control: `packages/shared-access-context/src/index.ts`
- Migration: `supabase/migrations/20260214000001_search_index_company_access_control.sql`
