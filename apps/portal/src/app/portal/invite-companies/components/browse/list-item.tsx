"use client";

import {
    CompanyInvitation,
    getStatusBadgeClass,
    formatInvitationDate,
} from "../../types";

interface ListItemProps {
    invitation: CompanyInvitation;
    isSelected: boolean;
    onSelect: (id: string) => void;
}

export default function ListItem({
    invitation,
    isSelected,
    onSelect,
}: ListItemProps) {
    return (
        <div
            onClick={() => onSelect(invitation.id)}
            className={`group px-3 pt-2 pb-4 border-b border-base-300 cursor-pointer hover:bg-base-100 transition-colors ${
                isSelected
                    ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10"
                    : "border-l-4 border-l-transparent"
            }`}
        >
            {/* Title + Status */}
            <div className="flex justify-between items-start gap-2">
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary">
                    {invitation.company_name_hint || "Company Invitation"}
                </h3>
                <span
                    className={`badge badge-xs ${getStatusBadgeClass(invitation.status)}`}
                >
                    {invitation.status}
                </span>
            </div>

            {/* Email + Code */}
            <div className="flex items-center justify-between text-xs text-base-content/60 mt-1">
                <div className="flex items-center gap-2 min-w-0">
                    {invitation.invited_email ? (
                        <span className="line-clamp-1">
                            {invitation.invited_email}
                        </span>
                    ) : (
                        <span className="text-base-content/40">No email</span>
                    )}
                </div>
                <code className="font-mono text-xs shrink-0 ml-2 bg-base-200 px-1.5 py-0.5 rounded">
                    {invitation.invite_code}
                </code>
            </div>

            {/* Date */}
            <div className="text-xs text-base-content/40 mt-1">
                {formatInvitationDate(invitation.created_at)}
            </div>
        </div>
    );
}
