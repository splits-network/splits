"use client";

import { SearchInput } from "@/components/standard-lists/search-input";
import type { ViewMode } from "./status-color";
import type { TeamFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: TeamFilters;
    onFilterChange: <K extends keyof TeamFilters>(
        key: K,
        value: TeamFilters[K],
    ) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    canCreateTeam: boolean;
    onAddTeam: () => void;
    teamCount: number;
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
    canCreateTeam,
    onAddTeam,
    teamCount,
    totalCount,
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <section className="controls-bar sticky top-0 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <SearchInput
                            value={searchInput}
                            onChange={onSearchChange}
                            placeholder="Search teams..."
                            className="flex-1 min-w-[200px] max-w-md"
                        />

                        {/* Status filter */}
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
                            <option value="suspended">Suspended</option>
                        </select>

                        {/* Create Team */}
                        {canCreateTeam && (
                            <button
                                onClick={onAddTeam}
                                className="btn btn-sm btn-primary gap-2"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-plus" />
                                <span className="hidden sm:inline">
                                    Create Team
                                </span>
                            </button>
                        )}

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
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {teamCount} of {totalCount} results
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
