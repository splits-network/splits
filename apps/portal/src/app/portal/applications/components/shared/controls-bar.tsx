"use client";

import { useCallback } from "react";
import type { ApplicationFilters, ViewMode } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ApplicationFilters;
    onFilterChange: <K extends keyof ApplicationFilters>(
        key: K,
        value: ApplicationFilters[K],
    ) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    loading: boolean;
    refresh: () => void;
    onSubmitCandidate: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    loading,
    refresh,
    onSubmitCandidate,
}: ControlsBarProps) {
    const resetFilters = useCallback(() => {
        onFilterChange("stage", undefined);
        onFilterChange("ai_score_filter", undefined);
        onFilterChange("scope", undefined);
    }, [onFilterChange]);

    return (
        <section className="controls-bar sticky top-0 z-30 bg-base-100 border-b-2 border-base-300 opacity-0">
            <div className="container mx-auto px-6 lg:px-12 py-4">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Search + Filters */}
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px] max-w-md">
                            <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/30 text-sm"></i>
                            <input
                                type="text"
                                placeholder="Search by candidate, role, or company..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                            />
                        </div>

                        {/* Scope filter */}
                        <select
                            value={filters.scope || "all"}
                            onChange={(e) =>
                                onFilterChange(
                                    "scope",
                                    (e.target.value as "all" | "mine") ||
                                        undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                        >
                            <option value="all">All Applications</option>
                            <option value="mine">My Applications</option>
                        </select>

                        {/* Stage filter */}
                        <select
                            value={filters.stage || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "stage",
                                    e.target.value || undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                        >
                            <option value="">All Stages</option>
                            <option value="draft">Draft</option>
                            <option value="screen">Screening</option>
                            <option value="submitted">Submitted</option>
                            <option value="company_review">Company Review</option>
                            <option value="recruiter_review">Recruiter Review</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* AI Score filter */}
                        <select
                            value={filters.ai_score_filter || ""}
                            onChange={(e) =>
                                onFilterChange(
                                    "ai_score_filter",
                                    e.target.value || undefined,
                                )
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                        >
                            <option value="">All AI Scores</option>
                            <option value="high">High Match</option>
                            <option value="medium">Medium Match</option>
                            <option value="low">Low Match</option>
                            <option value="not_reviewed">Not Scored</option>
                        </select>

                        {/* Reset */}
                        <button
                            onClick={resetFilters}
                            className="btn btn-sm btn-ghost"
                            disabled={loading}
                        >
                            <i className="fa-duotone fa-regular fa-filter-circle-xmark" />
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

                        {/* Submit Candidate */}
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={onSubmitCandidate}
                        >
                            <i className="fa-duotone fa-regular fa-user-plus" />
                            <span className="hidden sm:inline">
                                Submit Candidate
                            </span>
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-4">
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
                            ).map((v) => (
                                <button
                                    key={v.mode}
                                    onClick={() => onViewModeChange(v.mode)}
                                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                                        viewMode === v.mode
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/50 hover:text-base-content"
                                    }`}
                                >
                                    <i
                                        className={`fa-duotone fa-regular ${v.icon} mr-1`}
                                    />
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
