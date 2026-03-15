"use client";

import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
} from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import { isNew, postedAgo } from "../shared/helpers";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

export function SplitItem({
    invitation,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { isCompanyUser } = useUserProfile();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : `bg-base-100 ${statusBorder(invitation.status)}`
            }`}
        >
            {/* Row 1: name + posted time */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(invitation) && invitation.status === "pending" && (
                        <i className="fa-duotone fa-regular fa-sparkles text-warning text-sm flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {counterpartyName}
                    </h4>
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {postedAgo(invitation)}
                </span>
            </div>

            {/* Row 2: subtext */}
            <div className={`text-sm mt-0.5 truncate ${counterpartySubtext ? "text-base-content/60" : "text-base-content/30"}`}>
                {counterpartySubtext || "No details"}
            </div>

            {/* Row 3: type + status pill */}
            <div className="flex items-center justify-between gap-2 mt-0.5 pr-10">
                <span className="text-sm font-bold text-base-content/60 capitalize">
                    {invitation.relationship_type}
                </span>
                <BaselBadge color={statusColorName(invitation.status)} size="xs" variant="soft">
                    {getStatusLabel(invitation.status)}
                </BaselBadge>
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <ConnectionActionsToolbar
                    invitation={invitation}
                    variant="icon-only"
                    size="xs"
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
