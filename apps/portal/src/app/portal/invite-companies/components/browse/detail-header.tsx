"use client";

import { CompanyInvitation, getStatusBadgeClass } from "../../types";

interface DetailHeaderProps {
    invitation: CompanyInvitation | null;
    onClose: () => void;
}

export default function DetailHeader({
    invitation,
    onClose,
}: DetailHeaderProps) {
    if (!invitation) {
        return (
            <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100">
                <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    {/* Mobile back button */}
                    <button
                        onClick={onClose}
                        className="md:hidden btn btn-ghost btn-circle btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                    </button>

                    <i className="fa-duotone fa-regular fa-building-user text-primary text-lg" />

                    <h1 className="text-xl sm:text-2xl font-bold line-clamp-1">
                        {invitation.company_name_hint || "Company Invitation"}
                    </h1>

                    <span
                        className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                    >
                        {invitation.status}
                    </span>
                </div>

                {invitation.invited_email && (
                    <div className="flex items-center gap-2 text-sm text-base-content/60 ml-12 md:ml-0">
                        <i className="fa-duotone fa-regular fa-envelope" />
                        <span>{invitation.invited_email}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
