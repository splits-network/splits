"use client";

import Link from "next/link";
import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";

interface GridCardProps {
    firm: PublicFirm;
}

export function GridCard({ firm }: GridCardProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);
    const href = firm.slug ? `/firms/${firm.slug}` : "#";

    const hasPartnerSignal =
        firm.seeking_split_partners || firm.accepts_candidate_submissions;

    // Tagline fallback — construct from industries when no tagline exists
    const displayTagline =
        firm.tagline ||
        (firm.industries.length > 1
            ? `${firm.industries[0]} & ${firm.industries[1]} recruiting firm`
            : firm.industries.length === 1
              ? `${firm.industries[0]} recruiting firm`
              : null);

    const capabilityItems = [
        firm.team_size_range
            ? { label: "Team", value: `${firm.team_size_range.replace("-", "\u2013")} recruiters` }
            : null,
        firm.founded_year
            ? { label: "Est.", value: String(firm.founded_year) }
            : null,
        firm.show_member_count && firm.active_member_count != null
            ? { label: "Active", value: `${firm.active_member_count} ${firm.active_member_count === 1 ? "recruiter" : "recruiters"}` }
            : null,
    ].filter(Boolean) as { label: string; value: string }[];

    return (
        <Link
            href={href}
            className="firm-card group flex flex-col bg-base-100 border border-base-300 border-t-4 border-t-primary transition-all hover:border-primary/40 hover:shadow-lg"
        >
            {/* Banner / Identity Header */}
            {firm.banner_url ? (
                <BannerHeader
                    bannerUrl={firm.banner_url}
                    logoUrl={firm.logo_url}
                    initials={initials}
                    name={firm.name}
                    location={location}
                />
            ) : (
                <IdentityHeader
                    logoUrl={firm.logo_url}
                    initials={initials}
                    name={firm.name}
                    location={location}
                />
            )}

            {/* Body */}
            <div className="flex flex-col flex-1 px-5 pb-5">
                {/* Partnership signals — prominent, above the fold */}
                {hasPartnerSignal && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {firm.seeking_split_partners && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-accent-content text-sm font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-handshake" />
                                Open to Splits
                            </span>
                        )}
                        {firm.accepts_candidate_submissions && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary text-secondary-content text-sm font-bold uppercase tracking-wider">
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Taking Submissions
                            </span>
                        )}
                    </div>
                )}

                {/* Tagline or fallback descriptor */}
                {displayTagline && (
                    <p className="text-sm text-base-content/60 leading-snug line-clamp-2 mb-4">
                        {displayTagline}
                    </p>
                )}

                {/* Industries — only when tagline is real (fallback already uses industries) */}
                {firm.tagline && firm.industries.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {firm.industries.slice(0, 3).map((industry) => (
                            <span
                                key={industry}
                                className="px-2 py-0.5 bg-base-200 text-base-content/50 text-sm font-semibold uppercase tracking-wider"
                            >
                                {industry}
                            </span>
                        ))}
                    </div>
                )}

                {/* Specialties */}
                {firm.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {firm.specialties.slice(0, 2).map((specialty) => (
                            <span
                                key={specialty}
                                className="px-2 py-0.5 bg-primary/8 text-primary text-sm font-semibold"
                            >
                                {specialty}
                            </span>
                        ))}
                    </div>
                )}

                {/* Capability strip — stat micro-grid */}
                {capabilityItems.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-base-200">
                        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${capabilityItems.length}, 1fr)` }}>
                            {capabilityItems.map((item) => (
                                <div key={item.label} className="flex flex-col gap-0.5">
                                    <span className="text-sm font-black text-base-content">
                                        {item.value}
                                    </span>
                                    <span className="text-sm uppercase tracking-wider text-base-content/40">
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hover CTA — appears at bottom on hover */}
                <div className="mt-auto pt-3 text-sm font-semibold tracking-wider uppercase text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View firm profile <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </div>
            </div>
        </Link>
    );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function BannerHeader({
    bannerUrl,
    logoUrl,
    initials,
    name,
    location,
}: {
    bannerUrl: string;
    logoUrl?: string | null;
    initials: string;
    name: string;
    location: string | null;
}) {
    return (
        <div className="relative mb-3">
            <div className="h-24 overflow-hidden bg-base-200">
                <img
                    src={bannerUrl}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="px-5">
                <div className="relative -mt-5 mb-3 inline-flex">
                    <LogoOrInitials logoUrl={logoUrl} initials={initials} name={name} size="md" />
                </div>
                <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {name}
                </h3>
                {location && (
                    <div className="flex items-center gap-1.5 mt-1 text-sm text-base-content/40">
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        {location}
                    </div>
                )}
            </div>
        </div>
    );
}

function IdentityHeader({
    logoUrl,
    initials,
    name,
    location,
}: {
    logoUrl?: string | null;
    initials: string;
    name: string;
    location: string | null;
}) {
    return (
        <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3">
                <LogoOrInitials logoUrl={logoUrl} initials={initials} name={name} size="lg" />
                <div className="min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {name}
                    </h3>
                    {location && (
                        <div className="flex items-center gap-1.5 mt-1 text-sm text-base-content/40">
                            <i className="fa-duotone fa-regular fa-location-dot" />
                            {location}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function LogoOrInitials({
    logoUrl,
    initials,
    name,
    size,
}: {
    logoUrl?: string | null;
    initials: string;
    name: string;
    size: "md" | "lg";
}) {
    const dim = size === "lg" ? "w-14 h-14 text-lg" : "w-12 h-12 text-base";
    const border = size === "md" ? "border-2 border-base-100" : "";

    if (logoUrl) {
        return (
            <img
                src={logoUrl}
                alt={`${name} firm logo`}
                className={`${dim} ${border} object-cover flex-shrink-0 bg-base-200`}
            />
        );
    }

    return (
        <div
            className={`${dim} ${border} bg-primary text-primary-content flex items-center justify-center font-black flex-shrink-0`}
        >
            {initials}
        </div>
    );
}
