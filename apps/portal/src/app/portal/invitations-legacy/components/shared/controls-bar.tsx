"use client";

import { useState } from "react";
import { SearchInput } from "@splits-network/memphis-ui";
import type { ViewMode } from "./accent";
import type { InvitationFilters } from "../../types";
import { ViewModeToggle } from "./view-mode-toggle";
import AddCandidateModal from "../../../candidates-legacy/components/modals/add-candidate-modal";

interface ControlsBarProps {
    searchInput: string;
    onSearchChange: (value: string) => void;
    filters: InvitationFilters;
    onFilterChange: <K extends keyof InvitationFilters>(
        key: K,
        value: InvitationFilters[K],
    ) => void;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    onRefresh: () => void;
}

export function ControlsBar({
    searchInput,
    onSearchChange,
    filters,
    onFilterChange,
    viewMode,
    onViewModeChange,
    onRefresh,
}: ControlsBarProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    return (
        <>
            <div className="controls-bar mb-4">
                {/* Search */}
                <SearchInput
                    value={searchInput}
                    onChange={onSearchChange}
                    placeholder="Search invitations..."
                    className="flex-1"
                />

                {/* Inline Status Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Status:
                    </span>
                    <select
                        value={filters.status || ""}
                        onChange={(e) =>
                            onFilterChange(
                                "status",
                                e.target.value || undefined,
                            )
                        }
                        className="select select-sm select-ghost font-bold uppercase"
                    >
                        <option value="">All</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="expired">Expired</option>
                        <option value="terminated">Terminated</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Invite Candidate Button */}
                <button
                    className="btn btn-sm btn-coral gap-2 font-bold uppercase"
                    onClick={() => setShowAddModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-plus" />
                    Invite Candidate
                </button>

                {/* View Mode Toggle */}
                <ViewModeToggle
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                />
            </div>

            {/* Add Modal */}
            <AddCandidateModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    onRefresh();
                    setShowAddModal(false);
                }}
            />
        </>
    );
}
