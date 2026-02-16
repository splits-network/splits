"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ApplicationFilters } from "../../types";
import UniversalSubmitCandidateWizard from "../wizards/universal-submit-candidate-wizard";

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
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    const handleReset = useCallback(() => {
        setFilter("stage", undefined);
        setFilter("ai_score_filter", undefined);
    }, [setFilter]);

    const activeFilterCount = [filters.stage, filters.ai_score_filter].filter(
        Boolean,
    ).length;

    return (
        <div className="flex items-center gap-2 flex-wrap">
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
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="badge badge-primary badge-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-72 z-[50] border border-base-200 space-y-4"
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

                    {/* Scope Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Scope</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.scope || "all"}
                            onChange={(e) =>
                                setFilter(
                                    "scope",
                                    (e.target.value as "all" | "mine") ||
                                        undefined,
                                )
                            }
                        >
                            <option value="all">All Applications</option>
                            <option value="mine">My Applications</option>
                        </select>
                    </fieldset>

                    {/* Stage Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Stage</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.stage || ""}
                            onChange={(e) =>
                                setFilter("stage", e.target.value || undefined)
                            }
                        >
                            <option value="">All Stages</option>
                            <option value="draft">Draft</option>
                            <option value="screen">Screening</option>
                            <option value="submitted">Submitted</option>
                            <option value="company_review">
                                Company Review
                            </option>
                            <option value="recruiter_review">
                                Recruiter Review
                            </option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="hired">Hired</option>
                            <option value="rejected">Rejected</option>
                            <option value="withdrawn">Withdrawn</option>
                        </select>
                    </fieldset>

                    {/* AI Score Filter */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">AI Score</legend>
                        <select
                            className="select select-sm w-full"
                            value={filters.ai_score_filter || ""}
                            onChange={(e) =>
                                setFilter(
                                    "ai_score_filter",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Scores</option>
                            <option value="high">High (80%+)</option>
                            <option value="medium">Medium (50-79%)</option>
                            <option value="low">Low (&lt;50%)</option>
                            <option value="not_reviewed">Not Reviewed</option>
                        </select>
                    </fieldset>
                </div>
            </div>

            {/* Submit Candidate Button */}
            <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowSubmitWizard(true)}
            >
                <i className="fa-duotone fa-regular fa-user-plus" />
                <span className="hidden sm:inline">Submit Candidate</span>
            </button>

            {/* Universal Submit Candidate Wizard */}
            <UniversalSubmitCandidateWizard
                isOpen={showSubmitWizard}
                onClose={() => setShowSubmitWizard(false)}
                onSuccess={() => {
                    setShowSubmitWizard(false);
                    refresh(); // Refresh the applications list
                }}
            />
        </div>
    );
}
