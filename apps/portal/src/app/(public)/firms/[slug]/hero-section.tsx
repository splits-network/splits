"use client";

import Link from "next/link";
import type { PublicFirm, FirmPlacementStats } from "../types";
import { firmLocation, firmInitials } from "../types";

interface HeroSectionProps {
    firm: PublicFirm;
    placementStats?: FirmPlacementStats | null;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function HeroSection({ firm, placementStats }: HeroSectionProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);

    const stats = [
        firm.team_size_range
            ? { label: "Team Size", value: firm.team_size_range.replace("-", "\u2013"), icon: "fa-duotone fa-regular fa-users" }
            : null,
        firm.show_member_count && firm.active_member_count != null
            ? { label: "Active", value: String(firm.active_member_count), icon: "fa-duotone fa-regular fa-user-check" }
            : null,
        firm.founded_year
            ? { label: "Founded", value: String(firm.founded_year), icon: "fa-duotone fa-regular fa-calendar" }
            : null,
        firm.placement_types.length > 0
            ? { label: "Placement Types", value: String(firm.placement_types.length), icon: "fa-duotone fa-regular fa-briefcase" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
            {/* Diagonal clip-path accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            <div className="relative px-8 pt-10 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40">
                        {firm.industries.join(" \u00B7 ")}
                    </p>
                    <div className="flex items-center gap-4">
                        {firm.candidate_firm && (
                            <span className="firm-meta opacity-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                                <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                Candidate Partners
                            </span>
                        )}
                        {firm.company_firm && (
                            <span className="firm-meta opacity-0 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
                                <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                Company Partners
                            </span>
                        )}
                    </div>
                </div>

                {/* Logo + Identity */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                    <div className="flex items-end gap-5 flex-1">
                        <div className="firm-avatar opacity-0 shrink-0">
                            {firm.logo_url ? (
                                <img
                                    src={firm.logo_url}
                                    alt={`${firm.name} logo`}
                                    className="w-20 h-20 lg:w-24 lg:h-24 object-contain bg-base-100"
                                />
                            ) : (
                                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-black tracking-tight select-none">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1">
                                Recruiting Firm
                            </p>
                            <h1 className="firm-name opacity-0 text-4xl lg:text-5xl font-black tracking-tight leading-none text-neutral-content mb-3">
                                {firm.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-content/40">
                                {location && (
                                    <span className="firm-meta opacity-0 flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                        {location}
                                    </span>
                                )}
                                {firm.founded_year && (
                                    <>
                                        <span className="text-neutral-content/20">|</span>
                                        <span className="firm-meta opacity-0 flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                            Est. {firm.founded_year}
                                        </span>
                                    </>
                                )}
                                {firm.website_url && (
                                    <>
                                        <span className="text-neutral-content/20">|</span>
                                        <span className="firm-meta opacity-0 flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-globe text-xs" />
                                            {extractDomain(firm.website_url)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div className="flex flex-wrap gap-2 pb-1 shrink-0">
                        <Link
                            href="/sign-up"
                            className="firm-action opacity-0 btn btn-primary btn-sm font-bold uppercase tracking-wider"
                        >
                            <i className="fa-duotone fa-regular fa-handshake" />
                            Request Partnership
                        </Link>
                        {firm.website_url && (
                            <a
                                href={firm.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="firm-action opacity-0 btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Website
                            </a>
                        )}
                        <button className="firm-action opacity-0 btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                {stats.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-8">
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div key={stat.label} className="stat-block opacity-0 flex items-center gap-3 px-4 py-4">
                                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <i className={`${stat.icon} text-base`} />
                                    </div>
                                    <div>
                                        <span className="text-xl font-black text-neutral-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
}
