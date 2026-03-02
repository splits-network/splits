"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import ReputationDisplay from "./reputation-display";
import { getInitials, reputationColor, formatScore } from "./status-color";
import { MarkdownRenderer } from "@splits-network/shared-ui";

interface GridCardProps {
    recruiter: Recruiter;
    isSelected?: boolean;
    onSelect?: (recruiter: Recruiter) => void;
}

export default function GridCard({
    recruiter,
    isSelected,
    onSelect,
}: GridCardProps) {
    const name = recruiter.users?.name || recruiter.name || "Unknown Recruiter";
    const initials = getInitials(name);

    const stats = [
        recruiter.reputation_score != null
            ? { label: "Rating", value: formatScore(recruiter.reputation_score), icon: "fa-duotone fa-regular fa-star" }
            : null,
        recruiter.total_placements != null
            ? { label: "Placed", value: String(recruiter.total_placements), icon: "fa-duotone fa-regular fa-handshake" }
            : null,
        recruiter.success_rate != null
            ? { label: "Success", value: `${Math.round(recruiter.success_rate)}%`, icon: "fa-duotone fa-regular fa-bullseye" }
            : null,
        recruiter.years_experience != null
            ? { label: "Exp.", value: `${recruiter.years_experience}yr`, icon: "fa-duotone fa-regular fa-clock" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    return (
        <div
            onClick={() => onSelect?.(recruiter)}
            className={`recruiter-card group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-lg ${
                isSelected
                    ? "border-l-primary border-primary"
                    : "border-l-primary hover:border-primary/40"
            }`}
        >
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: reputation + experience */}
                <div className="flex items-center justify-between mb-4">
                    {recruiter.reputation_score ? (
                        <span
                            className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${reputationColor(recruiter.reputation_score)}`}
                        >
                            <i className="fa-duotone fa-regular fa-star mr-1" />
                            {recruiter.reputation_score.toFixed(1)} Rating
                        </span>
                    ) : (
                        <span className="text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 bg-base-content/10 text-base-content/40">
                            New
                        </span>
                    )}
                    {recruiter.years_experience && recruiter.years_experience >= 5 && (
                        <span className="text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 bg-accent/15 text-accent">
                            {recruiter.years_experience}+ yrs
                        </span>
                    )}
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none shrink-0">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        {recruiter.tagline && (
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5 truncate">
                                {recruiter.tagline}
                            </p>
                        )}
                        <h2 className="text-2xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                            {name}
                        </h2>
                    </div>
                </div>

                {/* Location + specialization */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    {recruiter.location && (
                        <span className="flex items-center gap-1.5">
                            <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                            {recruiter.location}
                        </span>
                    )}
                    {recruiter.specialization && (
                        <>
                            {recruiter.location && <span className="text-base-content/20">|</span>}
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-briefcase text-xs" />
                                {recruiter.specialization}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Bio */}
            {recruiter.bio && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        About
                    </p>
                    <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        <MarkdownRenderer content={recruiter.bio} />
                    </div>
                </div>
            )}

            {/* Stats Row */}
            {stats.length > 0 && (
                <div className="border-b border-base-300">
                    <div
                        className="grid divide-x divide-base-300"
                        style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                    >
                        {stats.map((stat, i) => {
                            const iconStyles = [
                                "bg-primary text-primary-content",
                                "bg-secondary text-secondary-content",
                                "bg-accent text-accent-content",
                                "bg-warning text-warning-content",
                            ];
                            const iconStyle = iconStyles[i % iconStyles.length];
                            return (
                                <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                                    <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${iconStyle}`}>
                                        <i className={`${stat.icon} text-xs`} />
                                    </div>
                                    <div>
                                        <span className="text-lg font-black text-base-content leading-none block">
                                            {stat.value}
                                        </span>
                                        <span className="text-xs font-semibold uppercase tracking-wider text-base-content/30 leading-none">
                                            {stat.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Industries tags */}
            {recruiter.industries && recruiter.industries.length > 0 && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Industries
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {recruiter.industries.slice(0, 3).map((ind) => (
                            <span
                                key={ind}
                                className="px-2.5 py-1 bg-base-200 border border-base-300 text-xs font-bold uppercase tracking-wider text-base-content/60"
                            >
                                {ind}
                            </span>
                        ))}
                        {recruiter.industries.length > 3 && (
                            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-base-content/30">
                                +{recruiter.industries.length - 3}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Footer: reputation + view */}
            <div className="mt-auto flex items-center justify-between px-6 py-4 border-t border-base-200">
                <ReputationDisplay
                    score={recruiter.reputation_score}
                    placements={recruiter.total_placements}
                />
                <Link
                    href={`/marketplace/${recruiter.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-bold uppercase tracking-wider text-primary hover:text-primary/70 transition-colors"
                >
                    View
                    <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                </Link>
            </div>
        </div>
    );
}
