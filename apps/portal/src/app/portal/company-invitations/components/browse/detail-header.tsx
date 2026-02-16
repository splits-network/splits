"use client";

import { useUserProfile } from "@/contexts";
import {
    RecruiterCompanyRelationship,
    getStatusBadgeClass,
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
} from "../../types";

interface DetailHeaderProps {
    invitation: RecruiterCompanyRelationship | null;
    onClose: () => void;
}

export default function DetailHeader({
    invitation,
    onClose,
}: DetailHeaderProps) {
    const { isCompanyUser } = useUserProfile();

    if (!invitation) {
        return (
            <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100">
                <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
            </div>
        );
    }

    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(
        invitation,
        isCompanyUser,
    );

    return (
        <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    {/* Mobile back button */}
                    <button
                        onClick={onClose}
                        className="md:hidden btn btn-ghost btn-square btn-sm"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                    </button>

                    <i className="fa-duotone fa-regular fa-handshake text-primary text-lg" />

                    <h1 className="text-xl sm:text-2xl font-bold line-clamp-1">
                        {counterpartyName}
                    </h1>

                    <span
                        className={`badge badge-sm ${getStatusBadgeClass(invitation.status)}`}
                    >
                        {getStatusLabel(invitation.status)}
                    </span>
                </div>

                {counterpartySubtext && (
                    <div className="flex items-center gap-2 text-sm text-base-content/60 ml-12 md:ml-0">
                        <i className="fa-duotone fa-regular fa-envelope" />
                        <span>{counterpartySubtext}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
