"use client";

import { useUserProfile } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import {
    getStatusLabel,
    getCounterpartyName,
    getCounterpartySubtext,
    getInitials,
    formatDate,
    RELATIONSHIP_TYPE_LABELS,
} from "../../types";
import { statusColorName, statusBorder } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import { isNew, postedAgo } from "../shared/helpers";
import ConnectionActionsToolbar from "../shared/actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

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
    const { isCompanyUser, profile } = useUserProfile();
    const { getLevel } = useGamification();
    const counterpartyName = getCounterpartyName(invitation, isCompanyUser);
    const counterpartySubtext = getCounterpartySubtext(invitation, isCompanyUser);
    const counterpartyLogo = isCompanyUser
        ? undefined
        : invitation.company?.logo_url;
    const companyLevel = !isCompanyUser && invitation.company?.id
        ? getLevel(invitation.company.id)
        : undefined;

    const isOutgoing = invitation.invited_by === profile?.id;
    const directionLabel = isOutgoing ? "Sent" : "Received";

    // Metadata items — always show all, muted when empty
    const metaItems: { icon: string; value: string; muted: boolean; tooltip: string }[] = [
        {
            icon: "fa-calendar",
            value: postedAgo(invitation) || "Unknown",
            muted: !invitation.created_at,
            tooltip: `${directionLabel} ${invitation.created_at ? formatDate(invitation.created_at) : "unknown date"}`,
        },
        {
            icon: invitation.status === "active" ? "fa-link" : "fa-hourglass-half",
            value: invitation.relationship_start_date
                ? `Since ${formatDate(invitation.relationship_start_date)}`
                : invitation.status === "pending" ? "Awaiting response" : "\u2014",
            muted: !invitation.relationship_start_date,
            tooltip: invitation.relationship_start_date ? "Connection start date" : "Not yet connected",
        },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary"
                    : `${statusBorder(invitation.status)} hover:border-base-content/20`,
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Editorial block: Avatar + Role kicker → Name → Subtext */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                        {counterpartyLogo ? (
                            <img
                                src={counterpartyLogo}
                                alt={counterpartyName}
                                className="w-12 h-12 object-contain bg-base-200 border border-base-300 p-0.5"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none">
                                {getInitials(counterpartyName)}
                            </div>
                        )}
                        {companyLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={companyLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {RELATIONSHIP_TYPE_LABELS[invitation.relationship_type] || invitation.relationship_type}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {counterpartyName}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${counterpartySubtext ? "text-base-content/50" : "text-base-content/30"}`}>
                            {counterpartySubtext || "No details"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Inline metadata strip */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                {metaItems.map((item, i) => (
                    <span
                        key={i}
                        className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`}
                        data-tip={item.tooltip}
                    >
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : "text-base-content/40"} text-sm`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {invitation.status === "terminated" && invitation.termination_reason ? (
                    <p className="text-sm text-error/70 leading-relaxed line-clamp-2">
                        {invitation.termination_reason}
                    </p>
                ) : invitation.status === "declined" ? (
                    <p className="text-sm text-base-content/30">Request was declined</p>
                ) : invitation.status === "active" ? (
                    <p className="text-sm text-base-content/60">Connection is active</p>
                ) : (
                    <p className="text-sm text-base-content/30">Awaiting response</p>
                )}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge color={statusColorName(invitation.status)} variant="soft-outline" size="sm">
                        {getStatusLabel(invitation.status)}
                    </BaselBadge>
                    {isNew(invitation) && invitation.status === "pending" && (
                        <BaselBadge color="warning" variant="soft-outline" size="sm" icon="fa-sparkles">
                            New
                        </BaselBadge>
                    )}
                    <BaselBadge color="neutral" variant="soft" size="sm" icon={isOutgoing ? "fa-arrow-up-right" : "fa-arrow-down-left"}>
                        {directionLabel}
                    </BaselBadge>
                </div>
            </div>

            {/* Footer: date + actions */}
            <div
                className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="text-sm text-base-content/40">
                    {invitation.created_at ? formatDate(invitation.created_at) : "Unknown date"}
                </span>
                <ConnectionActionsToolbar
                    invitation={invitation}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                />
            </div>
        </article>
    );
}
