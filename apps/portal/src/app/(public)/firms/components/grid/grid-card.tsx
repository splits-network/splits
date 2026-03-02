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

    return (
        <Link
            href={href}
            className="firm-card group flex flex-col bg-base-100 border-2 border-base-300 p-6 transition-all shadow-sm hover:shadow-md hover:border-primary/30"
            style={{ borderRadius: 0 }}
        >
            {/* Logo + Name */}
            <div className="flex items-start gap-3 mb-3">
                {firm.logo_url ? (
                    <img
                        src={firm.logo_url}
                        alt={firm.name}
                        className="w-12 h-12 object-cover flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    />
                ) : (
                    <div
                        className="w-12 h-12 bg-primary text-primary-content flex items-center justify-center font-bold flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    >
                        {initials}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-lg font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                        {firm.name}
                    </h3>
                </div>
            </div>

            {/* Tagline */}
            {firm.tagline && (
                <p className="text-sm text-base-content/60 mb-3 line-clamp-2">
                    {firm.tagline}
                </p>
            )}

            {/* Location */}
            {location && (
                <div className="flex items-center gap-1 text-sm text-base-content/40 mb-3">
                    <i className="fa-duotone fa-regular fa-location-dot" />
                    {location}
                </div>
            )}

            {/* Industries */}
            {firm.industries.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {firm.industries.slice(0, 2).map((industry) => (
                        <span
                            key={industry}
                            className="px-2 py-0.5 bg-base-200 text-base-content/60 text-sm"
                            style={{ borderRadius: 0 }}
                        >
                            {industry}
                        </span>
                    ))}
                </div>
            )}

            {/* Partnership badges */}
            <div className="flex flex-wrap gap-1 mt-auto pt-3 border-t border-base-200">
                {firm.seeking_split_partners && (
                    <span
                        className="px-2 py-0.5 bg-accent/15 text-accent text-sm font-semibold"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-handshake mr-1" />
                        Seeking Partners
                    </span>
                )}
                {firm.accepts_candidate_submissions && (
                    <span
                        className="px-2 py-0.5 bg-secondary/15 text-secondary text-sm font-semibold"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                        Accepts Candidates
                    </span>
                )}
            </div>
        </Link>
    );
}
