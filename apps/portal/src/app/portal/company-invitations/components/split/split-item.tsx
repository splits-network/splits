"use client";

import { Badge } from "@splits-network/memphis-ui";
import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
    isRecent,
    timeAgo,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";

export function SplitItem({
    invitation,
    accent,
    isSelected,
    onSelect,
}: {
    invitation: RecruiterCompanyRelationship;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const ac = accent;
    const { isCompanyUser } = useUserProfile();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                isSelected
                    ? `${ac.bgLight} ${ac.border}`
                    : "bg-white border-transparent"
            }`}
        >
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                    {isRecent(invitation) && invitation.status === "pending" && (
                        <i className="fa-duotone fa-regular fa-sparkles text-sm flex-shrink-0 text-yellow" />
                    )}
                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                        {counterpartyName}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                    {timeAgo(invitation.created_at)}
                </span>
            </div>
            {counterpartySubtext && (
                <div className={`text-sm font-bold mb-1 ${ac.text}`}>
                    {counterpartySubtext}
                </div>
            )}
            <div className="flex items-center justify-between">
                <span className="text-sm text-dark/50 capitalize">
                    <i className="fa-duotone fa-regular fa-tag mr-1" />
                    {invitation.relationship_type}
                </span>
                <Badge color={statusVariant(invitation.status)}>
                    {getStatusLabel(invitation.status)}
                </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
                {invitation.can_manage_company_jobs && (
                    <span className="text-sm font-bold text-teal">
                        <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                        Can Manage Jobs
                    </span>
                )}
            </div>
        </div>
    );
}
