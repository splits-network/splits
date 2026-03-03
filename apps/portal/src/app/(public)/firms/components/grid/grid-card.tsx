"use client";

import Link from "next/link";
import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

interface GridCardProps {
    firm: PublicFirm;
}

export function GridCard({ firm }: GridCardProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);
    const href = firm.slug ? `/firms/${firm.slug}` : "#";
    const hasPartnerSignal = firm.candidate_firm || firm.company_firm;

    const displayTagline =
        firm.tagline ||
        (firm.industries.length > 1
            ? `${firm.industries[0]} & ${firm.industries[1]} recruiting firm`
            : firm.industries.length === 1
              ? `${firm.industries[0]} recruiting firm`
              : null);

    const stats = [
        firm.team_size_range
            ? { label: "Team", value: firm.team_size_range.replace("-", "\u2013"), icon: "fa-duotone fa-regular fa-users" }
            : null,
        firm.founded_year
            ? { label: "Est.", value: String(firm.founded_year), icon: "fa-duotone fa-regular fa-calendar" }
            : null,
        firm.show_member_count && firm.active_member_count != null
            ? { label: "Active", value: String(firm.active_member_count), icon: "fa-duotone fa-regular fa-user-check" }
            : null,
        firm.placement_types.length > 0
            ? { label: "Types", value: String(firm.placement_types.length), icon: "fa-duotone fa-regular fa-briefcase" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <Link
            href={href}
            className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full block hover:shadow-lg transition-shadow"
        >
            <CardHeader
                firm={firm}
                initials={initials}
                location={location}
            />
            <CardBody
                firm={firm}
                displayTagline={displayTagline}
                stats={stats}
                hasPartnerSignal={hasPartnerSignal}
            />
        </Link>
    );
}

function CardHeader({
    firm,
    initials,
    location,
}: {
    firm: PublicFirm;
    initials: string;
    location: string | null;
}) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;

    return (
        <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
            {/* Kicker row: industries + location */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                    {firm.industries.slice(0, 2).join(" \u00B7 ")}
                </p>
                {location && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content/40">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {location}
                    </span>
                )}
            </div>

            {/* Logo + Name block */}
            <div className="flex items-end gap-4">
                <div className="relative shrink-0">
                    {firm.logo_url ? (
                        <img
                            src={firm.logo_url}
                            alt={`${firm.name} logo`}
                            className="w-16 h-16 object-contain bg-base-100"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {initials}
                        </div>
                    )}
                    {firmLevel && (
                        <div className="absolute -bottom-1 -right-1">
                            <LevelBadge level={firmLevel} size="sm" />
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                        Recruiting Firm
                    </p>
                    <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                        {firm.name}
                    </h2>
                </div>
            </div>

            {/* Founded + team size */}
            <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                {firm.founded_year && (
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        Est. {firm.founded_year}
                    </span>
                )}
                {firm.team_size_range && (
                    <>
                        <span className="text-base-content/20">|</span>
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-users text-xs" />
                            {firm.team_size_range.replace("-", "\u2013")} recruiters
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}

function CardBody({
    firm,
    displayTagline,
    stats,
    hasPartnerSignal,
}: {
    firm: PublicFirm;
    displayTagline: string | null;
    stats: { label: string; value: string; icon: string }[];
    hasPartnerSignal: boolean;
}) {
    return (
        <>
            {/* Tagline */}
            {displayTagline && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {displayTagline}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            {stats.length > 0 && (
                <div className="border-b border-base-300">
                    <div
                        className="grid divide-x divide-base-300"
                        style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                    >
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                                    <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <i className={`${stat.icon} text-xs`} />
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-base-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Specialties */}
            {firm.specialties.length > 0 && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Specialties
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {firm.specialties.slice(0, 4).map((spec) => (
                            <span
                                key={spec}
                                className="px-2.5 py-1 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Partnership Badges */}
            {hasPartnerSignal && (
                <div className="px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Partnership
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.candidate_firm && (
                            <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-content">
                                <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                Candidate Partners
                            </span>
                        )}
                        {firm.company_firm && (
                            <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-content">
                                <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                Company Partners
                            </span>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
