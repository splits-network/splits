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
├── types.ts                    # Feature-specific TypeScript types and helpers
├── contexts/                   # Feature-specific React contexts
│   └── filter-context.tsx
└── components/
    ├── browse/                 # Browse view components
    │   ├── view.tsx
    │   ├── list-item.tsx
    │   ├── detail-panel.tsx
    │   └── detail-header.tsx
    ├── table/                  # Table view components
    │   ├── view.tsx
    │   └── row.tsx
    ├── grid/                   # Grid view components
    │   ├── view.tsx
    │   └── item.tsx
    ├── modals/                 # Modal dialogs
    │   ├── add-[feature]-modal.tsx # should use the add/edit modal pattern from shared-ui
    │   └── delete-[feature]-modal.tsx
    ├── wizards/                # Multi-step workflows
    │   ├── [workflow]-wizard.tsx
    │   └── [workflow]-wizard-steps/
    │       ├── step-1.tsx
    │       ├── step-2.tsx
    │       └── step-3.tsx
    ├── shared/                 # Shared components across all views
    │   ├── details.tsx         # Full detail content, reused in browse/detail-panel.tsx and sidebar
    │   ├── sidebar.tsx         # DaisyUI drawer sidebar for table/grid views
    │   ├── header-filters.tsx  # Search, filters, stats toggle, primary action button
    │   ├── stats.tsx           # Self-loading stats panel (fetches own analytics data)
    │   └── actions-toolbar.tsx # Action buttons (icon-only/descriptive variants)
```

## Component Naming Conventions

### View Components

- **Browse**: `view.tsx`, `list-item.tsx`, `detail-panel.tsx`, `detail-header.tsx`
- **Table**: `view.tsx`, `row.tsx`
- **Grid**: `view.tsx`, `item.tsx`

### Shared Components

- `shared/details.tsx` - Complete detail content (reused in browse detail panel and sidebar)
- `shared/sidebar.tsx` - DaisyUI drawer container for table/grid views (actions toolbar in header)
- `shared/actions-toolbar.tsx` - Action buttons used across all views (icon-only and descriptive variants)
- `shared/stats.tsx` - Self-loading stats panel that fetches its own analytics data (rendered at page level)
- `shared/header-filters.tsx` - Search, filter controls, stats toggle, and primary action button for page title

### Interactive Components

- **Modals**: `add-[model]-modal.tsx`, `delete-[model]-modal.tsx` (use model name, not feature name)
- **Wizards**: `[workflow-name]-wizard.tsx`

## Implementation Patterns

### 1. Main Page Component (Provider/Content Wrapper)

**CRITICAL**: To avoid "hook must be used within provider" errors, always use the two-component wrapper pattern. The main export provides the context, and a separate content component consumes it.

```tsx
// [feature]/page.tsx
"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewMode, type ViewMode } from "@/hooks/use-view-mode";
import { LoadingState } from "@splits-network/shared-ui";
import { FilterProvider, useFilter } from "./contexts/filter-context";
import HeaderFilters from "./components/shared/header-filters";
import Stats from "./components/shared/stats";
import BrowseView from "./components/browse/view";
import TableView from "./components/table/view";
import GridView from "./components/grid/view";

// Main export - only provides the context provider
export default function FeaturePage() {
    return (
        <FilterProvider>
            <FeaturePageContent />
        </FilterProvider>
    );
}

// Content component - consumes context and passes data as props
function FeaturePageContent() {
    const { viewMode, setViewMode, isLoaded } =
        useViewMode("[feature]ViewMode");
    const router = useRouter();
    const pathname = usePathname();

    // Pull context data to pass as props to HeaderFilters
    const {
        searchInput,
        setSearchInput,
        clearSearch,
        filters,
        setFilter,
        loading,
        refresh,
        showStats,
        setShowStats,
    } = useFilter();

    // Clear URL params when switching views to prevent stale selection
    const handleViewChange = useCallback(
        (newView: ViewMode) => {
            router.replace(pathname);
            setViewMode(newView);
        },
        [router, pathname, setViewMode],
    );

    if (!isLoaded) {
        return <LoadingState message="Loading [feature]..." />;
    }

    return (
        <>
            <PageTitle
                title="[Feature]"
                subtitle="Manage your [feature] pipeline"
            >
                <HeaderFilters
                    searchInput={searchInput}
                    setSearchInput={setSearchInput}
                    clearSearch={clearSearch}
                    filters={filters}
                    setFilter={setFilter}
                    loading={loading}
                    refresh={refresh}
                    showStats={showStats}
                    setShowStats={setShowStats}
                />
                <ViewToggle
                    viewMode={viewMode}
                    onViewChange={handleViewChange}
                />
            </PageTitle>

            <div className="space-y-6">
                {showStats && <Stats />}

                {viewMode === "browse" && <BrowseView />}
                {viewMode === "table" && <TableView />}
                {viewMode === "grid" && <GridView />}
            </div>
        </>
    );
}
```

**Key Rules:**

- Main component exports only the provider wrapper
- Content component consumes context via `useFilter()` hook
- Child components (like HeaderFilters) receive context data as **props**, NOT by calling hooks directly
- Clear URL params when switching views to prevent stale state
- View mode is persisted to localStorage via `useViewMode` hook

### 2. Filter Context Pattern

The filter context uses the standardized list pattern for data fetching and state management. See [Frontend List Calls Standard](./frontend-list-calls-standard.md) for complete implementation details of the `useStandardList` hook.

```tsx
// [feature]/contexts/filter-context.tsx
"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
    ReactNode,
} from "react";
import {
    useStandardList,
    UseStandardListReturn,
} from "@/hooks/use-standard-list";
import { FeatureItem, FeatureFilters } from "../types";

const STATS_VISIBLE_KEY = "[feature]StatsVisible";

interface FilterContextValue extends UseStandardListReturn<
    FeatureItem,
    FeatureFilters
> {
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
    // Stats visibility with localStorage persistence
    const [showStats, setShowStatsState] = useState(true);
    const [statsLoaded, setStatsLoaded] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(STATS_VISIBLE_KEY);
            if (stored !== null) setShowStatsState(stored === "true");
            setStatsLoaded(true);
        }
    }, []);

    const setShowStats = useCallback((show: boolean) => {
        setShowStatsState(show);
        if (typeof window !== "undefined") {
            localStorage.setItem(STATS_VISIBLE_KEY, String(show));
        }
    }, []);

    // Memoize defaultFilters to prevent unnecessary re-renders
    const defaultFilters = useMemo<FeatureFilters>(
        () => ({ status: undefined }),
        [],
    );

    const listState = useStandardList<FeatureItem, FeatureFilters>({
        endpoint: "/[feature]",
        defaultFilters,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: true,
    });

    const contextValue: FilterContextValue = {
        ...listState,
        showStats: statsLoaded ? showStats : true,
        setShowStats,
    };

    return (
        <FilterContext.Provider value={contextValue}>
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

The browse view uses a side-by-side layout with list and detail panels. Uses `BrowseLayout` from `@splits-network/shared-ui` and URL-based selection.

```tsx
// [feature]/components/browse/view.tsx
"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { BrowseLayout } from "@splits-network/shared-ui";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import ListItem from "./list-item";
import DetailPanel from "./detail-panel";

export default function BrowseView() {
    const { data, loading, pagination, page, goToPage } = useFilter();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL-based selection
    const selectedId = searchParams.get("[feature]Id");
    const totalPages = pagination?.total_pages || 1;

    const handleSelect = useCallback(
        (id: string) => {
            const params = new URLSearchParams(searchParams);
            params.set("[feature]Id", id);
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("[feature]Id");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    return (
        <BrowseLayout>
            {/* Left Panel - List */}
            <div
                className={`flex flex-col border-r border-base-300 bg-base-200 w-full md:w-96 lg:w-[420px] ${
                    selectedId ? "hidden md:flex" : "flex"
                }`}
            >
                <div className="flex-1 overflow-y-auto min-h-0">
                    {loading && data.length === 0 ? (
                        <div className="p-8">
                            <LoadingState message="Loading..." />
                        </div>
                    ) : data.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                title="No items found"
                                description="..."
                            />
                        </div>
                    ) : (
                        data.map((item) => (
                            <ListItem
                                key={item.id}
                                item={item}
                                isSelected={selectedId === item.id}
                                onSelect={handleSelect}
                            />
                        ))
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="border-t border-base-300 p-2 flex items-center justify-between text-xs">
                        <span>
                            Page {page} of {totalPages}
                        </span>
                        <div className="join">
                            <button
                                className="join-item btn btn-xs"
                                disabled={page <= 1}
                                onClick={() => goToPage(page - 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-left" />
                            </button>
                            <button
                                className="join-item btn btn-xs"
                                disabled={page >= totalPages}
                                onClick={() => goToPage(page + 1)}
                            >
                                <i className="fa-duotone fa-regular fa-chevron-right" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Panel - Detail */}
            <div
                className={`flex-1 flex-col bg-base-100 min-w-0 ${
                    selectedId
                        ? "fixed inset-0 z-50 flex md:static md:z-auto"
                        : "hidden md:flex"
                }`}
            >
                {selectedId ? (
                    <DetailPanel id={selectedId} onClose={handleClose} />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-base-content/60">
                        <p>Select an item to view details</p>
                    </div>
                )}
            </div>
        </BrowseLayout>
    );
}
```

```tsx
// [feature]/components/browse/detail-panel.tsx
"use client";

import DetailHeader from "./detail-header";
import Details from "../shared/details";

interface DetailPanelProps {
    id: string;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader id={id} onClose={onClose} />
            <div className="flex-1 overflow-y-auto">
                <Details itemId={id} />
            </div>
        </div>
    );
}
```

### 4. Table View Pattern

The table view uses the `DataTable` component with the sidebar for detail views. The sidebar receives the **full entity object** (not just an ID) to avoid redundant API fetches.

```tsx
// [feature]/components/table/view.tsx
"use client";

import { useState } from "react";
import { DataTable, type TableColumn } from "@/components/ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { FeatureItem } from "../../types";
import Row from "./row";
import Sidebar from "../shared/sidebar";

export default function TableView() {
    const {
        data,
        loading,
        pagination,
        sortBy,
        sortOrder,
        handleSort,
        page,
        goToPage,
    } = useFilter();

    // Track the FULL ENTITY for sidebar (avoids extra fetch)
    const [sidebarItem, setSidebarItem] = useState<FeatureItem | null>(null);

    return (
        <>
            <div className="space-y-6">
                <DataTable
                    columns={columns}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    loading={loading}
                    isEmpty={data.length === 0}
                    emptyState={<EmptyState title="..." description="..." />}
                    showExpandColumn
                    card
                    zebra
                >
                    {data.map((item) => (
                        <Row
                            key={item.id}
                            item={item}
                            onViewDetails={(id) => setSidebarItem(item)}
                        />
                    ))}
                </DataTable>

                {pagination && pagination.total_pages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={pagination.total_pages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            {/* Sidebar receives full entity object */}
            <Sidebar item={sidebarItem} onClose={() => setSidebarItem(null)} />
        </>
    );
}
```

### 5. Grid View Pattern

The grid view displays items in a card-based layout with the same sidebar pattern as the table view.

```tsx
// [feature]/components/grid/view.tsx
"use client";

import { useState } from "react";
import { LoadingState } from "@splits-network/shared-ui";
import { PaginationControls, EmptyState } from "@/hooks/use-standard-list";
import { useFilter } from "../../contexts/filter-context";
import { FeatureItem } from "../../types";
import Item from "./item";
import Sidebar from "../shared/sidebar";

export default function GridView() {
    const { data, loading, pagination, page, goToPage } = useFilter();
    const [sidebarItem, setSidebarItem] = useState<FeatureItem | null>(null);

    if (loading && data.length === 0) {
        return <LoadingState message="Loading..." />;
    }

    return (
        <>
            <div className="space-y-6">
                {data.length === 0 ? (
                    <EmptyState title="..." description="..." />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                onViewDetails={(id) => setSidebarItem(item)}
                            />
                        ))}
                    </div>
                )}

                {pagination && pagination.total_pages > 1 && (
                    <PaginationControls
                        page={page}
                        totalPages={pagination.total_pages}
                        onPageChange={goToPage}
                    />
                )}
            </div>

            <Sidebar item={sidebarItem} onClose={() => setSidebarItem(null)} />
        </>
    );
}
```

## Shared Components Pattern

### Sidebar (Actions Toolbar in Header)

The sidebar uses a DaisyUI `drawer drawer-end` pattern. The **actions toolbar lives in the sidebar header** alongside the title and close button, ensuring actions are always visible without scrolling.

The sidebar receives the **full entity object** as a prop rather than just an ID. This avoids a redundant fetch since the list already has the data.

```tsx
// [feature]/components/shared/sidebar.tsx
"use client";

import Details from "./details";
import ActionsToolbar from "./actions-toolbar";
import { useFilter } from "../../contexts/filter-context";

interface SidebarProps {
    item: FeatureItem | null;
    onClose: () => void;
}

export default function Sidebar({ item, onClose }: SidebarProps) {
    const { refresh } = useFilter();

    if (!item) return null;

    return (
        <div className="drawer drawer-end">
            <input
                id="[feature]-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!item}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                />

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header - Actions toolbar here for always-visible access */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">
                                <i className="fa-duotone fa-regular fa-[icon] mr-2" />
                                [Feature] Details
                            </h2>
                            <div className="flex items-center gap-2">
                                <ActionsToolbar item={item} />
                                <button
                                    onClick={onClose}
                                    className="btn btn-sm btn-square btn-ghost"
                                    aria-label="Close"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                        <Details itemId={item.id} onRefresh={refresh} />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

**Key Sidebar Rules:**

- Actions toolbar in the header, next to the close button (always visible)
- Receives full entity object, not just an ID
- Responsive sizing: `w-full md:w-2/3 lg:w-1/2 xl:w-2/5`
- Sticky header with `z-10` so it stays visible while scrolling

### Details Component

The details component fetches and displays the full item detail. It is reused in both the browse detail panel and the sidebar.

```tsx
// [feature]/components/shared/details.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";

interface DetailsProps {
    itemId: string;
    onRefresh?: () => void;
}

export default function Details({ itemId, onRefresh }: DetailsProps) {
    const { getToken } = useAuth();
    const [item, setItem] = useState<FeatureItem | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/[feature]/${itemId}`);
            setItem(response.data);
        } catch (err) {
            console.error("Failed to fetch detail:", err);
        } finally {
            setLoading(false);
        }
    }, [itemId, getToken]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    if (loading)
        return (
            <div className="p-8">
                <LoadingState message="Loading details..." />
            </div>
        );
    if (!item) return null;

    return <div className="space-y-6 p-6">{/* Detail sections here */}</div>;
}
```

#### Tabbed Details (Large Data Sets)

When a feature has a large amount of detail data to present, use DaisyUI's `tabs tabs-lift` pattern to organize content into logical sections. This keeps the detail view scannable and prevents overwhelming the user with a single long scroll.

```tsx
// Inside details.tsx - tabbed layout for complex entities
const [activeTab, setActiveTab] = useState<
    "overview" | "requirements" | "financials"
>("overview");

return (
    <div className="space-y-6 p-6">
        {/* Tabs */}
        <div className="overflow-x-auto">
            <div role="tablist" className="tabs tabs-lift min-w-max mb-4">
                <a
                    role="tab"
                    className={`tab ${activeTab === "overview" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("overview")}
                >
                    <i className="fa-duotone fa-clipboard mr-2" />
                    Overview
                </a>

                {/* Conditional tab - only show if data exists */}
                {item.requirements && item.requirements.length > 0 && (
                    <a
                        role="tab"
                        className={`tab ${activeTab === "requirements" ? "tab-active" : ""}`}
                        onClick={() => setActiveTab("requirements")}
                    >
                        <i className="fa-duotone fa-list-check mr-2" />
                        Requirements
                        {/* Optional count badge */}
                        <span className="badge badge-xs badge-primary ml-1">
                            {item.requirements.length}
                        </span>
                    </a>
                )}

                <a
                    role="tab"
                    className={`tab ${activeTab === "financials" ? "tab-active" : ""}`}
                    onClick={() => setActiveTab("financials")}
                >
                    <i className="fa-duotone fa-dollar-sign mr-2" />
                    Financials
                </a>
            </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewContent item={item} />}
        {activeTab === "requirements" && <RequirementsContent item={item} />}
        {activeTab === "financials" && <FinancialsContent item={item} />}
    </div>
);
```

**Key Tab Rules:**

- Use DaisyUI's `tabs tabs-lift` class with semantic `role="tablist"` and `role="tab"` attributes
- Each tab has a **FontAwesome Duotone icon** with `mr-2` spacing before the label
- Use `tab-active` class for the active tab (controlled by `useState`)
- Wrap tabs in `overflow-x-auto` for mobile horizontal scrolling
- `min-w-max` on the tablist prevents premature wrapping
- **Conditional tabs**: Only render tabs when the relevant data exists
- **Count badges**: Use `badge badge-xs badge-primary ml-1` to show item counts on tabs
- Tab content renders conditionally below based on `activeTab` state
- For simpler features with less data, tabs are optional - a flat layout is fine

### Header Filters

The header filters component receives all its data as **props** from the page content component (which pulls from context). It does NOT call `useFilter()` directly.

```tsx
// [feature]/components/shared/header-filters.tsx
"use client";

import { useState } from "react";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: any;
    setFilter: (key: string, value: any) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

export default function HeaderFilters({ searchInput, setSearchInput, ... }: HeaderFiltersProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const activeFilterCount = [filters.status].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input type="text" placeholder="Search..." value={searchInput}
                       onChange={(e) => setSearchInput(e.target.value)} disabled={loading} />
                {searchInput && (
                    <button onClick={clearSearch} className="btn btn-ghost btn-xs btn-square">
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
            </label>

            {/* Stats Toggle */}
            <button onClick={() => setShowStats(!showStats)}
                    className={`btn btn-sm btn-ghost ${showStats ? "text-primary" : ""}`}>
                <i className="fa-duotone fa-regular fa-chart-line" />
            </button>

            {/* Filters Dropdown */}
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                    <i className="fa-duotone fa-regular fa-filter" />
                    Filters
                    {activeFilterCount > 0 && <span className="badge badge-primary badge-xs">{activeFilterCount}</span>}
                </div>
                <div tabIndex={0} className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-64 z-50">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Status</legend>
                        <select className="select w-full select-sm" value={filters.status || ""}
                                onChange={(e) => setFilter("status", e.target.value || undefined)}>
                            <option value="">All</option>
                            {/* Feature-specific options */}
                        </select>
                    </fieldset>
                </div>
            </div>

            {/* Primary Action Button */}
            <button className="btn btn-sm btn-primary" onClick={() => setShowCreateModal(true)}>
                <i className="fa-duotone fa-regular fa-plus" /> Add [Feature]
            </button>

            {/* Create Modal */}
            <AddFeatureModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={...} />
        </div>
    );
}
```

### Stats Component (Self-Loading Analytics)

The stats component is a **self-contained, self-loading** component that fetches its own analytics data independently from the list data. This is important because:

- Stats should reflect **aggregate analytics** (e.g., totals across all pages), not just the current page's filtered data
- Stats load once and remain consistent regardless of list pagination/filtering
- Stats are rendered at the **page level** (in `page.tsx`), ensuring consistency across all view modes

The component uses the `card bg-base-200` wrapper pattern with `StatCardGrid` inside to create a layered visual appearance.

```tsx
// [feature]/components/shared/stats.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { StatCard, StatCardGrid } from "@/components/ui/cards";

interface FeatureStats {
    total: number;
    active: number;
    // ... feature-specific stat fields
}

const emptyStats: FeatureStats = { total: 0, active: 0 };

export default function Stats() {
    const { getToken, isLoaded } = useAuth();
    const [stats, setStats] = useState<FeatureStats>(emptyStats);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (cancelled || !isLoaded) return;

            const token = await getToken();
            if (!token) {
                if (!cancelled) setStats(emptyStats);
                return;
            }

            try {
                const client = createAuthenticatedClient(token);
                const response: any = await client.get("/[feature]", {
                    params: { limit: 1000 },
                });

                const items = response.data || [];
                // Calculate stats from full dataset
                if (!cancelled) {
                    setStats({
                        total: response.pagination?.total || items.length,
                        active: items.filter((i: any) => i.status === "active")
                            .length,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch stats:", error);
                if (!cancelled) setStats(emptyStats);
            }
        };

        void run();
        return () => {
            cancelled = true;
        };
    }, [getToken, isLoaded]);

    return (
        <div className="card bg-base-200">
            <StatCardGrid className="m-2 shadow-lg">
                <StatCard
                    title="Total"
                    value={stats.total}
                    icon="fa-duotone fa-regular fa-[icon]"
                    color="primary"
                />
                <StatCard
                    title="Active"
                    value={stats.active}
                    icon="fa-duotone fa-regular fa-[icon]"
                    color="success"
                />
                {/* Feature-specific stat cards... */}
            </StatCardGrid>
        </div>
    );
}
```

**Key Stats Rules:**

- Stats component **loads its own data** - does NOT use data from the filter context
- Wrapped in `<div className="card bg-base-200">` for visual layering
- `StatCardGrid` uses `className="m-2 shadow-lg"` for inner spacing and depth
- Rendered at **page level** in `page.tsx` (above the view), not inside individual views
- Toggle controlled by `showStats` state from filter context, toggled via header-filters button
- Use `StatCard` props: `title`, `value`, `icon`, `color`, and optionally `trend`/`trendLabel` for analytics
- Cleanup pattern with `cancelled` flag to prevent state updates on unmounted components

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

1. **Page Component**: Provider wrapper + content component with view mode management
2. **Content Component**: Consumes context, passes data as props to HeaderFilters, renders Stats at page level
3. **Stats Component**: Self-loading analytics (independent data fetch, not from list context)
4. **Context**: Data fetching via `useStandardList`, global state management
5. **View Components**: View-specific rendering, sidebar state management
6. **Shared Components**: Cross-view functionality (details, sidebar with toolbar, actions)
7. **Item Components**: Individual item presentation
8. **Modal/Wizard Components**: Isolated workflows

## File Organization Rules

### Do's

- One component per file
- Clear, descriptive naming following the convention
- Separate concerns (data, UI, logic)
- Use TypeScript interfaces for all props
- Export default for main component, named exports for utilities
- Pass context data as props to leaf components (like HeaderFilters)
- Track the full entity object for sidebar state (not just the ID)

### Don'ts

- Don't mix multiple components in one file
- Don't use generic names like `component.tsx`
- Don't put business logic in UI components
- Don't create deeply nested folder structures
- Don't duplicate view logic across components
- Don't call `useFilter()` from components rendered outside the provider (like HeaderFilters in PageTitle)

## Integration Patterns

### Context Integration

```tsx
// View components that are INSIDE the provider can use the hook directly
function BrowseView() {
    const { data, loading, page, goToPage, refresh } = useFilter();
    // ...
}
```

### Modal Integration

```tsx
// Modal state management in header-filters or actions-toolbar
const [showAddModal, setShowAddModal] = useState(false);

<AddFeatureModal
    isOpen={showAddModal}
    onClose={() => setShowAddModal(false)}
    onSuccess={() => {
        refresh();
        setShowAddModal(false);
    }}
/>;
```

### Sidebar Integration

```tsx
// Table/Grid views track the full entity for the sidebar
const [sidebarItem, setSidebarItem] = useState<FeatureItem | null>(null);

// When opening sidebar, pass the full entity (already available from list data)
<Row item={item} onViewDetails={(id) => setSidebarItem(item)} />

// Sidebar receives the full object (no redundant fetch needed for header/toolbar)
<Sidebar item={sidebarItem} onClose={() => setSidebarItem(null)} />
```

## Examples

See the following feature implementations for reference:

- **Invite Companies**: Clean implementation following this guidance (`invite-companies-new/`)
- **Roles**: Complex implementation with all view types, wizards, and pipeline sidebars
- **Candidates**: Being refactored to follow this structure

## See Also

- **[Unified Action Toolbar & Sidebar Pattern](./unified-action-toolbar-sidebar-pattern.md)** - Detailed implementation patterns for action toolbars, filter panels, and detail sidebars used across all feature views
- **[Frontend List Calls Standard](./frontend-list-calls-standard.md)** - Technical specification for the `useStandardList` hook, StandardListParams interface, and consistent API calling patterns

This guidance ensures consistency across all features while maintaining flexibility for feature-specific requirements.
