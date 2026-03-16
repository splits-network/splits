"use client";

import type { Firm } from "../../types";
import { PLACEMENT_TYPE_LABELS } from "../../types";
import { firmStatusBadgeColor } from "../shared/status-color";
import {
    formatStatus,
    firmInitials,
    teamSizeDisplay,
    foundedYearDisplay,
} from "../shared/helpers";
import { FirmActionsToolbar } from "../shared/actions-toolbar";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";

export function GridCard({
    firm,
    isSelected,
    onSelect,
    onRefresh,
}: {
    firm: Firm;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;
    const initials = firmInitials(firm.name);
    const location =
        [firm.headquarters_city, firm.headquarters_state]
            .filter(Boolean)
            .join(", ") || null;
    const foundedYear = foundedYearDisplay(firm.founded_year);

    const specialties = firm.specialties || [];
    const industries = firm.industries || [];
    const placementTypes = firm.placement_types || [];

    // Inline metadata — always show all 4, muted when empty
    const metaItems = [
        { icon: "fa-users", color: "text-primary", value: `${firm.active_member_count || 0} members`, muted: !firm.active_member_count, tooltip: "Active members" },
        { icon: "fa-user-group", color: "text-secondary", value: teamSizeDisplay(firm.team_size_range), muted: !firm.team_size_range, tooltip: "Team size range" },
        { icon: "fa-briefcase", color: "text-accent", value: `${firm.member_count || 0} total`, muted: !firm.member_count, tooltip: "Total members (including inactive)" },
        { icon: "fa-store", color: "text-success", value: firm.marketplace_visible ? "Listed" : "Unlisted", muted: !firm.marketplace_visible, tooltip: "Marketplace visibility" },
    ];

    return (
        <article
            onClick={onSelect}
            className={[
                "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-colors",
                isSelected
                    ? "border-primary border-l-primary bg-primary/5"
                    : "border-l-primary hover:border-base-content/20",
            ].join(" ")}
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Editorial block: Avatar + Industry kicker → Name */}
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0 mt-0.5">
                        {firm.logo_url ? (
                            <img
                                src={firm.logo_url}
                                alt={`${firm.name} logo`}
                                className="w-12 h-12 object-contain bg-base-100"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center text-sm font-black tracking-tight select-none">
                                {initials}
                            </div>
                        )}
                        {firmLevel && (
                            <div className="absolute -bottom-1 -right-1">
                                <LevelBadge level={firmLevel} size="sm" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {industries[0] || "Recruiting Firm"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {firm.name}
                        </h3>
                    </div>
                </div>

                {/* Location + founded context row */}
                <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/50">
                    <span className={`flex items-center gap-1.5 truncate ${location ? "" : "text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-location-dot text-xs text-secondary" />
                        {location || "No location specified"}
                    </span>
                    {foundedYear && (
                        <>
                            <span className="text-base-content/20">|</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                                <i className="fa-duotone fa-regular fa-calendar text-xs text-accent" />
                                {foundedYear}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Inline metadata: members · team size · founded · marketplace */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* Tagline snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {firm.tagline ? (
                    <div className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={firm.tagline} />
                    </div>
                ) : (
                    <p className="text-sm text-base-content/30">No description provided</p>
                )}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    <BaselBadge
                        color={firmStatusBadgeColor(firm.status)}
                        variant="soft-outline"
                        size="sm"
                    >
                        {formatStatus(firm.status)}
                    </BaselBadge>
                    {firm.marketplace_visible && (
                        <BaselBadge color="success" variant="soft-outline" size="sm" icon="fa-store">
                            Listed
                        </BaselBadge>
                    )}
                    {firm.candidate_firm && (
                        <BaselBadge color="primary" variant="soft-outline" size="sm" icon="fa-handshake">
                            Split Partners
                        </BaselBadge>
                    )}
                    {firm.company_firm && (
                        <BaselBadge color="secondary" variant="soft-outline" size="sm" icon="fa-building">
                            Direct Hire
                        </BaselBadge>
                    )}
                    {specialties.slice(0, 3).map((spec) => (
                        <BaselBadge key={spec} variant="soft" color="neutral" size="sm">
                            {spec}
                        </BaselBadge>
                    ))}
                    {specialties.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{specialties.length - 3} more
                        </span>
                    )}
                    {industries.slice(0, 2).map((ind) => (
                        <BaselBadge key={ind} variant="soft" color="neutral" size="sm">
                            {ind}
                        </BaselBadge>
                    ))}
                    {industries.length > 2 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{industries.length - 2}
                        </span>
                    )}
                    {placementTypes.slice(0, 2).map((pt) => (
                        <BaselBadge key={pt} variant="soft" color="neutral" size="sm">
                            {PLACEMENT_TYPE_LABELS[pt] || pt}
                        </BaselBadge>
                    ))}
                    {!firm.candidate_firm && !firm.company_firm && specialties.length === 0 && industries.length === 0 && placementTypes.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Footer: profile link + actions */}
            <div
                className="flex items-center justify-between gap-3 px-5 py-3 border-t border-base-300"
                onClick={(e) => e.stopPropagation()}
            >
                {firm.slug ? (
                    <a
                        href={`/firms/${firm.slug}`}
                        className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                    >
                        View Profile
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-xs" />
                    </a>
                ) : (
                    <button
                        onClick={onSelect}
                        className="text-sm font-semibold text-primary hover:text-primary/70 transition-colors flex items-center gap-1"
                    >
                        View Details
                        <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                    </button>
                )}
                <FirmActionsToolbar
                    firm={firm}
                    variant="icon-only"
                    size="sm"
                    onRefresh={onRefresh}
                    showActions={{
                        inviteMember: false,
                    }}
                />
            </div>
        </article>
    );
}
