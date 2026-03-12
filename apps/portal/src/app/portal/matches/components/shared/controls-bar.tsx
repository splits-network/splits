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
} from "../../types";

const TIER_OPTIONS = Object.entries(MATCH_TIER_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(MATCH_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const SCORE_OPTIONS = Object.entries(MATCH_SCORE_LABELS).map(([value, label]) => ({ value, label }));

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

    const hasExpandedFilters = filters.min_score !== undefined;

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
                    <BaselFilterSelect
                        value={filters.min_score?.toString()}
                        onChange={(v) => onFilterChange("min_score", v ? Number(v) : undefined)}
                        options={SCORE_OPTIONS}
                        placeholder="Any Score"
                    />
                ) : undefined
            }
        />
    );
}
