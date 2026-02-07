"use client";

import { useCallback } from "react";
import { Candidate } from "@splits-network/shared-types";
import ActionsToolbar from "../shared/actions-toolbar";

interface CandidateListPanelProps {
    candidates: Candidate[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
    };
    selectedCandidateId?: string | null;
    onSelectCandidate?: (id: string | null) => void;
    onMessage?: (candidate: Candidate) => void;
    onSendJob?: (candidate: Candidate) => void;
    onEdit?: (candidateId: string) => void;
    onViewDetails?: (candidateId: string) => void;
    searchQuery?: string;
    setSearchQuery?: (query: string) => void;
    loading?: boolean;
}

export default function CandidateListPanel({
    candidates,
    pagination,
    selectedCandidateId,
    onSelectCandidate,
    onMessage,
    onSendJob,
    onEdit,
    onViewDetails,
    searchQuery = "",
    setSearchQuery,
    loading = false,
}: CandidateListPanelProps) {
    const handleSelectCandidate = useCallback(
        (candidate: Candidate) => {
            onSelectCandidate?.(candidate.id);
        },
        [onSelectCandidate],
    );

    const getInitials = (name: string) => {
        const names = name.split(" ");
        const firstInitial = names[0]?.[0]?.toUpperCase() || "";
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || "";
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-base-300">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                        Candidates ({pagination?.total || 0})
                    </h3>
                    <button className="btn btn-primary btn-sm">
                        <i className="fa-duotone fa-regular fa-plus"></i>
                        Add
                    </button>
                </div>

                {/* Search */}
                <div className="w-full">
                    <input
                        type="text"
                        className="input input-sm w-full"
                        placeholder="Search candidates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {candidates.length === 0 ? (
                    <div className="p-8 text-center text-base-content/60">
                        <i className="fa-duotone fa-regular fa-users text-4xl mb-4"></i>
                        <h3 className="text-lg font-semibold mb-2">
                            No candidates found
                        </h3>
                        <p>
                            Try adjusting your search criteria or adding new
                            candidates.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-base-200">
                        {candidates.map((candidate) => (
                            <div
                                key={candidate.id}
                                className={`p-4 cursor-pointer hover:bg-base-50 transition-colors ${
                                    selectedCandidateId === candidate.id
                                        ? "bg-primary/5 border-r-4 border-r-primary"
                                        : ""
                                }`}
                                onClick={() => handleSelectCandidate(candidate)}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Avatar */}
                                    <div className="avatar avatar-placeholder shrink-0">
                                        <div className="bg-primary/10 text-primary rounded-full w-12 flex items-center justify-center text-sm font-semibold">
                                            {getInitials(candidate.name || "?")}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base-content truncate">
                                            {candidate.name}
                                        </h4>
                                        <p className="text-sm text-base-content/70 truncate">
                                            {candidate.current_title ||
                                                "No title"}
                                        </p>
                                        <p className="text-xs text-base-content/50 truncate">
                                            {candidate.location ||
                                                "No location"}
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div
                                        className="shrink-0"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <ActionsToolbar
                                            candidate={candidate}
                                            variant="icon-only"
                                            size="xs"
                                            showActions={{
                                                viewDetails: false, // Already handled by click
                                                message: true,
                                                sendJobOpportunity: true,
                                                edit: false,
                                            }}
                                            onMessage={onMessage}
                                            onSendJobOpportunity={onSendJob}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
