# Splits Network - Browse Page Implementation Standard (Split View Pattern)

**Status:** Implementation Standard
**Last Updated:** January 27, 2026
**Reference:** `apps/portal/src/app/portal/browse/candidates/`

## 1. Overview

The **Standard Browse Page** utilizes a **Master-Detail (Split View)** pattern to allow users to efficiently browse large lists of entities while viewing detailed information without losing context.

### Responsive Behavior

- **Desktop**: Side-by-side view. The List Panel stays visible on the left, and the Detail Panel updates on the right.
- **Mobile**: Single view. The user sees the List Panel by default. Clicking an item navigates to the Detail view (driven by URL), which covers the specific list.

## 2. File Structure

Organize feature-specific browse pages as follows:

```text
feature-browse/
├── page.tsx (Server Component Shell)
├── components/
│   ├── browse-client.tsx (Layout & State Orchestrator)
│   ├── list-panel.tsx (Data Fetching, Virtual List, Search Input)
│   ├── list-item.tsx (Individual Item UI)
│   ├── detail-panel.tsx (Detail View Container)
│   ├── detail-header.tsx (Detail Header & Actions)
│   ├── types.ts (Feature-specific types)
│   └── ... (Async sub-components for detail sections)
```

## 3. Architecture & State Management

### URL as Source of Truth

We use the URL query parameters to drive the UI state. This ensures shareability and browser history support.

- **Selection**: `?id=<entity_id>` (or specific param like `candidateId`) determines the active item in the Detail Panel.
- **Filters**: `?status=active&search=...` drives the list data via the generic hook.

### Hook: `useStandardList`

Use the shared hook `@/hooks/use-standard-list` for all list logic.

```tsx
const { data, loading, searchInput, setSearchInput, pagination, setFilter } =
    useStandardList<Entity>({
        fetchFn: myFetchFunction, // or endpoint: '/api/v2/entities'
        defaultFilters: { scope: "mine" },
    });
```

### Progressive Loading Pattern

1.  **List Panel**: Fetches paginated summaries (lighter payload).
2.  **Detail Panel**: Fetches full data on mount based on the `id` passed to it.
    - _Note_: The detail panel should handle its own loading state.
    - Sub-sections of the detail panel (e.g., Applications, Documents) should fetch their data independently to unblock the main render.

## 4. UI Standards (DaisyUI 5 / TailwindCSS)

To ensure a consistent "App-like" feel, use these exact classes.

### Layout Container (Wrapper)

Defines the boundary of the browse area, accounts for navbar height.

```tsx
<div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-base-200 rounded-xl overflow-hidden shadow-sm border border-base-300">
    {children}
</div>
```

### List Panel

**Background**: `bg-base-200` (Grey/Contrast).
**Width**: Fixed width on desktop, full width on mobile unless item selected.

```tsx
<div
    className={`
    flex flex-col border-r border-base-300 bg-base-200
    w-full md:w-96 lg:w-[420px] 
    ${selectedId ? "hidden md:flex" : "flex"} 
`}
>
    {/* Search Header, Tabs, Filter Row */}
    {/* Scrollable List Area */}
</div>
```

### List Items

**Background**: Transparent by default (taking parent's `base-200`), white (`base-100`) on hover/selection.
**Concept**: Selected item visually "merges" with the Detail Panel (which is also `base-100`).

```tsx
<div
    onClick={() => onSelect(item.id)}
    className={`
     group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
     hover:bg-base-100
     ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
  `}
>
    {/* Content */}
</div>
```

### Detail Panel

**Background**: `bg-base-100` (White/Primary Surface).
Occupies remaining space. Displays loading state immediately when `id` changes.

```tsx
<div
    className={`
    flex-1 bg-base-100 flex flex-col overflow-hidden relative
    ${!selectedId ? "hidden md:flex" : "flex"}
`}
>
    {selectedId ? <EntityDetails id={selectedId} /> : <EmptyState />}
</div>
```

## 5. Key Features checklist

- [ ] **Tab Filters**: 'Mine' (User's entities) vs 'All' (Marketplace/Org).
- [ ] **Keyboard Navigation**: Arrow Up/Down support in List Panel (`useEffect` listener).
- [ ] **Status Badges**: Use `badge-soft` logic.
    - Active/Success: `badge-success`
    - Pending/Review: `badge-info`
    - Warning/Action: `badge-warning`
- [ ] **Mobile Back Button**: In the Detail Panel header, show a back button `<` only on mobile (`md:hidden`) that clears the selection.

## 6. API Contract

The backend endpoints used by Browse pages must strictly adhere to the V2 API standards.

**Request:**

```http
GET /api/v2/entities?page=1&limit=25&search=query&filters[scope]=mine
```

**Response (`StandardListResponse`):**

```json
{
  "data": [ ... ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 25,
    "total_pages": 4
  }
}
```
