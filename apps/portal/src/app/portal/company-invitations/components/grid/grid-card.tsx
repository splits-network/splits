"use client";

import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
} from "../../types";
import { statusColor } from "../shared/status-color";
import { isNew, postedAgo } from "../shared/helpers";
import ConnectionActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
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
    const counterpartyLogo = isCompanyUser ? undefined : invitation.company?.logo_url;

    return (
        <div
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border-2 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30",
                isSelected ? "border-primary border-l-4" : "border-base-200",
            ].join(" ")}
        >
            {/* Top row: status pill + NEW badge */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span
                    className={`text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 ${statusColor(invitation.status)}`}
                >
                    {getStatusLabel(invitation.status)}
                </span>

                {isNew(invitation) && invitation.status === "pending" && (
                    <span className="text-[10px] uppercase tracking-wider bg-warning/15 text-warning px-2 py-1">
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </span>
                )}
            </div>

            {/* Name */}
            <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors mb-1">
                {counterpartyName}
            </h3>

            {/* Subtext */}
            {counterpartySubtext && (
                <div className="text-sm font-semibold text-base-content/60 mb-2">
                    {counterpartySubtext}
                </div>
            )}

            {/* Relationship type */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-bold text-accent capitalize">
                    <i className="fa-duotone fa-regular fa-tag mr-1" />
                    {invitation.relationship_type}
                </span>
                {invitation.can_manage_company_jobs && (
                    <span className="text-sm font-bold text-success">
                        <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                        Jobs
                    </span>
                )}
            </div>

            {/* Footer: logo/initials left, actions right */}
            <div className="mt-auto flex items-center justify-between gap-3 pt-4 border-t border-base-200">
                <div className="flex items-center gap-2 min-w-0">
                    {counterpartyLogo ? (
                        <img
                            src={counterpartyLogo}
                            alt={counterpartyName}
                            className="w-9 h-9 shrink-0 object-contain bg-base-200 border border-base-300 p-1"
                        />
                    ) : (
                        <div className="w-9 h-9 shrink-0 flex items-center justify-center bg-base-200 border border-base-300 text-xs font-bold text-base-content/60">
                            {getInitials(counterpartyName)}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-base-content truncate">
                            {counterpartyName}
                        </div>
                        <div className="text-xs text-base-content/40 truncate">
                            {postedAgo(invitation)}
                        </div>
                    </div>
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <ConnectionActionsToolbar
                        invitation={invitation}
                        variant="icon-only"
                        size="xs"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>
        </div>
    );
}
