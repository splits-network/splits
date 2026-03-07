"use client";

import type { PublicFirm, FirmRecentPlacement } from "../../types";

interface AboutTabProps {
    firm: PublicFirm;
    recentPlacements: FirmRecentPlacement[];
}

export function AboutTab({ firm, recentPlacements }: AboutTabProps) {
    return (
        <div className="space-y-10">
            {/* Description */}
            <div className="scroll-reveal fade-up profile-section border-l-4 border-l-primary pl-6">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                    About {firm.name}
                </p>
                {firm.description ? (
                    <p className="text-base text-base-content/70 leading-relaxed">
                        {firm.description}
                    </p>
                ) : (
                    <p className="text-base text-base-content/40 italic">
                        This firm hasn&apos;t added a description yet.
                    </p>
                )}
            </div>

            {/* Tagline highlight */}
            {firm.tagline && (
                <div className="scroll-reveal fade-up profile-section bg-primary/5 border border-primary/10 px-6 py-5">
                    <i className="fa-duotone fa-regular fa-quote-left text-xl text-primary/30 mb-3 block" />
                    <p className="text-lg font-bold text-base-content/80 italic leading-relaxed">
                        &ldquo;{firm.tagline}&rdquo;
                    </p>
                </div>
            )}

            {/* Partnership signals */}
            <div className="scroll-reveal fade-up profile-section">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${firm.candidate_firm ? "bg-primary text-primary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-handshake text-sm" />
                        {firm.candidate_firm ? "Candidate Partners" : "Not Accepting Candidates"}
                    </span>
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${firm.company_firm ? "bg-secondary text-secondary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                        {firm.company_firm ? "Company Partners" : "Not Accepting Companies"}
                    </span>
                </div>
            </div>

            {/* Recent Placements */}
            {recentPlacements.length > 0 && (
                <div className="scroll-reveal fade-up profile-section">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Recent Placements
                    </p>
                    <div className="divide-y divide-base-300 border border-base-300">
                        {recentPlacements.map((p, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                <i className="fa-duotone fa-regular fa-trophy text-primary text-base w-4 text-center shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-base-content/80 font-semibold">{p.role}</p>
                                </div>
                                <span className="px-2 py-0.5 bg-base-200 text-xs font-bold uppercase tracking-wider text-base-content/40 shrink-0">
                                    {p.level}
                                </span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 shrink-0">
                                    {p.time}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
