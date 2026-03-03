"use client";

import Link from "next/link";
import type { PublicFirm } from "../types";
import { firmLocation } from "../types";
import { MiniLeaderboard } from "@splits-network/shared-gamification";
import { createUnauthenticatedClient } from "@/lib/api-client";

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
    const contactItems = [
        firm.show_contact_info && firm.contact_email
            ? { icon: "fa-duotone fa-regular fa-envelope", label: "Email", value: firm.contact_email }
            : null,
        firm.show_contact_info && firm.contact_phone
            ? { icon: "fa-duotone fa-regular fa-phone", label: "Phone", value: firm.contact_phone }
            : null,
        firm.website_url
            ? { icon: "fa-duotone fa-regular fa-globe", label: "Website", value: extractDomain(firm.website_url) }
            : null,
        firm.linkedin_url
            ? { icon: "fa-brands fa-linkedin-in", label: "LinkedIn", value: "LinkedIn" }
            : null,
    ].filter(Boolean) as { icon: string; label: string; value: string }[];

    return (
        <aside className="space-y-6">
            {/* Contact card */}
            {contactItems.length > 0 && (
                <div className="sidebar-card opacity-0 bg-base-200 border border-base-300 border-l-4 border-l-primary">
                    <div className="px-6 py-4 border-b border-base-300">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                            Contact
                        </p>
                    </div>
                    <div className="divide-y divide-base-300">
                        {contactItems.map((c) => (
                            <div key={c.label} className="flex items-center gap-4 px-6 py-4">
                                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                                    <i className={`${c.icon} text-primary text-xs`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                                        {c.label}
                                    </p>
                                    <p className="text-sm font-semibold text-base-content truncate">
                                        {c.value}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="px-6 pb-5 pt-4">
                        <Link
                            href="/sign-up"
                            className="btn btn-primary btn-sm w-full font-bold uppercase tracking-wider"
                        >
                            <i className="fa-duotone fa-regular fa-handshake" />
                            Request Partnership
                        </Link>
                    </div>
                </div>
            )}

            {/* Milestones card — Coming Soon */}
            <div className="sidebar-card opacity-0 bg-base-200 border border-base-300">
                <div className="px-6 py-4 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        Milestones
                    </p>
                </div>
                <div className="px-6 py-8 text-center">
                    <i className="fa-duotone fa-regular fa-flag text-2xl text-base-content/15 mb-2 block" />
                    <p className="text-sm text-base-content/40">Coming Soon</p>
                </div>
            </div>

            {/* Leaderboard card */}
            <div className="sidebar-card opacity-0">
                <MiniLeaderboard
                    entityType="recruiter"
                    client={createUnauthenticatedClient()}
                    title="Top Recruiters"
                    fullLeaderboardHref="/portal/leaderboard"
                />
            </div>

            {/* Markets Served card */}
            {firm.geo_focus.length > 0 && (
                <div className="sidebar-card opacity-0 bg-base-200 border border-base-300">
                    <div className="px-6 py-4 border-b border-base-300">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                            Markets Served
                        </p>
                    </div>
                    <div className="divide-y divide-base-300">
                        {firm.geo_focus.map((geo) => (
                            <div key={geo} className="flex items-center gap-3 px-6 py-3.5">
                                <i className="fa-duotone fa-regular fa-globe text-xs text-accent" />
                                <span className="text-sm text-base-content/60">{geo}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
