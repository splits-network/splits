"use client";

import { APPLICATION_STAGES, type ApplicationFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: ApplicationFilters;
    setFilter: <K extends keyof ApplicationFilters>(
        key: K,
        value: ApplicationFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => Promise<void>;
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
    const activeFilterCount = [filters.stage].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search applications..."
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
                title="Toggle stats"
            >
                <i className="fa-duotone fa-regular fa-chart-line" />
            </button>

            {/* Refresh */}
            <button
                onClick={() => refresh()}
                className="btn btn-sm btn-ghost"
                disabled={loading}
                title="Refresh"
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
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="badge badge-primary badge-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-64 z-50"
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Stage</legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.stage || ""}
                            onChange={(e) =>
                                setFilter("stage", e.target.value || undefined)
                            }
                        >
                            <option value="">All Stages</option>
                            {APPLICATION_STAGES.map((stage) => (
                                <option key={stage.value} value={stage.value}>
                                    {stage.label}
                                </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
            </div>
        </div>
    );
}
