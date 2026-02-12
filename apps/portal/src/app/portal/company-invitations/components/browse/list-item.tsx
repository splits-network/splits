"use client";

import { useUserProfile } from "@/contexts";
import {
    RecruiterCompanyRelationship,
    getStatusBadgeClass,
    getStatusLabel,
    getStatusIcon,
    formatDateShort,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";

interface ListItemProps {
    invitation: RecruiterCompanyRelationship;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    invitation,
    isSelected,
    onSelect,
}: ListItemProps) {
    const { isCompanyUser } = useUserProfile();

    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);
    const counterpartyLogo = isCompanyUser ? undefined : invitation.company?.logo_url;
    const isPending = invitation.status === "pending";

    return (
        <div
            onClick={() => onSelect(invitation.id)}
            className={`group px-3 pt-2 pb-4 border-b border-base-300 cursor-pointer hover:bg-base-100 transition-colors ${
                isSelected
                    ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                    : "border-l-4 border-l-transparent"
            }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="avatar avatar-placeholder shrink-0">
                    {counterpartyLogo ? (
                        <div className="w-10 h-10 rounded-lg">
                            <img src={counterpartyLogo} alt={counterpartyName} />
                        </div>
                    ) : (
                        <div className="bg-secondary text-secondary-content rounded-lg w-10 h-10">
                            <span className="text-sm">
                                {getInitials(counterpartyName)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3
                            className={`truncate text-sm group-hover:text-primary ${
                                isPending
                                    ? "font-bold text-base-content"
                                    : "font-medium text-base-content/90"
                            }`}
                        >
                            {counterpartyName}
                        </h3>

                        {isPending && (
                            <span
                                className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"
                                title="Pending"
                            />
                        )}
                    </div>

                    {counterpartySubtext && (
                        <div className="text-xs text-base-content/60 truncate mb-1.5">
                            {counterpartySubtext}
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-1.5">
                        <span
                            className={`badge badge-xs ${getStatusBadgeClass(invitation.status)} badge-soft gap-1 border-0`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${getStatusIcon(invitation.status)} text-[10px]`}
                            />
                            {getStatusLabel(invitation.status)}
                        </span>

                        {invitation.can_manage_company_jobs && (
                            <span className="badge badge-xs badge-warning badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-briefcase text-[10px]" />
                                Can Manage Jobs
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="shrink-0">
                    <span
                        className={`text-[10px] ${
                            isPending
                                ? "font-semibold text-primary"
                                : "text-base-content/40"
                        }`}
                    >
                        {formatDateShort(invitation.created_at)}
                    </span>
                </div>
            </div>
        </div>
    );
}
