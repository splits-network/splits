# Browse Components Usage Guide

The `@splits-network/shared-ui` package provides generic browse components for implementing master-detail split view interfaces across the Splits Network applications.

## Overview

The browse pattern consists of:

- **BrowseClient**: Main orchestrator with URL state management (created via factory)
- **BrowseListPanel**: Search, filters, pagination, and item list
- **BrowseDetailPanel**: Detail view with loading/error states
- **BrowseLayout**: Container with responsive layout
- **BrowseFilterDropdown**: Reusable filter dropdown

## Quick Start

### 1. Create Domain Browse Components

```tsx
// In your domain (e.g., apps/portal/src/app/portal/roles/components/browse/)
import { useStandardList } from "@/hooks/use-standard-list";
import { createBrowseComponents } from "@splits-network/shared-ui";
import { Job, JobFilters } from "./types";

// Create domain-specific components using your existing useStandardList hook
const { BrowseClient: RolesBrowseClient } = createBrowseComponents<
    Job,
    JobFilters
>(useStandardList);

export { RolesBrowseClient };
```

### 2. Implement Browse Interface

```tsx
// browse-roles-client.tsx
"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { RolesBrowseClient } from "./domain-components";
import RoleListItem from "./list-item";
import RoleDetailPanel from "./detail-panel";
import RoleFilterForm from "./filter-form";
import { Job, JobFilters } from "./types";

export default function BrowseRolesClient() {
    const { getToken } = useAuth();

    const fetchJobs = useCallback(
        async (params: any) => {
            const token = await getToken();
            const client = createAuthenticatedClient(token!);
            return await client.get("/jobs", { params });
        },
        [getToken],
    );

    const renderListItem = useCallback(
        (job: Job, isSelected: boolean, onSelect: (id: string) => void) => (
            <RoleListItem
                key={job.id}
                item={job}
                isSelected={isSelected}
                onSelect={onSelect}
            />
        ),
        [],
    );

    const renderDetail = useCallback(
        (id: string | null, onClose: () => void) => (
            <RoleDetailPanel id={id} onClose={onClose} />
        ),
        [],
    );

    const renderFilters = useCallback(
        (filters: JobFilters, onChange: (filters: JobFilters) => void) => (
            <RoleFilterForm filters={filters} onChange={onChange} />
        ),
        [],
    );

    return (
        <RolesBrowseClient
            fetchFn={fetchJobs}
            renderListItem={renderListItem}
            renderDetail={renderDetail}
            renderFilters={renderFilters}
            defaultFilters={{ job_owner_filter: "all" }}
            searchPlaceholder="Search roles..."
            emptyStateIcon="fa-briefcase"
            emptyStateMessage="Select a role to view details"
            urlParamName="roleId"
            tabs={[
                {
                    key: "mine",
                    label: "My Roles",
                    filterKey: "job_owner_filter",
                    filterValue: "assigned",
                },
                {
                    key: "all",
                    label: "Marketplace",
                    filterKey: "job_owner_filter",
                    filterValue: "all",
                },
            ]}
            defaultActiveTab="all"
            actions={
                <button className="btn btn-primary btn-square">
                    <i className="fa-duotone fa-plus" />
                </button>
            }
        />
    );
}
```

### 3. Create Filter Form

```tsx
// filter-form.tsx
import {
    BrowseFilterDropdown,
    createFilterField,
} from "@splits-network/shared-ui";
import { JobFilters } from "./types";

const FilterField = createFilterField<JobFilters>();

interface FilterFormProps {
    filters: JobFilters;
    onChange: (filters: JobFilters) => void;
}

export default function RoleFilterForm({ filters, onChange }: FilterFormProps) {
    const handleChange = (key: keyof JobFilters, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <BrowseFilterDropdown
            filters={filters}
            onChange={onChange}
            preserveFilters={["job_owner_filter"]} // Keep tab filter when resetting
        >
            <FilterField.Select
                label="Status"
                value={filters.status}
                onChange={(value) => handleChange("status", value)}
                options={[
                    { label: "Active", value: "active" },
                    { label: "Paused", value: "paused" },
                    { label: "Closed", value: "closed" },
                ]}
            />

            <FilterField.Select
                label="Employment Type"
                value={filters.employment_type}
                onChange={(value) => handleChange("employment_type", value)}
                options={[
                    { label: "Full-time", value: "full_time" },
                    { label: "Contract", value: "contract" },
                    { label: "Part-time", value: "part_time" },
                ]}
            />

            <FilterField.Toggle
                label="Remote Work"
                checked={filters.is_remote || false}
                onChange={(checked) => handleChange("is_remote", checked)}
            />
        </BrowseFilterDropdown>
    );
}
```

### 4. List Item Component

```tsx
// list-item.tsx
import { Job } from "./types";

interface RoleListItemProps {
    item: Job;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function RoleListItem({
    item,
    isSelected,
    onSelect,
}: RoleListItemProps) {
    return (
        <div
            onClick={() => onSelect(item.id)}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer 
                transition-all duration-200 hover:bg-base-100
                ${
                    isSelected
                        ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                        : "border-l-4 border-l-transparent"
                }
            `}
        >
            <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-base-content line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                </h3>
                {item.status && (
                    <span
                        className={`badge badge-xs ${
                            item.status === "active"
                                ? "badge-success"
                                : "badge-neutral"
                        }`}
                    >
                        {item.status}
                    </span>
                )}
            </div>

            <div className="text-sm text-base-content/70 mb-2 line-clamp-1">
                {item.company?.name || "Confidential Company"}
            </div>

            <div className="flex items-center justify-between text-xs text-base-content/60">
                <span>{item.location || "Remote"}</span>
                <span>{item.employment_type || "Full-time"}</span>
            </div>
        </div>
    );
}
```

### 5. Detail Panel Component

```tsx
// detail-panel.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BrowseDetailPanel } from "@splits-network/shared-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Job } from "./types";

interface RoleDetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function RoleDetailPanel({ id, onClose }: RoleDetailPanelProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setJob(null);
            return;
        }

        async function fetchJob() {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                const client = createAuthenticatedClient(token!);
                const res = await client.get(`/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                setError("Failed to load role details");
            } finally {
                setLoading(false);
            }
        }

        fetchJob();
    }, [id, getToken]);

    return (
        <BrowseDetailPanel
            id={id}
            onClose={onClose}
            loading={loading}
            error={error}
            emptyIcon="fa-briefcase"
            emptyMessage="Select a role to view details"
        >
            {job && (
                <>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-base-300 bg-base-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="btn btn-ghost btn-sm md:hidden"
                            >
                                <i className="fa-duotone fa-arrow-left" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold">
                                    {job.title}
                                </h1>
                                <p className="text-base-content/60">
                                    {job.company?.name}
                                </p>
                            </div>
                        </div>
                        <button className="btn btn-primary">Edit Role</button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="prose max-w-none">
                            <h3>Job Description</h3>
                            <p>{job.description}</p>

                            <h3>Requirements</h3>
                            <ul>
                                {job.requirements?.map((req, idx) => (
                                    <li key={idx}>{req.description}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </>
            )}
        </BrowseDetailPanel>
    );
}
```

## API Reference

### BrowseClient Props

```tsx
interface BrowseProps<T, F> {
    // Required
    fetchFn: (
        params: StandardListParams & F,
    ) => Promise<StandardListResponse<T>>;
    renderListItem: (
        item: T,
        isSelected: boolean,
        onSelect: (id: string) => void,
    ) => ReactNode;
    renderDetail: (id: string | null, onClose: () => void) => ReactNode;

    // Optional
    defaultFilters?: F;
    defaultSortBy?: string;
    defaultSortOrder?: "asc" | "desc";
    searchPlaceholder?: string;
    emptyStateIcon?: string;
    emptyStateMessage?: string;
    urlParamName?: string; // Default: 'id'
    listPanelWidth?: string; // Default: 'w-full md:w-96 lg:w-[420px]'

    // UI Customization
    listHeader?: ReactNode;
    actions?: ReactNode;
    renderFilters?: (filters: F, onChange: (filters: F) => void) => ReactNode;

    // Tabs
    tabs?: {
        key: string;
        label: string;
        filterValue?: any;
        filterKey?: keyof F;
    }[];
    defaultActiveTab?: string;
}
```

### Filter Field Helpers

```tsx
const FilterField = createFilterField<YourFiltersType>();

// Available components:
<FilterField.Select
    label="Status"
    value={filters.status}
    onChange={(value) => setFilter("status", value)}
    options={[{label: "Active", value: "active"}]}
/>

<FilterField.Toggle
    label="Remote"
    checked={filters.is_remote}
    onChange={(checked) => setFilter("is_remote", checked)}
/>

<FilterField.Input
    label="Search"
    value={filters.search}
    onChange={(value) => setFilter("search", value)}
    placeholder="Enter search term..."
/>
```

## Migration from Existing Components

To migrate existing browse implementations:

1. **Extract types**: Move your domain types to a `types.ts` file
2. **Create domain components**: Use `createBrowseComponents` with your existing `useStandardList`
3. **Refactor list items**: Extract into separate components using the render prop pattern
4. **Update detail panels**: Wrap your existing detail content with `BrowseDetailPanel`
5. **Consolidate filters**: Use `BrowseFilterDropdown` and filter field helpers
6. **Replace layout**: Replace your custom layout with the shared `BrowseClient`

The migration preserves all existing functionality while eliminating code duplication and ensuring consistency across the application.

## Benefits

✅ **Consistent UI/UX** - All browse interfaces follow the same patterns
✅ **Type Safety** - Full TypeScript generics support  
✅ **Responsive Design** - Mobile-first with proper overlay behavior
✅ **Performance** - Shared optimizations benefit all implementations
✅ **Maintainability** - Central location for improvements and bug fixes
✅ **Flexibility** - Render props allow complete customization
✅ **Standards Compliance** - Follows documented browse page standards
