"use client";

import { SearchInput } from "@splits-network/memphis-ui";
import type { ConversationFilters, Mailbox } from "../../types";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    onClearSearch: () => void;
    filters: ConversationFilters;
    onFilterChange: <K extends keyof ConversationFilters>(
        key: K,
        value: ConversationFilters[K],
    ) => void;
    loading: boolean;
    onRefresh: () => void;
    showStats: boolean;
    onToggleStats: (show: boolean) => void;
    requestCount: number;
}

const mailboxOptions: { value: Mailbox; label: string; icon: string }[] = [
    { value: "inbox", label: "Inbox", icon: "fa-inbox" },
    { value: "requests", label: "Requests", icon: "fa-envelope" },
    { value: "archived", label: "Archived", icon: "fa-box-archive" },
];

export function ControlsBar({
    searchInput,
    onSearchChange,
    onClearSearch,
    filters,
    onFilterChange,
    loading,
    onRefresh,
    showStats,
    onToggleStats,
    requestCount,
}: ControlsBarProps) {
    return (
        <div className="controls-bar mb-4 flex flex-wrap items-center gap-2">
            <SearchInput
                value={searchInput}
                onChange={onSearchChange}
                placeholder="Search conversations..."
                className="flex-1 min-w-64"
            />

            {searchInput && (
                <button
                    onClick={onClearSearch}
                    className="btn btn-sm btn-ghost"
                    disabled={loading}
                >
                    <i className="fa-duotone fa-regular fa-xmark" />
                    Clear
                </button>
            )}

            <button
                onClick={() => onToggleStats(!showStats)}
                className={`btn btn-sm btn-ghost ${showStats ? "text-primary" : ""}`}
                title="Toggle stats"
            >
                <i className="fa-duotone fa-regular fa-chart-simple" />
            </button>

            <button
                onClick={onRefresh}
                className="btn btn-sm btn-ghost"
                disabled={loading}
                title="Refresh conversations"
            >
                <i
                    className={`fa-duotone fa-regular fa-arrows-rotate ${loading ? "animate-spin" : ""}`}
                />
            </button>

            <div className="join">
                {mailboxOptions.map((opt) => (
                    <button
                        key={opt.value}
                        className={`join-item btn btn-sm ${
                            filters.mailbox === opt.value
                                ? "btn-primary"
                                : "btn-ghost"
                        }`}
                        onClick={() => onFilterChange("mailbox", opt.value)}
                    >
                        <i className={`fa-duotone fa-regular ${opt.icon} mr-1`} />
                        {opt.label}
                        {opt.value === "requests" && requestCount > 0 && (
                            <span className="badge badge-sm ml-1">
                                {requestCount > 99 ? "99+" : requestCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

