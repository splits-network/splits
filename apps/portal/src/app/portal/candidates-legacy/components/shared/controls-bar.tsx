"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { CandidateFilters, CandidateScope } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";

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
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4">
            {/* Search */}
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search candidates, skills, titles..."
                className="flex-1"
            />

            {/* Inline Scope Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Scope:</span>
                <select
                    value={scope}
                    onChange={(e) => onScopeChange(e.target.value as CandidateScope)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="mine">Mine</option>
                    <option value="all">All</option>
                </select>
            </div>

            {/* Inline Verification Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Verification:</span>
                <select
                    value={filters.verification_status || ""}
                    onChange={(e) => onFilterChange("verification_status", e.target.value || undefined)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="">All</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="unverified">Unverified</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            {/* Inline Job Type Filter */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider text-dark/50">Type:</span>
                <select
                    value={filters.desired_job_type || ""}
                    onChange={(e) => onFilterChange("desired_job_type", e.target.value || undefined)}
                    className="select select-sm select-ghost font-bold uppercase"
                >
                    <option value="">All</option>
                    <option value="full_time">Full Time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="part_time">Part Time</option>
                </select>
            </div>

            {/* Add Candidate */}
            <button
                onClick={onAddCandidate}
                className="btn btn-sm btn-primary gap-2"
            >
                <i className="fa-duotone fa-regular fa-plus" />
                <span className="hidden sm:inline">Add Candidate</span>
            </button>

            {/* View Mode Toggle */}
            <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
            />
        </div>
    );
}
