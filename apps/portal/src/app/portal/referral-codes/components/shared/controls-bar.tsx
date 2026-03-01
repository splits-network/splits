"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselResultsCount,
    BaselRefreshButton,
} from "@splits-network/basel-ui";
import type { ReferralCodeFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: ReferralCodeFilters;
    onFilterChange: <K extends keyof ReferralCodeFilters>(
        key: K,
        value: ReferralCodeFilters[K],
    ) => void;
    onCreateCode: () => void;
    codeCount: number;
    totalCount: number;
    loading: boolean;
    refresh: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    onCreateCode,
    codeCount,
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
                        placeholder="Search by code or label..."
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
                        <option value="inactive">Inactive</option>
                    </select>

                    <button
                        onClick={onCreateCode}
                        className="btn btn-primary gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">New Code</span>
                    </button>

                </>
            }
            statusLeft={
                <BaselResultsCount count={codeCount} total={totalCount} label="codes" />
            }
            statusRight={
                <BaselRefreshButton onClick={refresh} loading={loading} />
            }
        />
    );
}
