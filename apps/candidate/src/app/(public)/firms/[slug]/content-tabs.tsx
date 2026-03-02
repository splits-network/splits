"use client";

import type { PublicFirm } from "../types";
import TeamTab from "./team-tab";

type TabKey = "about" | "specialties" | "team" | "partnership";

interface ContentTabsProps {
    firm: PublicFirm;
    activeTab: TabKey;
}

const PLACEMENT_ICONS: Record<string, string> = {
    "Direct Hire": "fa-duotone fa-regular fa-briefcase",
    Contract: "fa-duotone fa-regular fa-file-contract",
    "Contract-to-Hire": "fa-duotone fa-regular fa-arrows-rotate",
    Retained: "fa-duotone fa-regular fa-lock",
    Contingency: "fa-duotone fa-regular fa-handshake",
};

function AboutTab({ firm }: { firm: PublicFirm }) {
    return (
        <div className="profile-section opacity-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-4">
                About {firm.name}
            </h2>
            <div className="border-l-4 border-primary bg-base-200 p-6">
                {firm.description ? (
                    <p className="text-base-content/70 leading-relaxed whitespace-pre-line">
                        {firm.description}
                    </p>
                ) : (
                    <p className="text-base-content/40 italic">
                        This firm hasn&apos;t added a description yet.
                    </p>
                )}
            </div>
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
            <div className="profile-section opacity-0 text-center py-12">
                <i className="fa-duotone fa-regular fa-bullseye text-3xl text-base-content/15 mb-3 block" />
                <p className="text-sm text-base-content/50">
                    No specialization data available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {firm.industries.length > 0 && (
                <div className="profile-section opacity-0">
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-3">
                        Industries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {firm.industries.map((ind) => (
                            <span key={ind} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-semibold">
                                {ind}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.specialties.length > 0 && (
                <div className="profile-section opacity-0">
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-3">
                        Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {firm.specialties.map((spec) => (
                            <span key={spec} className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm font-semibold">
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.placement_types.length > 0 && (
                <div className="profile-section opacity-0">
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-3">
                        Placement Types
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {firm.placement_types.map((pt) => (
                            <span
                                key={pt}
                                className="px-3 py-1.5 bg-accent/10 text-accent text-sm font-semibold inline-flex items-center gap-2"
                            >
                                <i className={PLACEMENT_ICONS[pt] || "fa-duotone fa-regular fa-tag"} />
                                {pt}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {firm.geo_focus.length > 0 && (
                <div className="profile-section opacity-0">
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-3">
                        Geographic Focus
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {firm.geo_focus.map((geo) => (
                            <span
                                key={geo}
                                className="px-3 py-1.5 bg-base-200 text-base-content/70 text-sm font-semibold inline-flex items-center gap-2"
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

function PartnershipTab({ firm }: { firm: PublicFirm }) {
    return (
        <div className="space-y-6">
            <div className="profile-section opacity-0">
                <h3 className="text-sm font-black uppercase tracking-wider text-base-content/40 mb-3">
                    Partnership Badges
                </h3>
                <div className="flex flex-wrap gap-3">
                    <span
                        className={`px-4 py-2 text-sm font-bold ${
                            firm.seeking_split_partners
                                ? "bg-success/15 text-success"
                                : "bg-base-200 text-base-content/40"
                        }`}
                    >
                        <i className="fa-duotone fa-regular fa-handshake mr-2" />
                        {firm.seeking_split_partners ? "Seeking Partners" : "Not Seeking Partners"}
                    </span>
                    {firm.accepts_candidate_submissions && (
                        <span className="px-4 py-2 text-sm font-bold bg-info/15 text-info">
                            <i className="fa-duotone fa-regular fa-user-plus mr-2" />
                            Accepts Candidate Submissions
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ContentTabs({ firm, activeTab }: ContentTabsProps) {
    return (
        <>
            {activeTab === "about" && <AboutTab firm={firm} />}
            {activeTab === "specialties" && <SpecialtiesTab firm={firm} />}
            {activeTab === "team" && firm.show_member_count && <TeamTab firm={firm} />}
            {activeTab === "partnership" && <PartnershipTab firm={firm} />}
        </>
    );
}
