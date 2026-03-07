"use client";

import type { PublicFirm, FirmRecentPlacement } from "../types";
import TeamTab from "./team-tab";

type TabKey = "about" | "specialties" | "team" | "reviews";

interface ContentTabsProps {
    firm: PublicFirm;
    activeTab: TabKey;
    recentPlacements?: FirmRecentPlacement[];
}

const PLACEMENT_ICONS: Record<string, string> = {
    "Direct Hire": "fa-duotone fa-regular fa-briefcase",
    Contract: "fa-duotone fa-regular fa-file-contract",
    "Contract-to-Hire": "fa-duotone fa-regular fa-arrows-rotate",
    Retained: "fa-duotone fa-regular fa-lock",
    Contingency: "fa-duotone fa-regular fa-handshake",
};

function AboutTab({ firm, recentPlacements }: { firm: PublicFirm; recentPlacements?: FirmRecentPlacement[] }) {
    return (
        <div className="space-y-10">
            {/* Description */}
            <div className="scroll-reveal fade-up border-l-4 border-l-primary pl-6">
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
                <div className="scroll-reveal fade-up bg-primary/5 border border-primary/10 px-6 py-5">
                    <i className="fa-duotone fa-regular fa-quote-left text-xl text-primary/30 mb-3 block" />
                    <p className="text-lg font-bold text-base-content/80 italic leading-relaxed">
                        &ldquo;{firm.tagline}&rdquo;
                    </p>
                </div>
            )}

            {/* Partnership signals */}
            <div className="scroll-reveal fade-up">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                    Partnership
                </p>
                <div className="flex flex-wrap gap-2">
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${firm.candidate_firm ? "bg-primary text-primary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-handshake text-sm" />
                        {firm.candidate_firm ? "Candidate Partners" : "Not Seeking Partners"}
                    </span>
                    <span className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider ${firm.company_firm ? "bg-secondary text-secondary-content" : "bg-base-200 border border-base-300 text-base-content/30"}`}>
                        <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                        {firm.company_firm ? "Company Partners" : "Not Accepting Submissions"}
                    </span>
                </div>
            </div>

            {/* Recent Placements */}
            {recentPlacements && recentPlacements.length > 0 && (
                <div className="scroll-reveal fade-up">
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

function SpecialtiesTab({ firm }: { firm: PublicFirm }) {
    const hasData =
        firm.industries.length > 0 ||
        firm.specialties.length > 0 ||
        firm.placement_types.length > 0 ||
        firm.geo_focus.length > 0;

    if (!hasData) {
        return (
            <div className="scroll-reveal fade-up text-center py-12">
                <i className="fa-duotone fa-regular fa-bullseye text-3xl text-base-content/15 mb-3 block" />
                <p className="text-sm text-base-content/50">
                    No specialization data available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {firm.industries.length > 0 && (
                <div className="scroll-reveal fade-up">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Industries
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.industries.map((ind) => (
                            <span key={ind} className="px-3 py-1.5 bg-primary text-primary-content text-xs font-bold uppercase tracking-wider">
                                {ind}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.specialties.length > 0 && (
                <div className="scroll-reveal fade-up">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Specialties
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.specialties.map((spec) => (
                            <span key={spec} className="px-3 py-1.5 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-wider">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.placement_types.length > 0 && (
                <div className="scroll-reveal fade-up">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Placement Types
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.placement_types.map((pt) => (
                            <span
                                key={pt}
                                className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                            >
                                <i className={PLACEMENT_ICONS[pt] || "fa-duotone fa-regular fa-tag"} />
                                {pt}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.geo_focus.length > 0 && (
                <div className="scroll-reveal fade-up">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Geographic Focus
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.geo_focus.map((geo) => (
                            <span
                                key={geo}
                                className="px-3 py-1.5 bg-base-200 border border-base-300 text-base-content/60 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                            >
                                <i className="fa-duotone fa-regular fa-globe" />
                                {geo}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ReviewsTab() {
    return (
        <div className="scroll-reveal fade-up text-center py-16">
            <div className="bg-base-200 border border-base-300 border-l-4 border-l-primary px-8 py-12 max-w-md mx-auto">
                <i className="fa-duotone fa-regular fa-star text-4xl text-primary/30 mb-4 block" />
                <h3 className="text-xl font-black tracking-tight text-base-content mb-2">
                    Reviews Coming Soon
                </h3>
                <p className="text-sm text-base-content/50 leading-relaxed">
                    Client testimonials and peer reviews will be available here in a future update.
                </p>
            </div>
        </div>
    );
}

export default function ContentTabs({ firm, activeTab, recentPlacements }: ContentTabsProps) {
    return (
        <>
            {activeTab === "about" && <AboutTab firm={firm} recentPlacements={recentPlacements} />}
            {activeTab === "specialties" && <SpecialtiesTab firm={firm} />}
            {activeTab === "team" && <TeamTab firm={firm} />}
            {activeTab === "reviews" && <ReviewsTab />}
        </>
    );
}
