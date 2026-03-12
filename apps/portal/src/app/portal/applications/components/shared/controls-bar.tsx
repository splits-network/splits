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
import type { ApplicationFilters } from "../../types";
import {
    APPLICATION_STAGE_LABELS,
    AI_SCORE_LABELS,
    APPLICATION_SOURCE_LABELS,
    AI_REVIEWED_LABELS,
    COMPANY_ACCEPTED_LABELS,
    CANDIDATE_ACCEPTED_LABELS,
    HAS_COVER_LETTER_LABELS,
    HAS_PRE_SCREEN_LABELS,
    APPLICATION_SORT_OPTIONS,
} from "../../types";

const STAGE_OPTIONS = Object.entries(APPLICATION_STAGE_LABELS).map(([value, label]) => ({ value, label }));
const AI_SCORE_OPTIONS = Object.entries(AI_SCORE_LABELS).map(([value, label]) => ({ value, label }));
const SOURCE_OPTIONS = Object.entries(APPLICATION_SOURCE_LABELS).map(([value, label]) => ({ value, label }));
const AI_REVIEWED_OPTIONS = Object.entries(AI_REVIEWED_LABELS).map(([value, label]) => ({ value, label }));
const COMPANY_ACCEPTED_OPTIONS = Object.entries(COMPANY_ACCEPTED_LABELS).map(([value, label]) => ({ value, label }));
const CANDIDATE_ACCEPTED_OPTIONS = Object.entries(CANDIDATE_ACCEPTED_LABELS).map(([value, label]) => ({ value, label }));
const COVER_LETTER_OPTIONS = Object.entries(HAS_COVER_LETTER_LABELS).map(([value, label]) => ({ value, label }));
const PRE_SCREEN_OPTIONS = Object.entries(HAS_PRE_SCREEN_LABELS).map(([value, label]) => ({ value, label }));

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
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.application_source || filters.ai_reviewed || filters.company_accepted || filters.candidate_accepted || filters.has_cover_letter || filters.has_pre_screen);

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
                            value={filters.application_source}
                            onChange={(v) => onFilterChange("application_source", v)}
                            options={SOURCE_OPTIONS}
                            placeholder="All Sources"
                        />
                        <BaselFilterSelect
                            value={filters.ai_reviewed}
                            onChange={(v) => onFilterChange("ai_reviewed", v)}
                            options={AI_REVIEWED_OPTIONS}
                            placeholder="AI Review"
                        />
                        <BaselFilterSelect
                            value={filters.company_accepted}
                            onChange={(v) => onFilterChange("company_accepted", v)}
                            options={COMPANY_ACCEPTED_OPTIONS}
                            placeholder="Company Response"
                        />
                        <BaselFilterSelect
                            value={filters.candidate_accepted}
                            onChange={(v) => onFilterChange("candidate_accepted", v)}
                            options={CANDIDATE_ACCEPTED_OPTIONS}
                            placeholder="Candidate Response"
                        />
                        <BaselFilterSelect
                            value={filters.has_cover_letter}
                            onChange={(v) => onFilterChange("has_cover_letter", v)}
                            options={COVER_LETTER_OPTIONS}
                            placeholder="Cover Letter"
                        />
                        <BaselFilterSelect
                            value={filters.has_pre_screen}
                            onChange={(v) => onFilterChange("has_pre_screen", v)}
                            options={PRE_SCREEN_OPTIONS}
                            placeholder="Pre-Screen"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
