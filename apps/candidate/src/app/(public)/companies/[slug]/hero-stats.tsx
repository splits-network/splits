"use client";

import type { PublicCompany } from "../types";

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

interface HeroStatsProps {
    company: PublicCompany;
}

export function HeroStats({ company }: HeroStatsProps) {
    const stats = [
        company.company_size
            ? {
                  label: "Company Size",
                  value: company.company_size,
                  icon: "fa-duotone fa-regular fa-users",
              }
            : null,
        company.open_roles_count > 0
            ? {
                  label: "Open Roles",
                  value: String(company.open_roles_count),
                  icon: "fa-duotone fa-regular fa-briefcase",
              }
            : null,
        company.founded_year
            ? {
                  label: "Founded",
                  value: String(company.founded_year),
                  icon: "fa-duotone fa-regular fa-calendar",
              }
            : null,
        company.stage
            ? {
                  label: "Stage",
                  value: company.stage,
                  icon: "fa-duotone fa-regular fa-chart-line",
              }
            : null,
    ].filter(Boolean) as { label: string; value: string; icon: string }[];

    if (stats.length === 0) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-8">
            {stats.map((stat, i) => {
                const iconStyle = ICON_STYLES[i % ICON_STYLES.length];
                return (
                    <div
                        key={stat.label}
                        className="scroll-reveal fade-up stat-block flex items-center gap-3 px-4 py-4"
                    >
                        <div
                            className={`w-10 h-10 flex items-center justify-center shrink-0 ${iconStyle}`}
                        >
                            <i className={`${stat.icon} text-base`} />
                        </div>
                        <div>
                            <span className="text-xl font-black text-base-content leading-none block">
                                {stat.value}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40 leading-none">
                                {stat.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
