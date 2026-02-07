"use client";

import type { ConversationFilters, Mailbox } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: ConversationFilters;
    setFilter: <K extends keyof ConversationFilters>(
        key: K,
        value: ConversationFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    requestCount: number;
}

const mailboxOptions: { value: Mailbox; label: string; icon: string }[] = [
    { value: "inbox", label: "Inbox", icon: "fa-inbox" },
    { value: "requests", label: "Requests", icon: "fa-envelope" },
    { value: "archived", label: "Archived", icon: "fa-box-archive" },
];

export default function HeaderFilters({
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    refresh,
    showStats,
    setShowStats,
    requestCount,
}: HeaderFiltersProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={loading}
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-ghost btn-xs btn-circle"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
            </label>

            {/* Stats Toggle */}
            <button
                onClick={() => setShowStats(!showStats)}
                className={`btn btn-sm btn-ghost ${showStats ? "text-primary" : ""}`}
            >
                <i className="fa-duotone fa-regular fa-chart-simple" />
            </button>

            {/* Refresh */}
            <button
                onClick={refresh}
                className="btn btn-sm btn-ghost"
                disabled={loading}
            >
                <i
                    className={`fa-duotone fa-regular fa-arrows-rotate ${loading ? "animate-spin" : ""}`}
                />
            </button>

            {/* Mailbox Filter */}
            <div className="join">
                {mailboxOptions.map((opt) => (
                    <button
                        key={opt.value}
                        className={`join-item btn btn-sm ${
                            filters.mailbox === opt.value
                                ? "btn-primary"
                                : "btn-ghost"
                        }`}
                        onClick={() => setFilter("mailbox", opt.value)}
                    >
                        <i
                            className={`fa-duotone fa-regular ${opt.icon} mr-1`}
                        />
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
