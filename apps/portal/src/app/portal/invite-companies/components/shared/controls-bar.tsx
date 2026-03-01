"use client";

import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselViewModeSelector,
    BaselResultsCount,
    BaselRefreshButton,
    type BaselViewMode,
} from "@splits-network/basel-ui";
import type { InvitationFilters } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: InvitationFilters;
    onFilterChange: <K extends keyof InvitationFilters>(
        key: K,
        value: InvitationFilters[K],
    ) => void;
    viewMode: BaselViewMode;
    onViewModeChange: (mode: BaselViewMode) => void;
    invitationCount: number;
    totalCount: number;
    onCreateInvitation: () => void;
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
    invitationCount,
    totalCount,
    onCreateInvitation,
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
                        placeholder="Search invitations, emails, companies..."
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
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="expired">Expired</option>
                        <option value="revoked">Revoked</option>
                    </select>

                    <button
                        onClick={onCreateInvitation}
                        className="btn btn-primary gap-2 rounded-none"
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        <span className="hidden sm:inline">Invite Company</span>
                    </button>

                </>
            }
            statusLeft={
                <BaselResultsCount count={invitationCount} total={totalCount} />
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
