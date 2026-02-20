"use client";

import { EMPLOYMENT_TYPES } from "../../types";
import type { JobFilters } from "../../types";
import type { ViewMode } from "./status-color";

const VIEW_ICONS: Record<ViewMode, string> = {
    table: "fa-table-columns",
    grid: "fa-grid-2",
    split: "fa-columns-3",
};

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: JobFilters;
    onFilterChange: (key: keyof JobFilters, value: string | undefined) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    resultCount: number;
    totalCount: number;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    resultCount,
    totalCount,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Left: Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm" />
                            <input
                                type="text"
                                placeholder="Search jobs, companies, locations..."
                                value={searchInput}
                                onChange={(e) =>
                                    onSearchChange(e.target.value)
                                }
                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                            {searchInput && (
                                <button
                                    onClick={() => onSearchChange("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content text-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                </button>
                            )}
                        </div>

                        {/* Employment type filter */}
                        <select
                            value={filters.employment_type || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "employment_type",
                                    e.target.value || undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Types</option>
                            {EMPLOYMENT_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Right: Results count + View toggle */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {resultCount} of {totalCount} results
                        </span>

                        {/* View mode toggle */}
                        <div className="flex bg-base-200 p-1">
                            {(["table", "grid", "split"] as ViewMode[]).map(
                                (mode) => (
                                    <button
                                        key={mode}
                                        onClick={() =>
                                            onViewModeChange(mode)
                                        }
                                        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                            viewMode === mode
                                                ? "bg-primary text-primary-content"
                                                : "text-base-content/50 hover:text-base-content"
                                        }`}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${VIEW_ICONS[mode]} mr-1`}
                                        />
                                        <span className="hidden sm:inline">
                                            {mode.charAt(0).toUpperCase() +
                                                mode.slice(1)}
                                        </span>
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
