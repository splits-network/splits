"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { MatchFilters } from "../../types";
import {
    MATCH_TIER_LABELS,
    MATCH_STATUS_LABELS,
    MATCH_SCORE_LABELS,
    MATCH_SORT_OPTIONS,
    SALARY_OVERLAP_LABELS,
    LOCATION_COMPATIBLE_LABELS,
    EMPLOYMENT_TYPE_MATCH_LABELS,
    JOB_LEVEL_MATCH_LABELS,
    AVAILABILITY_COMPATIBLE_LABELS,
    INVITE_STATUS_LABELS,
} from "../../types";

const TIER_OPTIONS = Object.entries(MATCH_TIER_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const SCORE_OPTIONS = Object.entries(MATCH_SCORE_LABELS).map(([value, label]) => ({ value, label }));
const SALARY_OVERLAP_OPTIONS = Object.entries(SALARY_OVERLAP_LABELS).map(([value, label]) => ({ value, label }));
const LOCATION_OPTIONS = Object.entries(LOCATION_COMPATIBLE_LABELS).map(([value, label]) => ({ value, label }));
const EMPLOYMENT_TYPE_OPTIONS = Object.entries(EMPLOYMENT_TYPE_MATCH_LABELS).map(([value, label]) => ({ value, label }));
const JOB_LEVEL_OPTIONS = Object.entries(JOB_LEVEL_MATCH_LABELS).map(([value, label]) => ({ value, label }));
const AVAILABILITY_OPTIONS = Object.entries(AVAILABILITY_COMPATIBLE_LABELS).map(([value, label]) => ({ value, label }));
const INVITE_STATUS_OPTIONS = Object.entries(INVITE_STATUS_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: MatchFilters;
    onFilterChange: <K extends keyof MatchFilters>(
        key: K,
        value: MatchFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    matchCount: number;
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
    viewMode,
    onViewModeChange,
    matchCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.min_score !== undefined || filters.salary_overlap || filters.location_compatible || filters.employment_type_match || filters.job_level_match || filters.availability_compatible || filters.invite_status);

    return (
        <BaselControlsBarShell
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search matches, candidates, jobs..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.match_tier}
                        onChange={(v) => onFilterChange("match_tier", (v || undefined) as MatchFilters["match_tier"])}
                        options={TIER_OPTIONS}
                        placeholder="All Tiers"
                    />
                    <BaselFilterSelect
                        value={filters.status}
                        onChange={(v) => onFilterChange("status", (v || undefined) as MatchFilters["status"])}
                        options={STATUS_OPTIONS}
                        placeholder="All Statuses"
                    />
                </>
            }
            statusLeft={
                <BaselResultsCount count={matchCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={MATCH_SORT_OPTIONS}
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
                            value={filters.min_score?.toString()}
                            onChange={(v) => onFilterChange("min_score", v ? Number(v) : undefined)}
                            options={SCORE_OPTIONS}
                            placeholder="Any Score"
                        />
                        <BaselFilterSelect
                            value={filters.salary_overlap}
                            onChange={(v) => onFilterChange("salary_overlap", v || undefined)}
                            options={SALARY_OVERLAP_OPTIONS}
                            placeholder="Salary Fit"
                        />
                        <BaselFilterSelect
                            value={filters.location_compatible}
                            onChange={(v) => onFilterChange("location_compatible", v || undefined)}
                            options={LOCATION_OPTIONS}
                            placeholder="Location"
                        />
                        <BaselFilterSelect
                            value={filters.employment_type_match}
                            onChange={(v) => onFilterChange("employment_type_match", v || undefined)}
                            options={EMPLOYMENT_TYPE_OPTIONS}
                            placeholder="Employment Type"
                        />
                        <BaselFilterSelect
                            value={filters.job_level_match}
                            onChange={(v) => onFilterChange("job_level_match", v || undefined)}
                            options={JOB_LEVEL_OPTIONS}
                            placeholder="Job Level"
                        />
                        <BaselFilterSelect
                            value={filters.availability_compatible}
                            onChange={(v) => onFilterChange("availability_compatible", v || undefined)}
                            options={AVAILABILITY_OPTIONS}
                            placeholder="Availability"
                        />
                        <BaselFilterSelect
                            value={filters.invite_status}
                            onChange={(v) => onFilterChange("invite_status", v || undefined)}
                            options={INVITE_STATUS_OPTIONS}
                            placeholder="Invite Status"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
