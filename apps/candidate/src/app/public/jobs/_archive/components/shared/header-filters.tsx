"use client";

import { EMPLOYMENT_TYPES, type JobFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: JobFilters;
    setFilter: <K extends keyof JobFilters>(
        key: K,
        value: JobFilters[K],
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
    const activeFilterCount = [filters.employment_type].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search jobs..."
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
                        <legend className="fieldset-legend">
                            Employment Type
                        </legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.employment_type || ""}
                            onChange={(e) =>
                                setFilter(
                                    "employment_type",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Types</option>
                            {EMPLOYMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </fieldset>
                </div>
            </div>

            {/* RSS Feed Link */}
            <a
                href="/public/jobs/rss.xml"
                className="btn btn-sm btn-ghost"
                title="RSS Feed"
                target="_blank"
                rel="noopener noreferrer"
            >
                <i className="fa-duotone fa-regular fa-rss" />
            </a>
        </div>
    );
}

