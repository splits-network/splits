"use client";

import React from "react";

interface RecruiterCompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: "sourcer" | "recruiter";
    status: "pending" | "active" | "declined" | "terminated";
    can_manage_company_jobs: boolean;
    relationship_start_date?: string;
    relationship_end_date?: string;
    termination_reason?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
    recruiter?: {
        id: string;
        user_id: string;
        user?: { name: string; email: string };
    };
    company?: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
}

interface InvitationDetailPanelProps {
    invitation: RecruiterCompanyRelationship | null;
    onClose: () => void;
    onAccept: (invitation: RecruiterCompanyRelationship) => void;
    onDecline: (invitation: RecruiterCompanyRelationship) => void;
    isResponding: boolean;
}

export function InvitationDetailPanel({
    invitation,
    onClose,
    onAccept,
    onDecline,
    isResponding,
}: InvitationDetailPanelProps) {
    if (!invitation) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-base-content/40">
                <div className="bg-base-200 p-6 rounded-full mb-4">
                    <i className="fa-duotone fa-regular fa-building text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    Select an Invitation
                </h3>
                <p className="max-w-xs">
                    Select an invitation from the list to view details and
                    respond.
                </p>
            </div>
        );
    }

    const company = invitation.company;
    const isPending = invitation.status === "pending";
    const isActive = invitation.status === "active";
    const isDeclined = invitation.status === "declined";
    const isTerminated = invitation.status === "terminated";

    // Get initials for company avatar
    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // Status display
    let statusColor = "badge-ghost";
    let statusLabel = "Unknown";

    if (isActive) {
        statusColor = "badge-success";
        statusLabel = "Active";
    } else if (isDeclined) {
        statusColor = "badge-error";
        statusLabel = "Declined";
    } else if (isTerminated) {
        statusColor = "badge-neutral";
        statusLabel = "Terminated";
    } else if (isPending) {
        statusColor = "badge-info";
        statusLabel = "Pending";
    }

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col">
            {/* Mobile Header with Back Button */}
            <div className="flex md:hidden items-center p-4 border-b border-base-300 bg-base-100">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm mr-3"
                    aria-label="Back to list"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left"></i>
                </button>
                <h3 className="text-lg font-semibold flex-1">
                    Invitation Details
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-start gap-4">
                        <div className="avaatar avatar-placeholder">
                            {company?.logo_url ? (
                                <div className="w-16 h-16 rounded-xl">
                                    <img
                                        src={company.logo_url}
                                        alt={company.name}
                                    />
                                </div>
                            ) : (
                                <div className="bg-secondary text-secondary-content rounded-xl w-16 h-16">
                                    <span className="text-xl">
                                        {getInitials(company?.name || "CO")}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                                <h3 className="text-2xl font-bold truncate">
                                    {company?.name || "Unknown Company"}
                                </h3>
                                <div
                                    className={`badge ${statusColor} badge-lg ml-2`}
                                >
                                    {statusLabel}
                                </div>
                            </div>
                            {company?.industry && (
                                <p className="text-base-content/70 mt-1">
                                    {company.industry}
                                </p>
                            )}
                            {company?.headquarters_location && (
                                <p className="text-sm text-base-content/50 mt-1">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1"></i>
                                    {company.headquarters_location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Invitation Details */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-envelope mr-2"></i>
                                Invitation Details
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Received
                                    </div>
                                    <div>
                                        {formatDate(invitation.created_at)}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-sm font-medium text-base-content/70">
                                        Status
                                    </div>
                                    <div className={`badge ${statusColor}`}>
                                        {statusLabel}
                                    </div>
                                </div>

                                {invitation.relationship_start_date && (
                                    <div>
                                        <div className="text-sm font-medium text-base-content/70">
                                            Started
                                        </div>
                                        <div>
                                            {formatDate(
                                                invitation.relationship_start_date,
                                            )}
                                        </div>
                                    </div>
                                )}

                                {invitation.relationship_end_date && (
                                    <div>
                                        <div className="text-sm font-medium text-base-content/70">
                                            Ended
                                        </div>
                                        <div>
                                            {formatDate(
                                                invitation.relationship_end_date,
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h4 className="card-title text-lg">
                                <i className="fa-duotone fa-regular fa-key mr-2"></i>
                                Permissions
                            </h4>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <i
                                        className={`fa-duotone fa-regular ${invitation.can_manage_company_jobs ? "fa-check-circle text-success" : "fa-times-circle text-base-content/30"}`}
                                    ></i>
                                    <span>Can manage company jobs</span>
                                </div>
                            </div>

                            {invitation.can_manage_company_jobs && (
                                <div className="alert alert-info mt-3">
                                    <i className="fa-duotone fa-regular fa-info-circle"></i>
                                    <span>
                                        You will be able to create and edit job
                                        postings for this company.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Termination Reason */}
                    {isTerminated && invitation.termination_reason && (
                        <div className="card bg-error/10 border border-error/20">
                            <div className="card-body">
                                <h4 className="card-title text-lg text-error">
                                    <i className="fa-duotone fa-regular fa-times-circle mr-2"></i>
                                    Termination Reason
                                </h4>
                                <p className="text-error/80">
                                    {invitation.termination_reason}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Bar - Only show for pending invitations */}
            {isPending && (
                <div className="p-4 border-t border-base-300 bg-base-100">
                    <div className="flex gap-3">
                        <button
                            onClick={() => onDecline(invitation)}
                            className="btn btn-outline btn-error flex-1"
                            disabled={isResponding}
                        >
                            <i className="fa-duotone fa-regular fa-times mr-2"></i>
                            Decline
                        </button>
                        <button
                            onClick={() => onAccept(invitation)}
                            className="btn btn-primary flex-1"
                            disabled={isResponding}
                        >
                            {isResponding ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check mr-2"></i>
                                    Accept
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
