"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselScopeToggle,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { UnifiedJobFilters } from "../../types";
import {
    JOB_STATUS_LABELS,
    EMPLOYMENT_TYPE_LABELS,
    COMMUTE_TYPE_LABELS,
    JOB_LEVEL_LABELS,
    ROLE_SORT_OPTIONS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(JOB_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const EMPLOYMENT_OPTIONS = Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const COMMUTE_OPTIONS = Object.entries(COMMUTE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const JOB_LEVEL_OPTIONS = Object.entries(JOB_LEVEL_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: UnifiedJobFilters;
    onFilterChange: <K extends keyof UnifiedJobFilters>(
        key: K,
        value: UnifiedJobFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    canCreateRole: boolean;
    onAddRole: () => void;
    jobCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (field: string, order: "asc" | "desc") => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    canCreateRole,
    onAddRole,
    jobCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.commute_type || filters.job_level || filters.company_id);

    return (
        <BaselControlsBarShell
            /* Row 1: Action + Search + Inline Filters */
            action={
                canCreateRole ? (
                    <button
                        onClick={onAddRole}
                        className="btn btn-primary btn-sm gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">Add Role</span>
                    </button>
                ) : undefined
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search roles, companies, skills..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.status}
                        onChange={(v) => onFilterChange("status", v)}
                        options={STATUS_OPTIONS}
                        placeholder="All Status"
                    />
                    <BaselFilterSelect
                        value={filters.employment_type}
                        onChange={(v) => onFilterChange("employment_type", v)}
                        options={EMPLOYMENT_OPTIONS}
                        placeholder="All Types"
                    />
                </>
            }
            /* Row 2: Scope + Count (left) | Sort + Refresh + View + Expand (right) */
            statusLeft={
                <>
                    <BaselScopeToggle
                        value={filters.job_owner_filter || "assigned"}
                        onChange={(v) => onFilterChange("job_owner_filter", v as "all" | "assigned")}
                        options={[
                            { value: "assigned", label: "My Roles" },
                            { value: "all", label: "All Roles" },
                        ]}
                    />
                    <BaselResultsCount count={jobCount} total={totalCount} />
                </>
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={ROLE_SORT_OPTIONS}
                    />
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                    <BaselExpandToggle
                        expanded={expanded || hasExpandedFilters}
                        onToggle={() => setExpanded((prev) => !prev)}
                    />
                </>
            }
            /* Row 3: Expanded filters */
            expandedFilters={
                (expanded || hasExpandedFilters) ? (
                    <>
                        <BaselFilterSelect
                            value={filters.commute_type}
                            onChange={(v) => onFilterChange("commute_type", v)}
                            options={COMMUTE_OPTIONS}
                            placeholder="All Commute Types"
                        />
                        <BaselFilterSelect
                            value={filters.job_level}
                            onChange={(v) => onFilterChange("job_level", v)}
                            options={JOB_LEVEL_OPTIONS}
                            placeholder="All Levels"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
