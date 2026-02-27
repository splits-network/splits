"use client";

import { SearchInput } from "@/components/standard-lists";
import type { ViewMode, MatchFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: MatchFilters;
    onFilterChange: <K extends keyof MatchFilters>(
        key: K,
        value: MatchFilters[K],
    ) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    matchCount: number;
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
    matchCount,
    totalCount,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 bg-base-100 border-b-2 border-base-300 opacity-0 z-20">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <SearchInput
                            value={searchInput}
                            onChange={onSearchChange}
                            placeholder="Search matches, candidates, jobs..."
                            className="flex-1 min-w-[200px] max-w-md"
                        />

                        {/* Tier filter */}
                        <select
                            value={filters.match_tier || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "match_tier",
                                    (e.target.value || undefined) as MatchFilters["match_tier"],
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Tiers</option>
                            <option value="standard">Standard</option>
                            <option value="true">True Score</option>
                        </select>

                        {/* Status filter */}
                        <select
                            value={filters.status || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "status",
                                    (e.target.value || undefined) as MatchFilters["status"],
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="dismissed">Dismissed</option>
                            <option value="applied">Applied</option>
                        </select>

                        {/* Min score filter */}
                        <select
                            value={filters.min_score ?? ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "min_score",
                                    e.target.value ? Number(e.target.value) : undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">Any Score</option>
                            <option value="40">40+ Worth Reviewing</option>
                            <option value="55">55+ Promising</option>
                            <option value="70">70+ Strong</option>
                            <option value="85">85+ Excellent</option>
                        </select>

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
                    </div>

                    {/* View Toggle + Results */}
                    <div className="flex items-center gap-4">
                        <span className="text-sm uppercase tracking-wider text-base-content/40 font-bold">
                            {matchCount} of {totalCount} results
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
                                    className={`px-3 py-1.5 text-sm font-bold uppercase tracking-wider transition-colors ${
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
