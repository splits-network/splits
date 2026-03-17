"use client";

import Link from "next/link";
import type { Recruiter } from "../marketplace-client";
import { BaselSplitView } from "@splits-network/basel-ui";
import SplitItem from "./split-item";
import ReputationDisplay from "./reputation-display";
import { getInitials, reputationColor } from "./status-color";

interface SplitViewProps {
    recruiters: Recruiter[];
    selectedRecruiter: Recruiter | null;
    onSelect: (recruiter: Recruiter) => void;
}

export default function SplitView({
    recruiters,
    selectedRecruiter,
    onSelect,
}: SplitViewProps) {
    // Auto-select first recruiter when nothing is selected
    const effectiveId =
        selectedRecruiter?.id ?? recruiters[0]?.id ?? null;

    return (
        <BaselSplitView
            items={recruiters}
            selectedId={effectiveId}
            getItemId={(r) => r.id}
            estimatedItemHeight={90}
            renderItem={(recruiter, isSelected) => (
                <SplitItem
                    recruiter={recruiter}
                    isSelected={isSelected}
                    onSelect={onSelect}
                />
            )}
            renderDetail={(recruiter) => (
                <SplitDetailPanel recruiter={recruiter} />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a recruiter to view details"
            initialListWidth={38}
            mobileBreakpoint="lg"
            onMobileClose={() => {
                if (selectedRecruiter) onSelect(selectedRecruiter);
            }}
        />
    );
}

function SplitDetailPanel({ recruiter }: { recruiter: Recruiter }) {
    const name =
        recruiter.users?.name || recruiter.name || "Unknown Recruiter";
    const initials = getInitials(name);

    return (
        <div>
            {/* Sticky header */}
            <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        {recruiter.specialization && (
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                                {recruiter.specialization}
                            </p>
                        )}
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-2">
                            {name}
                        </h2>
                        <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                            {recruiter.location && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {recruiter.location}
                                </span>
                            )}
                            {recruiter.years_experience && (
                                <span>
                                    <i className="fa-duotone fa-regular fa-clock mr-1" />
                                    {recruiter.years_experience} years
                                    experience
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="w-14 h-14 flex items-center justify-center bg-primary/10 text-primary font-black text-lg flex-shrink-0">
                        {initials}
                    </div>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Rating
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {recruiter.reputation_score
                                ? recruiter.reputation_score.toFixed(1)
                                : "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Placements
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {recruiter.total_placements ?? 0}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Success Rate
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {recruiter.success_rate
                                ? `${recruiter.success_rate}%`
                                : "N/A"}
                        </p>
                    </div>
                </div>

                {recruiter.tagline && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-2">
                            Tagline
                        </h3>
                        <p className="text-base font-bold text-base-content/70">
                            {recruiter.tagline}
                        </p>
                    </div>
                )}

                {recruiter.bio && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            About
                        </h3>
                        <p className="text-base-content/70 leading-relaxed">
                            {recruiter.bio}
                        </p>
                    </div>
                )}

                {recruiter.industries && recruiter.industries.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Industries
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {recruiter.industries.map((industry, i) => (
                                <span
                                    key={i}
                                    className="text-xs font-bold uppercase tracking-[0.15em] bg-primary/10 text-primary px-3 py-1.5"
                                >
                                    {industry}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="border-t-2 border-base-300 pt-6">
                    <Link
                        href={`/marketplace/${recruiter.slug || recruiter.id}`}
                        className="btn btn-link w-full gap-2"
                    >
                        View Full Profile
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
