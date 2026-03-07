"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { FirmFilters } from "../../types";

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
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search firms..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.status || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "status",
                                e.target.value || undefined,
                            )
                        }
                        className="select uppercase rounded-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    {canCreateFirm && (
                        <button
                            onClick={onAddFirm}
                            className="btn btn-primary gap-2 rounded-none"
                        >
                            <i className="fa-duotone fa-regular fa-plus" />
                            <span className="hidden sm:inline">Create Firm</span>
                        </button>
                    )}
                    {showUpgradeHint && (
                        <a
                            href="/portal/profile?tab=subscription"
                            className="btn btn-outline btn-warning gap-2 rounded-none"
                        >
                            <i className="fa-duotone fa-regular fa-crown" />
                            <span className="hidden sm:inline">
                                Upgrade to Partner to create a firm
                            </span>
                        </a>
                    )}

                </>
            }
            statusLeft={
                <BaselResultsCount count={firmCount} total={totalCount} />
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
