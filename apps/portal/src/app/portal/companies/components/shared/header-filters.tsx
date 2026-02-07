"use client";

import { CompanyTab, CompanyFilters } from "../../types";

interface HeaderFiltersProps {
    activeTab: CompanyTab;
    setActiveTab: (tab: CompanyTab) => void;
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: CompanyFilters;
    setFilter: <K extends keyof CompanyFilters>(
        key: K,
        value: CompanyFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

export default function HeaderFilters({
    activeTab,
    setActiveTab,
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
    const activeFilterCount = [
        filters.industry,
        filters.company_size,
        activeTab === "my-companies" ? filters.status : undefined,
    ].filter(Boolean).length;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search companies..."
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
                        <legend className="fieldset-legend">View</legend>
                        <select
                            className="select w-full select-sm"
                            value={activeTab}
                            onChange={(e) =>
                                setActiveTab(e.target.value as CompanyTab)
                            }
                        >
                            <option value="marketplace">Marketplace</option>
                            <option value="my-companies">My Companies</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset mt-2">
                        <legend className="fieldset-legend">Industry</legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.industry || ""}
                            onChange={(e) =>
                                setFilter(
                                    "industry",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Industries</option>
                            <option value="Technology">Technology</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Finance">Finance</option>
                            <option value="Education">Education</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail">Retail</option>
                            <option value="Consulting">Consulting</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset mt-2">
                        <legend className="fieldset-legend">
                            Company Size
                        </legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.company_size || ""}
                            onChange={(e) =>
                                setFilter(
                                    "company_size",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Sizes</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501+">501+</option>
                        </select>
                    </fieldset>

                    {activeTab === "my-companies" && (
                        <fieldset className="fieldset mt-2">
                            <legend className="fieldset-legend">
                                Relationship Status
                            </legend>
                            <select
                                className="select w-full select-sm"
                                value={filters.status || ""}
                                onChange={(e) =>
                                    setFilter(
                                        "status",
                                        e.target.value || undefined,
                                    )
                                }
                            >
                                <option value="">All</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="declined">Declined</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        </fieldset>
                    )}
                </div>
            </div>
        </div>
    );
}
