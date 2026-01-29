"use client";

import React from "react";
import { SearchInput } from "@/hooks/use-standard-list";
//import { RecruiterCandidateStatusFilter } from '@splits-network/shared-types';

enum RecruiterCandidateStatusFilter {
    ALL = "All Statuses",
    PENDING = "Pending",
    ACCEPTED = "Accepted",
    DECLINED = "Declined",
    EXPIRED = "Expired",
}

interface InvitationFiltersPanelProps {
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    searchInput: string;
    onSearchInputChange: (value: string) => void;
    onClearSearch: () => void;
    isRecruiter?: boolean;
    onAddCandidate?: () => void;
}

export const InvitationsFiltersPanel = React.memo(
    function InvitationsFiltersPanel({
        statusFilter,
        onStatusFilterChange,
        searchInput,
        onSearchInputChange,
        onClearSearch,
        isRecruiter,
        onAddCandidate,
    }: InvitationFiltersPanelProps) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body p-4 space-y-4">
                    <h3 className="card-title">
                        <i className="fa-duotone fa-regular fa-filter mr-2" />
                        Options
                    </h3>

                    {isRecruiter && onAddCandidate && (
                        <button
                            className="btn btn-primary w-full"
                            onClick={onAddCandidate}
                        >
                            <i className="fa-duotone fa-regular fa-plus"></i>
                            Add Candidate
                        </button>
                    )}

                    <div className="flex flex-wrap gap-4 items-center">
                        <fieldset className="fieldset w-full">
                            <select
                                className="select w-full"
                                value={statusFilter || ""}
                                onChange={(e) =>
                                    onStatusFilterChange(e.target.value)
                                }
                            >
                                {Object.entries(
                                    RecruiterCandidateStatusFilter,
                                ).map(([name, value]) => (
                                    <option key={name} value={name}>
                                        {value as any}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        <SearchInput
                            value={searchInput}
                            onChange={onSearchInputChange}
                            onClear={onClearSearch}
                            placeholder="Search invitations..."
                            className="flex-1 min-w-0"
                        />
                    </div>
                </div>
            </div>
        );
    },
);
