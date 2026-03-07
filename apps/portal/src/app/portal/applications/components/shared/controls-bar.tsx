"use client";

import { useCallback } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { ApplicationFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ApplicationFilters;
    onFilterChange: <K extends keyof ApplicationFilters>(
        key: K,
        value: ApplicationFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
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
        <BaselControlsBarShell
            filters={
                <>
                    <div className="join">
                        {(
                            [
                                { value: "all", label: "All Applications" },
                                { value: "mine", label: "My Applications" },
                            ] as const
                        ).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onFilterChange("scope", value)}
                                className={`join-item btn btn-sm rounded-none ${
                                    (filters.scope || "all") === value
                                        ? "btn-active"
                                        : ""
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search by candidate, role, or company..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.stage || ""}
                        onChange={(e) =>
                            onFilterChange("stage", e.target.value || undefined)
                        }
                        className="select uppercase rounded-none"
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

                    <select
                        value={filters.ai_score_filter || ""}
                        onChange={(e) =>
                            onFilterChange("ai_score_filter", e.target.value || undefined)
                        }
                        className="select uppercase rounded-none"
                    >
                        <option value="">All AI Scores</option>
                        <option value="high">High Match</option>
                        <option value="medium">Medium Match</option>
                        <option value="low">Low Match</option>
                        <option value="not_reviewed">Not Scored</option>
                    </select>

                    <button
                        onClick={resetFilters}
                        className="btn btn-ghost rounded-none"
                        disabled={loading}
                    >
                        <i className="fa-duotone fa-regular fa-filter-circle-xmark" />
                    </button>

                    <button
                        className="btn btn-primary rounded-none"
                        onClick={onSubmitCandidate}
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        <span className="hidden sm:inline">Submit Candidate</span>
                    </button>
                </>
            }
            statusRight={
                <>
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                </>
            }
        />
    );
}
