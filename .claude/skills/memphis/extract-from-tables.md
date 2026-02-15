# extract-from-tables

Extract reusable components from the tables showcase page.

## Available Components

1. **MemphisDataTable** - Full table component with toolbar, table, bulk actions, and pagination
2. **TableToolbar** - Toolbar with search, filters, view toggle, column menu, export
3. **TableSearchInput** - Composite search input with icon area
4. **TableStatusFilter** - Memphis-styled status filter select
5. **ViewDensityToggle** - Comfortable/dense view toggle button pair
6. **ColumnVisibilityMenu** - Dropdown menu with column checkboxes
7. **ExportButton** - Export action button
8. **BulkActionBar** - Coral action bar shown when rows are selected
9. **TableCheckbox** - Square selection checkbox (used in header + rows)
10. **SortableColumnHeader** - Column header with sort icon indicator
11. **SortIcon** - Sort direction indicator icon
12. **StatusBadge** - Colored status label badge
13. **InlineStatusEditor** - Click-to-edit status with select + confirm
14. **ScoreBar** - Mini progress bar with numeric score
15. **RowActionButtons** - View/Edit/Delete action button group
16. **RowActionButton** - Individual small action button
17. **MemphisPagination** - Page navigation with numbered buttons and prev/next
18. **PaginationInfo** - "Showing X-Y of Z" text display

## Component Details

### MemphisDataTable
```tsx
interface Column<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    visible?: boolean;
    render?: (value: any, row: T) => ReactNode;
}
interface MemphisDataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    idKey: keyof T;
    perPage?: number;        // default 8
    searchKeys?: (keyof T)[];
    statusKey?: keyof T;
    statusOptions?: string[];
    onExport?: () => void;
}
// Full table card: border-4, toolbar, optional bulk actions, table, pagination
// Manages: selection, sorting, filtering, pagination, column visibility, dense mode
```

### TableToolbar
```tsx
interface TableToolbarProps {
    search: string;
    onSearchChange: (v: string) => void;
    statusFilter: string;
    statusOptions: string[];
    onStatusChange: (v: string) => void;
    dense: boolean;
    onDenseChange: (v: boolean) => void;
    columns: { key: string; visible: boolean }[];
    onColumnToggle: (key: string) => void;
    onExport?: () => void;
}
// p-4 border-b-3 flex flex-wrap gap-3
// Contains: search input, status select, density toggle, column menu, export button
```

### BulkActionBar
```tsx
interface BulkActionBarProps {
    selectedCount: number;
    onEmail?: () => void;
    onTag?: () => void;
    onDelete?: () => void;
    onClear: () => void;
}
// px-4 py-3 flex items-center gap-3, backgroundColor: C.coral
// Count label + action buttons (border-2 white outline) + clear link
```

### TableCheckbox
```tsx
interface TableCheckboxProps {
    checked: boolean;
    onChange: () => void;
    color?: string;   // default C.coral
}
// w-5 h-5 border-2 square
// Checked: filled bg + white check icon
// Unchecked: border only
```

### SortableColumnHeader
```tsx
interface SortableColumnHeaderProps {
    label: string;
    sortKey: string;
    currentSort: string;
    ascending: boolean;
    onClick: (key: string) => void;
}
// text-[10px] font-black uppercase tracking-wider cursor-pointer
// SortIcon: fa-sort (neutral), fa-sort-up (asc), fa-sort-down (desc)
// Active sort: C.coral; inactive: rgba(26,26,46,0.2)
```

### StatusBadge
```tsx
interface StatusBadgeProps {
    status: string;
    colorMap?: Record<string, string>;  // status -> color
    onClick?: () => void;               // for inline editing
}
// px-2 py-0.5 text-[10px] font-black uppercase
// Default color mapping:
//   Applied: C.dark, Screening: C.yellow, Interview: C.teal
//   Offer: C.purple, Placed: C.teal, Rejected: C.coral
```

### InlineStatusEditor
```tsx
interface InlineStatusEditorProps {
    value: string;
    options: string[];
    onSave: (value: string) => void;
    onCancel: () => void;
}
// flex items-center gap-1
// Select: border-2 text-[10px] font-bold uppercase
// Confirm button: w-5 h-5 backgroundColor: C.teal + check icon
```

### ScoreBar
```tsx
interface ScoreBarProps {
    score: number;
    max?: number;   // default 100
}
// flex items-center gap-2
// Bar: w-12 h-1.5 border with inner fill
// Color thresholds: >= 90 -> C.teal, >= 75 -> C.yellow, < 75 -> C.coral
// Numeric label: text-xs font-bold, same color as bar
```

### RowActionButtons
```tsx
interface RowActionButtonsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}
// flex items-center gap-1
// Each: w-6 h-6 border flex items-center justify-center
// View: C.teal (fa-eye), Edit: C.purple (fa-pen), Delete: C.coral (fa-trash)
// Icons at text-[10px]
```

### MemphisPagination
```tsx
interface MemphisPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    perPage: number;
}
// px-4 py-4 border-t-3 flex justify-between
// Left: "Showing X-Y of Z" text
// Right: prev arrow + numbered buttons + next arrow
// Active page: C.coral filled; disabled nav: opacity 0.3
```

### ViewDensityToggle
```tsx
interface ViewDensityToggleProps {
    dense: boolean;
    onChange: (dense: boolean) => void;
}
// border-3 flex, two buttons: expand (comfortable) and compress (dense)
// Active: backgroundColor: C.dark, color: C.white
// Inactive: transparent, color: C.dark
```

### ColumnVisibilityMenu
```tsx
interface ColumnVisibilityMenuProps {
    columns: { key: string; visible: boolean }[];
    onToggle: (key: string) => void;
}
// Trigger: border-3 button with columns icon
// Dropdown: absolute, border-3, w-40, backgroundColor: C.white
// Each column: checkbox (w-4 h-4 border-2, C.teal when checked) + label
```

## Dependencies
- **MemphisDataTable** composes all sub-components: TableToolbar, BulkActionBar, TableCheckbox, SortableColumnHeader, StatusBadge, InlineStatusEditor, ScoreBar, RowActionButtons, MemphisPagination
- **TableToolbar** composes: TableSearchInput, TableStatusFilter, ViewDensityToggle, ColumnVisibilityMenu, ExportButton
- **ColumnVisibilityMenu** uses checkbox pattern from TableCheckbox (smaller variant)
- **SortableColumnHeader** composes: SortIcon

## Reference
Source: `.claude/memphis/showcase/tables-six.tsx`
Target: `packages/memphis-ui/src/components/`
