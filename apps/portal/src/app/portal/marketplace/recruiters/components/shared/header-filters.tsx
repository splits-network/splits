"use client";

import { useCallback } from "react";
import { MarketplaceFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: MarketplaceFilters;
    setFilter: <K extends keyof MarketplaceFilters>(
        key: K,
        value: MarketplaceFilters[K],
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
        setFilter("status", "active");
    }, [setFilter]);

    const hasActiveFilters = filters.status && filters.status !== "active";

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search recruiters..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={loading}
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-ghost btn-xs btn-circle"
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
                <i className="fa-duotone fa-regular fa-chart-line" />
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
                    {hasActiveFilters && (
                        <span className="badge badge-primary badge-xs">1</span>
                    )}
                </div>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-64 z-[50] border border-base-200 space-y-4"
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

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Status</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilter(
                                    "status",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="active">Active</option>
                            <option value="">All Statuses</option>
                        </select>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}
