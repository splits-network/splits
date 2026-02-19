"use client";

import type { Invitation } from "../../types";
import { getDisplayStatus } from "../../types";
import { statusColor, statusBorder } from "./status-color";
import { formatInvitationDate, getInitials, candidateName } from "./helpers";
import ActionsToolbar from "./actions-toolbar";

export function InvitationDetail({
    invitation,
    onClose,
    onRefresh,
}: {
    invitation: Invitation;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const candidate = invitation.candidate;
    const status = getDisplayStatus(invitation);
    const name = candidateName(invitation);
    const isDeclined = !!invitation.declined_at;
    const borderClass = statusBorder(invitation);

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-2 border-base-300 border-l-4 ${borderClass}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <span
                            className={`inline-block text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 mb-3 ${statusColor(invitation)}`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${status.icon} mr-1`}
                            />
                            {status.label}
                        </span>
                        <h2 className="text-2xl font-black tracking-tight leading-tight mb-2">
                            {name}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {candidate?.email && (
                                <span className="text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {candidate.email}
                                </span>
                            )}
                            {candidate?.phone && (
                                <span className="text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-phone mr-1" />
                                    {candidate.phone}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost flex-shrink-0"
                            style={{ borderRadius: 0 }}
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
            <div className="grid grid-cols-3 border-b-2 border-base-300">
                <div className="p-4 text-center border-r border-base-200">
                    <div className="text-lg font-black text-primary">
                        {status.label}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40">
                        Status
                    </div>
                </div>
                <div className="p-4 text-center border-r border-base-200">
                    <div className="text-lg font-black text-primary">
                        {formatInvitationDate(invitation.invited_at)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40">
                        Invited
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className="text-lg font-black text-primary">
                        {formatInvitationDate(invitation.invitation_expires_at)}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40">
                        Expires
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-6">
                {/* Candidate Info */}
                {candidate && (
                    <div className="p-4 border-2 border-base-300 mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Candidate Information
                        </h3>
                        <div className="flex items-center gap-3 mb-4">
                            {candidate.profile_picture ? (
                                <img
                                    src={candidate.profile_picture}
                                    alt={name}
                                    className="w-12 h-12 object-cover border-2 border-base-300"
                                />
                            ) : (
                                <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm text-base-content/60">
                                    {getInitials(name)}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-sm">
                                    {name}
                                </div>
                                <div className="text-sm text-base-content/50">
                                    {candidate.email}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {candidate.current_title && (
                                <div className="p-3 border border-base-200">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                        Title
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {candidate.current_title}
                                    </div>
                                </div>
                            )}
                            {candidate.current_company && (
                                <div className="p-3 border border-base-200">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                        Company
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {candidate.current_company}
                                    </div>
                                </div>
                            )}
                            {candidate.location && (
                                <div className="p-3 border border-base-200">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                        Location
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {candidate.location}
                                    </div>
                                </div>
                            )}
                            {candidate.phone && (
                                <div className="p-3 border border-base-200">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                        Phone
                                    </div>
                                    <div className="text-sm font-semibold">
                                        {candidate.phone}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Invitation Timeline */}
                <div className="mb-6">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-clock text-primary" />
                        Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 border border-base-200">
                            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                Invited
                            </div>
                            <div className="text-sm font-semibold">
                                {formatInvitationDate(invitation.invited_at)}
                            </div>
                        </div>
                        <div className="p-3 border border-base-200">
                            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-base-content/40 mb-1">
                                Expires
                            </div>
                            <div className="text-sm font-semibold">
                                {formatInvitationDate(
                                    invitation.invitation_expires_at,
                                )}
                            </div>
                        </div>
                        {invitation.consent_given_at && (
                            <div className="p-3 border border-success/30 bg-success/5">
                                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-success mb-1">
                                    Accepted
                                </div>
                                <div className="text-sm font-semibold">
                                    {formatInvitationDate(
                                        invitation.consent_given_at,
                                    )}
                                </div>
                            </div>
                        )}
                        {invitation.declined_at && (
                            <div className="p-3 border border-error/30 bg-error/5">
                                <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-error mb-1">
                                    Declined
                                </div>
                                <div className="text-sm font-semibold">
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
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-times-circle text-error" />
                            Decline Reason
                        </h3>
                        <div className="p-3 border border-error/30 bg-error/5 text-sm text-base-content/70">
                            {invitation.declined_reason}
                        </div>
                    </div>
                )}

                {/* Verification Status */}
                {candidate?.verification_status && (
                    <div className="mb-6">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-badge-check text-success" />
                            Verification
                        </h3>
                        <div className="flex items-center gap-3 text-sm">
                            <i
                                className={`fa-duotone fa-regular ${
                                    candidate.verification_status === "verified"
                                        ? "fa-check-circle text-success"
                                        : "fa-clock text-warning"
                                }`}
                            />
                            <span className="text-base-content/75 capitalize">
                                {candidate.verification_status}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
