"use client";

import { useState } from "react";
import CreateInvitationModal from "../modals/create-invitation-modal";
import { InvitationFilters } from "../../types";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: InvitationFilters;
    setFilter: <K extends keyof InvitationFilters>(key: K, value: InvitationFilters[K]) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
}

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
}: HeaderFiltersProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);

    const activeFilterCount = [filters.status].filter(Boolean).length;

    const handleCreateSuccess = () => {
        refresh();
        setShowCreateModal(false);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Search */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search invitations..."
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
                title="Toggle stats"
            >
                <i className="fa-duotone fa-regular fa-chart-line" />
            </button>

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
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Status</legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.status || ""}
                            onChange={(e) =>
                                setFilter("status", e.target.value || undefined)
                            }
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="expired">Expired</option>
                            <option value="revoked">Revoked</option>
                        </select>
                    </fieldset>

                    {activeFilterCount > 0 && (
                        <button
                            className="btn btn-ghost btn-sm mt-2"
                            onClick={() => setFilter("status", undefined)}
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Create Invitation Button */}
            <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowCreateModal(true)}
            >
                <i className="fa-duotone fa-regular fa-plus" />
                Create Invitation
            </button>

            {/* Create Modal */}
            <CreateInvitationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}
