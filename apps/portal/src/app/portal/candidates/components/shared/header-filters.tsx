"use client";

import { useState } from "react";
import { CandidateFilters, CandidateScope } from "../../types";
import AddCandidateModal from "../modals/add-candidate-modal";

interface HeaderFiltersProps {
    searchInput: string;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    filters: CandidateFilters;
    setFilter: <K extends keyof CandidateFilters>(
        key: K,
        value: CandidateFilters[K],
    ) => void;
    loading: boolean;
    refresh: () => void;
    showStats: boolean;
    setShowStats: (show: boolean) => void;
    scope: CandidateScope;
    setScope: (scope: CandidateScope) => void;
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
    scope,
    setScope,
}: HeaderFiltersProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    const activeFilterCount = [
        filters.verification_status,
        filters.desired_job_type,
        filters.open_to_remote,
    ].filter(Boolean).length;

    const handleScopeChange = (newScope: CandidateScope) => {
        setScope(newScope);
        setFilter("scope", newScope);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <label className="input input-sm w-48 lg:w-64">
                <i className="fa-duotone fa-regular fa-search" />
                <input
                    type="text"
                    placeholder="Search candidates..."
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
                        <legend className="fieldset-legend">View</legend>
                        <select
                            className="select w-full select-sm"
                            value={scope}
                            onChange={(e) =>
                                handleScopeChange(e.target.value as CandidateScope)
                            }
                        >
                            <option value="mine">My Candidates</option>
                            <option value="all">All Candidates</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset mt-2">
                        <legend className="fieldset-legend">
                            Verification Status
                        </legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.verification_status || ""}
                            onChange={(e) =>
                                setFilter(
                                    "verification_status",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All</option>
                            <option value="verified">Verified</option>
                            <option value="pending">Pending</option>
                            <option value="unverified">Unverified</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset mt-2">
                        <legend className="fieldset-legend">Job Type</legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.desired_job_type || ""}
                            onChange={(e) =>
                                setFilter(
                                    "desired_job_type",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All Types</option>
                            <option value="full_time">Full Time</option>
                            <option value="contract">Contract</option>
                            <option value="freelance">Freelance</option>
                            <option value="part_time">Part Time</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset mt-2">
                        <legend className="fieldset-legend">
                            Remote Preference
                        </legend>
                        <select
                            className="select w-full select-sm"
                            value={filters.open_to_remote || ""}
                            onChange={(e) =>
                                setFilter(
                                    "open_to_remote",
                                    e.target.value || undefined,
                                )
                            }
                        >
                            <option value="">All</option>
                            <option value="true">Open to Remote</option>
                            <option value="false">Not Remote</option>
                        </select>
                    </fieldset>
                </div>
            </div>

            {/* Add Candidate Button */}
            <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowAddModal(true)}
            >
                <i className="fa-duotone fa-regular fa-plus" /> Add Candidate
            </button>

            {/* Add Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    refresh();
                    setShowAddModal(false);
                }}
            />
        </div>
    );
}
