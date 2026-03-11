"use client";

import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
} from "../../types";
import { statusColorName } from "../shared/status-color";
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
            className={`relative cursor-pointer px-6 py-4 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: name + posted time */}
            <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(invitation) && invitation.status === "pending" && (
                        <i className="fa-duotone fa-regular fa-star text-primary text-xs flex-shrink-0" />
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
            {counterpartySubtext && (
                <div className="text-sm font-semibold text-base-content/60 mb-1 truncate">
                    {counterpartySubtext}
                </div>
            )}

            {/* Row 3: type + status pill */}
            <div className="flex items-center justify-between gap-2 mb-1">
                <div className="text-sm text-base-content/50 capitalize truncate">
                    <i className="fa-duotone fa-regular fa-tag mr-1" />
                    {invitation.relationship_type}
                </div>
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
