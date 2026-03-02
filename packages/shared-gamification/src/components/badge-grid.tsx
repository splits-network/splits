"use client";

import { BadgeAward } from "../types";

interface BadgeGridProps {
    badges: BadgeAward[];
    maxVisible?: number;
}

export function BadgeGrid({ badges, maxVisible }: BadgeGridProps) {
    const visible = maxVisible ? badges.slice(0, maxVisible) : badges;
    const overflow = maxVisible && badges.length > maxVisible ? badges.length - maxVisible : 0;

    if (visible.length === 0) {
        return (
            <div className="px-6 py-8 text-center">
                <i className="fa-duotone fa-regular fa-trophy text-2xl text-base-content/20 mb-2" />
                <p className="text-sm text-base-content/40">No badges earned yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-px bg-base-300">
            {visible.map((badge) => (
                <div
                    key={badge.id}
                    className="flex flex-col items-center gap-2 bg-base-200 px-4 py-5"
                    title={badge.badge_definition.description}
                >
                    <i className={`${badge.badge_definition.icon} ${badge.badge_definition.color} text-xl`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-base-content/60 text-center leading-tight">
                        {badge.badge_definition.name}
                    </span>
                    {badge.badge_definition.tier && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/30">
                            {badge.badge_definition.tier}
                        </span>
                    )}
                </div>
            ))}
            {overflow > 0 && (
                <div className="flex flex-col items-center justify-center bg-base-200 px-4 py-5">
                    <span className="text-sm font-bold text-base-content/40">+{overflow}</span>
                    <span className="text-xs text-base-content/30">more</span>
                </div>
            )}
        </div>
    );
}
