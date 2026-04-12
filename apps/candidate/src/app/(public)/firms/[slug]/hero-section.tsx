"use client";

import type { PublicFirm } from "../types";
import { firmLocation, firmInitials } from "../types";
import { HeroStats } from "./hero-stats";
import {
    LevelBadge,
    useGamification,
} from "@splits-network/shared-gamification";

interface HeroSectionProps {
    firm: PublicFirm;
    connected?: boolean;
    onConnect?: () => void;
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname.replace("www.", "");
    } catch {
        return url;
    }
}

export default function HeroSection({
    firm,
    connected,
    onConnect,
}: HeroSectionProps) {
    const { getLevel } = useGamification();
    const firmLevel = firm.id ? getLevel(firm.id) : undefined;
    const location = firmLocation(firm);
    const initials = firmInitials(firm.name);

    return (
        <header className="relative bg-base-300 text-base-content border-l-4 border-l-primary">
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />
            <div className="relative px-8 pt-10 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-8">
                    <p className="scroll-reveal fade-up hero-kicker text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
                        {firm.industries.join(" \u00B7 ")}
                    </p>
                    <div className="flex items-center gap-4">
                        {firm.candidate_firm && (
                            <span className="scroll-reveal fade-up hero-kicker flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-secondary">
                                <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                Candidate Partners
                            </span>
                        )}
                        {firm.company_firm && (
                            <span className="scroll-reveal fade-up hero-kicker flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
                                <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                Company Partners
                            </span>
                        )}
                    </div>
                </div>

                {/* Logo + Identity */}
                <div className="flex flex-col lg:flex-row lg:items-end gap-8">
                    <div className="flex items-end gap-5 flex-1">
                        <div className="scroll-reveal pop-in firm-avatar relative shrink-0">
                            {firm.logo_url ? (
                                <img
                                    src={firm.logo_url}
                                    alt={`${firm.name} logo`}
                                    className="w-20 h-20 lg:w-24 lg:h-24 object-contain bg-base-200 border border-base-300"
                                />
                            ) : (
                                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary text-primary-content flex items-center justify-center text-2xl lg:text-3xl font-black tracking-tight select-none">
                                    {initials}
                                </div>
                            )}
                            {firmLevel && (
                                <div className="absolute -bottom-1 -right-1">
                                    <LevelBadge level={firmLevel} size="sm" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pb-1">
                            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1">
                                Recruiting Firm
                            </p>
                            <h1 className="scroll-reveal fade-up firm-name text-4xl lg:text-5xl font-black tracking-tight leading-none text-base-content mb-3">
                                {firm.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/40">
                                {location && (
                                    <span className="scroll-reveal fade-up firm-meta flex items-center gap-1.5">
                                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                        {location}
                                    </span>
                                )}
                                {firm.founded_year && (
                                    <>
                                        {location && (
                                            <span className="text-base-content/20">
                                                |
                                            </span>
                                        )}
                                        <span className="scroll-reveal fade-up firm-meta flex items-center gap-1.5">
                                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                            Est. {firm.founded_year}
                                        </span>
                                    </>
                                )}
                                {firm.website_url && (
                                    <>
                                        <span className="text-base-content/20">
                                            |
                                        </span>
                                        <span className="scroll-reveal fade-up firm-meta flex items-center gap-1.5">
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
                        {connected ? (
                            <a
                                href="/portal/messages"
                                className="scroll-reveal fade-up firm-action btn btn-primary btn-sm font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-comments" />
                                Message
                            </a>
                        ) : (
                            <button
                                className="scroll-reveal fade-up firm-action btn btn-primary btn-sm font-bold uppercase tracking-wider"
                                onClick={onConnect}
                            >
                                <i className="fa-duotone fa-regular fa-paper-plane" />
                                Submit a Candidate
                            </button>
                        )}
                        {firm.website_url && (
                            <a
                                href={firm.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="scroll-reveal fade-up firm-action btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Website
                            </a>
                        )}
                        <button className="scroll-reveal fade-up firm-action btn btn-ghost btn-sm border-neutral-content/20 font-bold uppercase tracking-wider">
                            <i className="fa-duotone fa-regular fa-share-nodes" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Stats strip */}
                <HeroStats firm={firm} />
            </div>
        </header>
    );
}
