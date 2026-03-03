"use client";

import { BaselBadge } from "@splits-network/basel-ui";
import type { CandidateCardData } from "./data";

const statusConfig: Record<string, { color: string; dotColor: string }> = {
    Active: { color: "text-success", dotColor: "bg-success" },
    Passive: { color: "text-warning", dotColor: "bg-warning" },
    "Not Looking": { color: "text-base-content/30", dotColor: "bg-base-content/30" },
};

export function CandidateCardEditorial({ candidate }: { candidate: CandidateCardData }) {
    const status = statusConfig[candidate.status] ?? statusConfig.Active;

    const stats = [
        {
            label: "Experience",
            value: candidate.experience,
            icon: "fa-duotone fa-regular fa-briefcase",
        },
        {
            label: "Desired",
            value: candidate.desiredSalary,
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Status",
            value: candidate.status,
            icon: "fa-duotone fa-regular fa-signal",
            statusColor: status.color,
        },
    ];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: current company + availability */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {candidate.currentCompany}
                    </p>
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <span className={`inline-block w-2 h-2 ${status.dotColor}`} />
                        <span className={status.color}>
                            {candidate.status}
                        </span>
                    </span>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {candidate.initials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Candidate
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {candidate.name}
                        </h2>
                    </div>
                </div>

                {/* Location + experience */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {candidate.location}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-clock text-xs" />
                        {candidate.experience} experience
                    </span>
                </div>
            </div>

            {/* Bio */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    About
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                    {candidate.bio}
                </p>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center justify-center px-1.5 py-4 gap-1 text-center min-w-0 overflow-hidden"
                        >
                            <i
                                className={`${stat.icon} text-primary text-sm`}
                            />
                            <span
                                className={`text-base font-black leading-none truncate w-full ${
                                    stat.statusColor ?? "text-base-content"
                                }`}
                            >
                                {stat.value}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate w-full">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {candidate.skills.map((skill) => (
                        <BaselBadge key={skill} variant="outline" size="sm">
                            {skill}
                        </BaselBadge>
                    ))}
                </div>
            </div>

            {/* Bottom Badges */}
            <div className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Preferences
                </p>
                <div className="flex flex-wrap gap-2">
                    {candidate.remoteOnly ? (
                        <BaselBadge color="primary" icon="fa-house-laptop">
                            Remote Only
                        </BaselBadge>
                    ) : (
                        <BaselBadge variant="outline" icon="fa-house-laptop" className="opacity-30">
                            Remote Only
                        </BaselBadge>
                    )}
                    {candidate.relocatable ? (
                        <BaselBadge color="secondary" icon="fa-truck-moving">
                            Relocatable
                        </BaselBadge>
                    ) : (
                        <BaselBadge variant="outline" icon="fa-truck-moving" className="opacity-30">
                            Relocatable
                        </BaselBadge>
                    )}
                </div>
            </div>
        </article>
    );
}
