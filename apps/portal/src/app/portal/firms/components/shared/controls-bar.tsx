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
import type { FirmFilters } from "../../types";
import {
    FIRM_SORT_OPTIONS,
    TEAM_SIZE_LABELS,
    PLACEMENT_TYPE_LABELS,
    CANDIDATE_FIRM_LABELS,
    COMPANY_FIRM_LABELS,
    MARKETPLACE_VISIBLE_LABELS,
} from "../../types";

const FIRM_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
];
const TEAM_SIZE_OPTIONS = Object.entries(TEAM_SIZE_LABELS).map(([value, label]) => ({ value, label }));
const PLACEMENT_TYPE_OPTIONS = Object.entries(PLACEMENT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const CANDIDATE_FIRM_OPTIONS = Object.entries(CANDIDATE_FIRM_LABELS).map(([value, label]) => ({ value, label }));
const COMPANY_FIRM_OPTIONS = Object.entries(COMPANY_FIRM_LABELS).map(([value, label]) => ({ value, label }));
const MARKETPLACE_OPTIONS = Object.entries(MARKETPLACE_VISIBLE_LABELS).map(([value, label]) => ({ value, label }));

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: FirmFilters;
    onFilterChange: <K extends keyof FirmFilters>(
        key: K,
        value: FirmFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    canCreateFirm: boolean;
    showUpgradeHint?: boolean;
    onAddFirm: () => void;
    firmCount: number;
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
    canCreateFirm,
    showUpgradeHint,
    onAddFirm,
    firmCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    const hasExpandedFilters = !!(filters.team_size_range || filters.is_candidate_firm || filters.is_company_firm || filters.is_marketplace_visible || filters.placement_type);

    return (
        <BaselControlsBarShell
            action={
                canCreateFirm ? (
                    <button
                        onClick={onAddFirm}
                        className="btn btn-primary btn-sm gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">Create Firm</span>
                    </button>
                ) : showUpgradeHint ? (
                    <a
                        href="/portal/profile?tab=subscription"
                        className="btn btn-outline btn-warning btn-sm gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-crown" />
                        <span className="hidden sm:inline">
                            Upgrade to Partner to create a firm
                        </span>
                    </a>
                ) : undefined
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search firms..."
                    className="input-sm"
                />
            }
            filters={
                <BaselFilterSelect
                    value={filters.status}
                    onChange={(v) => onFilterChange("status", v)}
                    options={FIRM_STATUS_OPTIONS}
                    placeholder="All Status"
                />
            }
            statusLeft={
                <BaselResultsCount count={firmCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={FIRM_SORT_OPTIONS}
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
                            value={filters.team_size_range}
                            onChange={(v) => onFilterChange("team_size_range", v)}
                            options={TEAM_SIZE_OPTIONS}
                            placeholder="Team Size"
                        />
                        <BaselFilterSelect
                            value={filters.placement_type}
                            onChange={(v) => onFilterChange("placement_type", v)}
                            options={PLACEMENT_TYPE_OPTIONS}
                            placeholder="Placement Type"
                        />
                        <BaselFilterSelect
                            value={filters.is_candidate_firm}
                            onChange={(v) => onFilterChange("is_candidate_firm", v)}
                            options={CANDIDATE_FIRM_OPTIONS}
                            placeholder="Candidate Firm"
                        />
                        <BaselFilterSelect
                            value={filters.is_company_firm}
                            onChange={(v) => onFilterChange("is_company_firm", v)}
                            options={COMPANY_FIRM_OPTIONS}
                            placeholder="Company Firm"
                        />
                        <BaselFilterSelect
                            value={filters.is_marketplace_visible}
                            onChange={(v) => onFilterChange("is_marketplace_visible", v)}
                            options={MARKETPLACE_OPTIONS}
                            placeholder="Marketplace"
                        />
                    </>
                ) : undefined
            }
        />
    );
}
