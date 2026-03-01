"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { MarketplaceFilters } from "../../types";

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
    onInvite: () => void;
    recruiterCount: number;
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
    canInvite,
    onInvite,
    recruiterCount,
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
                        placeholder="Search recruiters, specialties, industries..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.status || ""}
                        onChange={(e) =>
                            onFilterChange("status", e.target.value || undefined)
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    {canInvite && (
                        <button
                            onClick={onInvite}
                            className="btn btn-primary gap-2 rounded-none"
                        >
                            <i className="fa-duotone fa-regular fa-paper-plane" />
                            <span className="hidden sm:inline">Invite Recruiter</span>
                        </button>
                    )}

                </>
            }
            statusLeft={
                <BaselResultsCount count={recruiterCount} total={totalCount} />
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
