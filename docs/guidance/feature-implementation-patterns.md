# Feature Implementation Guidance

This document provides the standard structure, naming conventions, and component patterns for implementing feature pages in the Splits Network portal application. It serves as the source of truth for consistent design, structure, and component organization across all features.

## Related Documentation

This document works in conjunction with:

- **[Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md)** - Detailed patterns for action toolbars and detail sidebars used across all views
- **[Frontend List Calls Standard](./frontend-list-calls-standard.md)** - Technical implementation details for the `useStandardList` hook and API patterns used in filter contexts

## Overview

All feature pages should follow a consistent structure that separates concerns clearly and provides multiple view modes for different user workflows:

- **Browse View**: Side-by-side list and detail panel for exploration
- **Table View**: Data table with sorting, filtering, and bulk actions
- **Grid View**: Card-based layout for visual browsing

## Folder Structure

Each feature should follow this exact structure:

```
[feature]/
├── page.tsx                    # Main page component with view switching
├── types.ts                    # Feature-specific TypeScript types
├── contexts/                   # Feature-specific React contexts
│   └── filter-context.tsx
└── components/
    ├── browse/                 # Browse view components
    │   ├── view.tsx
    │   ├── list-panel.tsx
    │   ├── list-item.tsx
    │   └── detail-header.tsx
    │   └── detail-panel.tsx
    ├── table/                  # Table view components
    │   ├── view.tsx
    │   ├── row.tsx
    │   ├── header.tsx
    ├── grid/                   # Grid view components
    │   ├── view.tsx
    │   ├── item.tsx
    ├── modals/                 # Modal dialogs
    │   ├── add-[feature]-modal.tsx # should use the add/edit modal pattern from shared-ui
    │   └── delete-[feature]-modal.tsx
    ├── wizards/                # Multi-step workflows
    │   ├── [workflow]-wizard.tsx
    │   └── [workflow]-wizard-steps/
    │       ├── step-1.tsx
    │       ├── step-2.tsx
    │       └── step-3.tsx
    ├── shared/                 # Browse view components
    │   ├── details.tsx # the shared detail panel used in the browse/detail-panel.tsx and the table/grid sidebar.  This is the full details view with all details that are not already in the header.
    │   ├── stats.tsx
    │   ├── sidebar.tsx
    │   ├── filters.tsx
    │   └── actions-toolbar.tsx
```

## Component Naming Conventions

### View Components

- **Browse**: `view.tsx`, `list-panel.tsx`, `list-item.tsx`, `detail-panel.tsx`, `detail-header.tsx`
- **Table**: `view.tsx`, `row.tsx`, `header.tsx`
- **Grid**: `view.tsx`, `item.tsx`

### Shared Components

- `shared/details.tsx` - Complete detail content (reused across views)
- `shared/stats.tsx` - Dashboard metrics and statistics
- `shared/sidebar.tsx` - DaisyUI sidebar container for table/grid views
- `shared/actions-toolbar.tsx` - Action buttons used across all views
- `shared/filter.tsx` - Filter components for page title

### Interactive Components

- **Modals**: `add-[model]-modal.tsx`, `delete-[model]-modal.tsx` (use model name, not feature name)
- **Wizards**: `[workflow-name]-wizard.tsx`

## Implementation Patterns

### 1. Main Page Component

```tsx
// [feature]/page.tsx
"use client";

import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";
import BrowseView from "./components/browse/view";
import TableView from "./components/table/view";
import GridView from "./components/grid/view";
import { FilterProvider } from "./contexts/filter-context";
import Filter from "./components/shared/filter";
import Stats from "./components/shared/stats";
import ActionsToolbar from "./components/shared/actions-toolbar";

export default function FeaturePage() {
    const { viewMode, setViewMode, isLoaded } =
        useViewMode("[feature]ViewMode");

    if (!isLoaded) {
        return <LoadingState message="Loading [feature]..." />;
    }

    return (
        <FilterProvider>
            <PageTitle
                title="[Feature]"
                subtitle="Manage your [feature] pipeline"
            >
                <Filter />
                <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
            </PageTitle>

            <div className="space-y-6">
                <Stats />
                <ActionsToolbar />

                {viewMode === "browse" && <BrowseView />}
                {viewMode === "table" && <TableView />}
                {viewMode === "grid" && <GridView />}
            </div>
        </FilterProvider>
    );
}
```

### 2. Filter Context Pattern

The filter context uses the standardized list pattern for data fetching and state management. See [Frontend List Calls Standard](./frontend-list-calls-standard.md) for complete implementation details of the `useStandardList` hook.

```tsx
// [feature]/contexts/filter-context.tsx
"use client";

import { createContext, useContext, useState } from "react";
import { useStandardList } from "@/hooks/use-standard-list";

interface FilterContextType {
    data: FeatureItem[];
    loading: boolean;
    error: string | null;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filters: Record<string, any>;
    setFilter: (key: string, value: any) => void;
    refresh: () => void;
    selectedId: string | null;
    setSelectedId: (id: string | null) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const {
        data,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        refresh,
    } = useStandardList<FeatureItem>({
        endpoint: "/[feature]",
        initialParams: { limit: 25 },
    });

    const [selectedId, setSelectedId] = useState<string | null>(null);

    const value = {
        data,
        loading,
        error,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
        refresh,
        selectedId,
        setSelectedId,
    };

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (!context) {
        throw new Error("useFilter must be used within FilterProvider");
    }
    return context;
}
```

### 3. Browse View Pattern

The browse view uses a side-by-side layout with list and detail panels. The detail panel follows the patterns outlined in [Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md) for consistent action toolbars and detail presentation.

```tsx
// [feature]/components/browse/view.tsx
"use client";

import { useFilter } from "../../contexts/filter-context";
import ListPanel from "./list-panel";
import DetailPanel from "./detail-panel";

export default function BrowseView() {
    const { selectedId } = useFilter();

    return (
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
            <div className="col-span-5">
                <ListPanel />
            </div>
            <div className="col-span-7">
                {selectedId ? (
                    <DetailPanel />
                ) : (
                    <div className="flex items-center justify-center h-full text-base-content/60">
                        Select an item to view details
                    </div>
                )}
            </div>
        </div>
    );
}
```

```tsx
// [feature]/components/browse/detail-panel.tsx
"use client";

import DetailHeader from "./detail-header";
import Details from "../shared/details";

export default function DetailPanel() {
    return (
        <div className="space-y-6">
            <DetailHeader />
            <Details />
        </div>
    );
}
```

### 4. Table View Pattern

The table view uses the DataTable component with the unified sidebar pattern for detail views. See [Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md) for complete sidebar implementation details.

```tsx
// [feature]/components/table/view.tsx
"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { useFilter } from "../../contexts/filter-context";
import Row from "./row";
import Sidebar from "../shared/sidebar";

export default function TableView() {
    const { data, loading, error, searchTerm, setSearchTerm } = useFilter();
    const [showSidebar, setShowSidebar] = useState(false);

    const columns: TableColumn<FeatureItem>[] = [
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "created_at", label: "Created", sortable: true },
        { key: "actions", label: "Actions", sortable: false },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                renderRow={(item) => (
                    <Row
                        key={item.id}
                        item={item}
                        onShowDetails={() => setShowSidebar(true)}
                    />
                )}
            />

            <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
        </>
    );
}
```

### 5. Grid View Pattern

```tsx
// [feature]/components/grid/view.tsx
"use client";

import { useState } from "react";
import { LoadingState, ErrorState } from "@/components/ui";
import { useFilter } from "../../contexts/filter-context";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, error } = useFilter();
    const [showSidebar, setShowSidebar] = useState(false);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map((item) => (
                        <Item
                            key={item.id}
                            item={item}
                            onShowDetails={() => setShowSidebar(true)}
                        />
                    ))}
                </div>
            </div>

            <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
        </>
    );
}
```

## Shared Components Pattern

### Shared Component Examples

```tsx
// [feature]/components/shared/sidebar.tsx
"use client";

import Details from "./details";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <div className={`drawer ${isOpen ? "drawer-open" : ""}`}>
            <div className="drawer-side">
                <label className="drawer-overlay" onClick={onClose}></label>
                <div className="w-96 min-h-full bg-base-200">
                    <Details />
                </div>
            </div>
        </div>
    );
}
```

```tsx
// [feature]/components/shared/details.tsx
"use client";

import { useFilter } from "../../contexts/filter-context";

export default function Details() {
    const { selectedId, data } = useFilter();

    if (!selectedId) return null;

    const item = data.find((d) => d.id === selectedId);
    if (!item) return <div>Item not found</div>;

    return (
        <div className="space-y-6 p-6">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <div className="grid gap-4">
                {/* All detail content sections go here */}
                {/* Bio, Skills, Applications, etc. */}
            </div>
        </div>
    );
}
("use client");

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui/tables";
import { useFilter } from "../../contexts/filter-context";
import Row from "./row";
import Sidebar from "../shared/sidebar";

export default function TableView() {
    const { data, loading, error, searchTerm, setSearchTerm, refresh } =
        useFilter();
    const [showSidebar, setShowSidebar] = useState(false);

    const columns: TableColumn<FeatureItem>[] = [
        { key: "name", label: "Name", sortable: true },
        { key: "status", label: "Status", sortable: true },
        { key: "created_at", label: "Created", sortable: true },
        { key: "actions", label: "Actions", sortable: false },
    ];

    return (
        <>
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                renderRow={(item) => (
                    <Row
                        key={item.id}
                        item={item}
                        onShowDetails={() => setShowSidebar(true)}
                    />
                )}
            />

            <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
        </>
    );
}
```

### 5. Grid View Pattern

The grid view displays items in a card-based layout with the unified sidebar pattern for details. Like the table view, it follows the sidebar patterns in [Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md).

```tsx
// [feature]/components/grid/view.tsx
"use client";

import { useState } from "react";
import { LoadingState, ErrorState } from "@/components/ui";
import { useFilter } from "../../contexts/filter-context";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, error } = useFilter();
    const [showSidebar, setShowSidebar] = useState(false);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map((item) => (
                        <Item
                            key={item.id}
                            item={item}
                            onShowDetails={() => setShowSidebar(true)}
                        />
                    ))}
                </div>
            </div>

            <Sidebar
                isOpen={showSidebar}
                onClose={() => setShowSidebar(false)}
            />
        </>
    );
}
```

## Shared Components Pattern

### Shared Component Examples

```tsx
// [feature]/components/shared/sidebar.tsx
"use client";

import Details from "./details";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    return (
        <div className={`drawer ${isOpen ? "drawer-open" : ""}`}>
            <div className="drawer-side">
                <label className="drawer-overlay" onClick={onClose}></label>
                <div className="w-96 min-h-full bg-base-200">
                    <Details />
                </div>
            </div>
        </div>
    );
}
```

```tsx
// [feature]/components/shared/details.tsx
"use client";

import { useFilter } from "../../contexts/filter-context";

export default function Details() {
    const { selectedId, data } = useFilter();

    if (!selectedId) return null;

    const item = data.find((d) => d.id === selectedId);
    if (!item) return <div>Item not found</div>;

    return (
        <div className="space-y-6 p-6">
            {/* All detail content goes here */}
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <div className="grid gap-4">{/* Detail sections */}</div>
        </div>
    );
}
```

## Component Responsibilities

### Single Responsibility Principle

Each component should have one clear responsibility:

- **View Components**: Layout orchestration and view-specific interactions
- **Panel/Item Components**: Individual item rendering and layout
- **Shared Components**: Reusable functionality across all views
- **Modal Components**: Form handling and validation
- **Wizard Components**: Multi-step workflow orchestration
- **Context**: Data fetching, state management, and business logic

### Data Flow Pattern

1. **Page Component**: View mode management, provider setup
2. **Context**: Data fetching, global state management
3. **View Components**: View-specific rendering and user interactions
4. **Shared Components**: Cross-view functionality (details, stats, actions)
5. **Item Components**: Individual item presentation
6. **Modal/Wizard Components**: Isolated workflows

## File Organization Rules

### Do's ✅

- One component per file
- Clear, descriptive naming following the convention
- Separate concerns (data, UI, logic)
- Use TypeScript interfaces for all props
- Export default for main component, named exports for utilities

### Don'ts ❌

- Don't mix multiple components in one file
- Don't use generic names like `component.tsx`
- Don't put business logic in UI components
- Don't create deeply nested folder structures
- Don't duplicate view logic across components

## Integration Patterns

### Context Integration

````tsx
// contexts/[feature]-filter-context.tsx
export function FeatureFilterProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Filter state management
    return (
        <FeatureFilterContext.Provider value={value}>
### Context Integration

```tsx
// All views and components use the same context for data and state
const {
    data, loading, error, searchTerm, setSearchTerm,
    selectedId, setSelectedId, refresh
} = useFilter();
````

### Modal Integration

```tsx
// Modal state management in shared/actions-toolbar.tsx
const [showAddModal, setShowAddModal] = useState(false);
const { refresh } = useFilter();

<AddCandidateModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onSuccess={refresh}
/>;
```

### Consistent Data Access

```tsx
// All components access the same data through context
// No prop drilling or duplicate API calls
function AnyComponent() {
    const { data, selectedId, setSelectedId } = useFilter();
    // Component logic here
}
```

## Examples

See the following feature implementations for reference:

- **Roles**: Complete implementation with all view types (recommended template)
- **Candidates**: Being refactored to follow this new structure

## See Also

- **[Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md)** - Detailed implementation patterns for action toolbars, filter panels, and detail sidebars used across all feature views
- **[Frontend List Calls Standard](./frontend-list-calls-standard.md)** - Technical specification for the `useStandardList` hook, StandardListParams interface, and consistent API calling patterns

This guidance ensures consistency across all features while maintaining flexibility for feature-specific requirements.
