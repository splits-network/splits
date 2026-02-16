"use client";

import { useCallback } from "react";
import { PlacementFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: PlacementFilters;
    setFilter: <K extends keyof PlacementFilters>(
        key: K,
        value: PlacementFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

export default function HeaderFilters({
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    refresh,
    showStats,
    setShowStats,
}: HeaderFiltersProps) {
    const handleReset = useCallback(() => {
        setFilter("status", undefined);
    }, [setFilter]);

    const activeFilterCount = [filters.status].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search placements..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={loading}
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-ghost btn-xs btn-square"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
            </label>

            {/* Stats Toggle */}
            <button
                onClick={() => setShowStats(!showStats)}
                className={`btn btn-sm btn-ghost ${showStats ? "text-primary" : ""}`}
            >
                <i className="fa-duotone fa-regular fa-chart-simple" />
            </button>

            {/* Refresh */}
            <button
                onClick={refresh}
                className="btn btn-sm btn-ghost"
                disabled={loading}
            >
                <i
                    className={`fa-duotone fa-regular fa-arrows-rotate ${loading ? "animate-spin" : ""}`}
                />
            </button>

            {/* Filters Dropdown */}
            <div className="dropdown dropdown-end">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-sm btn-ghost"
                >
                    <i className="fa-duotone fa-regular fa-filter" />
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
                            <option value="hired">Hired</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}
