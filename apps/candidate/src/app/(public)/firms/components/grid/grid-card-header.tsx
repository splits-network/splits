"use client";

import type { PublicFirm } from "../../types";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

interface GridCardHeaderProps {
    firm: PublicFirm;
    location: string | null;
    initials: string;
}

export function GridCardHeader({ firm, location, initials }: GridCardHeaderProps) {
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
                    <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
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
                        {firm.founded_year && <span className="text-base-content/20">|</span>}
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
