"use client";

import Link from "next/link";
import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";

interface GridCardProps {
    firm: PublicFirm;
}

export function GridCard({ firm }: GridCardProps) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);
    const href = firm.slug ? `/firms/${firm.slug}` : "#";

    const displayTagline =
        firm.tagline ||
        (firm.industries.length > 1
            ? `${firm.industries[0]} & ${firm.industries[1]} recruiting firm`
            : firm.industries.length === 1
              ? `${firm.industries[0]} recruiting firm`
              : null);

    // Inline metadata
    const metaItems: { icon: string; color: string; value: string; muted: boolean; tooltip: string }[] = [
        { icon: "fa-users", color: "text-primary", value: firm.team_size_range ? `${firm.team_size_range.replace("-", "\u2013")} recruiters` : "\u2014", muted: !firm.team_size_range, tooltip: "Team size" },
        { icon: "fa-calendar", color: "text-accent", value: firm.founded_year ? `Est. ${firm.founded_year}` : "\u2014", muted: !firm.founded_year, tooltip: "Founded" },
        ...(firm.show_member_count && firm.active_member_count != null ? [{ icon: "fa-user-check", color: "text-secondary", value: `${firm.active_member_count} active`, muted: false, tooltip: "Active members" }] : []),
    ];

    return (
        <Link
            href={href}
            className="group bg-base-100 border border-base-300 border-l-4 border-l-primary w-full flex flex-col transition-colors hover:border-base-content/20"
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                {/* Logo + Name block */}
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
                            {firm.industries[0] || "Recruiting Firm"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {firm.name}
                        </h3>
                        <p className={`text-sm truncate mt-0.5 ${location ? "text-base-content/50" : "text-base-content/30"}`}>
                            {location || "Location not specified"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Inline metadata: team · founded · active */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span key={i} className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`} data-tip={item.tooltip}>
                        <i className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`} />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {displayTagline ? (
                    <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        {displayTagline}
                    </p>
                ) : (
                    <p className="text-sm text-base-content/30">No description provided</p>
                )}
            </div>

            {/* Badge row: emphasis (soft-outline) + default (soft) */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
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
                    {firm.specialties.slice(0, 3).map((spec) => (
                        <BaselBadge key={spec} variant="soft" color="neutral" size="sm">
                            {spec}
                        </BaselBadge>
                    ))}
                    {firm.specialties.length > 3 && (
                        <span className="text-sm font-semibold text-base-content/40 self-center">
                            +{firm.specialties.length - 3} more
                        </span>
                    )}
                    {firm.industries.slice(0, 2).map((ind) => (
                        <BaselBadge key={ind} variant="soft" color="neutral" size="sm">
                            {ind}
                        </BaselBadge>
                    ))}
                    {!firm.candidate_firm && !firm.company_firm && firm.specialties.length === 0 && firm.industries.length === 0 && (
                        <span className="text-sm text-base-content/30">No details listed</span>
                    )}
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="px-5 py-3 border-t border-base-300">
                <span className="text-sm font-semibold text-primary group-hover:text-primary/70 transition-colors flex items-center gap-1">
                    Submit a Candidate
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                </span>
            </div>
        </Link>
    );
}
