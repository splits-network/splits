"use client";

import type { FirmCardData } from "./data";
import { firmInitials } from "./data";

export function FirmCardEditorial({ firm }: { firm: FirmCardData }) {
    const initials = firmInitials(firm.name);
    const hasPartnerSignal = firm.seekingSplitPartners || firm.acceptsCandidateSubmissions;

    const displayTagline =
        firm.tagline ||
        (firm.industries.length > 1
            ? `${firm.industries[0]} & ${firm.industries[1]} recruiting firm`
            : firm.industries.length === 1
              ? `${firm.industries[0]} recruiting firm`
              : null);

    const stats = [
        firm.teamSizeRange
            ? { label: "Team", value: `${firm.teamSizeRange.replace("-", "\u2013")}`, icon: "fa-duotone fa-regular fa-users" }
            : null,
        firm.foundedYear
            ? { label: "Est.", value: String(firm.foundedYear), icon: "fa-duotone fa-regular fa-calendar" }
            : null,
        firm.showMemberCount && firm.activeMemberCount != null
            ? { label: "Active", value: String(firm.activeMemberCount), icon: "fa-duotone fa-regular fa-user-check" }
            : null,
        firm.placementTypes.length > 0
            ? { label: "Types", value: String(firm.placementTypes.length), icon: "fa-duotone fa-regular fa-briefcase" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: industries + partnership signal */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {firm.industries.slice(0, 2).join(" \u00B7 ")}
                    </p>
                    {firm.location && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content/40">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            {firm.location}
                        </span>
                    )}
                </div>

                {/* Logo + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        {firm.logoUrl ? (
                            <img
                                src={firm.logoUrl}
                                alt={`${firm.name} logo`}
                                className="w-16 h-16 object-contain bg-base-100"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Recruiting Firm
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {firm.name}
                        </h2>
                    </div>
                </div>

                {/* Founded + team size */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    {firm.foundedYear && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-calendar text-xs" />
                            Est. {firm.foundedYear}
                        </span>
                    )}
                    {firm.teamSizeRange && (
                        <>
                            <span className="text-base-content/20">|</span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-users text-xs" />
                                {firm.teamSizeRange.replace("-", "\u2013")} recruiters
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Tagline */}
            {displayTagline && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        About
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {displayTagline}
                    </p>
                </div>
            )}

            {/* Stats Row */}
            {stats.length > 0 && (
                <div className="border-b border-base-300">
                    <div className="grid divide-x divide-base-300" style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div
                                    key={stat.label}
                                    className="flex items-center gap-2 px-2 py-4 min-w-0 overflow-hidden"
                                >
                                    <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <i className={`${stat.icon} text-xs`} />
                                    </div>
                                    <div className="min-w-0">
                                        <span className="text-sm font-black text-base-content leading-none block truncate">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate block">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Specialties */}
            {firm.specialties.length > 0 && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Specialties
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {firm.specialties.slice(0, 4).map((spec) => (
                            <span
                                key={spec}
                                className="px-2.5 py-1 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Partnership Badges */}
            {hasPartnerSignal && (
                <div className="px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Partnership
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {firm.seekingSplitPartners && (
                            <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-content">
                                <i className="fa-duotone fa-regular fa-handshake text-sm" />
                                Open to Splits
                            </span>
                        )}
                        {firm.acceptsCandidateSubmissions && (
                            <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-secondary text-secondary-content">
                                <i className="fa-duotone fa-regular fa-paper-plane text-sm" />
                                Taking Submissions
                            </span>
                        )}
                    </div>
                </div>
            )}
        </article>
    );
}
