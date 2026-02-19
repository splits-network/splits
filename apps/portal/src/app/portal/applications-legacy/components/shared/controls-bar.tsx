"use client";

import { useState, useCallback } from "react";
import { SearchInput } from "@splits-network/memphis-ui";
import type { ApplicationFilters } from "../../types";
import type { ViewMode } from "./accent";
import { ViewModeToggle } from "./view-mode-toggle";
import UniversalSubmitCandidateWizard from "../wizards/universal-submit-candidate-wizard";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ApplicationFilters;
    onFilterChange: <K extends keyof ApplicationFilters>(key: K, value: ApplicationFilters[K]) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
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
    loading,
    refresh,
}: ControlsBarProps) {
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    const resetFilters = useCallback(() => {
        onFilterChange("stage", undefined);
        onFilterChange("ai_score_filter", undefined);
        onFilterChange("scope", undefined);
    }, [onFilterChange]);

    return (
        <>
            <div className="controls-bar mb-4 flex flex-wrap items-center gap-2">
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search applications, candidates, jobs..."
                    className="flex-1 min-w-64"
                />

                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Scope:</span>
                    <select
                        value={filters.scope || "all"}
                        onChange={(e) => onFilterChange("scope", (e.target.value as "all" | "mine") || undefined)}
                        className="select select-sm select-ghost font-bold uppercase"
                    >
                        <option value="all">All</option>
                        <option value="mine">Mine</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Stage:</span>
                    <select
                        value={filters.stage || ""}
                        onChange={(e) => onFilterChange("stage", e.target.value || undefined)}
                        className="select select-sm select-ghost font-bold uppercase"
                    >
                        <option value="">All</option>
                        <option value="draft">Draft</option>
                        <option value="screen">Screen</option>
                        <option value="submitted">Submitted</option>
                        <option value="company_review">Company Review</option>
                        <option value="recruiter_review">Recruiter Review</option>
                        <option value="interview">Interview</option>
                        <option value="offer">Offer</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">AI:</span>
                    <select
                        value={filters.ai_score_filter || ""}
                        onChange={(e) => onFilterChange("ai_score_filter", e.target.value || undefined)}
                        className="select select-sm select-ghost font-bold uppercase"
                    >
                        <option value="">All</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                        <option value="not_reviewed">Not Reviewed</option>
                    </select>
                </div>

                <button onClick={resetFilters} className="btn btn-sm btn-ghost" disabled={loading}>
                    <i className="fa-duotone fa-regular fa-filter-circle-xmark" />
                    Reset
                </button>

                <button onClick={refresh} className="btn btn-sm btn-ghost" disabled={loading}>
                    <i className={`fa-duotone fa-regular fa-arrows-rotate ${loading ? "animate-spin" : ""}`} />
                </button>

                <button className="btn btn-sm btn-primary" onClick={() => setShowSubmitWizard(true)}>
                    <i className="fa-duotone fa-regular fa-user-plus" />
                    <span className="hidden sm:inline">Submit Candidate</span>
                </button>

                <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>

            <UniversalSubmitCandidateWizard
                isOpen={showSubmitWizard}
                onClose={() => setShowSubmitWizard(false)}
                onSuccess={() => {
                    setShowSubmitWizard(false);
                    refresh();
                }}
            />
        </>
    );
}
