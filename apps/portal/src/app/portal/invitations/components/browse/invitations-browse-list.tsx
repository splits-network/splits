"use client";

import React from "react";
import { RecruiterCandidateWithCandidate } from "@splits-network/shared-types";
import InvitationsListItem from "./invitations-list-item";

interface InvitationsBrowseListProps {
    invitations: RecruiterCandidateWithCandidate[];
    selectedInvitation: RecruiterCandidateWithCandidate | null;
    onSelectInvitation: (invitation: RecruiterCandidateWithCandidate) => void;
    loading?: boolean;
}

export function InvitationsBrowseList({
    invitations,
    selectedInvitation,
    onSelectInvitation,
    loading,
}: InvitationsBrowseListProps) {
    if (loading && invitations.length === 0) {
        return (
            <div className="p-8 text-center text-base-content/50">
                <span className="loading loading-spinner loading-md mb-2"></span>
                <p>Loading invitations...</p>
            </div>
        );
    }

    if (invitations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-base-content/50">
                <i className="fa-duotone fa-regular fa-inbox text-4xl mb-3 opacity-50" />
                <p>No invitations found</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-base-300">
            {invitations.map((invitation) => (
                <InvitationsListItem
                    key={invitation.id}
                    invitation={invitation}
                    isSelected={selectedInvitation?.id === invitation.id}
                    onSelect={onSelectInvitation}
                />
            ))}
        </div>
    );
}
