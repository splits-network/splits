"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselScopeToggle,
    BaselFilterSelect,
    BaselSortSelect,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { ApplicationFilters } from "../../types";
import {
    APPLICATION_STAGE_LABELS,
    AI_SCORE_LABELS,
    APPLICATION_SORT_OPTIONS,
} from "../../types";

const STAGE_OPTIONS = Object.entries(APPLICATION_STAGE_LABELS).map(([value, label]) => ({ value, label }));
const AI_SCORE_OPTIONS = Object.entries(AI_SCORE_LABELS).map(([value, label]) => ({ value, label }));

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
    applicationCount: number;
    totalCount: number;
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
    loading,
    refresh,
    onSubmitCandidate,
    applicationCount,
    totalCount,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            action={
                <button
                    onClick={onSubmitCandidate}
                    className="btn btn-primary btn-sm gap-2 rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-user-plus" />
                    <span className="hidden sm:inline">Submit Candidate</span>
                </button>
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search by candidate, role, or company..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.stage}
                        onChange={(v) => onFilterChange("stage", v)}
                        options={STAGE_OPTIONS}
                        placeholder="All Stages"
                    />
                    <BaselFilterSelect
                        value={filters.ai_score_filter}
                        onChange={(v) => onFilterChange("ai_score_filter", v)}
                        options={AI_SCORE_OPTIONS}
                        placeholder="All AI Scores"
                    />
                </>
            }
            statusLeft={
                <>
                    <BaselScopeToggle
                        value={filters.scope || "all"}
                        onChange={(v) => onFilterChange("scope", v as "all" | "mine")}
                        options={[
                            { value: "all", label: "All Applications" },
                            { value: "mine", label: "My Applications" },
                        ]}
                    />
                    <BaselResultsCount count={applicationCount} total={totalCount} />
                </>
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={APPLICATION_SORT_OPTIONS}
                    />
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
