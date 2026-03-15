"use client";

import { useState } from "react";
import { SearchInput } from "@/components/standard-lists";
import {
    BaselControlsBarShell,
    BaselResultsCount,
    BaselRefreshButton,
    BaselFilterSelect,
    BaselSortSelect,
    BaselExpandToggle,
} from "@splits-network/basel-ui";
import type { ReferralCodeFilters } from "../../types";
import {
    CODE_STATUS_LABELS,
    REFERRAL_CODE_SORT_OPTIONS,
    IS_DEFAULT_LABELS,
    EXPIRY_STATUS_LABELS,
    HAS_USAGE_LIMIT_LABELS,
} from "../../types";

const STATUS_OPTIONS = Object.entries(CODE_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const IS_DEFAULT_OPTIONS = Object.entries(IS_DEFAULT_LABELS).map(([value, label]) => ({ value, label }));
const EXPIRY_STATUS_OPTIONS = Object.entries(EXPIRY_STATUS_LABELS).map(([value, label]) => ({ value, label }));
const HAS_USAGE_LIMIT_OPTIONS = Object.entries(HAS_USAGE_LIMIT_LABELS).map(([value, label]) => ({ value, label }));

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
    sortBy: string;
    sortOrder: "asc" | "desc";
    onSortChange: (field: string, order: "asc" | "desc") => void;
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
    sortBy,
    sortOrder,
    onSortChange,
}: ControlsBarProps) {
    const [expanded, setExpanded] = useState(false);

    return (
        <BaselControlsBarShell
            action={
                <button
                    onClick={onCreateCode}
                    className="btn btn-primary btn-sm gap-2 rounded-none"
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    <span className="hidden sm:inline">New Code</span>
                </button>
            }
            search={
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search by code or label..."
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
                            value={filters.is_default}
                            onChange={(v) => onFilterChange("is_default", v)}
                            options={IS_DEFAULT_OPTIONS}
                            placeholder="Default Status"
                        />
                        <BaselFilterSelect
                            value={filters.expiry_status}
                            onChange={(v) => onFilterChange("expiry_status", v)}
                            options={EXPIRY_STATUS_OPTIONS}
                            placeholder="Expiry Status"
                        />
                        <BaselFilterSelect
                            value={filters.has_usage_limit}
                            onChange={(v) => onFilterChange("has_usage_limit", v)}
                            options={HAS_USAGE_LIMIT_OPTIONS}
                            placeholder="Usage Limit"
                        />
                    </>
                ) : null
            }
            statusLeft={
                <BaselResultsCount count={codeCount} total={totalCount} label="codes" />
            }
            statusRight={
                <>
                    <BaselSortSelect
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSortChange={onSortChange}
                        options={REFERRAL_CODE_SORT_OPTIONS}
                    />
                    <BaselRefreshButton onClick={refresh} loading={loading} />
                </>
            }
        />
    );
}
