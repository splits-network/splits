"use client";

import type { ViewMode } from "./status-color";
import type { CandidateFilters, CandidateScope } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: CandidateFilters;
    onFilterChange: <K extends keyof CandidateFilters>(key: K, value: CandidateFilters[K]) => void;
    scope: CandidateScope;
    onScopeChange: (scope: CandidateScope) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onAddCandidate: () => void;
    candidateCount: number;
    totalCount: number;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    scope,
    onScopeChange,
    viewMode,
    onViewModeChange,
    onAddCandidate,
    candidateCount,
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
                                placeholder="Search by name, skill, or title..."
                                value={searchInput}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="input input-bordered w-full pl-9 bg-base-200 border-base-300 text-sm font-medium focus:border-primary focus:outline-none"
                                style={{ borderRadius: 0 }}
                            />
                        </div>

                        {/* Scope filter */}
                        <select
                            value={scope}
                            onChange={(e) => onScopeChange(e.target.value as CandidateScope)}
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="mine">My Candidates</option>
                            <option value="all">All Candidates</option>
                        </select>

                        {/* Verification filter */}
                        <select
                            value={filters.verification_status || ""}
                            onChange={(e) =>
                                onFilterChange("verification_status", e.target.value || undefined)
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Status</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="unverified">Unverified</option>
                            <option value="rejected">Rejected</option>
                        </select>

                        {/* Job Type filter */}
                        <select
                            value={filters.desired_job_type || ""}
                            onChange={(e) =>
                                onFilterChange("desired_job_type", e.target.value || undefined)
                            }
                            className="select select-bordered select-sm bg-base-200 border-base-300 text-xs uppercase tracking-wider font-bold"
                            style={{ borderRadius: 0 }}
                        >
                            <option value="">All Types</option>
                            <option value="full_time">Full Time</option>
                            <option value="contract">Contract</option>
                            <option value="freelance">Freelance</option>
                            <option value="part_time">Part Time</option>
                        </select>

                        {/* Add Candidate */}
                        <button
                            onClick={onAddCandidate}
                            className="btn btn-sm btn-primary gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            <span className="hidden sm:inline">Add Candidate</span>
                        </button>
                    </div>

                    {/* View Toggle + Results */}
                    <div className="flex items-center gap-4">
                        <span className="text-xs uppercase tracking-wider text-base-content/40 font-bold">
                            {candidateCount} of {totalCount} results
                        </span>
                        <div className="flex bg-base-200 p-1">
                            {(
                                [
                                    { mode: "table" as ViewMode, icon: "fa-table-list", label: "Table" },
                                    { mode: "grid" as ViewMode, icon: "fa-grid-2", label: "Grid" },
                                    { mode: "split" as ViewMode, icon: "fa-columns-3", label: "Split" },
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
                                    <i className={`fa-duotone fa-regular ${icon} mr-1`} />
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
