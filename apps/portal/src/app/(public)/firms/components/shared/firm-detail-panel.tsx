"use client";

import Link from "next/link";
import type { PublicFirm } from "../../types";
import { firmLocation, firmInitials } from "../../types";

interface FirmDetailPanelProps {
    firm: PublicFirm;
    onClose: () => void;
}

export function FirmDetailPanel({ firm, onClose }: FirmDetailPanelProps) {
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);

    return (
        <div className="p-6">
            {/* Close button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-xmark text-lg" />
                </button>
            </div>

            {/* Logo + Name */}
            <div className="flex items-start gap-4 mb-6">
                {firm.logo_url ? (
                    <img
                        src={firm.logo_url}
                        alt={firm.name}
                        className="w-16 h-16 object-cover flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    />
                ) : (
                    <div
                        className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-bold flex-shrink-0"
                        style={{ borderRadius: 0 }}
                    >
                        {initials}
                    </div>
                )}
                <div className="min-w-0">
                    <h2 className="text-xl font-black tracking-tight mb-1">
                        {firm.name}
                    </h2>
                    {firm.tagline && (
                        <p className="text-sm text-base-content/60">{firm.tagline}</p>
                    )}
                    {location && (
                        <p className="text-sm text-base-content/40 mt-1">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {location}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            {firm.description && (
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                        About
                    </h3>
                    <p className="text-sm text-base-content/70 leading-relaxed">
                        {firm.description}
                    </p>
                </div>
            )}

            {/* Industries */}
            {firm.industries.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                        Industries
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {firm.industries.map((industry) => (
                            <span
                                key={industry}
                                className="px-2 py-0.5 bg-base-200 text-base-content/60 text-sm"
                                style={{ borderRadius: 0 }}
                            >
                                {industry}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Specialties */}
            {firm.specialties.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-base-content/40 mb-2">
                        Specialties
                    </h3>
                    <div className="flex flex-wrap gap-1">
                        {firm.specialties.map((specialty) => (
                            <span
                                key={specialty}
                                className="px-2 py-0.5 bg-base-200 text-base-content/60 text-sm"
                                style={{ borderRadius: 0 }}
                            >
                                {specialty}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Partnership badges */}
            <div className="flex flex-wrap gap-2 mb-6">
                {firm.seeking_split_partners && (
                    <span
                        className="px-3 py-1 bg-accent/15 text-accent text-sm font-semibold"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-handshake mr-1" />
                        Seeking Split Partners
                    </span>
                )}
                {firm.accepts_candidate_submissions && (
                    <span
                        className="px-3 py-1 bg-secondary/15 text-secondary text-sm font-semibold"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-paper-plane mr-1" />
                        Accepts Candidate Submissions
                    </span>
                )}
            </div>

            {/* Team size + founded */}
            <div className="flex flex-wrap gap-6 mb-6 text-sm text-base-content/60">
                {firm.team_size_range && (
                    <div>
                        <span className="font-bold text-base-content/40 uppercase tracking-wider text-xs">
                            Team Size
                        </span>
                        <div className="font-semibold">{firm.team_size_range}</div>
                    </div>
                )}
                {firm.founded_year && (
                    <div>
                        <span className="font-bold text-base-content/40 uppercase tracking-wider text-xs">
                            Founded
                        </span>
                        <div className="font-semibold">{firm.founded_year}</div>
                    </div>
                )}
                {firm.show_member_count && firm.active_member_count != null && (
                    <div>
                        <span className="font-bold text-base-content/40 uppercase tracking-wider text-xs">
                            Members
                        </span>
                        <div className="font-semibold">
                            {firm.active_member_count}
                        </div>
                    </div>
                )}
            </div>

            {/* View Full Profile link */}
            <Link
                href={`/firms/${firm.slug}`}
                className="btn btn-primary btn-block"
                style={{ borderRadius: 0 }}
            >
                View Full Profile
                <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
            </Link>
        </div>
    );
}
