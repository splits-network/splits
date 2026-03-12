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
import type { InvitationFilters } from "../../types";
import {
    INVITATION_STATUS_LABELS,
    INVITATION_SORT_OPTIONS,
    CONSENT_STATUS_LABELS,
    INVITATION_EXPIRY_LABELS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(INVITATION_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const CONSENT_OPTIONS = Object.entries(CONSENT_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const EXPIRY_OPTIONS = Object.entries(INVITATION_EXPIRY_LABELS).map(([value, label]) => ({ value, label }));

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
    onInviteCandidate: () => void;
    invitationCount: number;
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
    onInviteCandidate,
    invitationCount,
    totalCount,
    loading,
    refresh,
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <BaselControlsBarShell
            action={
                <button
                    onClick={onInviteCandidate}
                    className="btn btn-primary btn-sm gap-2 rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="hidden sm:inline">Invite Candidate</span>
                </button>
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search invitations..."
                    className="input-sm"
                />
            }
            filters={
                <>
                    <BaselFilterSelect
                        value={filters.status}
                        onChange={(v) => onFilterChange("status", v)}
                        options={STATUS_OPTIONS}
                        placeholder="All Status"
                    />
                    <BaselExpandToggle expanded={expanded} onToggle={() => setExpanded(!expanded)} />
                </>
            }
            expandedFilters={
                expanded ? (
                    <>
                        <BaselFilterSelect
                            value={filters.consent_status}
                            onChange={(v) => onFilterChange("consent_status", v)}
                            options={CONSENT_OPTIONS}
                            placeholder="Consent Status"
                        />
                        <BaselFilterSelect
                            value={filters.expiry_status}
                            onChange={(v) => onFilterChange("expiry_status", v)}
                            options={EXPIRY_OPTIONS}
                            placeholder="Expiry Status"
                        />
                    </>
                ) : null
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
                        options={INVITATION_SORT_OPTIONS}
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
