"use client";

import type { ViewMode } from "./status-color";
import type { CompanyTab, CompanyFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    activeTab: CompanyTab;
    onTabChange: (tab: CompanyTab) => void;
    filters: CompanyFilters;
    onFilterChange: <K extends keyof CompanyFilters>(
        key: K,
        value: CompanyFilters[K],
    ) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    isMyCompanies: boolean;
    companyCount: number;
    totalCount: number;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    activeTab,
    onTabChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    isMyCompanies,
    companyCount,
    totalCount,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                        </div>

                        {/* Tab Toggle */}
                        <div className="flex bg-base-200 p-1">
                            <button
                                onClick={() => onTabChange("marketplace")}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    activeTab === "marketplace"
                                        ? "bg-primary text-primary-content"
                                        : "text-base-content/50 hover:text-base-content"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-store mr-1" />
                                Marketplace
                            </button>
                            <button
                                onClick={() => onTabChange("my-companies")}
                                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                    activeTab === "my-companies"
                                        ? "bg-primary text-primary-content"
                                        : "text-base-content/50 hover:text-base-content"
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-handshake mr-1" />
                                My Companies
                            </button>
                        </div>

                        {/* Industry Filter */}
                        <select
                            value={filters.industry || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "industry",
                                    e.target.value || undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
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

                        {/* Status filter (my-companies only) */}
                        {isMyCompanies && (
                            <select
                                value={filters.status || ""}
                                onChange={(e) =>
                                    onFilterChange(
                                        "status",
                                        e.target.value || undefined,
                                    )
                                }
                                className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                                style={{ borderRadius: 0 }}
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="declined">Declined</option>
                                <option value="terminated">Terminated</option>
                            </select>
                        )}
                    </div>

                    {/* View Toggle + Results */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {companyCount} of {totalCount} results
                        </span>
                        <div className="flex bg-base-200 p-1">
                            {(
                                [
                                    {
                                        mode: "table" as ViewMode,
                                        icon: "fa-table-list",
                                        label: "Table",
                                    },
                                    {
                                        mode: "grid" as ViewMode,
                                        icon: "fa-grid-2",
                                        label: "Grid",
                                    },
                                    {
                                        mode: "split" as ViewMode,
                                        icon: "fa-columns-3",
                                        label: "Split",
                                    },
                                ] as const
                            ).map(({ mode, icon, label }) => (
                                <button
                                    key={mode}
                                    onClick={() => onViewModeChange(mode)}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === mode
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${icon} mr-1`}
                                    />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
