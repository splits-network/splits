"use client";

import { useUserProfile } from "@/contexts";
import { Badge } from "@splits-network/memphis-ui";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";
import type { AccentClasses } from "./accent";
import { statusVariant } from "./accent";
import ConnectionActionsToolbar from "./actions-toolbar";

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function ConnectionDetail({
    invitation,
    accent,
    onClose,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    const { isCompanyUser } = useUserProfile();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);
    const counterpartyLogo = isCompanyUser ? undefined : invitation.company?.logo_url;

    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <Badge color={statusVariant(invitation.status)} className="mb-3">
                            <i className={`fa-duotone fa-regular ${invitation.status === "pending" ? "fa-clock" : invitation.status === "active" ? "fa-check-circle" : "fa-times-circle"} mr-1`} />
                            {getStatusLabel(invitation.status)}
                        </Badge>
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {counterpartyName}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {counterpartySubtext && (
                                <span className="text-dark/70">
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {counterpartySubtext}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-coral flex-shrink-0"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <ConnectionActionsToolbar
                        invitation={invitation}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {getStatusLabel(invitation.status)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Status
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black capitalize ${accent.text}`}>
                        {invitation.relationship_type}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Type
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {formatDate(invitation.created_at)}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Received
                    </div>
                </div>
            </div>

            {/* Details */}
            <div className="p-6">
                {/* Counterparty Info */}
                <div className={`p-4 border-4 ${accent.border} mb-6`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        {isCompanyUser ? "Recruiter" : "Company"}
                    </h3>
                    <div className="flex items-center gap-3">
                        {counterpartyLogo ? (
                            <img
                                src={counterpartyLogo}
                                alt={counterpartyName}
                                className={`w-12 h-12 object-cover border-2 ${accent.border}`}
                            />
                        ) : (
                            <div
                                className={`w-12 h-12 flex items-center justify-center border-2 ${accent.border} bg-cream font-bold text-sm text-dark`}
                            >
                                {getInitials(counterpartyName)}
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-sm text-dark">
                                {counterpartyName}
                            </div>
                            {isCompanyUser && invitation.recruiter?.user?.email && (
                                <div className="text-sm text-dark/50">
                                    {invitation.recruiter.user.email}
                                </div>
                            )}
                            {!isCompanyUser && invitation.company?.industry && (
                                <div className={`text-sm ${accent.text}`}>
                                    {invitation.company.industry}
                                </div>
                            )}
                            {!isCompanyUser && invitation.company?.headquarters_location && (
                                <div className="text-sm text-dark/50">
                                    {invitation.company.headquarters_location}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {invitation.relationship_start_date && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Connected Since
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatDate(invitation.relationship_start_date)}
                            </div>
                        </div>
                    )}
                    {invitation.relationship_end_date && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Ended
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatDate(invitation.relationship_end_date)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Permissions */}
                <div className="mb-6">
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                        <span className="badge badge-xs badge-teal">
                            <i className="fa-duotone fa-regular fa-key" />
                        </span>
                        Permissions
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                        <i
                            className={`fa-duotone fa-regular ${invitation.can_manage_company_jobs ? "fa-check-circle text-teal" : "fa-times-circle text-dark/30"}`}
                        />
                        <span className="text-dark/75">Can manage company jobs</span>
                    </div>
                    {invitation.can_manage_company_jobs && (
                        <div className="p-3 border-2 border-teal/40 mt-3">
                            <div className="text-sm text-dark/70">
                                <i className="fa-duotone fa-regular fa-info-circle mr-1 text-teal" />
                                {isCompanyUser
                                    ? "This recruiter can create and edit job postings for your company."
                                    : "You can create and edit job postings for this company."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Termination Reason */}
                {invitation.status === "terminated" && invitation.termination_reason && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-coral">
                                <i className="fa-duotone fa-regular fa-times-circle" />
                            </span>
                            Termination Reason
                        </h3>
                        <div className="p-3 border-2 border-coral/40 text-sm text-dark/70">
                            {invitation.termination_reason}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
