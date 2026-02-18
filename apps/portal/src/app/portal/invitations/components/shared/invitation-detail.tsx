"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Invitation } from "../../types";
import {
    getDisplayStatus,
    formatInvitationDate,
    getInitials,
} from "../../types";
import type { AccentClasses } from "./accent";
import ActionsToolbar from "./actions-toolbar";

export function InvitationDetail({
    invitation,
    accent,
    onClose,
    onRefresh,
}: {
    invitation: Invitation;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const candidate = invitation.candidate;
    const status = getDisplayStatus(invitation);
    const candidateName = candidate?.full_name || "Unknown Candidate";
    const isDeclined = !!invitation.declined_at;

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Badge color={status.color} className="mb-3">
                            <i
                                className={`fa-duotone fa-regular ${status.icon} mr-1`}
                            />
                            {status.label}
                        </Badge>
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {candidateName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {candidate?.email && (
                                <span className="text-dark/70">
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {candidate.email}
                                </span>
                            )}
                            {candidate?.phone && (
                                <span className="text-dark/70">
                                    <i className="fa-duotone fa-regular fa-phone mr-1" />
                                    {candidate.phone}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`btn btn-xs btn-square btn-ghost flex-shrink-0 ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <ActionsToolbar
                        invitation={invitation}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewCandidate: true,
                            resend: true,
                            cancel: true,
                            viewDeclineReason: true,
                        }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {status.label}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Status
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {formatInvitationDate(invitation.invited_at)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Invited
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {formatInvitationDate(invitation.invitation_expires_at)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Expires
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-6">
                {/* Candidate Info */}
                {candidate && (
                    <div className={`p-4 border-4 ${accent.border} mb-6`}>
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                            Candidate Information
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            {candidate.profile_picture ? (
                                <img
                                    src={candidate.profile_picture}
                                    alt={candidateName}
                                    className={`w-12 h-12 object-cover border-2 ${accent.border}`}
                                />
                            ) : (
                                <div
                                    className={`w-12 h-12 flex items-center justify-center border-2 ${accent.border} bg-cream font-bold text-sm text-dark`}
                                >
                                    {getInitials(candidateName)}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm text-dark">
                                    {candidateName}
                                </div>
                                <div className="text-sm text-dark/50">
                                    {candidate.email}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {candidate.current_title && (
                                <div className="p-3 border-2 border-dark/20">
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                        Title
                                    </div>
                                    <div className="text-sm font-bold text-dark">
                                        {candidate.current_title}
                                    </div>
                                </div>
                            )}
                            {candidate.current_company && (
                                <div className="p-3 border-2 border-dark/20">
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                        Company
                                    </div>
                                    <div className="text-sm font-bold text-dark">
                                        {candidate.current_company}
                                    </div>
                                </div>
                            )}
                            {candidate.location && (
                                <div className="p-3 border-2 border-dark/20">
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                        Location
                                    </div>
                                    <div className="text-sm font-bold text-dark">
                                        {candidate.location}
                                    </div>
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="p-3 border-2 border-dark/20">
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                        Phone
                                    </div>
                                    <div className="text-sm font-bold text-dark">
                                        {candidate.phone}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Invitation Timeline */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                        <span className="badge badge-xs badge-coral">
                            <i className="fa-duotone fa-regular fa-clock" />
                        </span>
                        Timeline
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Invited
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatInvitationDate(invitation.invited_at)}
                            </div>
                        </div>
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Expires
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatInvitationDate(
                                    invitation.invitation_expires_at,
                                )}
                            </div>
                        </div>
                        {invitation.consent_given_at && (
                            <div className="p-3 border-2 border-teal/40">
                                <div className="text-sm font-bold uppercase tracking-wider text-teal mb-1">
                                    Accepted
                                </div>
                                <div className="text-sm font-bold text-dark">
                                    {formatInvitationDate(
                                        invitation.consent_given_at,
                                    )}
                                </div>
                            </div>
                        )}
                        {invitation.declined_at && (
                            <div className="p-3 border-2 border-coral/40">
                                <div className="text-sm font-bold uppercase tracking-wider text-coral mb-1">
                                    Declined
                                </div>
                                <div className="text-sm font-bold text-dark">
                                    {formatInvitationDate(
                                        invitation.declined_at,
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Decline Reason */}
                {isDeclined && invitation.declined_reason && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-coral">
                                <i className="fa-duotone fa-regular fa-times-circle" />
                            </span>
                            Decline Reason
                        </h3>
                        <div className="p-3 border-2 border-coral/40 text-sm text-dark/70">
                            {invitation.declined_reason}
                        </div>
                    </div>
                )}

                {/* Verification Status */}
                {candidate?.verification_status && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-teal">
                                <i className="fa-duotone fa-regular fa-badge-check" />
                            </span>
                            Verification
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                            <i
                                className={`fa-duotone fa-regular ${
                                    candidate.verification_status === "verified"
                                        ? "fa-check-circle text-teal"
                                        : "fa-clock text-yellow"
                                }`}
                            />
                            <span className="text-dark/75 capitalize">
                                {candidate.verification_status}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
