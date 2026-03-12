"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselScopeToggle,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { CandidateFilters, CandidateScope } from "../../types";
import {
    VERIFICATION_STATUS_LABELS,
    JOB_TYPE_LABELS,
    REMOTE_LABELS,
    RELOCATION_LABELS,
    AVAILABILITY_LABELS,
    ACCOUNT_STATUS_LABELS,
    RESUME_STATUS_LABELS,
    ACTIVITY_STATUS_LABELS,
    CANDIDATE_SORT_OPTIONS,
} from "../../types";

const VERIFICATION_OPTIONS = Object.entries(VERIFICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const JOB_TYPE_OPTIONS = Object.entries(JOB_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const REMOTE_OPTIONS = Object.entries(REMOTE_LABELS).map(([value, label]) => ({ value, label }));
const RELOCATION_OPTIONS = Object.entries(RELOCATION_LABELS).map(([value, label]) => ({ value, label }));
const AVAILABILITY_OPTIONS = Object.entries(AVAILABILITY_LABELS).map(([value, label]) => ({ value, label }));
const ACCOUNT_OPTIONS = Object.entries(ACCOUNT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const RESUME_OPTIONS = Object.entries(RESUME_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const ACTIVITY_OPTIONS = Object.entries(ACTIVITY_STATUS_LABELS).map(([value, label]) => ({ value, label }));

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
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (field: string, order: "asc" | "desc") => void;
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
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.open_to_remote || filters.open_to_relocation || filters.availability || filters.has_account || filters.has_resume || filters.activity);

    return (
        <BaselControlsBarShell
            action={
                <button
                    onClick={onAddCandidate}
                    className="btn btn-primary btn-sm gap-2 rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="hidden sm:inline">Add Candidate</span>
                </button>
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search by name, skill, or title..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.verification_status}
                        onChange={(v) => onFilterChange("verification_status", v)}
                        options={VERIFICATION_OPTIONS}
                        placeholder="All Status"
                    />
                    <BaselFilterSelect
                        value={filters.desired_job_type}
                        onChange={(v) => onFilterChange("desired_job_type", v)}
                        options={JOB_TYPE_OPTIONS}
                        placeholder="All Types"
                    />
                </>
            }
            statusLeft={
                <>
                    <BaselScopeToggle
                        value={scope}
                        onChange={(v) => onScopeChange(v as CandidateScope)}
                        options={[
                            { value: "mine", label: "My Candidates" },
                            { value: "all", label: "All Candidates" },
                        ]}
                    />
                    <BaselResultsCount count={candidateCount} total={totalCount} />
                </>
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={CANDIDATE_SORT_OPTIONS}
                    />
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                    <BaselViewModeSelector
                        viewMode={viewMode}
                        onViewModeChange={onViewModeChange}
                    />
                    <BaselExpandToggle
                        expanded={expanded || hasExpandedFilters}
                        onToggle={() => setExpanded((prev) => !prev)}
                    />
                </>
            }
            expandedFilters={
                (expanded || hasExpandedFilters) ? (
                    <>
                        <BaselFilterSelect
                            value={filters.availability}
                            onChange={(v) => onFilterChange("availability", v)}
                            options={AVAILABILITY_OPTIONS}
                            placeholder="All Availability"
                        />
                        <BaselFilterSelect
                            value={filters.open_to_remote}
                            onChange={(v) => onFilterChange("open_to_remote", v)}
                            options={REMOTE_OPTIONS}
                            placeholder="Remote Preference"
                        />
                        <BaselFilterSelect
                            value={filters.open_to_relocation}
                            onChange={(v) => onFilterChange("open_to_relocation", v)}
                            options={RELOCATION_OPTIONS}
                            placeholder="Relocation"
                        />
                        <BaselFilterSelect
                            value={filters.has_account}
                            onChange={(v) => onFilterChange("has_account", v)}
                            options={ACCOUNT_OPTIONS}
                            placeholder="Account Status"
                        />
                        <BaselFilterSelect
                            value={filters.has_resume}
                            onChange={(v) => onFilterChange("has_resume", v)}
                            options={RESUME_OPTIONS}
                            placeholder="Resume Status"
                        />
                        <BaselFilterSelect
                            value={filters.activity}
                            onChange={(v) => onFilterChange("activity", v)}
                            options={ACTIVITY_OPTIONS}
                            placeholder="Activity"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
