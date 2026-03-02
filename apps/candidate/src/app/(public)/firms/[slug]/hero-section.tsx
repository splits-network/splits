"use client";

import Link from "next/link";
import type { PublicFirm } from "../types";
import { firmLocation, firmInitials } from "../types";

interface HeroSectionProps {
    firm: PublicFirm;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function HeroSection({ firm }: HeroSectionProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);

    const stats = [
        { label: "Team Size", value: firm.team_size_range || "N/A" },
        ...(firm.show_member_count
            ? [{ label: "Members", value: String(firm.active_member_count ?? "N/A") }]
            : []),
        { label: "Founded", value: firm.founded_year ? String(firm.founded_year) : "N/A" },
        { label: "Placement Types", value: String(firm.placement_types.length) },
    ];

    return (
        <div className="bg-neutral text-neutral-content py-16 lg:py-20 relative overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Back link */}
                <Link
                    href="/firms"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-content/50 hover:text-neutral-content transition-colors mb-8"
                >
                    <i className="fa-duotone fa-regular fa-arrow-left" />
                    All Firms
                </Link>

                <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                    {/* Left: logo + info */}
                    <div className="flex items-start gap-6">
                        <div className="firm-avatar opacity-0 flex-shrink-0">
                            {firm.logo_url ? (
                                <img
                                    src={firm.logo_url}
                                    alt={`${firm.name} logo`}
                                    className="w-24 h-24 lg:w-28 lg:h-28 object-contain bg-base-100"
                                    style={{ borderRadius: 0 }}
                                />
                            ) : (
                                <div
                                    className="w-24 h-24 lg:w-28 lg:h-28 flex items-center justify-center bg-primary text-primary-content"
                                    style={{ borderRadius: 0 }}
                                >
                                    <span className="text-3xl font-black">{initials}</span>
                                </div>
                            )}
                        </div>

                        <div className="min-w-0">
                            <h1 className="firm-name opacity-0 text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                {firm.name}
                            </h1>
                            {firm.tagline && (
                                <p className="firm-meta opacity-0 text-sm font-semibold text-primary mt-2">
                                    {firm.tagline}
                                </p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                {location && (
                                    <span className="firm-meta opacity-0 text-sm text-neutral-content/50">
                                        <i className="fa-duotone fa-regular fa-location-dot mr-1 text-secondary" />
                                        {location}
                                    </span>
                                )}
                                {firm.founded_year && (
                                    <span className="firm-meta opacity-0 text-sm text-neutral-content/50">
                                        <i className="fa-duotone fa-regular fa-calendar mr-1 text-secondary" />
                                        Est. {firm.founded_year}
                                    </span>
                                )}
                                {firm.team_size_range && (
                                    <span className="firm-meta opacity-0 text-sm text-neutral-content/50">
                                        <i className="fa-duotone fa-regular fa-users mr-1 text-secondary" />
                                        {firm.team_size_range}
                                    </span>
                                )}
                                {firm.website_url && (
                                    <span className="firm-meta opacity-0 text-sm text-neutral-content/50">
                                        <i className="fa-duotone fa-regular fa-globe mr-1 text-secondary" />
                                        {extractDomain(firm.website_url)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: action buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {firm.website_url && (
                            <a
                                href={firm.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="firm-action opacity-0 btn btn-ghost text-neutral-content/60 hover:text-neutral-content gap-2"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Visit Website
                            </a>
                        )}
                        <Link
                            href="https://portal.splits.network/sign-up"
                            className="firm-action opacity-0 btn btn-primary gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-handshake" />
                            Partner With This Firm
                        </Link>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-neutral-content/10 mt-8">
                    {stats.map((stat, i) => (
                        <div
                            key={i}
                            className="stat-block bg-neutral-content/5 p-4 text-center opacity-0"
                        >
                            <p className="text-xl font-black">{stat.value}</p>
                            <p className="text-sm uppercase tracking-wider opacity-40 mt-1">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Diagonal accent */}
            <div
                className="absolute bottom-0 left-0 right-0 h-6 bg-base-100"
                style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
            />
        </div>
    );
}
