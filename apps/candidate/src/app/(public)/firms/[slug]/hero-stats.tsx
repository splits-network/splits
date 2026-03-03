"use client";

import type { PublicFirm } from "../types";

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

interface HeroStatsProps {
    firm: PublicFirm;
}

export function HeroStats({ firm }: HeroStatsProps) {
    const stats = [
        firm.team_size_range
            ? { label: "Team Size", value: firm.team_size_range.replace("-", "\u2013"), icon: "fa-duotone fa-regular fa-users" }
            : null,
        firm.show_member_count && firm.active_member_count != null
            ? { label: "Active", value: String(firm.active_member_count), icon: "fa-duotone fa-regular fa-user-check" }
            : null,
        firm.founded_year
            ? { label: "Founded", value: String(firm.founded_year), icon: "fa-duotone fa-regular fa-calendar" }
            : null,
        firm.placement_types.length > 0
            ? { label: "Placement Types", value: String(firm.placement_types.length), icon: "fa-duotone fa-regular fa-briefcase" }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    if (stats.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-8">
            {stats.map((stat, i) => {
                const iconStyle = ICON_STYLES[i % ICON_STYLES.length];
                return (
                    <div key={stat.label} className="stat-block opacity-0 flex items-center gap-3 px-4 py-4">
                        <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${iconStyle}`}>
                            <i className={`${stat.icon} text-base`} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-neutral-content leading-none block">
                                {stat.value}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                                {stat.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
