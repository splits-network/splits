"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { UnifiedJobFilters } from "../../types";

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
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    {/* My Roles / All Roles toggle */}
                    <div className="flex bg-base-200 p-1 rounded-none">
                        {(
                            [
                                { value: "assigned", label: "My Roles" },
                                { value: "all", label: "All Roles" },
                            ] as const
                        ).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() =>
                                    onFilterChange("job_owner_filter", value)
                                }
                                className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors rounded-none ${
                                    filters.job_owner_filter === value
                                        ? "bg-primary text-primary-content"
                                        : "text-base-content/50 hover:text-base-content"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search roles, companies, skills..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.status || ""}
                        onChange={(e) =>
                            onFilterChange("status", e.target.value || undefined)
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="filled">Filled</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={filters.employment_type || ""}
                        onChange={(e) =>
                            onFilterChange("employment_type", e.target.value || undefined)
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="contract">Contract</option>
                        <option value="temporary">Temporary</option>
                    </select>

                    {canCreateRole && (
                        <button
                            onClick={onAddRole}
                            className="btn btn-primary gap-2 rounded-none"
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            <span className="hidden sm:inline">Add Role</span>
                        </button>
                    )}

                </>
            }
            statusLeft={
                <BaselResultsCount count={jobCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </>
            }
        />
    );
}
