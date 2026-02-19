"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    formatDate,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
    isRecent,
} from "../../types";
import type { AccentClasses } from "../shared/accent";
import { statusVariant } from "../shared/accent";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    invitation,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    invitation: RecruiterCompanyRelationship;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { isCompanyUser } = useUserProfile();
    const ac = accent;
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);
    const counterpartyLogo = isCompanyUser ? undefined : invitation.company?.logo_url;

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

            <div className="card-body">
                {isRecent(invitation) && invitation.status === "pending" && (
                    <Badge color="yellow" className="mb-2" size="sm">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {counterpartyName}
                </h3>
                {counterpartySubtext && (
                    <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                        {counterpartySubtext}
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold capitalize text-dark/70">
                        <i className="fa-duotone fa-regular fa-tag mr-1" />
                        {invitation.relationship_type}
                    </span>
                    <Badge color={statusVariant(invitation.status)}>
                        {getStatusLabel(invitation.status)}
                    </Badge>
                </div>

                {/* Permissions row */}
                <div className="flex flex-wrap gap-1">
                    {invitation.can_manage_company_jobs && (
                        <Badge color="teal" variant="outline">
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            Can Manage Jobs
                        </Badge>
                    )}
                </div>
            </div>
            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                {/* Counterparty footer */}
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    {counterpartyLogo ? (
                        <img
                            src={counterpartyLogo}
                            alt={counterpartyName}
                            className={`w-10 h-10 shrink-0 object-contain bg-cream border-2 ${ac.border} p-1`}
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                        >
                            {getInitials(counterpartyName)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">
                            {formatDate(invitation.created_at)}
                        </div>
                    </div>
                </div>
                <div className="mt-2 shrink-0">
                    <ConnectionActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            accept: true,
                            decline: true,
                            terminate: true,
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}
