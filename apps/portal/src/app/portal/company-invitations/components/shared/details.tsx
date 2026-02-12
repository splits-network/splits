"use client";

import { useUserProfile } from "@/contexts";
import {
    RecruiterCompanyRelationship,
    getStatusBadgeClass,
    getStatusLabel,
    formatDate,
    getCounterpartyName,
} from "../../types";

interface DetailsProps {
    invitation: RecruiterCompanyRelationship;
}

export default function Details({ invitation }: DetailsProps) {
    const { isCompanyUser } = useUserProfile();

    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);

    return (
        <div className="space-y-6 p-6">
            {/* Counterparty Info */}
            <div className="bg-base-200 rounded-lg p-4">
                <label className="text-xs uppercase tracking-wider text-base-content/60 font-semibold mb-2 block">
                    {isCompanyUser ? "Recruiter" : "Company"}
                </label>
                <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg flex-1">
                        {counterpartyName}
                    </div>
                </div>
                {isCompanyUser && invitation.recruiter?.user?.email && (
                    <div className="text-sm text-base-content/60 mt-1">
                        <i className="fa-duotone fa-regular fa-envelope mr-1" />
                        {invitation.recruiter.user.email}
                    </div>
                )}
                {!isCompanyUser && invitation.company?.industry && (
                    <div className="text-sm text-base-content/60 mt-1">
                        {invitation.company.industry}
                        {invitation.company.headquarters_location && (
                            <span> &middot; {invitation.company.headquarters_location}</span>
                        )}
                    </div>
                )}
            </div>

            {/* Connection Details Grid */}
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">Status</span>
                    <span className={`badge ${getStatusBadgeClass(invitation.status)}`}>
                        {getStatusLabel(invitation.status)}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">Relationship Type</span>
                    <span className="text-sm font-medium capitalize">
                        {invitation.relationship_type}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-sm text-base-content/60">Received</span>
                    <span className="text-sm">
                        {formatDate(invitation.created_at)}
                    </span>
                </div>

                {invitation.relationship_start_date && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Connected Since</span>
                        <span className="text-sm">
                            {formatDate(invitation.relationship_start_date)}
                        </span>
                    </div>
                )}

                {invitation.relationship_end_date && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-base-content/60">Ended</span>
                        <span className="text-sm">
                            {formatDate(invitation.relationship_end_date)}
                        </span>
                    </div>
                )}
            </div>

            {/* Permissions */}
            <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-key text-primary" />
                    Permissions
                </h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <i
                            className={`fa-duotone fa-regular ${invitation.can_manage_company_jobs ? "fa-check-circle text-success" : "fa-times-circle text-base-content/30"}`}
                        />
                        <span className="text-sm">Can manage company jobs</span>
                    </div>
                </div>
                {invitation.can_manage_company_jobs && (
                    <div className="alert alert-info mt-3">
                        <i className="fa-duotone fa-regular fa-info-circle" />
                        <span className="text-sm">
                            {isCompanyUser
                                ? "This recruiter can create and edit job postings for your company."
                                : "You can create and edit job postings for this company."}
                        </span>
                    </div>
                )}
            </div>

            {/* Termination Reason */}
            {invitation.status === "terminated" && invitation.termination_reason && (
                <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-error">
                        <i className="fa-duotone fa-regular fa-times-circle" />
                        Termination Reason
                    </h3>
                    <div className="bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error/80">
                        {invitation.termination_reason}
                    </div>
                </div>
            )}
        </div>
    );
}
