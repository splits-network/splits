# Memphis Feature Architecture

This document defines the standard structure for building feature pages in the Memphis design system. The **roles feature** (`apps/portal/src/app/portal/roles/`) is the golden example.

## Folder Structure

```
feature/
├── page.tsx                    # Orchestrator: data fetching, state, view switching
├── types.ts                    # Feature types, filter interfaces, label maps
├── lists-six-animator.tsx      # GSAP entrance animations
└── components/
    ├── shared/                 # Cross-view utilities and components
    │   ├── accent.ts           # Accent color cycling + status mapping
    │   ├── helpers.ts          # Display formatters (salary, dates, etc.)
    │   ├── controls-bar.tsx    # Search + filters + add button + view toggle
    │   ├── header-section.tsx  # Hero header with geometric shapes + stats
    │   ├── actions-toolbar.tsx # Context actions (icon-only + descriptive variants)
    │   ├── expandable-button.tsx # Hover-expand icon button primitive
    │   ├── view-mode-toggle.tsx  # Table / Grid / Split switcher
    │   └── job-detail.tsx      # Full detail view + DetailLoader wrapper
    ├── table/
    │   ├── table-view.tsx      # Table layout with header columns
    │   └── table-row.tsx       # Row rendering + inline expandable detail
    ├── grid/
    │   ├── grid-view.tsx       # Responsive grid + detail sidebar
    │   └── grid-card.tsx       # Individual card with accent stripe
    ├── split/
    │   ├── split-view.tsx      # Two-panel: list left, detail right
    │   └── split-item.tsx      # Compact list item for left panel
    └── modals/
        ├── role-wizard-modal.tsx
        └── submit-candidate-modal.tsx
```

## Component Responsibilities

### page.tsx - The Orchestrator

The page component owns all state and passes it down as props. No context provider needed.

**Responsibilities:**
- URL sync (viewMode, selectedJobId via `searchParams`)
- Data fetching via `useStandardList` hook
- Permission checks (canCreateRole)
- Stats computation (useMemo over jobs array)
- View switching (table, grid, split)

**Key pattern - URL sync with ref:**
```tsx
const searchParamsRef = useRef(searchParams);
searchParamsRef.current = searchParams;

useEffect(() => {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    // Sync viewMode and selectedJobId to URL
    // ...
    router.replace(newUrl, { scroll: false });
}, [selectedJobId, viewMode, pathname, router]);
```

**Key pattern - useStandardList (no FilterContext needed):**
```tsx
const {
    data: jobs, loading, error, pagination,
    searchInput, setSearchInput, clearSearch,
    filters, setFilter, clearFilters,
    page, limit, goToPage, setLimit, total, totalPages, refresh,
} = useStandardList<Job, UnifiedJobFilters>({
    endpoint: "/jobs",
    defaultFilters: { status: undefined, job_owner_filter: "all" },
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
    defaultLimit: 24,
    syncToUrl: true,
    include: "company",
});
```

### types.ts - Feature Types

All types, filter interfaces, and label maps live in one file at the feature root.

```tsx
export interface Job { /* ... */ }
export interface UnifiedJobFilters {
    status?: string;
    employment_type?: string;
    job_owner_filter?: "all" | "assigned";
    // ...
}
export const COMMUTE_TYPE_LABELS: Record<string, string> = { /* ... */ };
export function formatCommuteTypes(types?: string[] | null): string | null { /* ... */ }
```

### shared/accent.ts - Accent Color Cycling

Memphis uses 4 accent colors that cycle through list items by index. This creates visual variety without manual color assignment.

```tsx
export const ACCENT = [
    { bg: "bg-coral", text: "text-coral", border: "border-coral", bgLight: "bg-coral-light", textOnBg: "text-white" },
    { bg: "bg-teal", text: "text-teal", border: "border-teal", bgLight: "bg-teal-light", textOnBg: "text-dark" },
    { bg: "bg-yellow", text: "text-yellow", border: "border-yellow", bgLight: "bg-yellow-light", textOnBg: "text-dark" },
    { bg: "bg-purple", text: "text-purple", border: "border-purple", bgLight: "bg-purple-light", textOnBg: "text-white" },
] as const;

export type AccentClasses = (typeof ACCENT)[number];
export type ViewMode = "table" | "grid" | "split";

export function accentAt(idx: number): AccentClasses {
    return ACCENT[idx % ACCENT.length];
}

export function statusVariant(status?: string): "teal" | "coral" | "yellow" | "purple" {
    switch (status) {
        case "active": return "teal";
        case "filled": return "coral";
        case "paused": return "yellow";
        case "closed": return "purple";
        default: return "teal";
    }
}
```

**Usage in views:**
```tsx
{jobs.map((job, idx) => (
    <GridCard key={job.id} job={job} accent={accentAt(idx)} ... />
))}
```

### shared/helpers.ts - Display Formatters

Pure functions for formatting display values. No React, no side effects.

```tsx
export function salaryDisplay(job: Job): string | null { /* "$80k - $120k" */ }
export function formatStatus(status?: string): string { /* "Active" */ }
export function isNew(job: Job): boolean { /* created < 7 days ago */ }
export function postedAgo(job: Job): string { /* "3d ago" */ }
export function companyName(job: Job): string { /* job.company?.name ?? "Unknown" */ }
```

### shared/controls-bar.tsx - Search, Filters, Actions

Receives all data as props from page.tsx. Contains search input, inline filters, add button, and view mode toggle.

```tsx
interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: UnifiedJobFilters;
    onFilterChange: <K extends keyof UnifiedJobFilters>(key: K, value: UnifiedJobFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    canCreateRole: boolean;
    onAddRole: () => void;
}
```

Uses the Memphis `controlsbar` CSS class and `SearchInput` component from memphis-ui.

### shared/header-section.tsx - Hero Header

Memphis-styled hero section with:
- Geometric decorative shapes (rotated squares, circles)
- Feature title (bold, uppercase)
- Stats bar (total, active, new, applications)
- Accent color borders

### shared/actions-toolbar.tsx - Context Actions

Renders action buttons for individual items. Supports two rendering variants:

- **`icon-only`**: Compact toolbar using `ExpandableButton` components (hover to expand)
- **`descriptive`**: Full-width buttons with labels visible at all times

The toolbar uses a permission-aware `actions` object:
```tsx
const actions = {
    viewDetails: canViewDetails,
    submitCandidate: canSubmitCandidate,
    editRole: canEdit,
    changeStatus: canChangeStatus,
    share: true,
    // ...
};
```

### shared/expandable-button.tsx - Hover-Expand Button

A reusable button primitive that starts as a square icon and expands on hover to reveal a text label. Supports both `onClick` (button) and `href` (Link) via discriminated union props.

```tsx
export type ExpandableButtonProps = ExpandableButtonClickProps | ExpandableButtonLinkProps;

// Usage
<ExpandableButton
    icon="fa-duotone fa-regular fa-user-plus"
    label="Submit"
    variant="btn-primary"
    size="sm"
    onClick={() => setShowSubmitModal(true)}
/>
```

### shared/job-detail.tsx - Detail View

Two components:
- **`DetailLoader`**: Fetches job data by ID, renders loading/error states, passes data to `JobDetail`
- **`JobDetail`**: Pure presentation component with tabbed layout (Overview, Requirements, Financials)

This is reused in all three views:
- **Table**: Inline expanded row (`<td colSpan={...}>`)
- **Grid**: Right-side sidebar panel
- **Split**: Right panel

## View Components

### Table View

```
table-view.tsx  →  Renders <table> with thead + tbody
table-row.tsx   →  <Fragment> wrapping <tr> + conditional detail <tr>
```

The table row uses a `Fragment` to wrap the main data row and an optional expanded detail row. When selected, the detail row spans all columns.

```tsx
<Fragment>
    <tr onClick={onSelect} className={`border-l-4 ${isSelected ? ac.border : "border-transparent"}`}>
        {/* columns */}
    </tr>
    {isSelected && (
        <tr>
            <td colSpan={colSpan} className={`border-t-4 border-b-4 ${ac.border}`}>
                <DetailLoader jobId={job.id} accent={ac} onClose={onSelect} />
            </td>
        </tr>
    )}
</Fragment>
```

### Grid View

```
grid-view.tsx  →  Responsive CSS grid + optional detail sidebar
grid-card.tsx  →  Card with accent top-border, company info, badges
```

The grid collapses from 4 columns to 2 when a detail sidebar is open:
```tsx
className={selectedJob
    ? "grid-cols-1 lg:grid-cols-2"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
}
```

### Split View

```
split-view.tsx  →  Fixed-width left list + flexible right detail
split-item.tsx  →  Compact item with title, company, status, salary
```

The split view always shows the detail panel (or an empty state prompt). The left panel uses `border-l-4` with accent color on the selected item.

## Data Flow

```
page.tsx (useStandardList)
  │
  ├── HeaderSection (stats as props)
  ├── ControlsBar (search, filters, viewMode as props)
  │
  ├── TableView (jobs, selectedId, onSelect, onRefresh)
  │     └── TableRow (job, accent, onSelect)
  │           └── DetailLoader (jobId) → JobDetail
  │
  ├── GridView (jobs, selectedId, onSelect, onRefresh)
  │     ├── GridCard (job, accent, onSelect)
  │     └── DetailLoader (jobId) → JobDetail
  │
  └── SplitView (jobs, selectedId, onSelect, onRefresh)
        ├── SplitItem (job, accent, onSelect)
        └── DetailLoader (jobId) → JobDetail
```

**Key principles:**
- page.tsx is the single source of data (useStandardList)
- All child components receive data as props
- No context provider needed for this pattern
- Each view component is a thin layout orchestrator
- Individual items (card, row, item) are pure presentation
- Detail loading is handled by a shared `DetailLoader` component
- Accent colors are computed by index, not hardcoded

## Memphis Styling Patterns

### Accent Borders on Selection

Selected items get a colored left border from the accent cycle:
```tsx
className={isSelected
    ? `${ac.bgLight} ${ac.border}`
    : "bg-white border-transparent"
}
```

### Status to Color Mapping

Status values map to accent colors for badges:
```tsx
<Badge variant={statusVariant(job.status)}>
    {formatStatus(job.status)}
</Badge>
```

### Geometric Decorations

The header section includes positioned geometric shapes:
```tsx
<div className="absolute top-8 right-8 w-16 h-16 bg-yellow rotate-45" />
<div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-purple" />
```

### Entrance Animations

`ListsSixAnimator` wraps the page content and uses GSAP to animate elements in:
- Hero section slides down
- Controls bar fades in
- Content area fades up
- Individual cards/rows stagger in

### No Shadows, No Rounded Corners

All cards, buttons, and inputs use `border-4` with sharp corners. The only exception is `rounded-full` for circular decorative elements and avatars.

## When to Deviate

This architecture works for most list-based feature pages. Adjust when:

- **No list data**: Dashboard pages, settings pages, profile pages have different layouts
- **Simple features**: If there's only one view mode, skip the view toggle and shared/ folder
- **Complex modals**: Multi-step wizards get their own `wizards/` folder under `components/`
- **Feature-specific widgets**: Add to `shared/` if used across views, or to the specific view folder if not
