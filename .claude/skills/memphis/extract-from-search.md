# extract-from-search

Extract reusable components from the search showcase page.

## Available Components

1. **MemphisSearchBar** - Composite search input with icon area, text input, and submit button
2. **FilterPanel** - Sidebar filter container with header and clear-all
3. **FilterCheckboxGroup** - Labeled group of Memphis-styled checkboxes
4. **FilterCheckbox** - Individual square checkbox with colored check
5. **FilterRadioGroup** - Radio button group for single-select options (date posted)
6. **FilterRadio** - Individual circular radio with inner dot
7. **FilterRangeSlider** - Dual range slider with min/max labels
8. **FilterCategorySelect** - Memphis-styled select dropdown
9. **SaveSearchButton** - Toggle button for saving search criteria
10. **ActiveFilterBar** - Horizontal row of removable filter pills
11. **ActiveFilterPill** - Individual filter pill with X remove button
12. **ResultsHeader** - Results count + sort dropdown row
13. **SortSelect** - Memphis-styled sort dropdown
14. **SearchResultCard** - Horizontal result card with left color stripe
15. **MobileFilterToggle** - Responsive filter panel toggle button
16. **SearchEmptyState** - No-results empty state with icon, message, and reset

## Component Details

### MemphisSearchBar
```tsx
interface MemphisSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: () => void;
    placeholder?: string;
    iconColor?: string;      // default C.yellow
    buttonColor?: string;    // default C.coral
    buttonLabel?: string;    // default "Search"
}
// border-4 flex composite: icon area (solid bg) + input + button
```

### FilterCheckboxGroup
```tsx
interface FilterCheckboxGroupProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    color: string;
}
// Label with w-1.5 h-4 colored accent bar
// Each option: w-5 h-5 square checkbox, text-sm font-semibold label
// Selected: filled bg + check icon; unselected: border only
```

### FilterRadioGroup
```tsx
interface FilterRadioGroupProps {
    label: string;
    options: { value: string; label: string }[];
    selected: string;
    onChange: (value: string) => void;
    color: string;
}
// Similar to checkbox group but uses w-4 h-4 rounded-full radio with inner dot
```

### FilterRangeSlider
```tsx
interface FilterRangeSliderProps {
    label: string;
    min: number;
    max: number;
    valueMin: number;
    valueMax: number;
    step?: number;
    unit?: string;           // e.g., "$", "K"
    color: string;
    onChangeMin: (v: number) => void;
    onChangeMax: (v: number) => void;
}
// Label + flanking value display + two native range inputs with accentColor
```

### ActiveFilterBar
```tsx
interface ActiveFilter { key: string; label: string; value: string; }
interface ActiveFilterBarProps {
    filters: ActiveFilter[];
    onRemove: (key: string, value: string) => void;
    onClearAll: () => void;
}
// "Active:" label + flex-wrap pills + "Clear All" link
// Each pill gets cycling Memphis color from [C.coral, C.teal, C.purple, C.yellow]
```

### SearchResultCard
```tsx
interface SearchResultCardProps {
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    remote: string;
    experience: string;
    tags: string[];
    applicants: number;
    daysAgo: number;
    color: string;
    onClick?: () => void;
}
// border-4, flex with w-1.5 left accent stripe
// Left: tags row, title, company/location meta, skill tags
// Right: salary, meta, View button
```

### SearchEmptyState
```tsx
interface SearchEmptyStateProps {
    onReset: () => void;
}
// border-4 p-12, centered: bordered icon box, heading, description, reset button
```

### ResultsHeader
```tsx
interface ResultsHeaderProps {
    count: number;
    sortBy: string;
    sortOptions: { value: string; label: string }[];
    onSortChange: (value: string) => void;
}
// Flex row: colored count + "Jobs Found" text; right: sort label + select
```

## Dependencies
- **FilterPanel** composes: FilterCheckboxGroup, FilterRadioGroup, FilterRangeSlider, FilterCategorySelect, SaveSearchButton
- **ActiveFilterBar** composes: ActiveFilterPill
- **SearchResultCard** composes: MemphisTag
- **ResultsHeader** composes: SortSelect

## Reference
Source: `apps/corporate/src/app/showcase/search/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
