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
import type { InvitationFilters } from "../../types";
import {
    INVITE_STATUS_LABELS,
    INVITE_COMPANY_SORT_OPTIONS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(INVITE_STATUS_LABELS).map(([value, label]) => ({ value, label }));

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
    invitationCount,
    totalCount,
    onCreateInvitation,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    return (
        <BaselControlsBarShell
            action={
                <button
                    onClick={onCreateInvitation}
                    className="btn btn-primary btn-sm gap-2 rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="hidden sm:inline">Invite Company</span>
                </button>
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search invitations, emails, companies..."
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
                <BaselResultsCount count={invitationCount} total={totalCount} />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={INVITE_COMPANY_SORT_OPTIONS}
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
