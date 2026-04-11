"use client";

import type { PublicCompanyProfile } from "../../types";
import { BaselBadge } from "@splits-network/basel-ui";

interface CultureTabProps {
    profile: PublicCompanyProfile | null;
}

export function CultureTab({ profile }: CultureTabProps) {
    const perks = profile?.perks || [];
    const cultureTags = profile?.culture_tags || [];
    const skills = profile?.skills || [];

    const hasData = perks.length > 0 || cultureTags.length > 0 || skills.length > 0;

    if (!hasData) {
        return (
            <div className="scroll-reveal fade-up profile-section text-center py-16">
                <i className="fa-duotone fa-regular fa-heart text-4xl text-base-content/15 mb-4 block" />
                <p className="text-lg font-black text-base-content/60 mb-2">
                    Culture Info Coming Soon
                </p>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto">
                    This company hasn&apos;t added culture, perks, or skills
                    information yet.
                </p>
            </div>
        );
    }

    // Group perks by category
    const perksByCategory = perks.reduce(
        (acc, perk) => {
            const cat = perk.category || "Other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(perk);
            return acc;
        },
        {} as Record<string, typeof perks>,
    );

    // Group culture tags by category
    const tagsByCategory = cultureTags.reduce(
        (acc, tag) => {
            const cat = tag.category || "Other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(tag);
            return acc;
        },
        {} as Record<string, typeof cultureTags>,
    );

    return (
        <div className="space-y-10">
            {/* Culture Tags */}
            {cultureTags.length > 0 && (
                <div className="scroll-reveal fade-up profile-section">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Culture & Values
                    </p>
                    <div className="space-y-4">
                        {Object.entries(tagsByCategory).map(
                            ([category, tags]) => (
                                <div key={category}>
                                    <p className="text-xs font-semibold text-base-content/40 mb-2 capitalize">
                                        {category}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {tags.map((tag) => (
                                            <BaselBadge
                                                key={tag.id}
                                                color="primary"
                                                variant="soft"
                                                size="sm"
                                            >
                                                {tag.name}
                                            </BaselBadge>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Perks */}
            {perks.length > 0 && (
                <div className="scroll-reveal fade-up profile-section">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Perks & Benefits
                    </p>
                    <div className="space-y-4">
                        {Object.entries(perksByCategory).map(
                            ([category, categoryPerks]) => (
                                <div key={category}>
                                    <p className="text-xs font-semibold text-base-content/40 mb-2 capitalize">
                                        {category}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categoryPerks.map((perk) => (
                                            <BaselBadge
                                                key={perk.id}
                                                color="secondary"
                                                variant="soft"
                                                size="sm"
                                            >
                                                {perk.name}
                                            </BaselBadge>
                                        ))}
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            )}

            {/* Tech Skills */}
            {skills.length > 0 && (
                <div className="scroll-reveal fade-up profile-section">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                        Tech Stack & Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                            <BaselBadge
                                key={skill.id}
                                color="accent"
                                variant="soft"
                                size="sm"
                            >
                                {skill.name}
                            </BaselBadge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
