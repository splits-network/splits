"use client";

import Link from "next/link";
import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";
import { GridCardHeader } from "./grid-card-header";
import { GridCardStats } from "./grid-card-stats";

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
            className="group bg-base-100 border border-base-300 border-l-4 border-l-primary w-full flex flex-col"
        >
            <GridCardHeader
                firm={firm}
                location={location}
                initials={initials}
            />

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
            <GridCardStats stats={stats} />

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
                <div className="px-6 py-5 border-b border-base-300">
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

            {/* Hover CTA */}
            <div className="mt-auto px-6 py-4 text-sm font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Submit a Candidate <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
            </div>
        </Link>
    );
}
