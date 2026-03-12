"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    BaselFilterSelect,
    BaselSortSelect,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { FirmFilters } from "../../types";
import { FIRM_SORT_OPTIONS } from "../../types";

const FIRM_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
];

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
                </>
            }
        />
    );
}
