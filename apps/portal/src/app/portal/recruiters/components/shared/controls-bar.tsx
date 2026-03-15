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
import type { MarketplaceFilters } from "../../types";
import {
    RECRUITER_STATUS_LABELS,
    RECRUITER_SORT_OPTIONS,
    CANDIDATE_RECRUITER_LABELS,
    COMPANY_RECRUITER_LABELS,
    MARKETPLACE_ENABLED_LABELS,
    REPUTATION_TIER_LABELS,
    HIRE_RATE_TIER_LABELS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(RECRUITER_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const CANDIDATE_RECRUITER_OPTIONS = Object.entries(CANDIDATE_RECRUITER_LABELS).map(([value, label]) => ({ value, label }));
const COMPANY_RECRUITER_OPTIONS = Object.entries(COMPANY_RECRUITER_LABELS).map(([value, label]) => ({ value, label }));
const MARKETPLACE_OPTIONS = Object.entries(MARKETPLACE_ENABLED_LABELS).map(([value, label]) => ({ value, label }));
const REPUTATION_OPTIONS = Object.entries(REPUTATION_TIER_LABELS).map(([value, label]) => ({ value, label }));
const HIRE_RATE_OPTIONS = Object.entries(HIRE_RATE_TIER_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: MarketplaceFilters;
    onFilterChange: <K extends keyof MarketplaceFilters>(
        key: K,
        value: MarketplaceFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    canInvite: boolean;
    companyIds: string[];
    onInvite: () => void;
    recruiterCount: number;
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
    canInvite,
    companyIds,
    onInvite,
    recruiterCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);
    const showingMyRecruiters = !!filters.company_ids?.length;

    const hasExpandedFilters = !!(filters.is_candidate_recruiter || filters.is_company_recruiter || filters.is_marketplace_enabled || filters.reputation_tier || filters.hire_rate_tier);

    return (
        <BaselControlsBarShell
            action={
                canInvite ? (
                    <button
                        onClick={onInvite}
                        className="btn btn-primary btn-sm gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane" />
                        <span className="hidden sm:inline">Invite Recruiter</span>
                    </button>
                ) : undefined
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search recruiters, specialties, industries..."
                    className="input-sm"
                />
            }
            filters={
                <BaselFilterSelect
                    value={filters.status}
                    onChange={(v) => onFilterChange("status", v)}
                    options={STATUS_OPTIONS}
                    placeholder="All Status"
                />
            }
            statusLeft={
                <>
                    {canInvite && (
                        <BaselScopeToggle
                            value={showingMyRecruiters ? "mine" : "all"}
                            onChange={(v) => onFilterChange("company_ids", v === "mine" ? companyIds : undefined)}
                            options={[
                                { value: "mine", label: "Mine" },
                                { value: "all", label: "All" },
                            ]}
                        />
                    )}
                    <BaselResultsCount count={recruiterCount} total={totalCount} />
                </>
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={RECRUITER_SORT_OPTIONS}
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
                            value={filters.is_candidate_recruiter}
                            onChange={(v) => onFilterChange("is_candidate_recruiter", v)}
                            options={CANDIDATE_RECRUITER_OPTIONS}
                            placeholder="Candidate Type"
                        />
                        <BaselFilterSelect
                            value={filters.is_company_recruiter}
                            onChange={(v) => onFilterChange("is_company_recruiter", v)}
                            options={COMPANY_RECRUITER_OPTIONS}
                            placeholder="Company Type"
                        />
                        <BaselFilterSelect
                            value={filters.is_marketplace_enabled}
                            onChange={(v) => onFilterChange("is_marketplace_enabled", v)}
                            options={MARKETPLACE_OPTIONS}
                            placeholder="Marketplace"
                        />
                        <BaselFilterSelect
                            value={filters.reputation_tier}
                            onChange={(v) => onFilterChange("reputation_tier", v)}
                            options={REPUTATION_OPTIONS}
                            placeholder="Reputation"
                        />
                        <BaselFilterSelect
                            value={filters.hire_rate_tier}
                            onChange={(v) => onFilterChange("hire_rate_tier", v)}
                            options={HIRE_RATE_OPTIONS}
                            placeholder="Hire Rate"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
