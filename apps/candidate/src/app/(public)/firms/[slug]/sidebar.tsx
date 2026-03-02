"use client";

import Link from "next/link";
import type { PublicFirm } from "../types";
import { firmLocation } from "../types";

interface SidebarProps {
    firm: PublicFirm;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function Sidebar({ firm }: SidebarProps) {
    const location = firmLocation(firm);

    return (
        <>
            {/* Partnership Status */}
            <div className="sidebar-card opacity-0 bg-base-200 border-t-4 border-primary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Partnership Status
                </h3>
                <div className="space-y-3 mb-6">
                    <span
                        className={`block w-fit px-3 py-1.5 text-sm font-bold ${
                            firm.seeking_split_partners
                                ? "bg-success/15 text-success"
                                : "text-base-content/40"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-handshake mr-2" />
                        {firm.seeking_split_partners
                            ? "Seeking Partners"
                            : "Not Seeking Partners"}
                    </span>
                    {firm.accepts_candidate_submissions && (
                        <span className="block w-fit px-3 py-1.5 text-sm font-bold bg-info/15 text-info">
                            <i className="fa-duotone fa-regular fa-user-plus mr-2" />
                            Accepts Candidate Submissions
                        </span>
                    )}
                </div>
                <Link
                    href="https://portal.splits.network/sign-up"
                    className="btn btn-primary btn-block gap-2"
                    style={{ borderRadius: 0 }}
                >
                    <i className="fa-duotone fa-regular fa-handshake" />
                    Start a Partnership
                </Link>
            </div>

            {/* Contact Info */}
            {firm.show_contact_info &&
                (firm.website_url || firm.linkedin_url || firm.contact_email) && (
                    <div className="sidebar-card opacity-0 bg-base-200 border-t-4 border-secondary p-6">
                        <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                            Contact
                        </h3>
                        <div className="space-y-3">
                            {firm.website_url && (
                                <a
                                    href={firm.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <div className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-globe text-xs" />
                                    </div>
                                    <span className="text-base-content/70 truncate">
                                        {extractDomain(firm.website_url)}
                                    </span>
                                </a>
                            )}
                            {firm.linkedin_url && (
                                <a
                                    href={firm.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <div className="w-7 h-7 flex items-center justify-center bg-info/10 text-info flex-shrink-0">
                                        <i className="fa-brands fa-linkedin text-xs" />
                                    </div>
                                    <span className="text-base-content/70 truncate">
                                        LinkedIn
                                    </span>
                                </a>
                            )}
                            {firm.contact_email && (
                                <a
                                    href={`mailto:${firm.contact_email}`}
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <div className="w-7 h-7 flex items-center justify-center bg-secondary/10 text-secondary flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-envelope text-xs" />
                                    </div>
                                    <span className="text-base-content/70 truncate">
                                        {firm.contact_email}
                                    </span>
                                </a>
                            )}
                            {firm.contact_phone && (
                                <a
                                    href={`tel:${firm.contact_phone}`}
                                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                                >
                                    <div className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-phone text-xs" />
                                    </div>
                                    <span className="text-base-content/70">
                                        {firm.contact_phone}
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>
                )}

            {/* Location */}
            <div className="sidebar-card opacity-0 bg-base-200 border-t-4 border-accent p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Location
                </h3>
                <div className="space-y-3">
                    {location ? (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 flex items-center justify-center bg-accent/10 text-accent flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            </div>
                            <span className="text-base-content/70">{location}</span>
                        </div>
                    ) : (
                        <p className="text-sm text-base-content/40 italic">
                            Location not specified
                        </p>
                    )}
                    {firm.founded_year && (
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-7 h-7 flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            </div>
                            <span className="text-base-content/70">
                                Founded {firm.founded_year}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
