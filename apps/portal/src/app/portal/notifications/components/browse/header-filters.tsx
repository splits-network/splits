"use client";

import type { NotificationFilters } from "../../contexts/filter-context";

const NOTIFICATION_CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "application", label: "Applications" },
    { value: "placement", label: "Placements" },
    { value: "proposal", label: "Proposals" },
    { value: "candidate", label: "Candidates" },
    { value: "collaboration", label: "Collaboration" },
    { value: "invitation", label: "Invitations" },
    { value: "chat", label: "Chat" },
    { value: "system", label: "System" },
];

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: NotificationFilters;
    setFilter: <K extends keyof NotificationFilters>(
        key: K,
        value: NotificationFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    unreadCount: number;
    markingAllRead: boolean;
    onMarkAllRead: () => void;
}

export default function HeaderFilters({
    searchInput,
    setSearchInput,
    clearSearch,
    filters,
    setFilter,
    loading,
    refresh,
    unreadCount,
    markingAllRead,
    onMarkAllRead,
}: HeaderFiltersProps) {
    const activeFilterCount = [filters.category, filters.unread_only].filter(
        Boolean,
    ).length;

    return (
        <div className="flex items-center gap-2">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    disabled={loading}
                />
                {searchInput && (
                    <button
                        onClick={clearSearch}
                        className="btn btn-ghost btn-xs btn-square"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                )}
            </label>

            {/* Filters Dropdown */}
            <div className="dropdown dropdown-end">
                <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-sm btn-ghost"
                >
                    <i className="fa-duotone fa-regular fa-filter" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="badge badge-primary badge-xs">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                <div
                    tabIndex={0}
                    className="dropdown-content menu p-4 shadow-lg bg-base-100 rounded-box w-64 z-50"
                >
                    <fieldset className="fieldset mb-3">
                        <legend className="fieldset-legend">Category</legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.category || ""}
                            onChange={(e) =>
                                setFilter(
                                    "category",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            {NOTIFICATION_CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm checkbox-primary"
                            checked={filters.unread_only || false}
                            onChange={(e) =>
                                setFilter(
                                    "unread_only",
                                    e.target.checked || undefined,
                                )
                            }
                        />
                        <span className="text-sm">Unread only</span>
                    </label>
                </div>
            </div>

            {/* Mark All Read */}
            {unreadCount > 0 && (
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={onMarkAllRead}
                    disabled={markingAllRead}
                >
                    {markingAllRead ? (
                        <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                        <i className="fa-duotone fa-regular fa-check-double text-xs"></i>
                    )}
                    Mark all read
                </button>
            )}
        </div>
    );
}
