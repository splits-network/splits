"use client";

import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";
import { statusColor } from "./status-color";
import { formatStatus } from "./helpers";
import ConnectionActionsToolbar from "./actions-toolbar";

export function ConnectionDetail({
    invitation,
    onClose,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
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
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(invitation.status)}`}
                            >
                                <i className={`fa-duotone fa-regular ${invitation.status === "pending" ? "fa-clock" : invitation.status === "active" ? "fa-check-circle" : invitation.status === "declined" ? "fa-times-circle" : "fa-ban"} mr-1`} />
                                {getStatusLabel(invitation.status)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {invitation.relationship_type}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {counterpartyName}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            {counterpartySubtext && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-envelope mr-1" />
                                    {counterpartySubtext}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
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

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Status
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {getStatusLabel(invitation.status)}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Type
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {invitation.relationship_type}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Received
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {formatDate(invitation.created_at)}
                        </p>
                    </div>
                </div>

                {/* Counterparty Info */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        {isCompanyUser ? "Recruiter" : "Company"}
                    </h3>
                    <div className="flex items-center gap-4">
                        {counterpartyLogo ? (
                            <img
                                src={counterpartyLogo}
                                alt={counterpartyName}
                                className="w-12 h-12 object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                                {getInitials(counterpartyName)}
                            </div>
                        )}
                        <div>
                            <p className="font-bold">{counterpartyName}</p>
                            {isCompanyUser && invitation.recruiter?.user?.email && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.recruiter.user.email}
                                </p>
                            )}
                            {!isCompanyUser && invitation.company?.industry && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.company.industry}
                                </p>
                            )}
                            {!isCompanyUser && invitation.company?.headquarters_location && (
                                <p className="text-sm text-base-content/50">
                                    {invitation.company.headquarters_location}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {invitation.relationship_start_date && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Connected Since
                            </p>
                            <p className="font-bold text-sm">
                                {formatDate(invitation.relationship_start_date)}
                            </p>
                        </div>
                    )}
                    {invitation.relationship_end_date && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Ended
                            </p>
                            <p className="font-bold text-sm">
                                {formatDate(invitation.relationship_end_date)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Permissions */}
                <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                        Permissions
                    </h3>
                    <div className="flex items-center gap-3 text-sm">
                        <i
                            className={`fa-duotone fa-regular ${invitation.can_manage_company_jobs ? "fa-check-circle text-success" : "fa-times-circle text-base-content/30"}`}
                        />
                        <span className="text-base-content/75">Can manage company jobs</span>
                    </div>
                    {invitation.can_manage_company_jobs && (
                        <div className="p-3 border-2 border-success/20 mt-3">
                            <div className="text-sm text-base-content/70">
                                <i className="fa-duotone fa-regular fa-info-circle mr-1 text-success" />
                                {isCompanyUser
                                    ? "This recruiter can create and edit job postings for your company."
                                    : "You can create and edit job postings for this company."}
                            </div>
                        </div>
                    )}
                </div>

                {/* Termination Reason */}
                {invitation.status === "terminated" && invitation.termination_reason && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Termination Reason
                        </h3>
                        <div className="p-3 border-2 border-error/20 text-sm text-base-content/70">
                            {invitation.termination_reason}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
