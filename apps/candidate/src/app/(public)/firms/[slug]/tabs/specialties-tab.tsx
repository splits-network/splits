"use client";

import type { PublicFirm } from "../../types";

const PLACEMENT_ICONS: Record<string, string> = {
    "Direct Hire": "fa-duotone fa-regular fa-briefcase",
    Contract: "fa-duotone fa-regular fa-file-contract",
    "Contract-to-Hire": "fa-duotone fa-regular fa-arrows-rotate",
    Retained: "fa-duotone fa-regular fa-lock",
    Contingency: "fa-duotone fa-regular fa-handshake",
};

interface SpecialtiesTabProps {
    firm: PublicFirm;
}

export function SpecialtiesTab({ firm }: SpecialtiesTabProps) {
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
        <div className="space-y-10">
            {/* Industries */}
            {firm.industries.length > 0 && (
                <div className="profile-section opacity-0">
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

            {/* Specialties */}
            {firm.specialties.length > 0 && (
                <div className="profile-section opacity-0">
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

            {/* Placement Types */}
            {firm.placement_types.length > 0 && (
                <div className="profile-section opacity-0">
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

            {/* Geographic Focus */}
            {firm.geo_focus.length > 0 && (
                <div className="profile-section opacity-0">
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
