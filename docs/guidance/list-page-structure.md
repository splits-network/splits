# List Page Structure Guidance

This document defines the standard blueprint for list-style pages across the Splits Network applications (Portal, Candidate, Corporate). Use it whenever you build a page whose primary job is to surface a filterable collection with optional card/table views. The Roles experience (`apps/portal/src/app/(authenticated)/roles/page.tsx` + `components/roles-list.tsx`) is the canonical example and every new list page should be compared against it.

---

## Reference Implementation: Roles List

| Layer | File | Responsibilities |
|-------|------|------------------|
| Server entry | `apps/portal/src/app/(authenticated)/roles/page.tsx` | Fetch user auth context, decide whether privileged CTAs (Create button) should render, and compose the hero/header shell. |
| Client orchestration | `apps/portal/src/app/(authenticated)/roles/components/roles-list.tsx` | Fetch/present list data, stats, filters, view toggles, loading + empty states, and permission-aware actions. |
| Shared hooks | `apps/portal/src/hooks/use-view-mode.ts` | Persist grid/table preference across sessions. |

Treat this stack as the source of truth. Deviations must be documented here before being coded elsewhere.

---

## Page Anatomy & Layout Standards

### 1. Authenticated Server Entry + Hero Header

- Every list page lives under an authenticated segment so its `page.tsx` stays a **server component** that calls `auth()` and `createAuthenticatedClient`.
- Compute gating booleans **at the server boundary** (e.g., `canCreateRole`) and pass them down as props or render CTAs in the header immediately.
- Standard header block:
  ```tsx
  <div className="flex justify-between items-center">
      <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-base-content/70 mt-1">{subtitle}</p>
      </div>
      {cta}
  </div>
  ```
- Wrap the page body in `<div className="space-y-6">` to maintain consistent vertical rhythm between sections.

### 2. Client Data Component Responsibilities

- The list component must be marked `'use client'` and pull auth tokens via `useAuth().getToken()`.
- Create a dedicated API client instance inside each fetcher (`createAuthenticatedClient(token)`), and reuse helper functions (`fetchUserRole`, `fetchJobs`, `fetchStats`) to keep side-effects isolated.
- Required state slices:
  - `items` (the actual list)
  - `loading` and `statsLoading`
  - Filter state per control (status, search text, etc.)
  - `viewMode` from `useViewMode('<entity>ViewMode')`
  - Permission data (e.g., `userRole`, booleans like `canManageRole`)
- Derive display-ready data (`filteredJobs`) with memoizable predicates so renders stay cheap.

### 3. KPI / Stats Deck

- Always render a stats section above the filters when aggregate data is available.
- Use DaisyUI `stats` components arranged in a responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- Show a centered spinner (`loading loading-spinner loading-md`) while stats resolve, independent from the main list loader.
- Personalize stat descriptions per persona just as Roles does (`System-wide`, `Assigned to you`, `In your company`) so the deck stays meaningful regardless of access level.

### 4. Controls & Utilities Bar

- Wrap filters in `card bg-base-100 shadow` with `card-body p-2`.
- Use `fieldset`-based controls per the [Form Controls Guidance](./form-controls.md).
- Default control set:
  1. **Primary filter select** (`select w-full max-w-xs`) for status/state.
  2. **Search input** (`input w-full`) which filters client-side and is debounced when API filtering arrives.
  3. **View toggle** using the [Grid/Table View Switching Pattern](./grid-table-view-switching.md). Buttons live in a `join` group with `btn-primary` for the active state.
- Keep the controls row flexible: `flex flex-wrap gap-4 items-center` ensures they stack on small screens.

### 5. Data Views

**Grid View**
- Render cards through a CSS grid: `grid grid-cols-1 md:grid-cols-3 gap-4`.
- Each card uses `card card-lg bg-base-100 shadow border-2` with a dynamic border (`getCardBorder(status)`).
- Display status badges in the top-right corner and keep key metrics (fee, company shorthand, location) inline.
- Bottom actions:
  - Primary action (`View Pipeline`) is always available.
  - Secondary actions (Edit, Duplicate, etc.) respect `canManageX` flags and use `btn-ghost btn-sm`.

**Table View**
- Wrap the table in `card bg-base-100 shadow overflow-hidden` + `overflow-x-auto`.
- Columns: Title (with subtext), Location, Primary metric (fee, budget, stage count), Status badge, Created/Posted date, Actions (right aligned).
- Action buttons mirror the grid cards so muscle memory carries over.

### 6. Empty, Loading, and Error States

- While the main list loads: replace the content area with `<span className="loading loading-spinner loading-lg">`.
- After load, if zero rows match filters, show a centered empty card:
  ```tsx
  <div className="card bg-base-100 shadow">
      <div className="card-body text-center py-12">
          <i className="fa-solid fa-briefcase text-6xl text-base-content/20"></i>
          <h3 className="text-xl font-semibold mt-4">No {entityName} Found</h3>
          <p className="text-base-content/70 mt-2">
              {searchQuery ? 'Try adjusting your search' : `No ${entityName.toLowerCase()} have been created yet`}
          </p>
      </div>
  </div>
  ```
- Log fetch errors to the console (for debugging) and consider surfacing inline alerts once the design system formalizes them.

### 7. Permission-Aware Actions

- Always derive permission booleans from authoritative data (e.g., membership roles fetched from `/me`).
- Gate:
  - Page-level CTAs in the header (`Create New Role`).
  - Per-row actions like Edit, Bulk Assign, etc.
  - Stats or KPIs that may reveal restricted information (companies count is rendered only for `platform_admin`).
- Prefer descriptive helpers: `const canManageRole = ['company_admin', 'platform_admin'].includes(userRole ?? '')`.

---

## Implementation Workflow

1. **Define server entry** under the appropriate `(authenticated)` segment. Fetch the signed-in user role and expose anything required for the header or initial props.
2. **Scaffold the client list component** with `useAuth`, `createAuthenticatedClient`, and the standard state slices. Keep fetchers private to the component.
3. **Add the stats deck** with persona-aware descriptions; load it lazily after the primary role/company context is known.
4. **Build the controls card** following the select + search + view toggle order. Plug `useViewMode` in early to avoid layout layout thrash.
5. **Implement grid + table views**, using helper functions for styling (badge colors, border colors) and matching action sets.
6. **Handle loading/empty cases** before returning the default layout so the component never renders undefined collections.
7. **Verify responsiveness and spacing** at breakpoints (≥320px single-column, ≥768px dual-column stats, ≥1024px triple-column grids).

---

## Extending to Other Page Types

- Replace entity-specific copy (`Roles`, `Company 1234`) with the new noun, but keep typography sizes and spacing identical.
- Swap metrics in the stats deck to match the domain (e.g., Candidates: `Interviews`, `Offers`, `Hired`).
- For multi-tenant data, adapt filter presets (status, owner, assignment) but preserve the control placement and component types.
- When a page requires additional utilities (bulk actions, export), place them on the right-hand side of the controls bar after the view toggle to keep the primary filters closest to the title.

---

## Checklist Before Shipping a List Page

- Header matches the standard hero layout with contextual copy + gated CTA.
- Stats deck renders with persona-aware descriptions and independent loading handling.
- Controls card includes (at minimum) status filter, search input, and grid/table toggle tied to `useViewMode`.
- Both grid and table views render the same dataset, share action affordances, and respect permission flags.
- Loading + empty states are present and match the shared iconography + copy pattern.
- API calls use `createAuthenticatedClient` and log failures without breaking the UI.
- Responsive behavior verified down to mobile and up to large desktop widths.
