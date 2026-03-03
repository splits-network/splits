"use client";

import { BaselBadge } from "@splits-network/basel-ui";
import type { CompanyCardData } from "./data";

export function CompanyCardEditorial({ company }: { company: CompanyCardData }) {
    const initials = company.initials || company.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

    const stats = [
        { label: "Open Roles", value: String(company.openRoles), icon: "fa-duotone fa-regular fa-briefcase" },
        { label: "Size", value: company.size, icon: "fa-duotone fa-regular fa-users" },
        { label: "Stage", value: company.stage, icon: "fa-duotone fa-regular fa-rocket" },
        { label: "Avg Salary", value: company.averageSalary, icon: "fa-duotone fa-regular fa-dollar-sign" },
    ];

    const iconStyles = [
        "bg-primary text-primary-content",
        "bg-secondary text-secondary-content",
        "bg-accent text-accent-content",
        "bg-warning text-warning-content",
    ];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: industry + hiring badge */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {company.industry}
                    </p>
                    {company.hiring && (
                        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-success">
                            <span className="inline-block w-2 h-2 bg-success" />
                            Hiring
                        </span>
                    )}
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        {company.logoUrl ? (
                            <img
                                src={company.logoUrl}
                                alt={`${company.name} logo`}
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
                            Company
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {company.name}
                        </h2>
                    </div>
                </div>

                {/* Location + founded */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {company.location}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        Est. {company.founded}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    About
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                    {company.description}
                </p>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div
                    className="grid divide-x divide-base-300"
                    style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
                >
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2 px-2 py-4 min-w-0 overflow-hidden"
                        >
                            <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyles[i % iconStyles.length]}`}>
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
                    ))}
                </div>
            </div>

            {/* Tech Stack Tags */}
            {company.techStack.length > 0 && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {company.techStack.map((tech) => (
                            <BaselBadge key={tech} variant="outline" size="sm">{tech}</BaselBadge>
                        ))}
                    </div>
                </div>
            )}

            {/* Featured Perks */}
            {company.featuredPerks.length > 0 && (
                <div className="px-6 py-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                        Perks
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {company.featuredPerks.map((perk) => (
                            <BaselBadge key={perk} color="secondary" icon="fa-star">{perk}</BaselBadge>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}
