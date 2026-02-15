# extract-from-lists

Extract reusable components from the lists showcase page.

## Available Components

1. **ListPageHeader** - Dark Memphis header with badge, title, subtitle, and stats pills
2. **StatsPill** - Bordered pill showing a numeric value and label
3. **SidebarNav** - Dark sidebar with nav items, logo block, and Memphis decoration footer
4. **SidebarNavItem** - Single nav item with icon box and active state
5. **ControlsBar** - Search + filters + view mode toggle container
6. **SearchInput** - Memphis-styled search input with icon
7. **FilterDropdown** - Bordered select dropdown
8. **ViewModeToggle** - Button group for switching between table/grid/split views
9. **TableView** - Full data table with expandable detail rows
10. **GridView** - Card grid with optional sticky detail sidebar
11. **GridCard** - Individual grid card with corner accent, tags, status, recruiter info
12. **GmailView** - Two-pane split view (list + detail)
13. **GmailListItem** - Single item in the left list pane
14. **JobDetail** - Detail panel with header, stats, requirements, responsibilities, benefits, skills, recruiter
15. **StatusBadge** - Colored status indicator (open/filled/pending/closed)
16. **TagPill** - Small bordered tag with accent color
17. **EmptyState** - Memphis-decorated empty state with shapes and reset button
18. **FeaturedBadge** - Small yellow "Featured" badge with star icon

## Component Details

### SidebarNav
```tsx
interface SidebarNavProps {
    items: { key: string; label: string; icon: string; color: string }[];
    activeKey: string;
    onSelect?: (key: string) => void;
}
// Dark bg, border-r-4, logo block at top, nav items with active indicator,
// Memphis decoration footer (small colored shapes)
```

### ControlsBar
```tsx
interface ControlsBarProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    filters: { label: string; value: string; options: string[]; color: string }[];
    onFilterChange: (key: string, value: string) => void;
    viewMode: "table" | "grid" | "gmail";
    onViewModeChange: (mode: string) => void;
}
// border-4 container, flex layout, search + filters + view toggles
```

### GridCard
```tsx
interface GridCardProps {
    title: string;
    subtitle: string;
    location: string;
    salary: string;
    status: string;
    tags: string[];
    recruiter: { name: string; agency: string; avatar: string };
    featured?: boolean;
    accentColor: string;
    selected?: boolean;
    onClick?: () => void;
}
// border-4, corner accent, featured badge, status badge, tag pills,
// recruiter row with avatar, hover:-translate-y-1
```

### JobDetail
```tsx
interface JobDetailProps {
    title: string;
    company: string;
    location: string;
    status: string;
    type: string;
    experienceLevel: string;
    salary: string;
    applicants: number;
    views: number;
    description: string;
    requirements: string[];
    responsibilities: string[];
    benefits: string[];
    tags: string[];
    recruiter: { name: string; agency: string; avatar: string };
    equity?: string;
    deadline: string;
    accentColor: string;
    onClose?: () => void;
}
// Structured sections: header with border-b-4, 3-col stats grid,
// requirements/responsibilities with chevron icons in colored boxes,
// benefits as bordered pills, skills as solid colored tags,
// recruiter card with border-4 and avatar
```

### StatusBadge
```tsx
interface StatusBadgeProps {
    status: "open" | "filled" | "pending" | "closed";
    variant?: "filled" | "outline";
}
// Color map: open=#4ECDC4, filled=#FF6B6B, pending=#FFE66D, closed=#A78BFA
// Filled: solid bg with white/dark text
// Outline: border-2 with colored text
```

### EmptyState
```tsx
interface EmptyStateProps {
    title: string;
    message: string;
    onReset?: () => void;
    resetLabel?: string;
}
// Memphis decoration (3 colored shapes), bold uppercase title,
// muted subtext, optional reset button with border-4
```

### ViewModeToggle
```tsx
interface ViewModeToggleProps {
    modes: { key: string; icon: string; label: string }[];
    activeMode: string;
    onChange: (mode: string) => void;
}
// border-2 container, buttons side by side,
// active: dark bg with yellow text, inactive: transparent with dark text
```

## Dependencies
- `JobDetail` is shared across all three view modes (TableView, GridView, GmailView)
- `StatusBadge` is used inside GridCard, GmailListItem, TableView rows, and JobDetail
- `TagPill` is used in GridCard and JobDetail
- `FeaturedBadge` is used in GridCard, GmailListItem, and TableView
- `SidebarNav` wraps `SidebarNavItem` components
- `ControlsBar` composes `SearchInput`, `FilterDropdown`, and `ViewModeToggle`
- Color cycling uses `ACCENT_CYCLE = [coral, teal, yellow, purple]` applied by item index

## Reference
Source: `.claude/memphis/showcase/lists-six.tsx`
Target: `packages/memphis-ui/src/components/`
