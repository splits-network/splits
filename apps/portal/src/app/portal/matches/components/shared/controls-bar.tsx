"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { MatchFilters } from "../../types";

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
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            filters={
                <>
                    <SearchInput
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Search matches, candidates, jobs..."
                        className="flex-1 min-w-[200px] max-w-md"
                    />

                    <select
                        value={filters.match_tier || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "match_tier",
                                (e.target.value || undefined) as MatchFilters["match_tier"],
                            )
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Tiers</option>
                        <option value="standard">Standard</option>
                        <option value="true">True Score</option>
                    </select>

                    <select
                        value={filters.status || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "status",
                                (e.target.value || undefined) as MatchFilters["status"],
                            )
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="dismissed">Dismissed</option>
                        <option value="applied">Applied</option>
                    </select>

                    <select
                        value={filters.min_score ?? ""}
                        onChange={(e) =>
                            onFilterChange(
                                "min_score",
                                e.target.value ? Number(e.target.value) : undefined,
                            )
                        }
                        className="select select-bordered bg-base-200 border-base-300 text-sm uppercase tracking-wider font-bold rounded-none"
                    >
                        <option value="">Any Score</option>
                        <option value="40">40+ Worth Reviewing</option>
                        <option value="55">55+ Promising</option>
                        <option value="70">70+ Strong</option>
                        <option value="85">85+ Excellent</option>
                    </select>

                </>
            }
            statusLeft={
                <BaselResultsCount count={matchCount} total={totalCount} />
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
