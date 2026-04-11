"use client";

import Link from "next/link";
import type { PublicCompany } from "../../types";
import { companyLocation, companyInitials } from "../../types";
import { BaselAvatar, BaselBadge } from "@splits-network/basel-ui";

interface GridCardProps {
    company: PublicCompany;
}

export function GridCard({ company }: GridCardProps) {
    const location = companyLocation(company);
    const initials = companyInitials(company.name);
    const href = company.slug ? `/companies/${company.slug}` : "#";

    const displayTagline =
        company.tagline ||
        (company.industry
            ? `${company.industry} company`
            : company.description?.slice(0, 120) || null);

    const metaItems: {
        icon: string;
        color: string;
        value: string;
        muted: boolean;
        tooltip: string;
    }[] = [
        {
            icon: "fa-users",
            color: "text-primary",
            value: company.company_size || "\u2014",
            muted: !company.company_size,
            tooltip: "Company size",
        },
        {
            icon: "fa-calendar",
            color: "text-accent",
            value: company.founded_year
                ? `Est. ${company.founded_year}`
                : "\u2014",
            muted: !company.founded_year,
            tooltip: "Founded",
        },
        {
            icon: "fa-briefcase",
            color: "text-secondary",
            value: `${company.open_roles_count} open`,
            muted: company.open_roles_count === 0,
            tooltip: "Open roles",
        },
    ];

    return (
        <Link
            href={href}
            className="group bg-base-100 border border-base-300 border-l-4 border-l-primary w-full flex flex-col transition-colors hover:border-base-content/20"
        >
            {/* Header Band */}
            <div className="bg-base-300 px-5 pt-4 pb-4">
                <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                        <BaselAvatar
                            initials={initials}
                            src={company.logo_url}
                            alt={`${company.name} logo`}
                            size="md"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary mb-0.5 truncate">
                            {company.industry || "Company"}
                        </p>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-base-content truncate group-hover:text-primary transition-colors">
                            {company.name}
                        </h3>
                        <p
                            className={`text-sm truncate mt-0.5 ${location ? "text-base-content/50" : "text-base-content/30"}`}
                        >
                            {location || "Location not specified"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Inline metadata */}
            <div className="px-5 py-2.5 border-b border-base-300 text-sm flex flex-wrap items-center gap-x-3 gap-y-1">
                {metaItems.map((item, i) => (
                    <span
                        key={i}
                        className={`tooltip tooltip-bottom flex items-center gap-1 ${item.muted ? "text-base-content/30" : "text-base-content/50"}`}
                        data-tip={item.tooltip}
                    >
                        <i
                            className={`fa-duotone fa-regular ${item.icon} ${item.muted ? "text-base-content/20" : item.color} text-xs`}
                        />
                        <span className="truncate">{item.value}</span>
                    </span>
                ))}
            </div>

            {/* About snippet */}
            <div className="px-5 py-3 border-b border-base-300">
                {displayTagline ? (
                    <p className="text-sm text-base-content/60 leading-relaxed line-clamp-2">
                        {displayTagline}
                    </p>
                ) : (
                    <p className="text-sm text-base-content/30">
                        No description provided
                    </p>
                )}
            </div>

            {/* Badge row */}
            <div className="px-5 py-3 flex-1">
                <div className="flex flex-wrap gap-1.5">
                    {company.stage && (
                        <BaselBadge
                            color="primary"
                            variant="soft-outline"
                            size="sm"
                            icon="fa-chart-line"
                        >
                            {company.stage}
                        </BaselBadge>
                    )}
                    {company.open_roles_count > 0 && (
                        <BaselBadge
                            color="secondary"
                            variant="soft-outline"
                            size="sm"
                            icon="fa-briefcase"
                        >
                            {company.open_roles_count} Open Role
                            {company.open_roles_count !== 1 ? "s" : ""}
                        </BaselBadge>
                    )}
                    {company.industry && (
                        <BaselBadge variant="soft" color="neutral" size="sm">
                            {company.industry}
                        </BaselBadge>
                    )}
                    {!company.stage &&
                        company.open_roles_count === 0 &&
                        !company.industry && (
                            <span className="text-sm text-base-content/30">
                                No details listed
                            </span>
                        )}
                </div>
            </div>

            {/* Footer: CTA */}
            <div className="px-5 py-3 border-t border-base-300">
                <span className="text-sm font-semibold text-primary group-hover:text-primary/70 transition-colors flex items-center gap-1">
                    View Open Roles
                    <i className="fa-duotone fa-regular fa-arrow-right text-xs" />
                </span>
            </div>
        </Link>
    );
}
