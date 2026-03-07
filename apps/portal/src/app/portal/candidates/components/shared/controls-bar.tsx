"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CandidateFilters, CandidateScope } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: CandidateFilters;
    onFilterChange: <K extends keyof CandidateFilters>(
        key: K,
        value: CandidateFilters[K],
    ) => void;
    scope: CandidateScope;
    onScopeChange: (scope: CandidateScope) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    onAddCandidate: () => void;
    candidateCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
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
    loading,
    refresh,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    <div className="join">
                        {(
                            [
                                { value: "mine", label: "My Candidates" },
                                { value: "all", label: "All Candidates" },
                            ] as const
                        ).map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onScopeChange(value)}
                                className={`join-item btn btn-sm rounded-none ${
                                    scope === value ? "btn-active" : ""
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search by name, skill, or title..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.verification_status || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "verification_status",
                                e.target.value || undefined,
                            )
                        }
                        className="select uppercase rounded-none"
                    >
                        <option value="">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="unverified">Unverified</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <select
                        value={filters.desired_job_type || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "desired_job_type",
                                e.target.value || undefined,
                            )
                        }
                        className="select uppercase rounded-none"
                    >
                        <option value="">All Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="contract">Contract</option>
                        <option value="freelance">Freelance</option>
                        <option value="part_time">Part Time</option>
                    </select>

                    <button
                        onClick={onAddCandidate}
                        className="btn btn-primary gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">Add Candidate</span>
                    </button>

                </>
            }
            statusLeft={
                <BaselResultsCount count={candidateCount} total={totalCount} />
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
