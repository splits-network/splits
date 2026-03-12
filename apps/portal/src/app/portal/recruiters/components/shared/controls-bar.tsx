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
import type { MarketplaceFilters } from "../../types";
import { RECRUITER_STATUS_LABELS, RECRUITER_SORT_OPTIONS } from "../../types";

const STATUS_OPTIONS = Object.entries(RECRUITER_STATUS_LABELS).map(([value, label]) => ({ value, label }));

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
    const showingMyRecruiters = !!filters.company_ids?.length;

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
                            value={showingMyRecruiters ? "my" : "all"}
                            onChange={(v) => onFilterChange("company_ids", v === "my" ? companyIds : undefined)}
                            options={[
                                { value: "all", label: "All Recruiters" },
                                { value: "my", label: "My Recruiters" },
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
                </>
            }
        />
    );
}
