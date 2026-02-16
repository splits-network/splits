"use client";

import { useCallback, useState } from "react";
import { ViewMode } from "@/hooks/use-view-mode";
import { UnifiedJobFilters } from "../types";
import RoleWizardModal from "./modals/role-wizard-modal";

interface HeaderFiltersProps {
    viewMode: ViewMode;
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: UnifiedJobFilters;
    setFilter: <K extends keyof UnifiedJobFilters>(
        key: K,
        value: UnifiedJobFilters[K],
    ) => void;
    loading: boolean;
    canCreateRole: boolean;
    showJobAssignmentFilter: boolean;
    refresh: () => Promise<void>;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

export function HeaderFilters({
    viewMode,
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    canCreateRole,
    showJobAssignmentFilter,
    refresh,
    showStats,
    setShowStats,
}: HeaderFiltersProps) {
    // Modal state for adding new role
    const [showAddModal, setShowAddModal] = useState(false);

    const handleReset = useCallback(() => {
        setFilter("status", undefined);
        setFilter("employment_type", undefined);
        setFilter("is_remote", undefined);
        setFilter("commute_type", undefined);
        setFilter("job_level", undefined);
        // Keep job_owner_filter as it may be role-specific default
    }, [setFilter]);

    // Count active filters (excluding search and job_owner_filter)
    const activeFilterCount = [
        filters.status,
        filters.employment_type,
        filters.is_remote,
        filters.commute_type,
        filters.job_level,
    ].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search text-base-content/50" />
                <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="grow"
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-ghost btn-xs btn-circle"
                        aria-label="Clear search"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
                {loading && (
                    <span className="loading loading-spinner loading-xs" />
                )}
            </label>

            {/* Stats Toggle - only show for grid/table views */}
            {viewMode !== "browse" && (
                <div
                    className="tooltip tooltip-bottom"
                    data-tip={showStats ? "Hide Stats" : "Show Stats"}
                >
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className={`btn btn-sm btn-ghost ${showStats ? "text-primary" : ""}`}
                        aria-label={showStats ? "Hide stats" : "Show stats"}
                    >
                        <i
                            className={`fa-duotone fa-chart-line ${showStats ? "" : "opacity-50"}`}
                        />
                    </button>
                </div>
            )}

            {/* Filters Dropdown */}
            <div className="dropdown dropdown-end">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-sm btn-ghost"
                    title="Filters"
                >
                    <i className="fa-duotone fa-filter" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="badge badge-primary badge-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-72 z-[50] border border-base-200 space-y-4"
                >
                    <div className="flex justify-between items-center pb-2 border-b border-base-200">
                        <span className="font-semibold">Filters</span>
                        <button
                            onClick={handleReset}
                            className="text-xs text-base-content/60 hover:text-primary"
                        >
                            Reset
                        </button>
                    </div>

                    {/* Status Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Status</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilter("status", e.target.value || undefined)
                            }
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="filled">Filled</option>
                            <option value="closed">Closed</option>
                        </select>
                    </fieldset>

                    {/* Job Assignment Filter */}
                    {showJobAssignmentFilter && (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Job Assignment
                            </legend>
                            <select
                                className="select select-sm w-full"
                                value={filters.job_owner_filter || "all"}
                                onChange={(e) =>
                                    setFilter(
                                        "job_owner_filter",
                                        e.target.value as "all" | "assigned",
                                    )
                                }
                            >
                                <option value="all">All Jobs</option>
                                <option value="assigned">
                                    My Assigned Jobs
                                </option>
                            </select>
                        </fieldset>
                    )}

                    {/* Employment Type Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Employment Type
                        </legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.employment_type || ""}
                            onChange={(e) =>
                                setFilter(
                                    "employment_type",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Types</option>
                            <option value="fulltime">Full-time</option>
                            <option value="contract">Contract</option>
                            <option value="parttime">Part-time</option>
                            <option value="freelance">Freelance</option>
                        </select>
                    </fieldset>

                    {/* Commute Type Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Commute Type</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.commute_type || ""}
                            onChange={(e) => setFilter("commute_type", e.target.value || undefined)}
                        >
                            <option value="">All Commute Types</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid_1">Hybrid (1 day)</option>
                            <option value="hybrid_2">Hybrid (2 days)</option>
                            <option value="hybrid_3">Hybrid (3 days)</option>
                            <option value="hybrid_4">Hybrid (4 days)</option>
                            <option value="in_office">In Office</option>
                        </select>
                    </fieldset>

                    {/* Job Level Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Job Level</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.job_level || ""}
                            onChange={(e) => setFilter("job_level", e.target.value || undefined)}
                        >
                            <option value="">All Levels</option>
                            <option value="entry">Entry Level</option>
                            <option value="mid">Mid Level</option>
                            <option value="senior">Senior</option>
                            <option value="lead">Lead</option>
                            <option value="manager">Manager</option>
                            <option value="director">Director</option>
                            <option value="vp">VP</option>
                            <option value="c_suite">C-Suite</option>
                        </select>
                    </fieldset>

                    {/* Remote Only Toggle */}
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={!!filters.is_remote}
                            onChange={(e) =>
                                setFilter(
                                    "is_remote",
                                    e.target.checked || undefined,
                                )
                            }
                        />
                        <span className="label-text">Remote Only</span>
                    </label>
                </div>
            </div>

            {/* Add Role Button */}
            {canCreateRole && (
                <div className="tooltip tooltip-bottom" data-tip="Add Role">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-sm btn-primary"
                        aria-label="Add role"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">Add Role</span>
                    </button>
                </div>
            )}

            {/* Add Role Modal */}
            {showAddModal && (
                <RoleWizardModal
                    isOpen={showAddModal}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}
